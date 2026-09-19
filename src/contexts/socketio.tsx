"use client";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useToast } from "@/components/ui/use-toast";
import { useSounds } from "@/components/realtime/hooks/use-sounds";

export type User = {
  id: string;
  socketId: string;
  name: string;
  avatar: string;
  color: string;
  isOnline: boolean;
  location: string;
  flag: string;
  lastSeen: string;
  createdAt: string;
  isAdmin?: boolean;
};
export type Message = {
  id: string;
  sessionId: string;
  flag: string;
  country: string;
  city?: string;
  username: string;
  avatar: string;
  color?: string;
  content: string;
  createdAt: string | Date;
  editedAt?: string | Date;
  replyTo?: { id: string; username: string; content: string };
  isAdmin?: boolean;
};

export type SystemMessage = {
  id: string;
  type: "system";
  subtype: "join";
  sessionId: string;
  username: string;
  flag: string;
  createdAt: string | Date;
};

export type ChatItem = Message | SystemMessage;

export type Reaction = { emoji: string; sessionIds: string[] };

export type UserProfile = { name: string; avatar: string; color: string; isAdmin?: boolean };

export type CursorPosition = { x: number; y: number };

type SocketContextType = {
  socket: Socket | null;
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  msgs: ChatItem[];
  reactions: Map<string, Reaction[]>;
  profileMap: Map<string, UserProfile>;
  cursorPositions: Map<string, CursorPosition>;
  followingId: string | null;
  setFollowingId: Dispatch<SetStateAction<string | null>>;
  hasMoreMessages: boolean;
  loadingHistory: boolean;
  fetchOlderMessages: () => void;
  initStatus: "idle" | "loading" | "loaded";
  fetchInitialMessages: () => void;
  unreadCount: number;
  soundMuted: boolean;
  setChatViewing: (isViewing: boolean) => void;
  clearUnread: () => void;
  toggleSound: () => void;
};

const INITIAL_STATE: SocketContextType = {
  socket: null,
  users: [],
  setUsers: () => { },
  msgs: [],
  reactions: new Map(),
  profileMap: new Map(),
  cursorPositions: new Map(),
  followingId: null,
  setFollowingId: () => { },
  hasMoreMessages: true,
  loadingHistory: false,
  fetchOlderMessages: () => { },
  initStatus: "idle",
  fetchInitialMessages: () => { },
  unreadCount: 0,
  soundMuted: false,
  setChatViewing: () => { },
  clearUnread: () => { },
  toggleSound: () => { },
};

export const SocketContext = createContext<SocketContextType>(INITIAL_STATE);

const SESSION_TOKEN_KEY = "portfolio-site-session-token";
const SOUND_MUTED_KEY = "portfolio-chat-sound-muted";

