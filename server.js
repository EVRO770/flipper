const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*'
  }
});

// Хранилище сообщений
const messagesFile = path.join(__dirname, 'messages.json');
let messages = [];

if (fs.existsSync(messagesFile)) {
  messages = JSON.parse(fs.readFileSync(messagesFile));
}

io.on('connection', socket => {
  console.log('Пользователь подключился');
  socket.emit('history', messages);

  socket.on('message', data => {
    messages.push(data);
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился');
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));