# Pullup

A mobile bulletin-board app for Stanford students to discover campus events and for student orgs to engage with the community.

## Overview

Pullup is a specialized platform where only officially recognized Stanford student organizations can post event announcements. Undergraduate students can browse, upvote/downvote, and comment on events. The platform includes a "Top Events" archive and a virtual wristband system (QR codes tied to SUNet IDs) for private/invite-only event check-ins.

## Repo Structure

```
pullup/
├── mobile/              # React Native mobile application
│   ├── android/         # Android-specific files
│   ├── ios/             # iOS-specific files
│   ├── src/             # Cross-platform TypeScript code
│   │   ├── api/         # API client code
│   │   ├── assets/      # Static assets
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom React hooks
│   │   ├── navigation/  # Navigation configuration
│   │   ├── screens/     # Screen components
│   │   ├── services/    # Business logic
│   │   ├── store/       # State management
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Utility functions
│   └── __tests__/       # Test files
│
├── backend/             # Python FastAPI backend
│   ├── app/             # Application code
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Core functionality
│   │   ├── db/          # Database models and migrations
│   │   ├── services/    # Business logic services
│   │   └── utils/       # Utility functions
│   ├── tests/           # Test files
│   └── scripts/         # Utility scripts
│
├── docs/                # Documentation
│   └── PULLUP_PRD.md    # Product Requirements Document
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

Backend:

- Python 3.10+
- PostgreSQL 14+
- AWS (for RDS, S3)

## Getting Started

Mobile App:

```bash
# go to directory
cd mobile

# install dependencies
npm install
# or
yarn install

# install iOS dependencies
cd ios && pod install && cd ..

# start Metro bundler
npm start
# or
yarn start

# run on iOS
npm run ios
# or
yarn ios

# run on Android
npm run android
# or
yarn android
```

Backend:

```bash
# go to directory
cd backend

# create virtual env
python -m venv venv
source venv/bin/activate

# install dependencies
pip install -r requirements.txt

# set up env vars
cp .env.example .env  # let's edit .env later w/ our config

# run database migrations
alembic upgrade head

# start dev server
uvicorn app.main:app --reload
```

## Developers

[Aaron Jin](https://github.com/aaronkjin)

[Ina Chun](https://github.com/ikc2210)

[Andrew Chung](https://github.com/awchung04)
