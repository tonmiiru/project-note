# PointFlow

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tonmiiru/project-note)

A minimalist, real-time collaboration tool to capture, organize, and summarize project notes with AI-powered insights.

PointFlow is a minimalist, real-time collaborative note-taking application designed to streamline project communication. It replaces disorganized chat histories with a structured, topic-based system of bullet points. Authenticated users can create unique 'projects', each with a shareable link. Anyone with the link can instantly contribute points without needing an account, fostering frictionless collaboration. The interface is divided into three core, seamlessly integrated views: a streamlined input form for quick note entry with topic tagging; a dynamic 'Points' view for organizing, filtering, and interacting with notes (reacting, replying, setting statuses); and an 'AI Summary' view that leverages a powerful language model to generate on-demand summaries, status reports, and topic-based insights.

## ✨ Key Features

- **Frictionless Collaboration**: Anyone with a project link can contribute notes instantly, no sign-up required.
- **Topic-Based Organization**: Group notes by topics for clarity and easy retrieval.
- **Real-Time Updates**: See new points as they are added by collaborators.
- **AI-Powered Summaries**: Generate on-demand summaries, status reports, and topic-based insights with a single click.
- **Interactive Notes**: React, reply, and set statuses on points to track progress and facilitate discussion.
- **Flexible Dashboard**: View your input form, points list, and AI summary in a combined three-panel layout or as separate tabs.
- **Project Management**: Authenticated users can create, manage, and share multiple projects from a personal dashboard.

## 🚀 Technology Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Framer Motion, Lucide React
- **State Management**: Zustand
- **Forms**: React Hook Form, Zod
- **Backend**: Cloudflare Workers, Hono
- **Persistence**: Cloudflare Durable Objects (via Cloudflare Agents SDK)
- **AI Integration**: OpenAI SDK, Cloudflare AI Gateway

## 🏁 Getting Started

Follow these instructions to get a local copy of PointFlow up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/) package manager

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/pointflow.git
    cd pointflow
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

### Configuration

The application requires Cloudflare environment variables to connect to the AI Gateway.

1.  Create a `.dev.vars` file in the root of the project:
    ```sh
    touch .dev.vars
    ```

2.  Add your Cloudflare AI Gateway credentials to the `.dev.vars` file. You can get these from your Cloudflare Dashboard.
    ```ini
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="YOUR_CLOUDFLARE_API_KEY"
    ```

    **Note**: Never commit your `.dev.vars` file to version control.

## 💻 Development

To start the local development server, which includes both the Vite frontend and the Cloudflare Worker, run:

```sh
bun dev
```

This will start the application, typically on `http://localhost:3000`. The frontend will automatically reload when you make changes to the source files.

## 🚀 Deployment

This project is designed for seamless deployment to Cloudflare's global network.

1.  **Login to Cloudflare:**
    If you haven't already, log in to your Cloudflare account via the command line:
    ```sh
    bunx wrangler login
    ```

2.  **Configure Secrets:**
    Before deploying, you need to set your AI Gateway API key as a secret in your Cloudflare project.
    ```sh
    bunx wrangler secret put CF_AI_API_KEY
    ```
    You will also need to update the `CF_AI_BASE_URL` in `wrangler.jsonc` to point to your production gateway.

3.  **Deploy the application:**
    Run the deploy script to build the application and deploy it to Cloudflare Workers.
    ```sh
    bun run deploy
    ```

Alternatively, you can deploy directly from your GitHub repository with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tonmiiru/project-note)

## 📂 Project Structure

The codebase is organized into two main directories:

-   `src/`: Contains all the frontend code, including React components, pages, stores (Zustand), and utility functions.
-   `worker/`: Contains the backend Cloudflare Worker code, including the Hono API routes, Durable Object (Agent) implementation, and type definitions.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.