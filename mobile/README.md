# TravelTrek

A membership-based travel mobile application built with Flutter.

## Features

- 🔐 User authentication (login/signup)
- 🎫 Membership management
- 🏔️ Destination browsing
- 🤖 AI-powered travel assistant
- 📧 Email/WhatsApp/Push automation

## Getting Started

### Prerequisites

- Flutter SDK (3.0+)
- Dart SDK
- iOS Simulator / Android Emulator

### Installation

```bash
cd mobile
flutter pub get
flutter run
```

## Project Structure

```
lib/
├── main.dart           # App entry point
├── config/             # Theme, routes, constants
├── models/             # Data models
├── providers/          # State management
├── services/           # API & storage services
├── screens/            # All app screens
└── widgets/            # Reusable widgets
```

## Screens

1. Splash Screen - Auto auth check
2. Onboarding (3 slides)
3. Login/Signup
4. Home - Dashboard with stats
5. Destinations - Browse locations
6. Membership - View details
7. Chat - AI assistant
8. Profile - User settings
