import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) onLogin(username.trim());
  };

  return (
    <div className="p-4 flex flex-col gap-2 max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold">Enter a username to join chat</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. marycathline"
          className="border p-2 w-full"
        />
        <button type="submit" className="mt-2 p-2 bg-blue-600 text-white rounded">
          Join Chat
        </button>
      </form>
    </div>
  );
}
