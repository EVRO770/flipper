const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'https://front-one-eta.vercel.app',
  methods: ['GET', 'POST'],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: 'https://front-one-eta.vercel.app',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
let messageHistory = [];

io.on('connection', socket => {
  console.log('🔌 Пользователь подключился');

  // Отправка истории
  socket.emit('history', messageHistory);

  // Новое сообщение
  socket.on('message', data => {
    messageHistory.push(data);
    if (messageHistory.length > 100) messageHistory.shift();
    io.emit('message', data);
  });

  // Очистка истории
  socket.on('clear', () => {
    messageHistory = [];
    io.emit('history', []);
    console.log('🧹 История чата очищена');
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
