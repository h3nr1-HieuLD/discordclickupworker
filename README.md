# Discord ClickUp Bot

A Discord bot that integrates with ClickUp and can be deployed to Cloudflare Workers.

## Features

This bot implements the features described in the API reference, including:

- Task Management
  - Create, update, and delete tasks
  - Get task details and comments
  - Add and remove tags from tasks
  - Search tasks by tags and status
- List Management
  - Create and get lists
  - Get tasks from a list
- Tag Management
  - Create and list tags
  - Add and remove tags from tasks
- Workspace Organization
  - Get the workspace hierarchy

## Setup

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- A Discord bot token and application ID
- A ClickUp API token and workspace ID
- A Cloudflare account (for deployment)

### Installation

1. Clone this repository:
   ```
   git clone <repository-url>
   cd discord-clickup-bot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create a `.dev.vars` file for local development:
     ```
     DISCORD_PUBLIC_KEY=your_discord_public_key
     DISCORD_TOKEN=your_discord_token
     DISCORD_APPLICATION_ID=your_discord_application_id
     CLICKUP_API_TOKEN=your_clickup_api_token
     CLICKUP_WORKSPACE_ID=your_clickup_workspace_id
     ```

### Local Development

1. Start the development server:
   ```
   npm run dev
   ```

2. Register the Discord commands:
   - Visit `http://localhost:8787/register` in your browser

### Deployment to Cloudflare Workers

1. Login to Cloudflare:
   ```
   npx wrangler login
   ```

2. Build the project:
   ```
   npm run build
   ```

3. Set up Cloudflare Wrangler secrets:
   ```
   npx wrangler secret put DISCORD_TOKEN
   npx wrangler secret put CLICKUP_API_TOKEN
   ```

4. Update the `wrangler.toml` file with your Discord public key and application ID:
   ```toml
   [vars]
   DISCORD_PUBLIC_KEY = "your_discord_public_key"
   DISCORD_APPLICATION_ID = "your_discord_application_id"
   CLICKUP_WORKSPACE_ID = "your_clickup_workspace_id"
   ```

5. Deploy to Cloudflare Workers:
   ```
   npm run deploy
   ```

6. Register the Discord commands:
   - Visit `https://your-worker-url.workers.dev/register` in your browser

7. Configure Discord Application:
   - Go to the Discord Developer Portal: https://discord.com/developers/applications
   - Select your application
   - Go to "Interactions" in the sidebar
   - Set the Interactions Endpoint URL to `https://your-worker-url.workers.dev/interactions`
   - Save changes

8. Test the bot:
   - Visit `https://your-worker-url.workers.dev/test-discord-response` to test basic response functionality
   - Use the slash commands in your Discord server

## Discord Commands

The bot provides the following slash commands:

- `/workspace hierarchy` - Get the workspace hierarchy
- `/task create` - Create a new task
- `/task get` - Get task details
- `/task update` - Update a task
- `/task delete` - Delete a task
- `/list get` - Get list details
- `/list tasks` - Get tasks from a list
- `/list create` - Create a new list
- `/tag list` - List all tags in a space
- `/tag create` - Create a new tag
- `/tag add` - Add a tag to a task
- `/tag remove` - Remove a tag from a task
- `/search tags` - Search tasks by tags
- `/search status` - Search tasks by status

## License

MIT
