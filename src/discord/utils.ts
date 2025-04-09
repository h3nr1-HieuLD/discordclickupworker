import { verifyKey } from 'discord-interactions';

/**
 * Verify that the request is coming from Discord
 */
export async function verifyDiscordRequest(
  request: Request,
  clientKey: string,
  signature: string,
  timestamp: string
): Promise<boolean> {
  // Get the body as text
  const bodyText = await request.clone().text();

  // Verify the signature
  return verifyKey(bodyText, signature, timestamp, clientKey);
}

/**
 * Send a response to Discord
 */
export async function sendDiscordResponse(
  url: string,
  body: any,
  token: string
): Promise<Response> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Discord API error: ${response.status} ${text}`);
  }

  return response;
}

/**
 * Format a Discord embed for displaying ClickUp data
 */
export function formatEmbed(title: string, description: string, fields: any[] = [], color = 0x00AAFF): any {
  return {
    title,
    description,
    color,
    fields: fields.map(field => ({
      name: field.name,
      value: field.value,
      inline: field.inline || false,
    })),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a Discord response object
 */
export function createDiscordResponse(type: number, data: any): Response {
  try {
    console.log(`DEBUG: Creating Discord response of type ${type}`);
    const responseBody = JSON.stringify({ type, data });
    console.log(`DEBUG: Response body: ${responseBody}`);

    return new Response(responseBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('DEBUG: Error creating Discord response:', error);
    // Fallback to a simple response if JSON.stringify fails
    return new Response(JSON.stringify({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'An error occurred while creating the response.' }
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * Discord interaction response types
 */
export const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
  DEFERRED_UPDATE_MESSAGE: 6,
  UPDATE_MESSAGE: 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
  MODAL: 9,
};

/**
 * Discord interaction types
 */
export const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
  MODAL_SUBMIT: 5,
};
