# SuperChat MVP Backend

Production-style Node.js backend for a SuperChat-like MVP:

- JWT auth for viewers and creators
- Stream creation and live stream listing
- Socket.IO powered live chat
- Razorpay order creation and payment verification
- SuperChat persistence and real-time fanout
- Creator earnings endpoints

## Stack

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- Razorpay

## Quick Start

Run these commands from the [`backend/`](/Users/sudhirkumar/Documents/Codex/2026-04-24/let-s-design-a-real-mvp/backend) folder.

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB and Razorpay credentials.

4. Start development server:

```bash
npm run dev
```

## Frontend

The React frontend lives in [`frontend/`](/Users/sudhirkumar/Documents/Codex/2026-04-24/let-s-design-a-real-mvp/frontend).

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Create frontend env file:

```bash
cp .env.example .env
```

3. Start the frontend:

```bash
npm run dev
```

By default it expects the backend at `http://localhost:5001`.

## API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Streams

- `POST /api/streams`
- `GET /api/streams/live`
- `GET /api/streams/:id`
- `PATCH /api/streams/:id/status`

### Payments

- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `POST /api/payments/webhook`

### Creator

- `GET /api/creator/earnings`
- `GET /api/creator/transactions`

## Socket Events

Client emits:

- `join_stream` with `{ streamId }`
- `send_message` with `{ streamId, text }`

Server emits:

- `message_received`
- `superchat_received`

## Notes

- `MIN_SUPERCHAT_AMOUNT` is in paise. `1000` means `Rs. 10.00`.
- The backend verifies Razorpay signatures before inserting a paid SuperChat into chat.
- For reliability, keep Razorpay webhook enabled in production.
