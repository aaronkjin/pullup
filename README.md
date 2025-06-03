# Pullup

A mobile bulletin-board app for Stanford students to discover campus events.

## Overview

Pullup is a platform where only officially recognized Stanford student orgs can post event announcements. The app features a dual-interface system: students can browse and "pull up" to events, while organizations can create events and manage participation. It includes password-protected private events and real-time participation tracking.

## Prerequisites

Mobile App:

- Node.js 18+
- npm or yarn
- React Native CLI

## Getting Started

```bash
# go to directory
cd mobile

# install dependencies
npm i --legacy-peer-deps

# run app
npm start
```

## Current Features

### Student View

- Event feed with "pull up" functionality
- Modal-based event interaction
- My Events list showing registered events
- Private event password entry
- Real-time participation counters

### Organization View

- Event creation with public/private options
- My Events list showing created events
- Participant management and tracking
- Password generation for private events
- Event details management

### Core Features

- Dual navigation system based on user type
- Pull up system replacing likes/bookmarks
- Password-protected private events
- Event participation tracking
- Image upload for events
- Mock API services (no real backend integration yet)

## Notes:

Limitations:

- Uses mock data instead of real API calls
- No authentication system yet (user type detection simulated)
- No real image uploads
- Limited error handling
- No persistent state (refreshing the app resets everything)
- Password system is simulated

Next Steps:

- Implement the backend w/ FastAPI
- Add Stanford CAS OAuth auth with user type detection
- Implement real API calls for pull up system
- Add password generation and validation
- Implement real-time participation counter updates
- Add image upload functionality
- Implement real-time notifications
- Add better error handling + network state management
- Improve UI/UX based on user feedback

## Key Changes from Previous Version

- Removed like, bookmark, and comment features
- Removed QR wristband system
- Removed Top Events archive
- Added dual-interface system (Student vs Organization views)
- Added "pull up" participation system
- Added password-protected private events
- Simplified navigation to 2 tabs per user type
- Changed from separate screens to modals for student interactions

## Developers

[Aaron Jin](https://github.com/aaronkjin)

[Ina Chun](https://github.com/ikc2210)

[Andrew Chung](https://github.com/awchung04)
