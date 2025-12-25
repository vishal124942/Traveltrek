# TravelTrek

A comprehensive travel & trek platform featuring a mobile app for users, a marketing website, and a powerful admin dashboard.

## 🚀 Features

- **Multi-Platform**: Android/iOS App, Responsive Website, and Admin Panel.
- **Membership System**: 3-Year and 5-Year membership plans with automated ID generation.
- **Automated Notifications**: Instant email notifications via Resend for welcome messages and membership approvals.
- **Secure Authentication**: JWT-based auth with bcrypt password hashing.
- **Rich Content**: Blog, Destinations, and About Us pages with premium UI.
- **Admin Controls**: Manage users, memberships, and approve requests from a centralized dashboard.

## 🏗 Architecture

```
traveltrek/
├── backend/          # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── controllers/   # API handlers
│   │   ├── services/      # Email (Resend), Auth, Onboarding
│   │   └── prisma/        # Database schema
│
├── mobile/           # Flutter mobile application
│   └── lib/screens/       # iOS/Android UI
│
├── website/          # Next.js Marketing Website
│   └── src/app/           # Public pages (Home, Join, Blog)
│
└── admin/            # Next.js Admin Dashboard
    └── src/app/           # Internal management tools
```

## 🛠 Tech Stack

| Component | Technology |
| --------- | ------------------------------ |
| **Mobile** | Flutter (Dart) |
| **Website** | Next.js 15, Tailwind CSS, Framer Motion |
| **Admin** | Next.js 15, Tailwind CSS, Recharts |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB (via Prisma ORM) |
| **Auth** | JWT, bcrypt |
| **Email** | Resend API |

## ⚡ Quick Start

### 1. Backend
```bash
cd backend
npm install
# Configure .env with RESEND_API_KEY and DATABASE_URL
npx prisma generate
npm run dev
```

### 2. Website
```bash
cd website
npm install
npm run dev
```

### 3. Admin Panel
```bash
cd admin
npm install
npm run dev
```

### 4. Mobile App
```bash
cd mobile
flutter pub get
flutter run
```

## 📄 License

MIT
