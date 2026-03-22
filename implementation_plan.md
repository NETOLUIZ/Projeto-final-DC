# Pizzaria Backend Implementation Plan

## Goal Description
Develop a complete, scalable, and production-ready backend for a pizzeria system with POS, delivery, and local service support. The backend will use Node.js, Express, MySQL, Prisma ORM, Socket.io for real-time updates, and JWT for authentication. It will feature a modular architecture, error handling, standardized responses, and an infrastructure prepared for receipt printing.

## Proposed Changes

We will create a new directory for the project and structure it cleanly.

### Setup and Infrastructure
- **Initialize Node Project:** `npm init -y`
- **Dependencies:** `express`, `cors`, `dotenv`, `prisma`, `@prisma/client`, `socket.io`, `jsonwebtoken`, `bcrypt`, `zod` (for validation), `express-async-errors`.
- **Folder Structure:**
  - `/src/config`: App config, socket, database.
  - `/src/controllers`: Handlers for HTTP requests.
  - `/src/middlewares`: Auth, roles, error handling.
  - `/src/prisma`: Schema and seed scripts.
  - `/src/routes`: Express routes mapping.
  - `/src/services`: Business logic and data access.
  - `/src/sockets`: Socket.io event handlers.
  - `/src/utils`: Helpers e.g., print formatters, standard responses.

### Database Schema (Prisma)
The database will be structured as follows:
- **User:** `id`, `name`, `email`, `password`, `role` (ADMIN, ATENDENTE, COZINHA, ENTREGADOR).
- **Customer:** `id`, `name`, `phone`.
- **Category:** `id`, `name`.
- **Product:** `id`, `name`, `price`, `categoryId`, `description`, `image`.
- **ProductAdditional:** `id`, `productId`, `name`, `price`.
- **Order:** `id`, `customerId`, `tableId`, `driverId`, `status`, `type` (DELIVERY, RETIRADA, LOCAL), `total`, `paymentMethod`, `paymentStatus`.
- **OrderItem:** `id`, `orderId`, `productId`, `size`, `quantity`, `unitPrice`, `totalPrice`, `observation`.
- **OrderItemAdditional:** `id`, `orderItemId`, `additionalId`, `price`.
- **Table:** `id`, `number`, `status` (LIVRE, OCUPADA).
- **CashRegister:** `id`, `userId`, `openedAt`, `closedAt`, `initialBalance`, `finalBalance`, `status` (ABERTO, FECHADO).
- **CashTransaction:** `id`, `cashRegisterId`, `type` (ENTRY, EXIT), `amount`, `description`, `paymentMethod`.
- **DeliveryDriver:** `id`, `name`, `phone`, `status`.
- **Address:** `id`, `orderId` or `customerId`, `street`, `number`, `neighborhood`, `city`, `state`, `zipCode`, `complement`.
- **Payment:** `id`, `orderId`, `method`, `amount`, `status`.

### API Routes & Controllers
- **Auth:** `POST /auth/login`
- **Users:** CRUD (Protected by Admin role)
- **Categories & Products:** CRUD (Public read, Admin/Atendente write)
- **Tables:** Open, Add Items, Close (Atendente/Admin)
- **Cashier:** Open, Entry, Exit, Close, Status (Atendente/Admin)
- **Drivers:** CRUD, Assign to order
- **Orders:** CRUD, Status update, Cancel, Print snippet
- **Dashboard:** Summary metrics and Top products sold
- **Sockets:** Real-time events (`pedido:novo`, `pedido:status`)

### Specialized Features
- **Printing Service (`src/services/printService.js`):** Service responsible for standardizing the payload sent to the thermal printer (containing store name, order number, items, additionals, total, etc).
- **WebSockets:** Centralized handling of `socket.io` instances, allowing the admin panel to receive new orders in real-time and clients to see status updates.

## Verification Plan
### Automated & Manual Verification
- After setting up the project, we will run the server locally.
- Use `cURL` or similar tools (via node script if needed) to test endpoint logic.
- Verify Socket.io connection and event emission using custom test scripts.
- Check Prisma migrations and schema validation.
- Generate Prisma seed script and verify initial admin user login.
