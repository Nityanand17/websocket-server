# TypeBlaze Socket.IO Server

This is the real-time server component for the TypeBlaze typing application. It handles multiplayer typing competitions using Socket.IO.

## Features

- Create and join typing rooms
- Real-time typing competition with multiple players
- Live leaderboard updates
- Admin controls for room management
- Automatic timer and score calculation

## Getting Started

### Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. The server will run on http://localhost:3001 by default

### Production Deployment

#### Deploying to Render.com

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     - `PORT`: The port to run the server on (default: 3001)
   
4. Deploy the service
5. Update the client app to use your new Socket.IO server URL

#### Deploying to Railway

1. Create a new project on Railway
2. Connect your GitHub repository
3. Configure the deployment:
   - Start Command: `npm start`
   - Environment Variables:
     - `PORT`: The port to run the server on (default: 3001)

4. Deploy the application
5. Update the client app to use your new Socket.IO server URL

#### Deploying to Heroku

1. Create a new Heroku app
2. Connect your GitHub repository
3. Add the NodeJS buildpack
4. Deploy the application
5. Update the client app to use your new Socket.IO server URL

## Environment Variables

- `PORT`: The port to run the server on (default: 3001)

## Client Integration

Update your client-side Socket.IO connection to use the URL of your deployed server:

```javascript
const socket = io('https://your-server-url.com');
``` 