# Pizzaria Backend

Este é o backend completo do sistema de pizzaria com PDV, delivery, e atendimento no local. Desenvolvido com **Node.js, Express, MySQL, Prisma ORM e Socket.io**.

## Requisitos

- **Node.js** (v18 ou superior recomendado)
- **MySQL** (Servidor rodando localmente ou remoto)

## Como rodar o projeto

1. **Instale as dependências:**
   \`\`\`bash
   npm install
   \`\`\`
   *(Obs: Certifique-se de estar na pasta do projeto `pizzaria-backend`)*

2. **Configure o Banco de Dados:**
   - Crie um banco de dados no seu MySQL (por exemplo: `pizzaria_db`).
   - Copie o arquivo `.env.example` para `.env`:
     \`\`\`bash
     cp .env.example .env
     \`\`\`
   - Edite o arquivo `.env` e ajuste a variável `DATABASE_URL` com as suas credenciais do MySQL.
     Exemplo: `DATABASE_URL="mysql://root:suasenha@localhost:3306/pizzaria_db"`

3. **Gere as tabelas no banco de dados e o cliente do Prisma:**
   \`\`\`bash
   npx prisma db push
   npx prisma generate
   \`\`\`

4. **Execute o script de Seed (Opcional, mas recomendado para criar o primeiro ADMIN):**
   \`\`\`bash
   npm run seed
   \`\`\`
   Este comando criará um usuário administrador inicial:
   - **Email:** admin@pizzaria.com
   - **Senha:** admin123

5. **Inicie o servidor de desenvolvimento:**
   \`\`\`bash
   npm run dev
   \`\`\`

O servidor estará rodando em `http://localhost:3333`.

## Funcionalidades Prontas

- **Autenticação JWT** e controle de perfis (ADMIN, ATENDENTE, COZINHA, ENTREGADOR).
- **CRUD e Regras de Negócio** para: Produtos, Categorias, Usuários, Mesas, Caixa, Entregadores, e Pedidos.
- **Socket.io Integrado:** 
  - Emite `pedido:novo` quando um pedido é criado.
  - Emite `pedido:status` quando o status é atualizado.
  - Emite `pedido:atualizado` quando atribuído a entregador, etc.
- **Impressão de Pedidos:** Endpoint `GET /api/orders/:id/print` mapeia e organiza os dados em JSON padronizado para fácil integração com impressoras térmicas pelo frontend PDV ou outro cliente de impressão.

## Estrutura de Pastas

\`\`\`
/src
  /config         # Variáveis e setups (JWT config)
  /controllers    # Lógica dos endpoints
  /middlewares    # Proteção de rotas, verificação de perfis e tratamento de erros
  /prisma         # Inicialização do Prisma Client
  /routes         # Mapeamento do Express Router
  /services       # Serviços externos como formatação de impressão
  /sockets        # Setup centralizado do Socket.io
  /utils          # Classes de erro e encriptadores (bCrypt)
  app.js          # Configuração dos middlewares principais do Express
  server.js       # Inicialização do servidor HTTP + Sockets
/prisma
  schema.prisma   # Modelagem de dados
  seed.js         # Script de carga inicial de banco
\`\`\`
