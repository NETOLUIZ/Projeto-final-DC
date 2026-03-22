const { Server } = require('socket.io');

let io; // Variável global neste arquivo para manter a referência do Socket.io

// Função para configurar e inicializar o servidor de Sockets
const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Define quais domínios podem conectar. No ambiente de produção, é ideal trocar '*' pela URL do front-end.
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  // Evento disparado toda vez que um novo cliente (front-end) se conecta
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Permite que os clientes entrem em 'salas' específicas (ex: sala 'PDV' ou sala com ID do cliente)
    // Isso é útil para mandar mensagens focadas apenas para a cozinha, ou apenas para o cliente aguardando pedido.
    socket.on('join', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Evento disparado quando o cliente fecha a aba/aplicativo ou perde conexão
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Função auxiliar para pegar a instância do io em outros arquivos (ex: nos controllers)
const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Dispara um evento para TODOS os clientes conectados (útil para atualizar tela do PDV com um pedido novo)
const emitToAll = (event, data) => {
  getIo().emit(event, data);
};

// Dispara um evento apenas para uma sala específica (útil para atualizar o status do pedido celular do cliente X)
const emitToRoom = (room, event, data) => {
  getIo().to(room).emit(event, data);
};

module.exports = { setupSocket, getIo, emitToAll, emitToRoom };
