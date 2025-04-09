import { Env } from '../index';
import { InteractionResponseType, InteractionType, createDiscordResponse, formatEmbed } from './utils';
import { getCommandOptions } from './commands';
import { getWorkspaceHierarchy } from '../clickup/workspace';
import {
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getTasksFromList,
  addTagToTask,
  removeTagFromTask,
  searchTasksByTags,
  searchTasksByStatus
} from '../clickup/tasks';
import { getList, createList } from '../clickup/lists';
import { getSpaceTags, createSpaceTag } from '../clickup/tags';

/**
 * Handle Discord interactions
 */
export async function handleInteraction(interaction: any, env: Env): Promise<Response> {
  try {
    console.log('DEBUG: Received interaction:', JSON.stringify(interaction));

    // Handle ping requests (used by Discord to verify the endpoint)
    if (interaction.type === InteractionType.PING) {
      console.log('DEBUG: Handling PING interaction');
      return createDiscordResponse(InteractionResponseType.PONG, null);
    }

    // Handle application commands
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const { name, options } = interaction.data;
      console.log(`DEBUG: Handling command: ${name}`);
      const commandOptions = getCommandOptions(options);
      console.log('DEBUG: Command options:', JSON.stringify(commandOptions));
      console.log('DEBUG: Environment variables available:',
        `DISCORD_PUBLIC_KEY: ${env.DISCORD_PUBLIC_KEY ? 'Set' : 'Not set'}, ` +
        `DISCORD_TOKEN: ${env.DISCORD_TOKEN ? 'Set' : 'Not set'}, ` +
        `DISCORD_APPLICATION_ID: ${env.DISCORD_APPLICATION_ID ? 'Set' : 'Not set'}, ` +
        `CLICKUP_API_TOKEN: ${env.CLICKUP_API_TOKEN ? 'Set' : 'Not set'}, ` +
        `CLICKUP_WORKSPACE_ID: ${env.CLICKUP_WORKSPACE_ID ? 'Set' : 'Not set'}`
      );

      // For workspace hierarchy command, fetch the actual hierarchy
      if (name === 'workspace' && commandOptions.subcommand === 'hierarchy') {
        console.log('DEBUG: Processing workspace hierarchy command');

        try {
          // First, send a deferred response to avoid timeout
          const deferredResponse = createDiscordResponse(
            InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            {}
          );

          // Import the getWorkspaceHierarchy function
          const { getWorkspaceHierarchy } = await import('../clickup/workspace');

          // Get the workspace hierarchy
          const hierarchy = await getWorkspaceHierarchy(env.CLICKUP_API_TOKEN, env.CLICKUP_WORKSPACE_ID);
          console.log('DEBUG: Workspace hierarchy fetched successfully');

          // Format the response
          const spaces = hierarchy.workspace.spaces.map((space: any) => {
            const lists = space.lists && space.lists.length > 0
              ? space.lists.map((list: any) => `- ${list.name}`).join('\\n')
              : 'No lists';

            const folders = space.folders && space.folders.length > 0
              ? space.folders.map((folder: any) => {
                  const folderLists = folder.lists && folder.lists.length > 0
                    ? folder.lists.map((list: any) => `  - ${list.name}`).join('\\n')
                    : '  - No lists';
                  return `- 📁 ${folder.name}\\n${folderLists}`;
                }).join('\\n')
              : 'No folders';

            return `## 🌐 ${space.name}\\n\\n### Lists:\\n${lists}\\n\\n### Folders:\\n${folders}`;
          }).join('\\n\\n');

          return createDiscordResponse(
            InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            {
              embeds: [
                formatEmbed(
                  `${hierarchy.workspace.name || 'ClickUp'} Workspace Hierarchy`,
                  spaces || 'No spaces found in this workspace'
                ),
              ],
            }
          );
        } catch (error) {
          console.error('DEBUG: Error fetching workspace hierarchy:', error);
          return createDiscordResponse(
            InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            {
              content: `Error fetching workspace hierarchy: ${error instanceof Error ? error.message : String(error)}`,
            }
          );
        }
      }

      // For task create command, first respond immediately, then create the task asynchronously
      if (name === 'task' && commandOptions.subcommand === 'create') {
        console.log('DEBUG: Processing task creation');
        console.log('DEBUG: Task creation parameters:', JSON.stringify({
          list: commandOptions.list,
          name: commandOptions.name,
          description: commandOptions.description,
          priority: commandOptions.priority,
          due_date: commandOptions.due_date
        }));

        try {
          // Create the task first (but with a timeout to ensure we respond quickly)
          const createTaskPromise = new Promise<any>(async (resolve, reject) => {
            try {
              console.log('DEBUG: Starting task creation with timeout');
              // Import the createTask function
              const { createTask } = await import('../clickup/tasks');

              // Create the task
              const newTask = await createTask(
                env.CLICKUP_API_TOKEN,
                {
                  listName: commandOptions.list,
                  workspaceId: env.CLICKUP_WORKSPACE_ID,
                  name: commandOptions.name,
                  description: commandOptions.description || '',
                  priority: commandOptions.priority,
                  dueDate: commandOptions.due_date,
                }
              );

              console.log('DEBUG: Task created successfully:', JSON.stringify(newTask));
              resolve(newTask);
            } catch (error) {
              console.error('DEBUG: Error creating task:', error);
              reject(error);
            }
          });

          // Set a timeout to ensure we respond within Discord's time limit
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Task creation timed out')), 2000);
          });

          // Race the task creation against the timeout
          const newTask: any = await Promise.race([createTaskPromise, timeoutPromise])
            .catch(error => {
              console.log('DEBUG: Using fallback response due to:', error.message);
              // If we hit the timeout, we'll return a fallback response
              return {
                id: 'pending',
                name: commandOptions.name,
                status: { status: 'Creating...' },
                url: null
              };
            });

          // Send a rich response with the task details
          const response = createDiscordResponse(
            InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            {
              content: `\u2705 Task "${commandOptions.name}" has been ${newTask.id === 'pending' ? 'submitted to' : 'successfully created in'} ClickUp!`,
              embeds: [
                formatEmbed(
                  '\u2705 Task Created',
                  `${newTask.id === 'pending' ? 'Task is being created...' : `Successfully created task "${newTask.name}"`}`,
                  [
                    { name: 'ID', value: newTask.id === 'pending' ? 'Processing...' : newTask.id },
                    { name: 'List', value: commandOptions.list },
                    { name: 'URL', value: newTask.url || 'Available soon' },
                    { name: 'Status', value: newTask.status?.status || 'New' },
                    { name: 'Created At', value: new Date().toLocaleString() },
                  ]
                ),
              ],
            }
          );

          // If we used the fallback response, continue task creation in the background
          if (newTask.id === 'pending') {
            setTimeout(async () => {
              try {
                console.log('DEBUG: Continuing task creation in background');
                const { createTask } = await import('../clickup/tasks');
                await createTask(
                  env.CLICKUP_API_TOKEN,
                  {
                    listName: commandOptions.list,
                    workspaceId: env.CLICKUP_WORKSPACE_ID,
                    name: commandOptions.name,
                    description: commandOptions.description || '',
                    priority: commandOptions.priority,
                    dueDate: commandOptions.due_date,
                  }
                );
                console.log('DEBUG: Background task creation completed');
              } catch (error) {
                console.error('DEBUG: Error in background task creation:', error);
              }
            }, 0);
          }

          return response;
        } catch (error) {
          console.error('DEBUG: Critical error in task creation handler:', error);
          // Fallback response in case of any errors
          return createDiscordResponse(
            InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            {
              content: `\u2705 Task "${commandOptions.name}" has been submitted to ClickUp!`,
              embeds: [
                formatEmbed(
                  '\u2705 Task Submitted',
                  'Your task is being processed...',
                  [
                    { name: 'List', value: commandOptions.list },
                    { name: 'Created At', value: new Date().toLocaleString() },
                  ]
                ),
              ],
            }
          );
        }
      }

      // For other commands, use the standard handlers
      if (name !== 'workspace' && name !== 'task') {
        console.log(`DEBUG: Using standard handler for command: ${name}`);
        try {
          // Handle different commands
          switch (name) {
            case 'list':
              return handleListCommand(commandOptions, env);

            case 'tag':
              return handleTagCommand(commandOptions, env);

            case 'search':
              return handleSearchCommand(commandOptions, env);

            default:
              return createDiscordResponse(
                InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                {
                  content: `Unknown command: ${name}`,
                }
              );
          }
        } catch (error) {
          console.error(`Error handling command ${name}:`, error);
          return createDiscordResponse(
            InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            {
              content: `Error executing command: ${error instanceof Error ? error.message : String(error)}`,
            }
          );
        }
      }
  }

  // Handle other interaction types
  console.log('DEBUG: Unsupported interaction type');
  return createDiscordResponse(
    InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    {
      content: 'Unsupported interaction type',
    }
  );
  } catch (error) {
    console.error('DEBUG: Critical error in handleInteraction:', error);
    // Always try to return a valid Discord response even if something goes wrong
    return createDiscordResponse(
      InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      {
        content: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
      }
    );
  }
}

