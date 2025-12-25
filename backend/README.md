# TravelTrek Backend

Node.js + Express + TypeScript backend for the TravelTrek mobile application.

## Features

- 🔐 JWT Authentication
- 👤 User Management
- 🎫 Membership System
- 🏔️ Destinations API
- 🤖 AI Chat (OpenAI)
- 📧 Email Automation (Resend)
- 💬 WhatsApp (Twilio)
- 🔔 Push Notifications (FCM)

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npx prisma migrate dev

# Seed sample data
npm run db:seed

# Start development server
npm run dev
```

## API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/fcm-token` - Update FCM token

### Membership
- `GET /api/membership` - Get membership details

### Destinations
- `GET /api/destinations` - List all destinations
- `GET /api/destinations/:id` - Get destination by ID

### Chat
- `POST /api/chat` - Send message to AI
- `GET /api/chat/history` - Get chat history

## Project Structure

```
src/
├── index.ts           # Entry point
├── controllers/       # Route handlers
├── routes/            # API routes
├── services/          # Business logic
├── middleware/        # Auth middleware
└── utils/             # Utilities
prisma/
├── schema.prisma      # Database schema
└── seed.ts            # Seed data
```
