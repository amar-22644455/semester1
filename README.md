# ShareXP

**ShareXP** is a focused social platform built exclusively for students — a space where college and school students can share what they are actually doing: projects, achievements, skills, internships, and campus life. Unlike global social networks where content is unfiltered and audience is everyone, ShareXP is designed around the academic community.

---

## Why ShareXP is Different

Current social media platforms (Instagram, Twitter/X, LinkedIn) are built for a global, unrestricted audience. Content is driven by algorithms optimised for engagement, not relevance. For students, this creates noise — viral trends, advertisements, and content from people you have no connection with dominate the feed.

**ShareXP solves this by being explicit about its purpose:**

| Global Social Media | ShareXP |
|---|---|
| Global, unrestricted audience | Targeted to students — college and school community |
| Algorithm-driven content from strangers | Feed from people you follow within your academic network |
| No context on who is posting | Institute name shown on every post — you know the academic context |
| Career posts mixed with entertainment | Purely academic and student life content |
| No skill discovery | Dedicated skill profiles — find peers with specific technical skills |
| Notifications lost in noise | Clean, real-time notification system for meaningful interactions |

Students can share what they are building in labs, what hackathons they attended, what internships they secured, what skills they are learning — and it reaches the right people: other students and peers, not the entire internet.

---

## Features

### Posts and Feed
- Create text and media posts (images and videos up to 25 MB)
- Feed shows posts only from people you follow, keeping content relevant
- Real-time post updates via WebSocket — new posts appear instantly without refreshing
- Like and comment on posts with real-time engagement feedback

### Profiles
- Personal profile with name, institute, and profile picture
- View your own posts, follower count, and following count
- Skills section — list technical and soft skills on your profile
- Proficiency tracker — add skills with experience level (Beginner / Intermediate / Advanced)

### Search
- Search for other students by name or username
- Search history saved locally for quick access
- Skill-based search — find students who have a specific skill

### Notifications
- Real-time notifications for likes, comments, and follows via WebSocket
- Notifications persist in the database — you never miss one even if you were offline
- Unread badge count on the notification icon
- Browser push notification support

### Achievements
- Dedicated achievements section on each profile
- Students can log and showcase academic and extracurricular accomplishments

### Connections
- Follow and unfollow other students
- Follower and following counts visible on profiles
- Follow action triggers an instant notification to the recipient

---

## Security

ShareXP is built with security as a first-class concern, not an afterthought.

### Authentication
- Passwords are hashed using **bcrypt** before storage — plain text passwords are never saved
- Authentication uses **JWT (JSON Web Tokens)** stored exclusively in **httpOnly cookies**
- The JWT is never stored in `localStorage` or `sessionStorage`, eliminating exposure to XSS attacks
- Cookies are configured with `sameSite: strict` to prevent CSRF attacks
- Cookies are set to `secure: true` in production, enforcing HTTPS-only transmission

### Session Management
- Session state is verified on every page load via `/api/auth/me` with `cache: no-store`
- All protected routes on the client redirect to login if the session is invalid
- Logout clears the httpOnly cookie on the server side — the token is invalidated at the source

### Route Protection
- Every private page is wrapped in a `ProtectedRoute` component
- The route guard waits for the server session check before deciding to render or redirect
- Unauthenticated users pasting any private URL are redirected to the login page

### API Security
- All API responses include `Cache-Control: no-store` headers — sensitive data is never cached
- Custom rate limiting applied to auth endpoints (100 requests per 15 minutes) and all other routes (1000 per 15 minutes)
- Input validation on all routes using `express-validator`
- Security headers set on every response: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Content-Security-Policy`, `Referrer-Policy`
- File upload size limits enforced server-side (5 MB for profile images, 25 MB for post media)

---

## Tech Stack

### Client
- **React** with React Router for SPA navigation
- **Vite** as the build tool and dev server
- **Socket.IO client** for real-time updates
- **Lucide React** for icons
- **Framer Motion** for animations
- **Vanilla CSS** for styling

### Server
- **Node.js** with **Express**
- **MongoDB** with **Mongoose** for the database
- **Socket.IO** for WebSocket real-time communication
- **JWT** for stateless authentication
- **bcrypt** for password hashing
- **Multer** for file uploads
- **Nodemon** for development auto-restart

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd semester1

# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

### Environment Variables

Create `server/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
NODE_ENV=development
PORT=5000
POST_UPLOAD_LIMIT_MB=25
PROFILE_IMAGE_LIMIT_MB=5
```

### Running Locally

```bash
npm run dev
```

This starts the Express server on port 5000 and the Vite client on port 5173 concurrently.

---

## Project Structure

```
semester1/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── context/         # AuthContext for global auth state
│       ├── pages/           # Route-level page components
│       └── utils/
├── server/                  # Express backend
│   ├── config/              # Database connection
│   ├── middleware/          # Auth middleware
│   ├── models/              # Mongoose schemas
│   └── routes/              # API route handlers
└── package.json             # Root scripts (concurrently)
```

---

## License

This project is academic work. All rights reserved.
