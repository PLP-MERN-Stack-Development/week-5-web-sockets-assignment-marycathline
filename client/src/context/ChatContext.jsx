import { createContext, useState, useEffect } from 'react';
import socket from '../socket/socket';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Current user
  const [onlineUsers, setOnlineUsers] = useState([]); // All users in current room
  const [roomList, setRoomList] = useState([]); // Available rooms
  const [room, setRoom] = useState('general'); // Current active room
  const [typingUsers, setTypingUsers] = useState([]); // Who is typing
  const [privateMessages, setPrivateMessages] = useState({}); // { socketId: [msg, msg] }

  useEffect(() => {
    // Server sends list of users in current room
    socket.on('user_list', setOnlineUsers);

    // Server sends list of available rooms
    socket.on('room_list', setRoomList);

    // Users typing in the current room
    socket.on('typing_users', setTypingUsers);

    // Handle incoming private messages
    socket.on('private_message', (msg) => {
      setPrivateMessages((prev) => {
        const from = msg.senderId;
        const existing = prev[from] || [];
        return {
          ...prev,
          [from]: [...existing, msg],
        };
      });
    });

    return () => {
      socket.off('user_list');
      socket.off('room_list');
      socket.off('typing_users');
      socket.off('private_message');
    };
  }, []);

  // Join a new room
  const joinRoom = (newRoom) => {
    socket.emit('join_room', newRoom);
    setRoom(newRoom);
  };

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        onlineUsers,
        room,
        roomList,
        joinRoom,
        typingUsers,
        privateMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
