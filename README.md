# AlumniForge

AlumniForge is a learning and community platform for students and alumni. It provides curated learning resources, user profiles, learning progress, quizzes, course reviews, contributions, and a community forum.

## Features

- Clerk authentication
- AlumniForge user profiles stored in Convex
- Learning resources for different technologies
- Community forum
- Forum posts and comments
- Delete your own forum posts
- Quiz functionality
- Learning progress tracking
- Course reviews
- Contributions
- Guest access to learning content
- User and admin roles

## Tech Stack

- HTML
- CSS
- JavaScript
- Vite
- Clerk
- Convex

## Prerequisites

Before running AlumniForge locally, install:

- Node.js
- Git

## Getting Started

### 1. Clone the repository

    git clone https://github.com/Sakshipandit-025/AlumniForge_OOPS.git
    cd AlumniForge_OOPS

### 2. Install dependencies

    npm install

### 3. Configure environment variables

AlumniForge uses Clerk for authentication and Convex for the backend.

Create a `.env.local` file in the project root.

Add:

    VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    VITE_CONVEX_URL=your_convex_url

Do not commit `.env` or `.env.local` files. They are already included in `.gitignore`.

### 4. Configure and start Convex

From the project root, run:

    npx convex dev

Follow the Convex CLI prompts to connect or configure the development deployment.

Keep this terminal running while developing.

### 5. Start the Vite development server

Open a second terminal in the project directory and run:

    npm run dev

Vite will provide a local development URL, usually:

    http://localhost:5173

Open the URL in your browser.

## Development

During development, run both Convex and Vite.

### Terminal 1 — Convex

    npx convex dev

### Terminal 2 — Vite

    npm run dev

### Build the project

To create a production build:

    npm run build

### Preview the production build

    npm run preview

## Project Structure

    AlumniForge_OOPS/
    ├── convex/
    │   ├── _generated/
    │   ├── auth.config.ts
    │   ├── forum.ts
    │   ├── schema.ts
    │   ├── testAuth.ts
    │   └── users.ts
    ├── src/
    │   ├── clerk.js
    │   ├── convex.js
    │   └── forum.js
    ├── index.html
    ├── forum.html
    ├── package.json
    ├── package-lock.json
    ├── .gitignore
    └── README.md

The project also contains the learning-resource pages and other application pages.

## Authentication

AlumniForge uses:

- Clerk for authentication and identity
- Convex for AlumniForge user profiles and application data

A user authenticates through Clerk first. AlumniForge then checks whether the user has an associated profile in Convex.

The user's application role is stored in the Convex `users` table.

Users do not choose their role during signup.

## Community Forum

The community forum uses Convex for its backend.

The forum currently supports:

- Creating discussions
- Viewing discussions
- Adding comments
- Displaying discussion authors
- Deleting your own discussions

Forum functionality is implemented using:

    convex/forum.ts
    src/forum.js
    forum.html

## Environment Variables

The following frontend variables are required:

    VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    VITE_CONVEX_URL=your_convex_url

Never commit actual API keys, tokens, or other private credentials to the repository.

## Git Workflow

When contributing to AlumniForge:

1. Create or switch to the appropriate development branch.
2. Make your changes.
3. Test the application locally.
4. Check your Git status.

    git status

5. Stage your changes:

    git add .

6. Commit your changes:

    git commit -m "Describe your changes"

7. Push your branch:

    git push

## Future Development

Planned and ongoing improvements include:

- Learning progress tracking
- Quiz and assessment improvements
- Course reviews
- Contributions
- User profile improvements
- Community forum improvements
- Admin approval and moderation
- Announcements
- Additional learning resources
- Improved search and navigation

## License

This project is currently being developed as part of the AlumniForge project.

## Contact

For project-related questions or contributions, use the project's GitHub repository.

AlumniForge_OOPS:
https://github.com/Sakshipandit-025/AlumniForge_OOPS