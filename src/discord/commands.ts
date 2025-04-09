import { Env } from '../index';

// Command definitions
const COMMANDS = [
  {
    name: 'workspace',
    description: 'Get ClickUp workspace information',
    options: [
      {
        name: 'hierarchy',
        description: 'Get the workspace hierarchy',
        type: 1, // SUB_COMMAND
      },
    ],
  },
  {
    name: 'task',
    description: 'Manage ClickUp tasks',
    options: [
      {
        name: 'create',
        description: 'Create a new task',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'list',
            description: 'The list to create the task in',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'name',
            description: 'The name of the task',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'description',
            description: 'The description of the task',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'priority',
            description: 'The priority of the task (1-4)',
            type: 4, // INTEGER
            required: false,
            choices: [
              {
                name: 'Urgent',
                value: 1,
              },
              {
                name: 'High',
                value: 2,
              },
              {
                name: 'Normal',
                value: 3,
              },
              {
                name: 'Low',
                value: 4,
              },
            ],
          },
          {
            name: 'due_date',
            description: 'The due date of the task (natural language, e.g., "tomorrow at 5pm")',
            type: 3, // STRING
            required: false,
          },
        ],
      },
      {
        name: 'get',
        description: 'Get task details',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'task',
            description: 'The name or ID of the task',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'list',
            description: 'The list containing the task (for disambiguation)',
            type: 3, // STRING
            required: false,
          },
        ],
      },
      {
        name: 'update',
        description: 'Update a task',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'task',
            description: 'The name or ID of the task',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'name',
            description: 'The new name of the task',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'description',
            description: 'The new description of the task',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'status',
            description: 'The new status of the task',
            type: 3, // STRING
            required: false,
          },
          {
            name: 'priority',
            description: 'The new priority of the task (1-4)',
            type: 4, // INTEGER
            required: false,
            choices: [
              {
                name: 'Urgent',
                value: 1,
              },
              {
                name: 'High',
                value: 2,
              },
              {
                name: 'Normal',
                value: 3,
              },
              {
                name: 'Low',
                value: 4,
              },
            ],
          },
          {
            name: 'due_date',
            description: 'The new due date of the task (natural language)',
            type: 3, // STRING
            required: false,
          },
        ],
      },
      {
        name: 'delete',
        description: 'Delete a task',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'task',
            description: 'The name or ID of the task',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'list',
            description: 'The list containing the task (for disambiguation)',
            type: 3, // STRING
            required: false,
          },
        ],
      },
    ],
  },
  {
    name: 'list',
    description: 'Manage ClickUp lists',
    options: [
      {
        name: 'get',
        description: 'Get list details',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'list',
            description: 'The name or ID of the list',
            type: 3, // STRING
            required: true,
          },
        ],
      },
      {
        name: 'tasks',
        description: 'Get tasks from a list',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'list',
            description: 'The name or ID of the list',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'include_closed',
            description: 'Include closed tasks',
            type: 5, // BOOLEAN
            required: false,
          },
        ],
      },
      {
        name: 'create',
        description: 'Create a new list',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'space',
            description: 'The space to create the list in',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'name',
            description: 'The name of the list',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'content',
            description: 'The description of the list',
            type: 3, // STRING
            required: false,
          },
        ],
      },
    ],
  },
  {
    name: 'tag',
    description: 'Manage ClickUp tags',
    options: [
      {
        name: 'list',
        description: 'List all tags in a space',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'space',
            description: 'The name or ID of the space',
            type: 3, // STRING
            required: true,
          },
        ],
      },
      {
        name: 'create',
        description: 'Create a new tag',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'space',
            description: 'The name or ID of the space',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'name',
            description: 'The name of the tag',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'color',
            description: 'The color of the tag (natural language, e.g., "blue")',
            type: 3, // STRING
            required: false,
          },
        ],
      },
      {
        name: 'add',
        description: 'Add a tag to a task',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'task',
            description: 'The name or ID of the task',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'tag',
            description: 'The name of the tag',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'list',
            description: 'The list containing the task (for disambiguation)',
            type: 3, // STRING
            required: false,
          },
        ],
      },
      {
        name: 'remove',
        description: 'Remove a tag from a task',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'task',
            description: 'The name or ID of the task',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'tag',
            description: 'The name of the tag',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'list',
            description: 'The list containing the task (for disambiguation)',
            type: 3, // STRING
            required: false,
          },
        ],
      },
    ],
  },
  {
    name: 'search',
    description: 'Search for tasks across the workspace',
    options: [
      {
        name: 'tags',
        description: 'Search tasks by tags',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'tags',
            description: 'Comma-separated list of tags',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'include_closed',
            description: 'Include closed tasks',
            type: 5, // BOOLEAN
            required: false,
          },
        ],
      },
      {
        name: 'status',
        description: 'Search tasks by status',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'status',
            description: 'The status to search for',
            type: 3, // STRING
            required: true,
          },
        ],
      },
    ],
  },
];

/**
 * Register commands with Discord
 */
export async function registerCommands(env: Env): Promise<any> {
  const url = `https://discord.com/api/v10/applications/${env.DISCORD_APPLICATION_ID}/commands`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${env.DISCORD_TOKEN}`,
    },
    body: JSON.stringify(COMMANDS),
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error registering commands: ${response.status} ${text}`);
  }
  
  return response.json();
}

/**
 * Get command options from an interaction
 */
export function getCommandOptions(options: any[] = []): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const option of options) {
    if (option.type === 1) {
      // This is a subcommand
      result.subcommand = option.name;
      if (option.options) {
        Object.assign(result, getCommandOptions(option.options));
      }
    } else {
      result[option.name] = option.value;
    }
  }
  
  return result;
}