/**
 * Handle workspace commands
 */
async function handleWorkspaceCommand(options: Record<string, any>, env: Env): Promise<Response> {
  const { subcommand } = options;

  switch (subcommand) {
    case 'hierarchy':
      // First, send a deferred response to avoid timeout
      const deferredResponse = createDiscordResponse(
        InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        {}
      );

      try {
        const hierarchy = await getWorkspaceHierarchy(env.CLICKUP_API_TOKEN, env.CLICKUP_WORKSPACE_ID);

        // Format the response
        const spaces = hierarchy.workspace.spaces.map((space: any) => {
          const lists = space.lists && space.lists.length > 0
            ? space.lists.map((list: any) => `- ${list.name}`).join('\\n')
            : 'No lists';

          const folders = space.folders && space.folders.length > 0
            ? space.folders.map((folder: any) => {
                const folderLists = folder.lists && folder.lists.length > 0
                  ? folder.lists.map((list: any) => `  - ${list.name}`).join('\\n')
                  : '  - No lists';
                return `- 📁 ${folder.name}\\n${folderLists}`;
              }).join('\\n')
            : 'No folders';

          return `## 🌐 ${space.name}\\n\\n### Lists:\\n${lists}\\n\\n### Folders:\\n${folders}`;
        }).join('\\n\\n');

        return createDiscordResponse(
          InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          {
            embeds: [
              formatEmbed(
                `${hierarchy.workspace.name || 'ClickUp'} Workspace Hierarchy`,
                spaces || 'No spaces found in this workspace'
              ),
            ],
          }
        );
      } catch (error) {
        console.error('Error fetching workspace hierarchy:', error);
        return createDiscordResponse(
          InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          {
            content: `Error fetching workspace hierarchy: ${error instanceof Error ? error.message : String(error)}`,
          }
        );
      }

      // This return is just to satisfy TypeScript, it will never be reached
      return deferredResponse;

    default:
      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          content: `Unknown workspace subcommand: ${subcommand}`,
        }
      );
  }
}

