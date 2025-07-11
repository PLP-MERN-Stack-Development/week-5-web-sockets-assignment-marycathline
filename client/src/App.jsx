import { useContext, useEffect, useRef, useState } from "react";
import socket from "./socket/socket";
import Login from "./pages/Login";
import { ChatContext } from "./context/ChatContext";
import PrivateChat from "./components/PrivateChat";
import axios from "axios";

function App() {
  const {
    user,
    setUser,
    room,
    roomList,
    joinRoom,
    onlineUsers,
    typingUsers,
  } = useContext(ChatContext);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const chatBoxRef = useRef(null);

  // ✅ Play sound
  const playNotificationSound = () => {
    const audio = new Audio("/ping.mp3");
    audio.play().catch((e) => console.log("🔇 Sound blocked:", e.message));
  };

  // ✅ Show browser notification
  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/chat-icon.png",
      });
    }
  };

  // ✅ Load older messages
  const loadOlderMessages = async () => {
    if (!room || loadingOlder || messages.length === 0) return;
    setLoadingOlder(true);
    const oldest = messages[0].timestamp;
    try {
      const res = await axios.get(`/api/messages?room=${room}&before=${oldest}`);
      setMessages((prev) => [...res.data, ...prev]);
    } catch (err) {
      console.error("Failed to fetch older messages", err);
    }
    setLoadingOlder(false);
  };

  // ✅ Scroll to bottom + reset unread count
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
    setUnreadCount(0);
  }, [messages]);

  // ✅ Handle file sharing
  const handleFileSend = (file) => {
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = () => {
      const msgData = {
        image: reader.result,
        sender: user,
        room,
        timestamp: new Date().toISOString(),
      };
      socket.emit("send_message", msgData, () => {
        console.log("📤 File message delivered");
      });
    };
    reader.readAsDataURL(file);
  };

  // ✅ Handle reactions
  const handleReaction = (msgId, emoji) => {
    socket.emit("add_reaction", { msgId, emoji });
  };

  // ✅ Mark messages as read
  useEffect(() => {
    socket.emit("mark_read", room);
  }, [messages, room]);

  // ✅ Listeners
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      if (msg.sender !== user && msg.room === room) {
        playNotificationSound();
        showNotification("New message from " + msg.sender, msg.text || "Image");
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on("update_reactions", ({ msgId, emoji }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId
            ? {
                ...msg,
                reactions: {
                  ...msg.reactions,
                  [emoji]: (msg.reactions?.[emoji] || 0) + 1,
                },
              }
            : msg
        )
      );
    });

    socket.on("read_receipt", ({ msgId, readers }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === msgId ? { ...msg, readers } : msg))
      );
    });

    socket.on("user_joined", ({ username }) => {
      if (username !== user) {
        playNotificationSound();
        showNotification("User joined", `${username} has joined the chat`);
      }
    });

    socket.on("user_left", ({ username }) => {
      showNotification("User left", `${username} has left the chat`);
    });

    return () => {
      socket.off("receive_message");
      socket.off("update_reactions");
      socket.off("read_receipt");
      socket.off("user_joined");
      socket.off("user_left");
    };
  }, [room, user]);

  // ✅ Join
  useEffect(() => {
    if (user) {
      socket.emit("user_join", user);
      Notification.requestPermission();
    }
  }, [user]);

  // ✅ Send message
  const sendMessage = () => {
    if (!message.trim()) return;

    const msgData = {
      id: Date.now(),
      text: message,
      sender: user,
      room,
      timestamp: new Date().toISOString(),
      reactions: {},
      readers: [],
    };

    socket.emit("send_message", msgData, () => {
      console.log("✅ Message delivered");
    });
    setMessage("");
    socket.emit("typing", false);
  };

  const handleTyping = () => {
    socket.emit("typing", true);
    setTimeout(() => {
      socket.emit("typing", false);
    }, 1000);
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Hello {user} 👋</h2>

      <PrivateChat />

      {/* Room Selector */}
      <div className="mb-4">
        <label className="mr-2">Room:</label>
        <select
          value={room}
          onChange={(e) => joinRoom(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {roomList.map((r) => (
            <option key={r} value={r}>
              #{r}
            </option>
          ))}
        </select>
      </div>

      {/* Load Older */}
      <button
        onClick={loadOlderMessages}
        disabled={loadingOlder}
        className="text-sm text-blue-600 mb-2"
      >
        {loadingOlder ? "Loading..." : "Load older messages"}
      </button>

      {/* Messages */}
      <div
        ref={chatBoxRef}
        className="space-y-2 border p-3 rounded h-64 overflow-y-auto bg-gray-50"
      >
        {messages
          .filter((msg) => msg.room === room)
          .map((msg, i) => (
            <div key={i} className="text-sm">
              <strong>{msg.sender}</strong>: {msg.text && <span>{msg.text}</span>}
              {msg.image && (
                <img
                  src={msg.image}
                  alt="shared"
                  className="max-w-xs mt-1 rounded"
                />
              )}
              <div className="text-xs text-gray-500">
                ({new Date(msg.timestamp).toLocaleTimeString()})
              </div>
              <div className="flex space-x-2 mt-1 text-xs">
                {"❤️👍😂".split("").map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(msg.id, emoji)}
                    className="hover:scale-110"
                  >
                    {emoji} {msg.reactions?.[emoji] || ""}
                  </button>
                ))}
              </div>
              {msg.readers?.length > 0 && (
                <div className="text-[10px] text-gray-400 mt-1">
                  Seen by: {msg.readers.join(", ")}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Typing */}
      {typingUsers.length > 0 && (
        <p className="italic text-sm mt-1 text-gray-600">
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
        </p>
      )}

      {/* Input */}
      <div className="mt-4">
        <input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type your message"
          className="border p-2 w-full"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSend(e.target.files[0])}
          className="mt-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 mt-2 rounded"
        >
          Send
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-700">
        <strong>Online in #{room}:</strong> {onlineUsers.length
          ? onlineUsers.map((u) => u.username).join(", ")
          : "No users"}
      </div>

      {unreadCount > 0 && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full shadow">
          🔔 {unreadCount} unread {unreadCount > 1 ? "messages" : "message"}
        </div>
      )}
    </div>
  );
}

export default App;
