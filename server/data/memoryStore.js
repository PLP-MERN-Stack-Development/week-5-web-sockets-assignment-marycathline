// server/data/memoryStore.js
const users = {}; // { socket.id: { username, id, room } }
const messages = []; // All messages
const typingUsers = {};
const rooms = ['general', 'support', 'random'];

module.exports = { users, messages, typingUsers, rooms };