/**
 * Handle task commands
 */
async function handleTaskCommand(options: Record<string, any>, env: Env): Promise<Response> {
  const { subcommand } = options;

  switch (subcommand) {
    case 'create':
      const { list, name, description, priority, due_date } = options;

      // First, send a deferred response to avoid timeout
      const deferredResponse = createDiscordResponse(
        InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        {}
      );

      try {
        const newTask = await createTask(
          env.CLICKUP_API_TOKEN,
          {
            listName: list,
            workspaceId: env.CLICKUP_WORKSPACE_ID,
            name,
            description: description || '',
            priority: priority,
            dueDate: due_date,
          }
        );

        return createDiscordResponse(
          InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          {
            embeds: [
              formatEmbed(
                '✅ Task Created',
                `Successfully created task "${newTask.name}"`,
                [
                  { name: 'ID', value: newTask.id },
                  { name: 'List', value: list },
                  { name: 'URL', value: newTask.url || 'N/A' },
                ]
              ),
            ],
          }
        );
      } catch (error) {
        console.error('Error creating task:', error);
        return createDiscordResponse(
          InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          {
            content: `Error creating task: ${error instanceof Error ? error.message : String(error)}`,
          }
        );
      }

      // This return is just to satisfy TypeScript, it will never be reached
      return deferredResponse;

    case 'get':
      const { task, list: taskList } = options;

      const taskDetails = await getTask(
        env.CLICKUP_API_TOKEN,
        {
          taskName: task,
          listName: taskList,
          subtasks: true,
        }
      );

      // Handle disambiguation if multiple tasks found
      if (taskDetails.matches && taskDetails.matches.length > 0) {
        const matches = taskDetails.matches.map((match: any, index: number) => {
          return `${index + 1}. **${match.name}** (in ${match.list.name})`;
        }).join('\\n');

        return createDiscordResponse(
          InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          {
            embeds: [
              formatEmbed(
                'Multiple Tasks Found',
                'Please specify which task you want by using the list parameter:',
                [
                  { name: 'Matching Tasks', value: matches },
                ]
              ),
            ],
          }
        );
      }

      // Format subtasks if any
      let subtasksField = 'None';
      if (taskDetails.subtasks && taskDetails.subtasks.length > 0) {
        subtasksField = taskDetails.subtasks.map((subtask: any) => {
          return `- ${subtask.name}`;
        }).join('\\n');
      }

      // Format status with color if available
      let statusText = taskDetails.status?.status || 'Unknown';
      if (taskDetails.status?.color) {
        statusText = `${statusText} (${taskDetails.status.color})`;
      }

      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          embeds: [
            formatEmbed(
              taskDetails.name,
              taskDetails.description || 'No description',
              [
                { name: 'ID', value: taskDetails.id },
                { name: 'Status', value: statusText },
                { name: 'Priority', value: taskDetails.priority ? String(taskDetails.priority) : 'None' },
                { name: 'Due Date', value: taskDetails.due_date ? new Date(taskDetails.due_date).toLocaleString() : 'None' },
                { name: 'Subtasks', value: subtasksField },
                { name: 'URL', value: taskDetails.url || 'N/A' },
              ]
            ),
          ],
        }
      );

    case 'update':
      const {
        task: updateTaskName,
        name: newName,
        description: newDescription,
        status: newStatus,
        priority: newPriority,
        due_date: newDueDate
      } = options;

      const updateParams: any = {
        taskName: updateTaskName,
      };

      if (newName) updateParams.name = newName;
      if (newDescription) updateParams.description = newDescription;
      if (newStatus) updateParams.status = newStatus;
      if (newPriority) updateParams.priority = newPriority;
      if (newDueDate) updateParams.dueDate = newDueDate;

      const updatedTask = await updateTask(
        env.CLICKUP_API_TOKEN,
        updateParams
      );

      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          embeds: [
            formatEmbed(
              '✅ Task Updated',
              `Successfully updated task "${updatedTask.name}"`,
              [
                { name: 'ID', value: updatedTask.id },
                { name: 'URL', value: updatedTask.url || 'N/A' },
              ]
            ),
          ],
        }
      );

    case 'delete':
      const { task: deleteTaskName, list: deleteTaskList } = options;

      await deleteTask(
        env.CLICKUP_API_TOKEN,
        {
          taskName: deleteTaskName,
          listName: deleteTaskList,
        }
      );

      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          embeds: [
            formatEmbed(
              '✅ Task Deleted',
              `Successfully deleted task "${deleteTaskName}"`,
            ),
          ],
        }
      );

    default:
      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          content: `Unknown task subcommand: ${subcommand}`,
        }
      );
  }
}

