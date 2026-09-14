# nonono - Complete Walkthrough

This guide will walk you through everything you need to know to set up, build, and use the **nonono** addiction recovery tracker app.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Cloning the Repository](#cloning-the-repository)
3. [Installation](#installation)
4. [Running the App](#running-the-app)
5. [Building for Production](#building-for-production)
6. [App Features Guide](#app-features-guide)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| npm | 9+ | Comes with Node.js |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### For Android Development

| Software | Purpose |
|----------|---------|
| Android Studio | Android SDK and emulator |
| Java JDK 17 | Required for Android builds |

### For iOS Development (macOS only)

| Software | Purpose |
|----------|---------|
| Xcode | iOS SDK and simulator |
| CocoaPods | iOS dependency manager |

### Optional Tools

| Tool | Purpose |
|------|---------|
| Expo CLI | `npm install -g expo-cli` |
| EAS CLI | `npm install -g eas-cli` |
| VS Code | Recommended IDE |

---

## Cloning the Repository

### Step 1: Open Terminal

- **Windows**: Command Prompt or PowerShell
- **macOS**: Terminal
- **Linux**: Terminal

### Step 2: Clone the Repository

```bash
git clone https://github.com/jidai01/nonono.git
```

### Step 3: Navigate to Project Directory

```bash
cd nonono
```

### Step 4: Verify Clone

```bash
ls -la
```

You should see:
```
.git/
.github/
.gitignore
README.md
WALKTHROUGH.md
app.json
assets/
package.json
src/
tsconfig.json
```

---

## Installation

### Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note**: The `--legacy-peer-deps` flag is required due to some dependency conflicts.

### Step 2: Verify Installation

```bash
npm list --depth=0
```

You should see a list of installed packages without errors.

---

## Running the App

### Option 1: Using Expo Go (Development)

1. Install Expo Go on your phone:
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Start the development server:

```bash
npx expo start
```

3. Scan the QR code with your phone:
   - **Android**: Use the Expo Go app
   - **iOS**: Use the Camera app

### Option 2: Using Emulator/Simulator

#### Android Emulator

1. Start Android Studio
2. Open AVD Manager and start an emulator
3. Run:

```bash
npx expo start --android
```

#### iOS Simulator (macOS only)

1. Open Xcode
2. Open Simulator
3. Run:

```bash
npx expo start --ios
```

### Option 3: Web Browser

```bash
npx expo start --web
```

---

## Building for Production

### Building Android APK

#### Method 1: Using EAS Build (Recommended)

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Login to Expo:

```bash
eas login
```

3. Configure the build:

```bash
eas build:configure
```

4. Build APK:

```bash
eas build -p android --profile preview
```

5. Download the APK from the provided link.

#### Method 2: Local Build

1. Generate native Android project:

```bash
npx expo prebuild --platform android
```

2. Navigate to Android folder:

```bash
cd android
```

3. Build APK:

```bash
./gradlew assembleRelease
```

4. Find the APK at:

```
android/app/build/outputs/apk/release/
```

### Building iOS App

1. Generate native iOS project:

```bash
npx expo prebuild --platform ios
```

2. Open in Xcode:

```bash
open ios/nonono.xcworkspace
```

3. Configure signing and build.

---

## App Features Guide

### First Launch

When you first open the app, you'll see the **Calendar** screen. The app starts empty - you can:

1. Add your first addiction using the dropdown in the header
2. Start logging journal entries
3. Create activities to help with recovery

### Adding an Addiction

1. Tap the dropdown in the top-right corner
2. Tap **"+ Add Addiction"**
3. Enter a name (e.g., "Gaming", "Smoking")
4. Select an icon
5. Tap **Save**

### Switching Between Addictions

1. Tap the dropdown in the top-right corner
2. Select the addiction you want to view

### Logging a Journal Entry

1. Go to the **Calendar** tab
2. Tap a date on the calendar
3. Tap the **"+"** button or **"Add Entry"**
4. Select your mood (1-5)
5. Write about your day
6. Optionally mark as a relapse and add notes
7. Tap **Save**

### Managing Activities

1. Go to the **Activities** tab
2. Tap **"+"** to add a new activity
3. Enter activity details:
   - Name
   - Duration (minutes)
   - Notes
4. Tap **Save**

### Setting Up Schedules

1. Go to the **Schedule** tab
2. Tap **"+"** to create a new schedule
3. Fill in details:
   - Title
   - Description
   - Date
   - Time
4. Toggle the schedule on/off
5. Tap **Save**

### Setting Up Security

1. Go to the **Settings** tab
2. Under **Security**:
   - **Set Password**: Create a password
   - **Biometrics**: Enable fingerprint/Face ID
   - **Device Lock**: Use device PIN/pattern

### Exporting Data

1. Go to **Settings** > **Data**
2. Tap **Export Data**
3. Enter a passphrase (this encrypts your backup)
4. The file will be saved to your device

### Importing Data

1. Go to **Settings** > **Data**
2. Tap **Import Data**
3. Select your backup file
4. Enter the passphrase used during export

### Wiping All Data

1. Go to **Settings** > **Data**
2. Tap **Wipe All Data**
3. Read the warning carefully
4. Confirm twice to proceed

---

## App Navigation

### Tab Bar

| Tab | Icon | Description |
|-----|------|-------------|
| Calendar | 📅 | View journal entries and schedules |
| Activities | 🏃 | Manage prevention activities |
| Schedule | ⏰ | Set and manage reminders |
| Settings | ⚙️ | App settings and data management |

### Calendar Screen

- **Top**: Month view with marked dates
- **Middle**: Selected date details
- **Bottom**: Quick actions

### Color Coding

- **Green dot**: Sober day
- **Red dot**: Relapse day
- **Teal dot**: Scheduled activity

---

## Data Storage

### Local Storage

All data is stored locally on your device:

- **SQLite Database**: Journal entries, activities, schedules, addictions
- **Secure Store**: Settings, authentication data
- **File System**: Exported backups

### No Cloud Sync

The app intentionally does not sync to any cloud service. Your data never leaves your device.

---

## Backup Strategy

### Recommended Backup Process

1. **Weekly**: Export encrypted backup
2. **Store**: Save backup to secure location (USB drive, encrypted cloud storage)
3. **Verify**: Periodically test importing your backup

### What's Included in Backup

- All journal entries
- All activities
- All schedules
- All addictions
- App settings (excluding password)

### What's NOT Included

- Password (for security)
- Biometric settings

---

## Troubleshooting

### Common Issues

#### "npm install" fails

```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules

# Reinstall
npm install --legacy-peer-deps
```

#### App won't start

```bash
# Clear Expo cache
npx expo start -c
```

#### Build fails

```bash
# Clear all caches
rm -rf node_modules
rm -rf .expo
npm install --legacy-peer-deps
npx expo start -c
```

#### Android build error

```bash
# Regenerate native project
npx expo prebuild --platform android --clean
```

### Getting Help

1. Check the [Issues](https://github.com/jidai01/nonono/issues) page
2. Search for existing solutions
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

---

## Development

### Project Structure

```
nonono/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   ├── entry/             # Journal entry screens
│   ├── schedule/          # Schedule screens
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── db/               # Database layer
│   ├── stores/           # State management
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
└── assets/               # Static assets
```

### Key Files

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root layout and navigation |
| `src/db/schema.ts` | Database schema |
| `src/stores/*.ts` | Zustand stores |
| `src/utils/auth.ts` | Authentication logic |

### Adding Features

1. Create a new screen in `app/`
2. Add database queries in `src/db/queries.ts`
3. Create a store in `src/stores/`
4. Update the UI

---

## Version History

### v1.0.0 (Current)

- Multi-addiction tracking
- Daily journal with mood tracking
- Activity management
- Schedule/reminder system
- Optional password/biometric security
- Encrypted data export/import
- Wipe all data functionality

---

## License

This project is licensed under the MIT License.

---

## Support

For support, please open an issue on GitHub or contact the maintainers.

**Remember**: Recovery is a journey, not a destination. Take it one day at a time. 💪