function mergeChatItems(current: ChatItem[], incoming: ChatItem[]) {
  const byId = new Map<string, ChatItem>();
  for (const item of [...current, ...incoming]) byId.set(String(item.id), item);
  return [...byId.values()].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

const SocketContextProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [msgs, setMsgs] = useState<ChatItem[]>([]);
  const [reactions, setReactions] = useState<Map<string, Reaction[]>>(new Map());
  const [profileMap, setProfileMap] = useState<Map<string, UserProfile>>(new Map());
  const [cursorPositions, setCursorPositions] = useState<Map<string, CursorPosition>>(new Map());
  const [followingId, setFollowingId] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [initStatus, setInitStatus] = useState<"idle" | "loading" | "loaded">("idle");
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundMuted, setSoundMuted] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const knownMessageIdsRef = useRef(new Set<string>());
  const soundMutedRef = useRef(false);
  const initStatusRef = useRef<"idle" | "loading" | "loaded">("idle");
  const chatViewingRef = useRef(false);
  const { playSendSound, playReceiveSound } = useSounds();

  const fetchInitialMessages = useCallback(() => {
    if (initStatusRef.current !== "idle") return;
    const s = socketRef.current;
    if (!s) return;
    initStatusRef.current = "loading";
    setInitStatus("loading");
    s.emit("msgs-fetch-init");
  }, []);

  const fetchOlderMessages = useCallback(() => {
    const s = socketRef.current;
    if (!s || loadingHistory || !hasMoreMessages) return;
    setMsgs(current => {
      if (current.length === 0) return current;
      const oldestId = String(current[0].id);
      if (!oldestId) return current;
      setLoadingHistory(true);
      s.emit("msgs-fetch-history", { before: oldestId });
      return current;
    });
  }, [loadingHistory, hasMoreMessages]);

  // Keep profileMap in sync — only adds/updates, never removes
  useEffect(() => {
    if (users.length === 0) return;
    setProfileMap(prev => {
      const next = new Map(prev);
      for (const u of users) {
        next.set(u.id, { name: u.name, avatar: u.avatar, color: u.color, isAdmin: u.isAdmin });
      }
      return next;
    });
  }, [users]);
  const { toast } = useToast();

  useEffect(() => {
    const muted = localStorage.getItem(SOUND_MUTED_KEY) === "1";
    soundMutedRef.current = muted;
    setSoundMuted(muted);
  }, []);

  const setChatViewing = useCallback((isViewing: boolean) => {
    chatViewingRef.current = isViewing;
    if (isViewing) setUnreadCount(0);
  }, []);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  const toggleSound = useCallback(() => {
    setSoundMuted((muted) => {
      const next = !muted;
      soundMutedRef.current = next;
      localStorage.setItem(SOUND_MUTED_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  // SETUP SOCKET.IO
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_WS_URL) return;
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: {
        sessionToken: localStorage.getItem(SESSION_TOKEN_KEY),
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelayMax: 5000,
    });
    setSocket(newSocket);
    socketRef.current = newSocket;
    newSocket.on("connect", () => {
      // Resync the latest history after a reconnect (e.g. waking from sleep)
      if (initStatusRef.current === "loaded") {
        newSocket.emit("msgs-fetch-init");
      }
    });
    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
    newSocket.on("disconnect", (reason) => {
      // Transport drops auto-reconnect; only a server disconnect needs a manual nudge
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });
    newSocket.on("users-updated", (data: User[]) => {
      setUsers(data);
    });
    newSocket.on("cursor-changed", (data: { pos: { x: number; y: number }; socketId: string }) => {
      setCursorPositions(prev => {
        const next = new Map(prev);
        next.set(data.socketId, data.pos);
        return next;
      });
    });
    newSocket.on("msgs-receive-init", (msgs: ChatItem[]) => {
      msgs.forEach((item) => knownMessageIdsRef.current.add(String(item.id)));
      setMsgs((current) => mergeChatItems(current, msgs));
      setHasMoreMessages(true);
      initStatusRef.current = "loaded";
      setInitStatus("loaded");
    });
    newSocket.on("msgs-receive-history", (data: { messages: ChatItem[]; hasMore: boolean; reactions: Record<string, Reaction[]> }) => {
      data.messages.forEach((item) => knownMessageIdsRef.current.add(String(item.id)));
      setMsgs(prev => mergeChatItems(prev, data.messages));
      setHasMoreMessages(data.hasMore);
      setLoadingHistory(false);
      if (data.reactions) {
        setReactions(prev => {
          const next = new Map(prev);
          for (const [msgId, rxns] of Object.entries(data.reactions)) {
            if (rxns.length === 0) next.delete(msgId);
            else next.set(msgId, rxns);
          }
          return next;
        });
      }
    });
    newSocket.on("session", ({ sessionId: nextSessionId, sessionToken }: { sessionId: string; sessionToken: string }) => {
      sessionIdRef.current = nextSessionId;
      localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
      const savedAvatar = localStorage.getItem("avatar");
      const savedColor = localStorage.getItem("color");
      if (savedAvatar && savedColor) {
        newSocket.emit("update-user", { avatar: savedAvatar, color: savedColor });
      }
    });

    newSocket.on("msg-receive", (message: ChatItem) => {
      const messageId = String(message.id);
      if (knownMessageIdsRef.current.has(messageId)) return;
      knownMessageIdsRef.current.add(messageId);
      setMsgs((current) => mergeChatItems(current, [message]));

      if (!("type" in message)) {
        if (message.sessionId === sessionIdRef.current) {
          if (!soundMutedRef.current) playSendSound();
        } else if (!chatViewingRef.current) {
          setUnreadCount((count) => count + 1);
          if (!soundMutedRef.current) playReceiveSound();
        }
      }
    });

    newSocket.on("warning", (data: { message: string }) => {
      toast({
        variant: "destructive",
        title: "System Warning",
        description: data.message,
      });
    });

    newSocket.on("msg-delete", (data: { id: string | number }) => {
      setMsgs((prev) => prev.filter((m) => String(m.id) !== String(data.id)));
    });

    newSocket.on("msg-update", (data: { id: string; content: string; editedAt: string }) => {
      setMsgs((prev) => prev.map((m) =>
        String(m.id) === String(data.id) && (!("type" in m) || !m.type)
          ? { ...m, content: data.content, editedAt: data.editedAt }
          : m
      ));
    });

    newSocket.on("reactions-init", (data: Record<string, Reaction[]>) => {
      setReactions(new Map(Object.entries(data)));
    });
    newSocket.on("reaction-update", (data: { messageId: string; reactions: Reaction[] }) => {
      setReactions(prev => {
        const next = new Map(prev);
        if (data.reactions.length === 0) next.delete(data.messageId);
        else next.set(data.messageId, data.reactions);
        return next;
      });
    });

    // Kick a reconnect on wake/refocus/network-return; backoff timers can stall through sleep
    const ensureConnected = () => {
      if (!newSocket.connected) newSocket.connect();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") ensureConnected();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", ensureConnected);
    window.addEventListener("focus", ensureConnected);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", ensureConnected);
      window.removeEventListener("focus", ensureConnected);
      newSocket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SocketContext.Provider value={{ socket, users, setUsers, msgs, reactions, profileMap, cursorPositions, followingId, setFollowingId, hasMoreMessages, loadingHistory, fetchOlderMessages, initStatus, fetchInitialMessages, unreadCount, soundMuted, setChatViewing, clearUnread, toggleSound }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;
