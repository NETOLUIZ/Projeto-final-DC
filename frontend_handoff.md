# Frontend Handoff

## Objetivo
Este arquivo serve como guia para o time de frontend construir a interface da pizzaria com base no backend já existente em `pizzaria-backend`.

Hoje o repositório contém apenas o backend. O frontend deve ser pensado como painel operacional para:

- login e controle de acesso por perfil
- gestão de cardápio
- gestão de pedidos
- operação de salão
- operação de caixa
- gestão de entregadores
- dashboard em tempo real

## Base da API

- Base URL local: `http://localhost:3000/api`
- Autenticação: `Authorization: Bearer <token>`
- Formato de resposta padrão:

```json
{
  "status": "success",
  "data": {}
}
```

- Formato de erro padrão:

```json
{
  "status": "error",
  "message": "Mensagem do erro"
}
```

## Perfis de acesso

- `ADMIN`: acesso total
- `ATENDENTE`: pedidos, cardápio, mesas, caixa, dashboard, entregadores
- `COZINHA`: atualização de status de pedidos
- `ENTREGADOR`: hoje não há rotas específicas dedicadas, mas existe como papel no sistema

## Fluxos principais do produto

### 1. Login
- Tela de login com email e senha
- Ao autenticar, salvar token e dados do usuário
- Redirecionar conforme perfil

### 2. Dashboard operacional
- Resumo do dia
- Pedidos em andamento
- Top produtos
- Atualização em tempo real via Socket.io

### 3. Cardápio
- Listagem de categorias
- Listagem de produtos
- Cadastro e edição de produtos com adicionais

### 4. Pedidos
- Listagem geral de pedidos
- Filtros por status e tipo
- Detalhe do pedido
- Mudança de status
- Atribuição de entregador
- Cancelamento
- Visualização de payload de impressão

### 5. Mesas
- Lista de mesas com status
- Abrir mesa
- Visualizar pedido ativo da mesa
- Fechar mesa apenas quando não houver pedido ativo

### 6. Caixa
- Ver caixa atual
- Abrir caixa
- Lançar entrada
- Lançar saída
- Fechar caixa
- Consultar histórico

### 7. Entregadores
- Listar entregadores
- Criar, editar e excluir
- Mostrar status atual

### 8. Usuários
- Área restrita para `ADMIN`
- CRUD de usuários internos

## Telas recomendadas

### Rotas públicas
- `/login`

### Rotas autenticadas
- `/dashboard`
- `/pedidos`
- `/pedidos/:id`
- `/cardapio/categorias`
- `/cardapio/produtos`
- `/mesas`
- `/caixa`
- `/entregadores`
- `/usuarios`

## Endpoints por módulo

### Auth
#### `POST /auth/login`

Request:

```json
{
  "email": "admin@pizzaria.com",
  "password": "123456"
}
```

Response:

```json
{
  "status": "success",
  "token": "jwt",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@pizzaria.com",
      "role": "ADMIN"
    }
  }
}
```

### Users
#### `GET /users`
- Apenas `ADMIN`

#### `POST /users`

```json
{
  "name": "Maria",
  "email": "maria@empresa.com",
  "password": "123456",
  "role": "ATENDENTE"
}
```

#### `PUT /users/:id`
- Campos parciais permitidos

#### `DELETE /users/:id`

### Categories
#### `GET /categories`
- Público
- Retorna categorias com `Products`

#### `POST /categories`

```json
{
  "name": "Pizzas Tradicionais"
}
```

#### `PUT /categories/:id`
#### `DELETE /categories/:id`

### Products
#### `GET /products`
- Público
- Retorna produto com `Category` e `Additionals`

#### `GET /products/:id`

#### `POST /products`

```json
{
  "name": "Pizza Calabresa",
  "price": 59.9,
  "description": "Molho, queijo, calabresa e cebola",
  "image": "https://...",
  "categoryId": 1,
  "additionals": [
    {
      "name": "Borda recheada",
      "price": 10
    }
  ]
}
```

#### `PUT /products/:id`
- Se enviar `additionals`, o backend remove os antigos e recria todos

#### `DELETE /products/:id`

### Tables
#### `GET /tables`
- Retorna mesas com `Orders` ativos

#### `POST /tables`

```json
{
  "number": 12
}
```

- Se a mesa não existir, o backend cria
- Se existir e estiver livre, marca como ocupada
- O backend também cria automaticamente um pedido inicial vazio do tipo `LOCAL`

#### `POST /tables/:id/close`
- Só fecha se não houver pedidos ativos

#### `DELETE /tables/:id`
- Apenas `ADMIN`

### Cash
#### `GET /cash/current`
#### `GET /cash/history`

#### `POST /cash/open`

```json
{
  "initialBalance": 150
}
```

#### `POST /cash/entry`

```json
{
  "amount": 30,
  "description": "Troco inicial",
  "paymentMethod": "DINHEIRO"
}
```

#### `POST /cash/exit`

```json
{
  "amount": 20,
  "description": "Compra de insumo",
  "paymentMethod": "DINHEIRO"
}
```

#### `POST /cash/close`

### Drivers
#### `GET /drivers`

#### `POST /drivers`

