import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import process from "node:process";
import { Server } from "socket.io";
import { getMongoDb, isMongoConfigured } from "./mongodb.mjs";

const PORT = Number(process.env.PORT || process.env.REALTIME_PORT || 4000);
const DATA_DIR = new URL("./data/", import.meta.url);
const DATA_FILE = new URL("./messages.json", DATA_DIR);
const MAX_MESSAGE_LENGTH = 500;
const HISTORY_PAGE_SIZE = 50;
const RATE_LIMIT_COUNT = 5;
const RATE_LIMIT_WINDOW = 10_000;
const ADMIN_RATE_LIMIT_COUNT = 5;
const ADMIN_RATE_LIMIT_WINDOW = 60_000;
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000;
const COLORS = ["#60a5fa", "#f87171", "#4ade80", "#facc15", "#c084fc", "#fb923c"];
const FRIENDLY_ADJECTIVES = ["Quiet", "Blue", "Silver", "Happy", "Calm", "Bright", "Gentle", "Swift"];
const FRIENDLY_ANIMALS = ["Panda", "Falcon", "Fox", "Sparrow", "Tiger", "Otter", "Badger", "Heron"];
const sessionSecret = process.env.REALTIME_SESSION_SECRET?.trim() || randomBytes(32).toString("hex");

const allowedOrigins = new Set(
  (process.env.REALTIME_ALLOWED_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000,http://192.168.0.100:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

const originAllowed = (origin) => !origin || allowedOrigins.has(origin);
const sessions = new Map();
const rateLimits = new Map();
const adminRateLimits = new Map();
const locationCache = new Map();
let store = { nextId: 1, messages: [], reactions: {} };
let mongoDb = null;

async function loadStore() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    store = JSON.parse(await readFile(DATA_FILE, "utf8"));
    if (!Array.isArray(store.messages) || typeof store.nextId !== "number") throw new Error("invalid store");
    if (!store.reactions || typeof store.reactions !== "object") store.reactions = {};
  } catch {
    await saveStore();
  }
}

let saveTimer;
function saveStore() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    await writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
  }, 100);
}

