# TravelTrek

A production-ready mobile application (Android + iOS) with scalable backend for a membership-based travel & trek company.

## Architecture

re_ikUcAJ3r_K6ugEacfiYMrg3yvo6d5a7br

```
traveltrek/
├── backend/          # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── controllers/   # API handlers
│   │   ├── routes/        # Route definitions
│   │   ├── services/      # Business logic & integrations
│   │   ├── middleware/    # Auth middleware
│   │   └── utils/         # Validators & utilities
│   └── prisma/            # Database schema & seeds
│
└── mobile/           # Flutter mobile application
    └── lib/
        ├── config/        # Theme, routes, constants
        ├── models/        # Data models
        ├── providers/     # State management
        ├── services/      # API & storage
        └── screens/       # UI screens
```

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npx prisma migrate dev
npm run db:seed
npm run dev
```

### Mobile

```bash
cd mobile
flutter pub get
flutter run
```

## Tech Stack

| Component | Technology                     |
| --------- | ------------------------------ |
| Mobile    | Flutter                        |
| Backend   | Node.js + Express + TypeScript |
| Database  | PostgreSQL + Prisma            |
| Auth      | JWT + bcrypt                   |
| Email     | Resend                         |
| WhatsApp  | Twilio                         |
| Push      | Firebase Cloud Messaging       |
| AI        | OpenAI GPT-4                   |

## Features

- ✅ User authentication (email/password)
- ✅ Membership dashboard
- ✅ Destination browsing
- ✅ AI travel assistant
- ✅ Automated onboarding (email, WhatsApp, push)
- ✅ Clean, minimal UI

## License

MIT
