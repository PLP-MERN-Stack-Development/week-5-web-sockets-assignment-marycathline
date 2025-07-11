import { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import socket from "../socket/socket";

const PrivateChat = () => {
  const { user, onlineUsers, privateMessages } = useContext(ChatContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim() || !selectedUser) return;

    socket.emit("private_message", {
      to: selectedUser.id,
      message,
    });

    setMessage("");
  };

  const messages = selectedUser ? privateMessages[selectedUser.id] || [] : [];

  return (
    <div className="border rounded p-4 mt-6">
      <h3 className="text-lg font-bold mb-2">Private Messages</h3>

      <div className="mb-4">
        <label className="block mb-1">Select a user:</label>
        <select
          onChange={(e) => {
            const userId = e.target.value;
            const userObj = onlineUsers.find((u) => u.id === userId);
            setSelectedUser(userObj || null);
          }}
          className="border px-2 py-1 rounded w-full"
        >
          <option value="">-- Choose user --</option>
          {onlineUsers
            .filter((u) => u.username !== user)
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
        </select>
      </div>

      {selectedUser && (
        <div>
          <div className="h-40 overflow-y-auto border p-2 rounded bg-gray-50 text-sm mb-2">
            {messages.map((msg, i) => (
              <div key={i}>
                <strong>{msg.sender}:</strong> {msg.message}{" "}
                <em className="text-xs text-gray-500">
                  ({new Date(msg.timestamp).toLocaleTimeString()})
                </em>
              </div>
            ))}
          </div>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border p-2 w-full"
            placeholder={`Message ${selectedUser.username}`}
          />
          <button
            onClick={handleSend}
            className="bg-green-600 text-white px-4 py-1 mt-2 rounded"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default PrivateChat;
