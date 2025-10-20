# WealthWise - Money Management Platform

WealthWise is a lightweight personal finance dashboard that showcases Google sign-in with the Google Identity Services SDK and offers simple money-management tooling once a user authenticates.

## Features

- **Google sign-in** using the Google Identity Services JavaScript SDK.
- **Personalized dashboard** with user profile card and secure sign-out.
- **Transaction tracking** for income and expenses with persistent storage per user via `localStorage`.
- **Budget health overview** that compares category spending to configurable percentage targets.
- **Responsive design** that works on desktop and mobile viewports.

## Getting started

1. Create a Google OAuth 2.0 Client ID for a web application in the [Google Cloud Console](https://console.cloud.google.com/).
2. Replace the placeholder value in `app.js`:
   ```js
   const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";
   ```
3. Serve the site locally (for example, with `npx serve .`) and open it in a modern browser.
4. Sign in with your Google account to unlock the dashboard and begin tracking transactions.

Transactions are stored in `localStorage` using a key that is unique per authenticated email address, so each user sees only their own data on the device.

## Project structure

```
index.html   # Application shell and Google sign-in container
styles.css   # Styling for the authentication screen and dashboard
app.js       # Client-side logic, Google sign-in, and transaction management
```

Feel free to extend the dashboard with charts, export features, or integrations with real banking APIs.
