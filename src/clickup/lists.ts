import { clickupRequest, handleClickUpError } from './api';

/**
 * Find a list by name in the workspace
 */
export async function findListByName(
  token: string,
  workspaceId: string,
  listName: string
): Promise<any> {
  try {
    // Get all spaces in the workspace
    const spacesResponse = await clickupRequest(
      token,
      `/team/${workspaceId}/space`
    );

    // Search for the list in each space
    for (const space of spacesResponse.spaces) {
      // Check lists directly in the space
      const listsResponse = await clickupRequest(
        token,
        `/space/${space.id}/list`
      );

      // Look for a matching list name
      const matchingList = listsResponse.lists.find(
        (list: any) => list.name.toLowerCase() === listName.toLowerCase()
      );

      if (matchingList) {
        return matchingList;
      }

      // Check lists in folders
      const foldersResponse = await clickupRequest(
        token,
        `/space/${space.id}/folder`
      );

      for (const folder of foldersResponse.folders) {
        const folderListsResponse = await clickupRequest(
          token,
          `/folder/${folder.id}/list`
        );

        const matchingFolderList = folderListsResponse.lists.find(
          (list: any) => list.name.toLowerCase() === listName.toLowerCase()
        );

        if (matchingFolderList) {
          return matchingFolderList;
        }
      }
    }

    throw new Error(`List with name '${listName}' not found`);
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Get a list by ID or name
 */
export async function getList(
  token: string,
  params: {
    listId?: string;
    listName?: string;
    workspaceId?: string;
  }
): Promise<any> {
  try {
    // If listId is provided, we can directly fetch the list
    if (params.listId) {
      const response = await clickupRequest(
        token,
        `/list/${params.listId}`
      );
      return response;
    }

    // If listName is provided, we need to search for the list
    if (params.listName) {
      if (!params.workspaceId) {
        throw new Error('workspaceId is required when using listName');
      }

      return await findListByName(token, params.workspaceId, params.listName);
    }

    throw new Error('Either listId or listName is required');
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Create a new list in a space
 */
export async function createList(
  token: string,
  params: {
    spaceId?: string;
    spaceName?: string;
    name: string;
    content?: string;
    dueDate?: number;
    priority?: number;
    assignee?: string;
    status?: string;
  }
): Promise<any> {
  try {
    // If spaceId is provided, we can directly create the list
    let spaceId = params.spaceId;
    if (!spaceId && params.spaceName) {
      // This would require implementing a function to find a space by name
      // For now, we'll assume the space ID is provided
      throw new Error('Finding space by name is not implemented yet');
    }

    if (!spaceId) {
      throw new Error('Either spaceId or spaceName is required');
    }

    // Prepare the request body
    const body: any = {
      name: params.name,
    };

    if (params.content) body.content = params.content;
    if (params.dueDate) body.due_date = params.dueDate;
    if (params.priority) body.priority = params.priority;
    if (params.assignee) body.assignee = params.assignee;
    if (params.status) body.status = params.status;

    // Make the API request
    const response = await clickupRequest(
      token,
      `/space/${spaceId}/list`,
      'POST',
      body
    );

    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Create a new list in a folder
 */
export async function createListInFolder(
  token: string,
  params: {
    folderId?: string;
    folderName?: string;
    name: string;
    content?: string;
    status?: string;
  }
): Promise<any> {
  try {
    // If folderId is provided, we can directly create the list
    let folderId = params.folderId;
    if (!folderId && params.folderName) {
      // This would require implementing a function to find a folder by name
      // For now, we'll assume the folder ID is provided
      throw new Error('Finding folder by name is not implemented yet');
    }

    if (!folderId) {
      throw new Error('Either folderId or folderName is required');
    }

    // Prepare the request body
    const body: any = {
      name: params.name,
    };

    if (params.content) body.content = params.content;
    if (params.status) body.status = params.status;

    // Make the API request
    const response = await clickupRequest(
      token,
      `/folder/${folderId}/list`,
      'POST',
      body
    );

    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Update a list
 */
export async function updateList(
  token: string,
  params: {
    listId?: string;
    listName?: string;
    name?: string;
    content?: string;
    status?: string;
  }
): Promise<any> {
  try {
    // If listId is provided, we can directly update the list
    let listId = params.listId;
    if (!listId && params.listName) {
      // This would require implementing a function to find a list by name
      // For now, we'll assume the list ID is provided
      throw new Error('Finding list by name is not implemented yet');
    }

    if (!listId) {
      throw new Error('Either listId or listName is required');
    }

    // Prepare the request body
    const body: any = {};

    if (params.name) body.name = params.name;
    if (params.content) body.content = params.content;
    if (params.status) body.status = params.status;

    // Make the API request
    const response = await clickupRequest(
      token,
      `/list/${listId}`,
      'PUT',
      body
    );

    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Delete a list
 */
export async function deleteList(
  token: string,
  params: {
    listId?: string;
    listName?: string;
  }
): Promise<any> {
  try {
    // If listId is provided, we can directly delete the list
    let listId = params.listId;
    if (!listId && params.listName) {
      // This would require implementing a function to find a list by name
      // For now, we'll assume the list ID is provided
      throw new Error('Finding list by name is not implemented yet');
    }

    if (!listId) {
      throw new Error('Either listId or listName is required');
    }

    // Make the API request
    const response = await clickupRequest(
      token,
      `/list/${listId}`,
      'DELETE'
    );

    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}
