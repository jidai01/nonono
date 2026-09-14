# nonono - Addiction Recovery Tracker

<div align="center">

![nonono Logo](assets/logo.svg)

**A privacy-first, local-only mobile app for tracking addiction recovery**

[![React Native](https://img.shields.io/badge/React%20Native-0.86.3-61DAFB?style=flat&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo%20SDK-57-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## Overview

**nonono** is a mobile application designed to help individuals track and overcome addictions. Built with privacy as the core principle, all data stays on your device with no server connections, no accounts, and no tracking.

### Key Features

- **Multi-Addiction Tracking** - Track multiple addictions simultaneously with isolated calendars, activities, and statistics
- **Daily Journal** - Log your mood, feelings, and relapses with detailed notes
- **Activity Management** - Create and track prevention activities that help you stay on track
- **Smart Scheduling** - Set reminders for activities with calendar integration
- **Encrypted Backup** - Export your data encrypted for safe backup and device migration
- **Optional Security** - Protect your data with password, biometrics, or device lock
- **Beautiful UI** - Clean, intuitive interface designed for daily use

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React Native 0.86 | Cross-platform mobile framework |
| Expo SDK 57 | Development platform and tooling |
| TypeScript 6.0 | Type-safe JavaScript |
| Expo Router | File-based navigation |
| Zustand | Lightweight state management |
| Expo SQLite | Local database storage |
| Expo Secure Store | Secure settings storage |
| React Native Calendars | Calendar component |

---

## Privacy by Design

- **No Server** - All data stored locally on your device
- **No Accounts** - No registration, no email, no tracking
- **No Analytics** - Zero telemetry or usage tracking
- **No Internet** - Works completely offline
- **Encrypted Backups** - Your data, your encryption key

---

## Project Structure

```
nonono/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── calendar.tsx   # Main calendar view
│   │   ├── activities.tsx # Activity management
│   │   ├── schedule.tsx   # Schedule & reminders
│   │   └── settings.tsx   # App settings
│   ├── entry/             # Journal entry screens
│   ├── schedule/          # Schedule screens
│   ├── auth.tsx           # Authentication screen
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── db/               # Database schema & queries
│   ├── stores/           # Zustand state stores
│   ├── types/            # TypeScript definitions
│   └── utils/            # Utility functions
└── assets/               # Images, icons, fonts
```

---

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android builds)
- Xcode (for iOS builds)

### Setup

```bash
# Clone the repository
git clone https://github.com/jidai01/nonono.git

# Navigate to project
cd nonono

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npx expo start
```

---

## Building for Production

### Android APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build -p android --profile preview
```

### iOS

```bash
# Build for iOS
eas build -p ios --profile production
```

---

## Features

### 1. Multi-Addiction Support

Track multiple addictions with complete data isolation:
- Each addiction has its own calendar, entries, activities, and schedules
- Switch between addictions via the dropdown in the header
- Add, edit, or delete addictions anytime

### 2. Daily Journal

Log your recovery journey:
- **Mood Tracking** - 5-level mood scale with emojis
- **Feelings** - Detailed notes about your day
- **Relapse Tracking** - Log relapses with notes
- **Calendar View** - See your progress at a glance

### 3. Activity Management

Create activities to help you stay on track:
- Predefined activity suggestions
- Custom activity creation
- Duration tracking
- Notes for each activity

### 4. Smart Scheduling

Set reminders for your activities:
- Date-based scheduling
- Time picker with hour/minute selection
- Calendar integration
- Toggle active/paused schedules

### 5. Data Protection

Your data stays safe:
- **Password Protection** - Optional password lock
- **Biometric Auth** - Fingerprint or Face ID
- **Device Lock** - Use device PIN/pattern
- **Recovery Code** - Backup code for password reset

### 6. Export/Import

Backup and restore your data:
- Encrypted export with custom passphrase
- Import from backup files
- Media library integration (Android)

---

## Design System

### Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#3D8B8B` | Main actions, headers |
| Accent | `#E8917A` | Highlights, alerts |
| Background | `#F4F7F6` | Screen background |
| Surface | `#FFFFFF` | Cards, modals |
| Error | `#D46A6A` | Destructive actions |
| Warning | `#E8C547` | Caution states |

### Typography

- **Headers**: SF Pro Display Bold
- **Body**: SF Pro Text Regular
- **Monospace**: SF Mono (for codes)

---

## Database Schema

### Tables

- **settings** - App settings and auth
- **addictions** - Addiction definitions
- **journal_entries** - Daily journal entries
- **activities** - Prevention activities
- **schedules** - Scheduled reminders

---

## API Reference

### Stores

- `useAuthStore` - Authentication state
- `useJournalStore` - Journal entries
- `useScheduleStore` - Schedules
- `useAddictionStore` - Addictions

### Utils

- `auth.ts` - Password hashing, biometric auth
- `crypto.ts` - Export encryption
- `notifications.ts` - Notification handling
- `date.ts` - Date formatting helpers

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Expo](https://expo.dev/) - Amazing development platform
- [React Native](https://reactnative.dev/) - Cross-platform framework
- [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
- [React Native Calendars](https://github.com/wix/react-native-calendars) - Beautiful calendar component

---

<div align="center">

**Built with care for those on their recovery journey**

[Download APK](https://github.com/jidai01/nonono/releases/latest) | [Report Bug](https://github.com/jidai01/nonono/issues) | [Request Feature](https://github.com/jidai01/nonono/issues)

</div>
