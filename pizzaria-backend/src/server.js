// Importações principais do Node e do projeto
const http = require('http');
const app = require('./app'); // Instância do Express configurada
const config = require('./config'); // Variáveis de ambiente e configuração
const { setupSocket } = require('./sockets'); // Módulo de WebSockets (tempo real)

// Criação do servidor HTTP passando a aplicação Express
// Usamos http.createServer para podermos anexar o Socket.io no mesmo servidor
const server = http.createServer(app);

// Inicializa o Socket.io, permitindo comunicação em tempo real
setupSocket(server);

// Faz o servidor escutar na porta definida (ex: 3333)
server.listen(config.port, () => {
  console.log(`Server running in ${config.env} mode on port ${config.port}`);
});

// Listener global para capturar promessas rejeitadas e não tratadas (ex: queda de banco forçada)
// Evita o travamento do Node sem logs claros
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
