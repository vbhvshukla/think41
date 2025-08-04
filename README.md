# Think41 - Simple Full Stack Web Application

A minimal full-stack web application built with AngularJS and Node.js.

## Technology Stack

### Frontend
- **AngularJS 1.8.2** - JavaScript framework for dynamic web apps
- **HTML5 & CSS3** - Standard web technologies

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for Node.js

## Features

- ✅ Simple single-page application
- ✅ AngularJS data binding
- ✅ Form handling
- ✅ API communication between frontend and backend
- ✅ Responsive design

## Project Structure

```
think41/
├── client/                 # Frontend (AngularJS)
│   ├── index.html         # Single page application
│   ├── package.json       # Frontend dependencies
│   └── node_modules/      # Dependencies
├── server/                # Backend (Node.js + Express)
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── node_modules/      # Dependencies
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (any recent version)
- npm package manager

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd think41
   ```

2. **Setup and Start Backend**
   ```bash
   cd server
   npm install
   npm start
   ```
   The server will start on http://localhost:5000

3. **Setup and Start Frontend** (in a new terminal)
   ```bash
   cd client
   npm install
   npm start
   ```
   The client will start on http://localhost:3000 and open in your browser

### Usage

1. Open http://localhost:3000 in your browser
2. Try adding users to the local list using the form
3. Click "Get Users from Server" to test the API connection
4. The app demonstrates basic AngularJS features and client-server communication

## API Endpoints

- `GET /` - Basic server info endpoint

## Development

- **Backend**: The server runs on port 5000 and provides a simple API
- **Frontend**: The client runs on port 3000 and serves the AngularJS application
- **Communication**: The frontend makes HTTP requests to the backend API

## Next Steps

This is a minimal starting point. You can extend it by adding:
- More API endpoints
- Database integration (MongoDB/PostgreSQL)
- User authentication
- Additional views and routing
- Styling frameworks (Bootstrap/Tailwind CSS)
- Form validation
- Error handling

## License

This project is licensed under the MIT License.
