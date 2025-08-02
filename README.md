# Node.js Blog App

A simple blogging platform with user authentication, post management, and commenting. Built with Node.js, Express, MongoDB on the backend, and vanilla JavaScript on the frontend. Supports public viewing for non-authenticated users and protected actions for logged-in users.

## Implemented Features
- **User Authentication**: Sign up, sign in, change password, edit profile (username/email).
- **Post Management**: Create, edit, delete posts (with title, body, status: draft/published). Partial updates allowed (e.g., change only status). Slug-based URLs for viewing.
- **Comments System**: Add comments to posts (auth required). View comments (public for all).
- **Dashboard**: Accessible to all—non-auth users see public published posts and can view comments (read-only); auth users see their own posts (including drafts) and can perform actions. Redirect to login for protected actions.
- **Filtering and Search**: Search posts by keyword, filter by status (published/draft), owner, date range.
- **Public Access**: Non-auth users can view published posts and comments but are redirected to login for interactions.
- **Other**: JWT for authentication, password hashing with bcrypt, MongoDB for data storage.

## Design Decisions
- **Backend**: Used Express for routing, MongoDB/Mongoose for data models (User, Post, Comment). JWT for secure authentication (expires in 1h). Routes are modular (auth.js, posts.js, comments.js). Public routes (e.g., /posts/public) for non-auth access to avoid separate pages.
- **Frontend**: Vanilla JS for simplicity (no frameworks). SessionStorage for token (clears on tab close). Dynamic rendering of posts/comments in dashboard.html. Conditional logic for auth/non-auth (e.g., hide forms, redirect on actions).
- **Security**: Passwords hashed with bcrypt. Auth middleware protects sensitive routes. Public viewing is read-only to prevent unauthorized changes.
- **UX Choices**: Dashboard serves both auth and non-auth users to simplify navigation (no separate public page). Redirects encourage login for interactions. Filtering added for better post discovery.

## Setup Instructions
1. **Prerequisites**:
   - Node.js (v16+)
   - MongoDB (local or Atlas)
   - Git

2. **Clone the Repo**:
git clone https://github.com/satvikB7/node-blog-app.git
cd node-blog-app


3. **Backend Setup**:
- Navigate to backend folder: `cd backend`
- Install dependencies: `npm install`
- npm install express mongoose jsonwebtoken bcryptjs dotenv cors body-parser
- Create a `.env` file in the backend folder with the following (use your own values):
  ```
  MONGO_URI=mongodb://localhost:27017/blogdb  # Example for local MongoDB; replace with your connection string (e.g., from MongoDB Atlas)
  JWT_SECRET=your-secret-key  # Generate a strong, unique secret (e.g., a random 32-character string; do NOT use this example in production)
     
  ```
- Run the server: `npm run dev` (uses nodemon for auto-reload)

4. **Frontend Setup**:
- No install needed (vanilla JS). Use a simple server like Live Server in VS Code to open frontend/index.html (for auth) or dashboard.html (for dashboard).

5. **Run the App**:
- Backend should be running on http://localhost:5000.
- Open frontend/index.html in browser for sign up/sign in.
- After login, redirects to dashboard.html for posts/comments.

6. **Test**:
- Sign up and log in.
- Create posts, add comments, test filtering.
- Log out and visit dashboard.html to see public view.

## Test User Credentials
Use these for testing (create them via sign up or add to your DB):
- Username: jack1
- Email: jack@gmail.com
- Password: jack

- Username: bob
- Email: bob@gmail.com
- Password: bob

If you run into issues, check the console for errors or the backend terminal for logs. Feel free to fork and contribute!


