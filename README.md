# Projeto Final DC

Sistema de pizzaria com backend já implementado e espaço preparado para o frontend operacional.

## O que existe hoje

- backend em Node.js + Express
- Prisma com MySQL
- autenticação JWT
- Socket.io para eventos em tempo real
- documentação de handoff para o frontend

## Estrutura

```text
.
|-- frontend_handoff.md
|-- implementation_plan.md
`-- pizzaria-backend/
```

## Arquivos importantes

- `frontend_handoff.md`: guia para o time de frontend construir as telas e integrar com a API
- `implementation_plan.md`: visão geral da implementação
- `pizzaria-backend/`: aplicação backend

## Backend

O backend fica em `pizzaria-backend`.

### Stack

- Node.js
- Express
- Prisma
- MySQL
- JWT
- Socket.io
- Zod

### Requisitos

- Node.js 18+
- MySQL disponível localmente ou remoto

### Instalação

Entre na pasta do backend:

```bash
cd pizzaria-backend
```

Instale as dependências:

```bash
npm install
```

### Configuração do ambiente

Crie um arquivo `.env` dentro de `pizzaria-backend` com algo nesse formato:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=7d
DATABASE_URL="mysql://root:sua_senha@localhost:3306/pizzaria_db"
```

### Banco de dados

Suba o schema no banco:

```bash
npx prisma db push
npx prisma generate
```

Popular dados iniciais:

```bash
npm run seed
```

### Rodando o servidor

Desenvolvimento:

```bash
npm run dev
```

Produção local:

```bash
npm start
```

API local:

```text
http://localhost:3000/api
```

## Principais módulos da API

- `auth`
- `users`
- `categories`
- `products`
- `tables`
- `cash`
- `drivers`
- `orders`
- `dashboard`

## Tempo real

O backend emite eventos Socket.io para atualização operacional:

- `pedido:novo`
- `pedido:status`
- `pedido:atualizado`

## Frontend

O frontend ainda não está implementado neste repositório.

Para começar a construção do front, use este arquivo primeiro:

- [frontend_handoff.md](frontend_handoff.md)

Esse documento já descreve:

- telas sugeridas
- perfis de acesso
- contratos de endpoints
- payloads
- enums e status do sistema
- fluxo recomendado de entrega

## Observações

- o backend atualmente aceita CORS aberto
- o endpoint base usa `/api`
- o endpoint de impressão devolve um payload estruturado, não faz a impressão no navegador
- o sistema foi pensado para painel operacional de pizzaria, não para landing page
