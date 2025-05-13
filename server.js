const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const fs = require('fs');

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
const HISTORY_FILE = './messages.json';

// Загружаем историю сообщений из файла при запуске
let messageHistory = [];
if (fs.existsSync(HISTORY_FILE)) {
  try {
    const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
    messageHistory = JSON.parse(data);
  } catch (e) {
    console.error('Ошибка чтения истории:', e);
  }
}

// Обработка подключений
io.on('connection', socket => {
  console.log('🔌 Пользователь подключился');

  // Отправка истории сообщений новому клиенту
  socket.emit('history', messageHistory);

  // Обработка новых сообщений
  socket.on('message', data => {
    messageHistory.push(data);
    if (messageHistory.length > 100) messageHistory.shift(); // обрезаем до 100 сообщений
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(messageHistory, null, 2));
    io.emit('message', data); // отправляем всем
  });

  // Обработка запроса на очистку чата
  socket.on('clear', () => {
    messageHistory = [];
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
    io.emit('history', []); // очищаем чат у всех клиентов
    console.log('🧹 История чата очищена');
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
