# Pullup

A mobile bulletin-board app for Stanford students to discover campus events.

## Overview

Pullup is a platform where only officially recognized Stanford student orgs can post event announcements. Undergrad students can browse, like, and comment on events. It includes: a Top Events archive + a virtual wristband system (QR codes tied to SUNet IDs) for private/invite-only event check-ins.

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
npm install

# run app
npm start
```

## Progress

- Event feed w/ public + private events
- Event details w/ like functionality
- Commenting system
- Virtual QR wristband system for private events
- Top Events ranking
- Event creation for orgs
- User profiles
- Mock API services (no real backend integration yet)

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
- Refactor code in big files to be more modular
- Add image upload func
- Implement real-time notifs
- Add better error handling + network state management
- Improve UI/UX based on user feedback

## Developers

[Aaron Jin](https://github.com/aaronkjin)

[Ina Chun](https://github.com/ikc2210)

[Andrew Chung](https://github.com/awchung04)