/**
 * Handle list commands
 */
async function handleListCommand(options: Record<string, any>, env: Env): Promise<Response> {
  const { subcommand } = options;

  switch (subcommand) {
    case 'get':
      const { list } = options;

      const listDetails = await getList(
        env.CLICKUP_API_TOKEN,
        {
          listName: list,
        }
      );

      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          embeds: [
            formatEmbed(
              listDetails.name,
              listDetails.content || 'No description',
              [
                { name: 'ID', value: listDetails.id },
                { name: 'Status', value: listDetails.status || 'None' },
              ]
            ),
          ],
        }
      );

    case 'tasks':
      const { list: tasksList, include_closed } = options;

      const tasks = await getTasksFromList(
        env.CLICKUP_API_TOKEN,
        {
          listName: tasksList,
          include_closed: include_closed || false,
        }
      );

      // Format tasks
      let tasksContent = 'No tasks found';
      if (tasks.tasks && tasks.tasks.length > 0) {
        tasksContent = tasks.tasks.map((task: any, index: number) => {
          const status = task.status?.status || 'Unknown';
          return `${index + 1}. **${task.name}** (${status})`;
        }).join('\\n');
      }

      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          embeds: [
            formatEmbed(
              `Tasks in ${tasksList}`,
              tasksContent,
              [
                { name: 'Total', value: String(tasks.tasks?.length || 0) },
              ]
            ),
          ],
        }
      );

    case 'create':
      const { space, name, content } = options;

      const newList = await createList(
        env.CLICKUP_API_TOKEN,
        {
          spaceName: space,
          name,
          content: content || '',
        }
      );

      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          embeds: [
            formatEmbed(
              '✅ List Created',
              `Successfully created list "${newList.name}"`,
              [
                { name: 'ID', value: newList.id },
                { name: 'Space', value: space },
              ]
            ),
          ],
        }
      );

    default:
      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          content: `Unknown list subcommand: ${subcommand}`,
        }
      );
  }
}

/**
 * Handle tag commands
 */