```json
{
  "name": "Joao",
  "phone": "11999999999",
  "status": "DISPONIVEL"
}
```

#### `PUT /drivers/:id`
#### `DELETE /drivers/:id`

### Orders
#### `GET /orders`
- Retorna pedidos ordenados por `createdAt desc`
- Inclui `Customer`, `Table`, `Driver`, `Items`, `Address`, `Payments`

#### `GET /orders/:id`

#### `POST /orders`

```json
{
  "customerId": 1,
  "tableId": null,
  "type": "DELIVERY",
  "paymentMethod": "PIX",
  "items": [
    {
      "productId": 3,
      "size": "GRANDE",
      "quantity": 2,
      "unitPrice": 59.9,
      "observation": "Sem cebola",
      "additionals": [
        {
          "additionalId": 7,
          "price": 10
        }
      ]
    }
  ],
  "address": {
    "street": "Rua A",
    "number": "123",
    "neighborhood": "Centro",
    "city": "Sao Paulo",
    "state": "SP",
    "zipCode": "01000-000",
    "complement": "Apto 12"
  }
}
```

Observações:

- `type` aceita `DELIVERY`, `RETIRADA`, `LOCAL`
- `paymentMethod` aceita `PIX`, `CARTAO`, `DINHEIRO`
- `address` faz sentido apenas para `DELIVERY`
- `tableId` faz sentido para `LOCAL`
- o total do pedido é calculado no backend

#### `PATCH /orders/:id/status`

```json
{
  "status": "EM_PREPARO"
}
```

Status possíveis:

- `NOVO`
- `RECEBIDO`
- `EM_PREPARO`
- `PRONTO`
- `SAIU_PARA_ENTREGA`
- `FINALIZADO`
- `CANCELADO`

#### `PATCH /orders/:id/assign-driver`

```json
{
  "driverId": 2
}
```

- Ao atribuir entregador, o pedido vai para `SAIU_PARA_ENTREGA`
- O entregador passa para `EM_ENTREGA`

#### `PATCH /orders/:id/cancel`

#### `GET /orders/:id/print`
- Retorna `printPayload`

### Dashboard
#### `GET /dashboard/summary`

Response esperado:

```json
{
  "status": "success",
  "data": {
    "totalOrders": 24,
    "faturamento": 1850.5,
    "inProgress": 6,
    "finished": 18
  }
}
```

#### `GET /dashboard/top-products`

## Eventos em tempo real

Socket disponível no mesmo host do backend.

Eventos emitidos pelo servidor:

- `pedido:novo`
- `pedido:status`
- `pedido:atualizado`

Uso esperado no frontend:

- atualizar lista de pedidos sem refresh
- atualizar dashboard
- destacar novos pedidos
- atualizar detalhe do pedido em aberto

O backend também aceita:

- evento `join` para entrar em salas, se o frontend quiser segmentar notificações no futuro

## Modelos e enums importantes

### Roles
- `ADMIN`
- `ATENDENTE`
- `COZINHA`
- `ENTREGADOR`

### Status de mesa
- `LIVRE`
- `OCUPADA`

### Status de entregador
- `DISPONIVEL`
- `EM_ENTREGA`
- `INATIVO`

### Status de caixa
- `ABERTO`
- `FECHADO`

### Tipo de transação do caixa
- `ENTRY`
- `EXIT`

### Status de pagamento
- `PENDENTE`
- `PAGO`
- `CANCELADO`

## Regras de UI importantes

- esconder ações conforme perfil do usuário
- pedidos devem ter cores e badges por status
- mesa ocupada e mesa livre precisam ficar muito visíveis
- ações críticas devem pedir confirmação: cancelar pedido, fechar caixa, excluir usuário, excluir entregador
- o frontend deve tratar `401` redirecionando para login
- o frontend deve tratar `403` com feedback de permissão insuficiente
- o frontend deve exibir mensagens de erro vindas do campo `message`

## Sugestão de arquitetura do frontend

- `src/pages`: telas principais
- `src/components`: componentes reutilizáveis
- `src/services/api.ts`: cliente HTTP
- `src/services/socket.ts`: conexão Socket.io
- `src/store` ou `src/context`: sessão e estado global mínimo
- `src/types`: contratos de resposta e enums

## Prioridade de entrega

### Fase 1
- login
- dashboard
- listagem de pedidos
- detalhe de pedido
- atualização de status

### Fase 2
- cardápio completo
- mesas
- caixa

### Fase 3
- entregadores
- usuários
- melhorias de tempo real
- refinamento visual

## Pontos de atenção

- `GET /categories` e `GET /products` são públicos, o restante é majoritariamente protegido
- o backend usa `cors()` aberto no momento
- o token JWT expira conforme variável de ambiente, com default de `7d`
- o backend roda por padrão na porta `3000`
- existe um endpoint de impressão, mas ele devolve payload formatado, não dispara impressão diretamente no browser
- o histórico de caixa já está implementado, mas o frontend deve assumir apenas o contrato retornado em `data.history`

## Entrega esperada do frontend

O frontend ideal deve parecer um painel operacional de pizzaria, não uma landing page. A interface precisa priorizar velocidade de operação, leitura rápida de status, ações de clique curto e atualização em tempo real.
