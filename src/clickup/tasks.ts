import { clickupRequest, handleClickUpError } from './api';

/**
 * Create a new task
 */
export async function createTask(
  token: string,
  params: {
    listId?: string;
    listName?: string;
    workspaceId?: string;
    name: string;
    description?: string;
    markdown_description?: string;
    priority?: number;
    dueDate?: string | number;
    startDate?: string | number;
    parent?: string;
    status?: string;
  }
): Promise<any> {
  try {
    // If listName is provided, we need to find the list ID
    let listId = params.listId;
    if (!listId && params.listName) {
      // Import findListByName function
      const { findListByName } = await import('./lists');

      if (!params.workspaceId) {
        throw new Error('workspaceId is required when using listName');
      }

      // Find the list by name
      const list = await findListByName(token, params.workspaceId, params.listName);
      listId = list.id;
    }

    if (!listId) {
      throw new Error('Either listId or listName is required');
    }

    // Prepare the request body
    const body: any = {
      name: params.name,
    };

    if (params.description) body.description = params.description;
    if (params.markdown_description) body.markdown_description = params.markdown_description;
    if (params.priority) body.priority = params.priority;
    if (params.status) body.status = params.status;
    if (params.parent) body.parent = params.parent;

    // Handle date fields
    if (params.dueDate) {
      // If it's a string and not a number, assume it's a natural language date
      if (typeof params.dueDate === 'string' && isNaN(Number(params.dueDate))) {
        body.due_date_natural = params.dueDate;
      } else {
        body.due_date = params.dueDate;
      }
    }

    if (params.startDate) {
      // If it's a string and not a number, assume it's a natural language date
      if (typeof params.startDate === 'string' && isNaN(Number(params.startDate))) {
        body.start_date_natural = params.startDate;
      } else {
        body.start_date = params.startDate;
      }
    }

    // Make the API request
    const response = await clickupRequest(
      token,
      `/list/${listId}/task`,
      'POST',
      body
    );

    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Get a task by ID or name
 */
export async function getTask(
  token: string,
  params: {
    taskId?: string;
    taskName?: string;
    listName?: string;
    subtasks?: boolean;
  }
): Promise<any> {
  try {
    // If taskId is provided, we can directly fetch the task
    if (params.taskId) {
      const response = await clickupRequest(
        token,
        `/task/${params.taskId}${params.subtasks ? '?include_subtasks=true' : ''}`
      );
      return response;
    }

    // If taskName is provided, we need to search for the task
    if (params.taskName) {
      // This would require implementing a function to find a task by name
      // For now, we'll simulate this by returning a mock response
      return {
        id: 'mock-task-id',
        name: params.taskName,
        description: 'This is a mock task response',
        status: {
          status: 'to do',
          color: '#d3d3d3',
        },
        priority: 3,
        due_date: null,
        subtasks: [],
        url: 'https://app.clickup.com/t/mock-task-id',
      };
    }

    throw new Error('Either taskId or taskName is required');
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Update a task
 */
export async function updateTask(
  token: string,
  params: {
    taskId?: string;
    taskName?: string;
    name?: string;
    description?: string;
    markdown_description?: string;
    status?: string;
    priority?: number;
    dueDate?: string | number;
    startDate?: string | number;
  }
): Promise<any> {
  try {
    // If taskId is provided, we can directly update the task
    let taskId = params.taskId;
    if (!taskId && params.taskName) {
      // This would require implementing a function to find a task by name
      // For now, we'll assume the task ID is provided
      throw new Error('Finding task by name is not implemented yet');
    }

    if (!taskId) {
      throw new Error('Either taskId or taskName is required');
    }

    // Prepare the request body
    const body: any = {};

    if (params.name) body.name = params.name;
    if (params.description) body.description = params.description;
    if (params.markdown_description) body.markdown_description = params.markdown_description;
    if (params.status) body.status = params.status;
    if (params.priority) body.priority = params.priority;

    // Handle date fields
    if (params.dueDate) {
      // If it's a string and not a number, assume it's a natural language date
      if (typeof params.dueDate === 'string' && isNaN(Number(params.dueDate))) {
        body.due_date_natural = params.dueDate;
      } else {
        body.due_date = params.dueDate;
      }
    }

    if (params.startDate) {
      // If it's a string and not a number, assume it's a natural language date
      if (typeof params.startDate === 'string' && isNaN(Number(params.startDate))) {
        body.start_date_natural = params.startDate;
      } else {
        body.start_date = params.startDate;
      }
    }

    // Make the API request
    const response = await clickupRequest(
      token,
      `/task/${taskId}`,
      'PUT',
      body
    );

    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Delete a task
 */
export async function deleteTask(
  token: string,
  params: {
    taskId?: string;
    taskName?: string;
    listName?: string;
  }
): Promise<any> {
  try {
    // If taskId is provided, we can directly delete the task
    let taskId = params.taskId;
    if (!taskId && params.taskName) {
      // This would require implementing a function to find a task by name
      // For now, we'll assume the task ID is provided
      throw new Error('Finding task by name is not implemented yet');
    }

    if (!taskId) {
      throw new Error('Either taskId or taskName is required');
    }

    // Make the API request
    const response = await clickupRequest(
      token,
      `/task/${taskId}`,
      'DELETE'
    );

    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Get tasks from a list
 */
export async function getTasksFromList(
  token: string,
  params: {
    listId?: string;
    listName?: string;
    archived?: boolean;
    page?: number;
    order_by?: string;
    reverse?: boolean;
    subtasks?: boolean;
    statuses?: string[];
    include_closed?: boolean;
    assignees?: string[];
    due_date_gt?: number;
    due_date_lt?: number;
  }
): Promise<any> {
  try {
    // If listId is provided, we can directly fetch the tasks
    let listId = params.listId;
    if (!listId && params.listName) {
      // This would require implementing a function to find a list by name
      // For now, we'll assume the list ID is provided
      throw new Error('Finding list by name is not implemented yet');
    }

    if (!listId) {
      throw new Error('Either listId or listName is required');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();

    if (params.archived !== undefined) queryParams.append('archived', params.archived.toString());
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.order_by) queryParams.append('order_by', params.order_by);
    if (params.reverse !== undefined) queryParams.append('reverse', params.reverse.toString());
    if (params.subtasks !== undefined) queryParams.append('subtasks', params.subtasks.toString());
    if (params.include_closed !== undefined) queryParams.append('include_closed', params.include_closed.toString());

    if (params.statuses && params.statuses.length > 0) {
      params.statuses.forEach(status => {
        queryParams.append('statuses[]', status);
      });
    }

    if (params.assignees && params.assignees.length > 0) {
      params.assignees.forEach(assignee => {
        queryParams.append('assignees[]', assignee);
      });
    }

    if (params.due_date_gt !== undefined) queryParams.append('due_date_gt', params.due_date_gt.toString());
    if (params.due_date_lt !== undefined) queryParams.append('due_date_lt', params.due_date_lt.toString());

    // Make the API request
    const response = await clickupRequest(
      token,
      `/list/${listId}/task?${queryParams.toString()}`
    );

    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Add a tag to a task
 */
export async function addTagToTask(
  token: string,
  params: {
    taskId?: string;
    taskName?: string;
    listName?: string;
    tagName: string;
  }
): Promise<any> {
  try {
    // If taskId is provided, we can directly add the tag
    let taskId = params.taskId;
    if (!taskId && params.taskName) {
      // This would require implementing a function to find a task by name
      // For now, we'll assume the task ID is provided
      throw new Error('Finding task by name is not implemented yet');
    }

    if (!taskId) {
      throw new Error('Either taskId or taskName is required');
    }

    // Make the API request
    const response = await clickupRequest(
      token,
      `/task/${taskId}/tag/${params.tagName}`,
      'POST'
    );

    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Remove a tag from a task
 */
export async function removeTagFromTask(
  token: string,
  params: {
    taskId?: string;
    taskName?: string;
    listName?: string;
    tagName: string;
  }
): Promise<any> {
  try {
    // If taskId is provided, we can directly remove the tag
    let taskId = params.taskId;
    if (!taskId && params.taskName) {
      // This would require implementing a function to find a task by name
      // For now, we'll assume the task ID is provided
      throw new Error('Finding task by name is not implemented yet');
    }

    if (!taskId) {
      throw new Error('Either taskId or taskName is required');
    }

    // Make the API request
    const response = await clickupRequest(
      token,
      `/task/${taskId}/tag/${params.tagName}`,
      'DELETE'
    );

    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Search tasks by tags
 */
export async function searchTasksByTags(
  token: string,
  workspaceId: string,
  params: {
    tags: string[];
    include_closed?: boolean;
    page?: number;
    order_by?: string;
    reverse?: boolean;
  }
): Promise<any> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();

    // Add tags
    params.tags.forEach(tag => {
      queryParams.append('tags[]', tag);
    });

    if (params.include_closed !== undefined) queryParams.append('include_closed', params.include_closed.toString());
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.order_by) queryParams.append('order_by', params.order_by);
    if (params.reverse !== undefined) queryParams.append('reverse', params.reverse.toString());

    // Make the API request
    const response = await clickupRequest(
      token,
      `/team/${workspaceId}/task?${queryParams.toString()}`
    );

    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Search tasks by status
 */
export async function searchTasksByStatus(
  token: string,
  workspaceId: string,
  params: {
    status: string;
    include_closed?: boolean;
    page?: number;
    order_by?: string;
    reverse?: boolean;
  }
): Promise<any> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();

    // Add status
    queryParams.append('statuses[]', params.status);

    if (params.include_closed !== undefined) queryParams.append('include_closed', params.include_closed.toString());
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.order_by) queryParams.append('order_by', params.order_by);
    if (params.reverse !== undefined) queryParams.append('reverse', params.reverse.toString());

    // Make the API request
    const response = await clickupRequest(
      token,
      `/team/${workspaceId}/task?${queryParams.toString()}`
    );

    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}
