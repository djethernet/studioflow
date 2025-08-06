# Firebase Setup for StudioFlow

## Prerequisites
- A Google account
- Node.js and npm installed

## Setup Steps

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name (e.g., "studioflow-app")
4. Follow the setup wizard

### 2. Enable Authentication
1. In your Firebase project, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Optionally enable other providers (Google, GitHub, etc.)

### 3. Set up Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** for development
3. Select your preferred location

### 4. Get Firebase Configuration
1. Go to **Project settings** (gear icon)
2. Scroll down to "Your apps" and click **Web app** (</>) icon
3. Register your app with a nickname (e.g., "StudioFlow Web")
4. Copy the config object

### 5. Configure Environment Variables
1. Create a `.env` file in your project root (copy from `.env.example`)
2. Fill in your Firebase configuration values:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 6. Security Rules (Production)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Projects can only be accessed by their owners
    match /projects/{projectId} {
      allow read, write, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Features Added

### Authentication
- User registration and login with email/password
- Password reset functionality
- Protected routes
- Automatic session management

### Project Management
- Create, read, update, delete projects
- Project ownership per user
- Project listing with metadata
- Automatic timestamps

### Routing
- `/login` - Login page
- `/signup` - Registration page
- `/reset-password` - Password reset
- `/projects` - Project selection dashboard
- `/studio/:projectId` - Studio interface for specific project
- Protected routes require authentication

## Development

The app includes Firebase emulator support for development. If you have Firebase emulators installed, they will be used automatically when running in development mode.

To install Firebase emulators:
```bash
npm install -g firebase-tools
firebase login
firebase init emulators
```

## Next Steps

You can now:
1. Register new users
2. Create and manage projects
3. Access the studio interface for each project
4. Projects are automatically saved to Firebase Firestore
5. All user data is secure and isolated per user