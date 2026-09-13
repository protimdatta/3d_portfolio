import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import process from "node:process";
import { Server } from "socket.io";
import { getMongoDb, isMongoConfigured } from "./mongodb.mjs";

const PORT = Number(process.env.REALTIME_PORT || 4000);
const DATA_DIR = new URL("./data/", import.meta.url);
const DATA_FILE = new URL("./messages.json", DATA_DIR);
const MAX_MESSAGE_LENGTH = 500;
const HISTORY_PAGE_SIZE = 50;
const RATE_LIMIT_COUNT = 5;
const RATE_LIMIT_WINDOW = 10_000;
const COLORS = ["#60a5fa", "#f87171", "#4ade80", "#facc15", "#c084fc", "#fb923c"];

const allowedOrigins = new Set(
  (process.env.REALTIME_ALLOWED_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000,http://192.168.0.100:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

const originAllowed = (origin) => !origin || allowedOrigins.has(origin);
const sessions = new Map();
const rateLimits = new Map();
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

function userFor(socket, sessionId) {
  const existing = sessions.get(sessionId);
  return {
    id: sessionId,
    socketId: socket.id,
    name: existing?.name || `Guest-${sessionId.slice(0, 5)}`,
    avatar: existing?.avatar || String((sessionId.charCodeAt(0) % 100) + 1),
    color: existing?.color || COLORS[sessionId.charCodeAt(1) % COLORS.length],
    isOnline: true,
    location: "",
    flag: "🌐",
    lastSeen: new Date().toISOString(),
    createdAt: existing?.createdAt || new Date().toISOString(),
    isAdmin: existing?.isAdmin || false,
  };
}

function publicUsers() {
  return [...sessions.values()].map((user) => ({ ...user }));
}

function sendUsers(io) {
  io.emit("users-updated", publicUsers());
}

function canSend(socket) {
  const now = Date.now();
  const entry = rateLimits.get(socket.id) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_LIMIT_WINDOW;
  }
  entry.count += 1;
  rateLimits.set(socket.id, entry);
  return entry.count <= RATE_LIMIT_COUNT;
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
    } catch {
      console.error("MongoDB unavailable; using local realtime fallback.");
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
  if (!mongoDb) {
    const older = store.messages.filter((message) => Number(message.id) < before);
    return { messages: older.slice(-HISTORY_PAGE_SIZE), hasMore: older.length > HISTORY_PAGE_SIZE };
  }
  const collection = mongoDb.collection("messages");
  const older = await collection.find({ numericId: { $lt: before } }, { projection: { _id: 0, numericId: 0 } })
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
    await mongoDb.collection("messages").insertOne({ ...message, numericId: Number(message.id) });
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

io.on("connection", (socket) => {
  const requestedSession = cleanText(socket.handshake.auth?.sessionId, 100);
  const sessionId = requestedSession || randomUUID();
  const user = userFor(socket, sessionId);
  sessions.set(sessionId, user);
  socket.data.sessionId = sessionId;
  socket.emit("session", { sessionId });
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
    const beforeId = Number(before);
    if (!Number.isSafeInteger(beforeId)) return;
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
    if (!canSend(socket)) return emitWarning(socket, "msg-send rate limit reached");
    const current = sessions.get(sessionId);
    const reply = replyTo
      ? mongoDb
        ? await mongoDb.collection("messages").findOne({ id: String(replyTo) }, { projection: { _id: 0, id: 1, username: 1, content: 1 } })
        : store.messages.find((message) => String(message.id) === String(replyTo))
      : null;
    const message = {
      id: String(store.nextId++),
      sessionId,
      flag: current.flag,
      country: "",
      username: current.name,
      avatar: current.avatar,
      color: current.color,
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

  socket.on("update-user", ({ username, avatar, color } = {}) => {
    const current = sessions.get(sessionId);
    const name = cleanText(username, 40);
    if (!current || !name || !/^#[0-9a-f]{6}$/i.test(color || "")) return emitWarning(socket, "Invalid profile update");
    current.name = name;
    current.avatar = cleanText(avatar, 100) || current.avatar;
    current.color = color;
    sessions.set(sessionId, current);
    sendUsers(io);
  });

  socket.on("typing-send", ({ username } = {}) => {
    socket.broadcast.emit("typing-receive", { socketId: socket.id, username: cleanText(username, 40) || "Someone", isTyping: true });
  });

  socket.on("cursor-change", ({ pos } = {}) => {
    if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return;
    socket.broadcast.emit("cursor-changed", { socketId: socket.id, pos: { x: pos.x, y: pos.y } });
  });

  socket.on("admin-auth", ({ password } = {}) => {
    if (!process.env.REALTIME_ADMIN_PASSWORD || password !== process.env.REALTIME_ADMIN_PASSWORD) return emitWarning(socket, "Admin authentication failed");
    const current = sessions.get(sessionId);
    current.isAdmin = true;
    sessions.set(sessionId, current);
    sendUsers(io);
  });

  socket.on("disconnect", () => {
    sessions.delete(sessionId);
    rateLimits.delete(socket.id);
    sendUsers(io);
  });
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Realtime server listening on port ${PORT}`);
});
