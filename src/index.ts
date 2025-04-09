import { Router } from 'itty-router';
import { verifyDiscordRequest } from './discord/utils';
import { handleInteraction } from './discord/interactions';
import { registerCommands } from './discord/commands';

// Create a new router
const router = Router();

// Register Discord commands on startup
router.get('/register', async (_request, env) => {
  try {
    const response = await registerCommands(env);
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(`Error registering commands: ${error}`, { status: 500 });
  }
});

// Test endpoint for Discord interactions
router.get('/test-discord-response', async (_request, env) => {
  try {
    console.log('DEBUG: Testing Discord response creation');

    // Import the necessary functions
    const { createDiscordResponse, InteractionResponseType } = await import('./discord/utils');

    // Create a test response
    const response = createDiscordResponse(
      InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      {
        content: 'This is a test response from the Discord bot.',
      }
    );

    console.log('DEBUG: Test response created successfully');
    return response;
  } catch (error) {
    console.error('DEBUG: Error in test endpoint:', error);
    return new Response(`Error testing Discord response: ${error}`, { status: 500 });
  }
});

// Handle Discord interactions
router.post('/interactions', async (request, env) => {
  console.log('Received request to /interactions endpoint');

  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');

  if (!signature || !timestamp) {
    console.error('Missing signature or timestamp');
    return new Response('Missing signature or timestamp', { status: 401 });
  }

  // Verify the request is from Discord
  try {
    const isValidRequest = await verifyDiscordRequest(
      request,
      env.DISCORD_PUBLIC_KEY,
      signature,
      timestamp
    );

    if (!isValidRequest) {
      console.error('Invalid request signature');
      return new Response('Invalid request signature', { status: 401 });
    }

    // Handle the interaction
    try {
      const interaction = await request.json();
      console.log('Processing interaction:', JSON.stringify(interaction));
      const response = await handleInteraction(interaction, env);
      console.log('Response sent successfully');
      return response;
    } catch (error) {
      console.error('Error handling interaction:', error);
      return new Response(`Error handling interaction: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
    }
  } catch (error) {
    console.error('Error verifying request:', error);
    return new Response(`Error verifying request: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
});

// Root route handler
router.get('/', () => {
  return new Response(
    JSON.stringify({
      name: 'Discord ClickUp Bot',
      description: 'A Discord bot that integrates with ClickUp',
      endpoints: [
        { path: '/register', description: 'Register Discord commands' },
        { path: '/interactions', description: 'Handle Discord interactions' }
      ],
      status: 'online'
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

// Handle all other requests
router.all('*', () => new Response('Not Found', { status: 404 }));

// Export the worker handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.handle(request, env, ctx);
  },
};

// Define environment variable interface
export interface Env {
  DISCORD_PUBLIC_KEY: string;
  DISCORD_TOKEN: string;
  DISCORD_APPLICATION_ID: string;
  CLICKUP_API_TOKEN: string;
  CLICKUP_WORKSPACE_ID: string;
}