function cleanText(value, max = MAX_MESSAGE_LENGTH) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function encodeToken(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signToken(payload) {
  const encoded = encodeToken(payload);
  const signature = createHmac("sha256", sessionSecret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

function verifyToken(token) {
  if (typeof token !== "string") return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = createHmac("sha256", sessionSecret).update(encoded).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!payload.sessionId || !payload.name || !payload.expiresAt || payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function identityFor(sessionId) {
  const hash = createHmac("sha256", sessionSecret).update(sessionId).digest();
  const adjective = FRIENDLY_ADJECTIVES[hash[0] % FRIENDLY_ADJECTIVES.length];
  const animal = FRIENDLY_ANIMALS[hash[1] % FRIENDLY_ANIMALS.length];
  return {
    name: `${adjective} ${animal}`,
    avatar: String((hash[2] % 100) + 1),
    color: COLORS[hash[3] % COLORS.length],
  };
}

function createSessionToken(sessionId, identity, isAdmin = false) {
  return signToken({
    sessionId,
    name: isAdmin ? cleanText(process.env.REALTIME_ADMIN_NAME, 40) || "Portfolio Admin" : identity.name,
    avatar: identity.avatar,
    color: identity.color,
    isAdmin,
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL,
  });
}

function publicLocation(location) {
  return {
    location: location.city ? `${location.city}, ${location.country}` : location.country || "Unknown",
    country: location.country || "Unknown",
    city: location.city || "",
    flag: location.flag || "🌐",
  };
}

function isPrivateAddress(address) {
  const normalized = String(address || "").replace(/^::ffff:/, "");
  if (!normalized || normalized === "::1" || normalized === "localhost") return true;
  if (isIP(normalized) === 4) {
    const parts = normalized.split(".").map(Number);
    return parts[0] === 10 || parts[0] === 127 || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168);
  }
  return isIP(normalized) === 6;
}

function requestAddress(socket) {
  const forwarded = socket.handshake.headers["x-forwarded-for"];
  return (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : socket.handshake.address) || "";
}

async function getLocation(socket) {
  const address = requestAddress(socket);
  if (isPrivateAddress(address)) return { country: "Localhost", city: "", flag: "🌐" };
  if (!isIP(address)) return { country: "Unknown", city: "", flag: "🌐" };
  if (locationCache.has(address)) return locationCache.get(address);
  const fallback = { country: "Unknown", city: "", flag: "🌐" };
  try {
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(address)}/json/`, { signal: AbortSignal.timeout(3500) });
    if (!response.ok) return fallback;
    const data = await response.json();
    const location = { country: cleanText(data.country_name, 80), city: cleanText(data.city, 80), flag: cleanText(data.country_code, 2) ? String.fromCodePoint(...cleanText(data.country_code, 2).toUpperCase().split("").map((letter) => 127397 + letter.charCodeAt(0))) : "🌐" };
    locationCache.set(address, location);
    return location;
  } catch {
    return fallback;
  }
}

function userFor(socket, sessionId, claims, location) {
  const existing = sessions.get(sessionId);
  const identity = claims || existing?.claims || { ...identityFor(sessionId), isAdmin: false };
  const safeLocation = publicLocation(location || existing?.location || { country: "Unknown", city: "", flag: "🌐" });
  return {
    id: sessionId,
    socketId: socket.id,
    name: identity.name,
    avatar: identity.avatar,
    color: identity.color,
    isOnline: true,
    ...safeLocation,
    lastSeen: new Date().toISOString(),
    createdAt: existing?.createdAt || new Date().toISOString(),
    isAdmin: Boolean(identity.isAdmin),
  };
}

function publicUsers() {
  return [...sessions.values()].map(({ user }) => ({ ...user }));
}

function sendUsers(io) {
  io.emit("users-updated", publicUsers());
}

function canSend(sessionId) {
  const now = Date.now();
  const entry = rateLimits.get(sessionId) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_LIMIT_WINDOW;
  }
  entry.count += 1;
  rateLimits.set(sessionId, entry);
  return entry.count <= RATE_LIMIT_COUNT;
}

function canAttemptAdmin(sessionId) {
  const now = Date.now();
  const entry = adminRateLimits.get(sessionId) || { count: 0, resetAt: now + ADMIN_RATE_LIMIT_WINDOW };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + ADMIN_RATE_LIMIT_WINDOW;
  }
  entry.count += 1;
  adminRateLimits.set(sessionId, entry);
  return entry.count <= ADMIN_RATE_LIMIT_COUNT;
}

function emitWarning(socket, message) {
  socket.emit("warning", { message });
}

function reactionsFor(ids) {
  return Object.fromEntries(ids.map((id) => [String(id), store.reactions[String(id)] || []]));
}

async function loadPersistence() {
  if (isMongoConfigured()) {
    try {
      mongoDb = await getMongoDb();
      const latest = await mongoDb.collection("messages").find().sort({ numericId: -1 }).limit(1).next();
      store.nextId = latest ? Number(latest.numericId) + 1 : 1;
      return;
    } catch (error) {
      console.error("MongoDB unavailable; using local realtime fallback.", {
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : String(error),
      });
      mongoDb = null;
    }
  }
  await loadStore();
}

async function getInitialMessages() {
  if (!mongoDb) return store.messages.slice(-HISTORY_PAGE_SIZE);
  const messages = await mongoDb.collection("messages")
    .find({}, { projection: { _id: 0, numericId: 0 } })
    .sort({ numericId: -1 })
    .limit(HISTORY_PAGE_SIZE)
    .toArray();
  return messages.reverse();
}

async function getHistory(before) {
  const beforeId = String(before || "");
  if (!mongoDb) {
    const current = store.messages.find((message) => String(message.id) === beforeId);
    const boundary = current?.numericId ?? Number(before);
    const older = store.messages.filter((message) => Number(message.numericId ?? message.id) < boundary);
    return { messages: older.slice(-HISTORY_PAGE_SIZE), hasMore: older.length > HISTORY_PAGE_SIZE };
  }
  const collection = mongoDb.collection("messages");
  const current = Number.isSafeInteger(Number(before))
    ? Number(before)
    : await collection.findOne({ id: beforeId }, { projection: { numericId: 1 } });
  const boundary = typeof current === "number" ? current : current?.numericId;
  if (!Number.isSafeInteger(boundary)) return { messages: [], hasMore: false };
  const older = await collection.find({ numericId: { $lt: boundary } }, { projection: { _id: 0, numericId: 0 } })
    .sort({ numericId: -1 })
    .limit(HISTORY_PAGE_SIZE + 1)
    .toArray();
  const hasMore = older.length > HISTORY_PAGE_SIZE;
  return { messages: older.slice(0, HISTORY_PAGE_SIZE).reverse(), hasMore };
}

async function getReactions(ids) {
  if (!mongoDb) return reactionsFor(ids);
  const rows = await mongoDb.collection("reactions").find({ messageId: { $in: ids.map(String) } }).toArray();
  return Object.fromEntries(rows.map((row) => [String(row.messageId), row.reactions]));
}

async function insertMessage(message) {
  if (mongoDb) {
    await mongoDb.collection("messages").insertOne(message);
    return;
  }
  store.messages.push(message);
  saveStore();
}

async function updateMessage(message) {
  if (mongoDb) {
    await mongoDb.collection("messages").updateOne(
      { id: message.id },
      { $set: { content: message.content, editedAt: message.editedAt } },
    );
    return;
  }
  saveStore();
}

async function toggleReaction(messageId, sessionId, emoji) {
  let list;
  if (mongoDb) {
    const row = await mongoDb.collection("reactions").findOne({ messageId: String(messageId) });
    list = row?.reactions || [];
  } else {
    list = store.reactions[String(messageId)] || [];
  }
  let item = list.find((entry) => entry.emoji === emoji);
  if (!item) {
    item = { emoji, sessionIds: [] };
    list.push(item);
  }
  item.sessionIds = item.sessionIds.includes(sessionId)
    ? item.sessionIds.filter((id) => id !== sessionId)
    : [...item.sessionIds, sessionId];
  list = list.filter((entry) => entry.sessionIds.length > 0);
  if (mongoDb) {
    await mongoDb.collection("reactions").updateOne(
      { messageId: String(messageId) },
      { $set: { messageId: String(messageId), reactions: list } },
      { upsert: true },
    );
  } else {
    if (list.length) store.reactions[String(messageId)] = list;
    else delete store.reactions[String(messageId)];
    saveStore();
  }
  return list;
}

await loadPersistence();

const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => callback(null, originAllowed(origin)),
    methods: ["GET", "POST"],
    credentials: true,
  },
  maxHttpBufferSize: 64 * 1024,
});

io.on("connection", async (socket) => {
  const claims = verifyToken(socket.handshake.auth?.sessionToken);
  const sessionId = claims?.sessionId || randomUUID();
  const sessionClaims = claims || {
    ...identityFor(sessionId),
    sessionId,
    isAdmin: false,
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL,
  };
  const location = await getLocation(socket);
  const user = userFor(socket, sessionId, sessionClaims, location);
  const existing = sessions.get(sessionId);
  const session = {
    user,
    claims: sessionClaims,
    location,
    sockets: existing?.sockets || new Set(),
  };
  session.sockets.add(socket.id);
  sessions.set(sessionId, session);
  socket.data.sessionId = sessionId;
  socket.emit("session", { sessionId, sessionToken: signToken(session.claims) });
  sendUsers(io);
  io.emit("msg-receive", {
    id: `system-${socket.id}`,
    type: "system",
    subtype: "join",
    sessionId,
    username: user.name,
    flag: user.flag,
    createdAt: new Date().toISOString(),
  });

  socket.on("msgs-fetch-init", async () => {
    try {
      const messages = await getInitialMessages();
      socket.emit("msgs-receive-init", messages);
      socket.emit("reactions-init", await getReactions(messages.map((message) => message.id)));
    } catch {
      emitWarning(socket, "Unable to load chat history");
    }
  });

  socket.on("msgs-fetch-history", async ({ before } = {}) => {
    const beforeId = cleanText(before, 100);
    if (!beforeId) return;
    try {
      const { messages, hasMore } = await getHistory(beforeId);
      socket.emit("msgs-receive-history", {
        messages,
        hasMore,
        reactions: await getReactions(messages.map((message) => message.id)),
      });
    } catch {
      emitWarning(socket, "Unable to load older messages");
    }
  });

  socket.on("msg-send", async ({ content, replyTo } = {}) => {
    const text = cleanText(content);
    if (!text) return emitWarning(socket, "msg-send: message cannot be empty");
    if (!canSend(sessionId)) return emitWarning(socket, "msg-send rate limit reached");
    const current = sessions.get(sessionId)?.user;
    if (!current) return;
    const reply = replyTo
      ? mongoDb
        ? await mongoDb.collection("messages").findOne({ id: String(replyTo) }, { projection: { _id: 0, id: 1, username: 1, content: 1 } })
        : store.messages.find((message) => String(message.id) === String(replyTo))
      : null;
    const message = {
      id: randomUUID(),
      numericId: store.nextId++,
      sessionId,
      flag: current.flag,
      country: "",
      username: current.name,
      avatar: current.avatar,
      color: current.color,
      isAdmin: Boolean(current.isAdmin),
      content: text,
      createdAt: new Date().toISOString(),
      ...(reply && { replyTo: { id: reply.id, username: reply.username, content: reply.content } }),
    };
    try {
      await insertMessage(message);
      io.emit("msg-receive", message);
    } catch {
      emitWarning(socket, "Unable to save message");
    }
  });

  socket.on("msg-edit", async ({ id, content } = {}) => {
    const message = mongoDb
      ? await mongoDb.collection("messages").findOne({ id: String(id) })
      : store.messages.find((item) => String(item.id) === String(id));
    const text = cleanText(content);
    if (!message || message.sessionId !== sessionId || !text) return;
    if (Date.now() - new Date(message.createdAt).getTime() > 5 * 60_000) return emitWarning(socket, "Messages can only be edited for five minutes");
    message.content = text;
    message.editedAt = new Date().toISOString();
    try {
      await updateMessage(message);
      io.emit("msg-update", { id: message.id, content: message.content, editedAt: message.editedAt });
    } catch {
      emitWarning(socket, "Unable to edit message");
    }
  });

  socket.on("reaction-toggle", async ({ messageId, emoji } = {}) => {
    const message = mongoDb
      ? await mongoDb.collection("messages").findOne({ id: String(messageId) })
      : store.messages.find((item) => String(item.id) === String(messageId));
    const reaction = cleanText(emoji, 16);
    if (!message || !reaction) return;
    try {
      const list = await toggleReaction(message.id, sessionId, reaction);
      io.emit("reaction-update", { messageId: String(message.id), reactions: list });
    } catch {
      emitWarning(socket, "Unable to save reaction");
    }
  });

  socket.on("update-user", ({ avatar, color } = {}) => {
    const current = sessions.get(sessionId);
    if (!current || !/^#[0-9a-f]{6}$/i.test(color || "")) return emitWarning(socket, "Invalid profile update");
    current.user.avatar = cleanText(avatar, 100) || current.user.avatar;
    current.user.color = color;
    current.claims = {
      ...current.claims,
      avatar: current.user.avatar,
      color: current.user.color,
      issuedAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL,
    };
    socket.emit("session", { sessionId, sessionToken: signToken(current.claims) });
    sendUsers(io);
  });

  socket.on("typing-send", () => {
    const current = sessions.get(sessionId)?.user;
    if (current) socket.broadcast.emit("typing-receive", { socketId: socket.id, username: current.name, isTyping: true });
  });

  socket.on("cursor-change", ({ pos } = {}) => {
    if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return;
    socket.broadcast.emit("cursor-changed", { socketId: socket.id, pos: { x: pos.x, y: pos.y } });
  });

  socket.on("admin-auth", ({ password } = {}) => {
    if (!canAttemptAdmin(sessionId) || !process.env.REALTIME_ADMIN_PASSWORD || password !== process.env.REALTIME_ADMIN_PASSWORD) return emitWarning(socket, "Admin authentication failed");
    const current = sessions.get(sessionId);
    if (!current) return;
    const identity = identityFor(sessionId);
    current.claims = { ...identity, sessionId, isAdmin: true, issuedAt: Date.now(), expiresAt: Date.now() + SESSION_TTL };
    current.claims.name = cleanText(process.env.REALTIME_ADMIN_NAME, 40) || "Portfolio Admin";
    current.user.name = current.claims.name;
    current.user.isAdmin = true;
    socket.emit("session", { sessionId, sessionToken: signToken(current.claims) });
    sendUsers(io);
  });

  socket.on("disconnect", () => {
    const current = sessions.get(sessionId);
    current?.sockets.delete(socket.id);
    if (current && current.sockets.size === 0) sessions.delete(sessionId);
    sendUsers(io);
  });
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Realtime server listening on port ${PORT}`);
});