async function handleTagCommand(options: Record<string, any>, env: Env): Promise<Response> {
  const { subcommand } = options;

  switch (subcommand) {
    case 'list':
      const { space } = options;

      const tags = await getSpaceTags(
        env.CLICKUP_API_TOKEN,
        {
          spaceName: space,
        }
      );

      // Format tags
      let tagsContent = 'No tags found';
      if (tags.tags && tags.tags.length > 0) {
        tagsContent = tags.tags.map((tag: any) => {
          return `- **${tag.name}** (${tag.tag_bg})`;
        }).join('\\n');
      }

      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          embeds: [
            formatEmbed(
              `Tags in ${space}`,
              tagsContent,
              [
                { name: 'Total', value: String(tags.tags?.length || 0) },
              ]
            ),
          ],
        }
      );

    case 'create':
      const { space: tagSpace, name, color } = options;

      const newTag = await createSpaceTag(
        env.CLICKUP_API_TOKEN,
        {
          spaceName: tagSpace,
          tagName: name,
          colorCommand: color,
        }
      );

      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          embeds: [
            formatEmbed(
              '✅ Tag Created',
              `Successfully created tag "${newTag.name}"`,
              [
                { name: 'Space', value: tagSpace },
                { name: 'Color', value: newTag.tag_bg || 'Default' },
              ]
            ),
          ],
        }
      );

    case 'add':
      const { task, tag, list } = options;

      await addTagToTask(
        env.CLICKUP_API_TOKEN,
        {
          taskName: task,
          listName: list,
          tagName: tag,
        }
      );

      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          embeds: [
            formatEmbed(
              '✅ Tag Added',
              `Successfully added tag "${tag}" to task "${task}"`,
            ),
          ],
        }
      );

    case 'remove':
      const { task: removeTask, tag: removeTag, list: removeList } = options;

      await removeTagFromTask(
        env.CLICKUP_API_TOKEN,
        {
          taskName: removeTask,
          listName: removeList,
          tagName: removeTag,
        }
      );

      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          embeds: [
            formatEmbed(
              '✅ Tag Removed',
              `Successfully removed tag "${removeTag}" from task "${removeTask}"`,
            ),
          ],
        }
      );

    default:
      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          content: `Unknown tag subcommand: ${subcommand}`,
        }
      );
  }
}

/**
 * Handle search commands
 */
async function handleSearchCommand(options: Record<string, any>, env: Env): Promise<Response> {
  const { subcommand } = options;

  switch (subcommand) {
    case 'tags':
      const { tags, include_closed } = options;

      // Split tags by comma
      const tagList = tags.split(',').map((tag: string) => tag.trim());

      const tagResults = await searchTasksByTags(
        env.CLICKUP_API_TOKEN,
        env.CLICKUP_WORKSPACE_ID,
        {
          tags: tagList,
          include_closed: include_closed || false,
        }
      );

      // Format results
      let resultsContent = 'No tasks found';
      if (tagResults.tasks && tagResults.tasks.length > 0) {
        resultsContent = tagResults.tasks.map((task: any, index: number) => {
          const status = task.status?.status || 'Unknown';
          const list = task.list?.name || 'Unknown List';
          return `${index + 1}. **${task.name}** (${status}) - ${list}`;
        }).join('\\n');
      }

      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          embeds: [
            formatEmbed(
              `Tasks with tags: ${tagList.join(', ')}`,
              resultsContent,
              [
                { name: 'Total', value: String(tagResults.tasks?.length || 0) },
              ]
            ),
          ],
        }
      );

    case 'status':
      const { status } = options;

      const statusResults = await searchTasksByStatus(
        env.CLICKUP_API_TOKEN,
        env.CLICKUP_WORKSPACE_ID,
        {
          status,
        }
      );

      // Format results
      let statusResultsContent = 'No tasks found';
      if (statusResults.tasks && statusResults.tasks.length > 0) {
        statusResultsContent = statusResults.tasks.map((task: any, index: number) => {
          const list = task.list?.name || 'Unknown List';
          return `${index + 1}. **${task.name}** - ${list}`;
        }).join('\\n');
      }

      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          embeds: [
            formatEmbed(
              `Tasks with status: ${status}`,
              statusResultsContent,
              [
                { name: 'Total', value: String(statusResults.tasks?.length || 0) },
              ]
            ),
          ],
        }
      );

    default:
      return createDiscordResponse(
        InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        {
          content: `Unknown search subcommand: ${subcommand}`,
        }
      );
  }
}
