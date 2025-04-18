# Pullup

A mobile bulletin-board app for Stanford students to discover campus events.

## Overview

Pullup is a platform where only officially recognized Stanford student orgs can post event announcements. Undergrad students can browse, upvote/downvote, and comment on events. It includes: a Top Events archive + a virtual wristband system (QR codes tied to SUNet IDs) for private/invite-only event check-ins.

## Progress

- Event feed w/ public + private events
- Event details w/ upvote/downvote functionality
- Commenting system
- Virtual QR wristband system for private events
- Top Events ranking
- Event creation for orgs
- User profiles
- Mock API services (no real backend integration yet)

## Repo Structure

```
pullup/
├── mobile/              # RN mobile app
│   ├── android/         # Android-specific
│   ├── ios/             # iOS-specific
│   ├── src/             # Cross-platform TS code
│   │   ├── api/         # API client code
│   │   ├── assets/      # Static assets
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom React hooks
│   │   ├── navigation/  # Nav config
│   │   ├── screens/     # Screen components
│   │   ├── services/    # Business logic
│   │   ├── store/       # State management
│   │   ├── types/       # TypeScript type defs
│   │   └── utils/       # Utility funcs
│   └── __tests__/       # Test files
│
├── backend/             # Python FastAPI backend
│   ├── app/             # App code
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Core func
│   │   ├── db/          # Database models, migrations
│   │   ├── services/    # Business logic services
│   │   └── utils/       # Utility funcs
│   ├── tests/           # Test files
│   └── scripts/         # Utility scripts
│
└── scripts/             # Project-wide scripts
```

## Prerequisites

Mobile App:

- Node.js 18+
- npm or yarn
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS dependencies)

## Getting Started

For the MVP, we're focusing on the mobile app. The backend will be implemented in the next phase.

```bash
# go to directory
cd mobile

# install dependencies
npm install

# run app
npm start
```

## Notes:

Limitations:

- Uses mock data instead of real API calls
- No authentication system yet
- No real image uploads
- Limited error handling
- No persistent state (refreshing the app resets everything)
- QR code scanning is simulated

Next Steps:

- Implement the backend w/ FastAPI
- Add Stanford CAS OAuth auth
- Implement real API calls
- Add image upload func
- Implement real-time notifs
- Add better error handling + network state management
- Improve UI/UX based on user feedback

## Developers

[Aaron Jin](https://github.com/aaronkjin)

[Ina Chun](https://github.com/ikc2210)

[Andrew Chung](https://github.com/awchung04)
