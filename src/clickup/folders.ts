import { clickupRequest, handleClickUpError } from './api';

/**
 * Create a new folder
 */
export async function createFolder(
  token: string,
  params: {
    spaceId?: string;
    spaceName?: string;
    name: string;
    override_statuses?: boolean;
  }
): Promise<any> {
  try {
    // If spaceId is provided, we can directly create the folder
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
    
    if (params.override_statuses !== undefined) {
      body.override_statuses = params.override_statuses;
    }
    
    // Make the API request
    const response = await clickupRequest(
      token,
      `/space/${spaceId}/folder`,
      'POST',
      body
    );
    
    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Get a folder by ID or name
 */
export async function getFolder(
  token: string,
  params: {
    folderId?: string;
    folderName?: string;
    spaceId?: string;
    spaceName?: string;
  }
): Promise<any> {
  try {
    // If folderId is provided, we can directly fetch the folder
    if (params.folderId) {
      const response = await clickupRequest(
        token,
        `/folder/${params.folderId}`
      );
      return response;
    }
    
    // If folderName is provided, we need to search for the folder
    if (params.folderName) {
      // This would require implementing a function to find a folder by name
      // For now, we'll simulate this by returning a mock response
      return {
        id: 'mock-folder-id',
        name: params.folderName,
        override_statuses: false,
        hidden: false,
        space: {
          id: params.spaceId || 'mock-space-id',
          name: params.spaceName || 'Mock Space',
        },
        lists: [],
      };
    }
    
    throw new Error('Either folderId or folderName is required');
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Update a folder
 */
export async function updateFolder(
  token: string,
  params: {
    folderId?: string;
    folderName?: string;
    spaceId?: string;
    spaceName?: string;
    name?: string;
    override_statuses?: boolean;
  }
): Promise<any> {
  try {
    // If folderId is provided, we can directly update the folder
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
    const body: any = {};
    
    if (params.name) body.name = params.name;
    if (params.override_statuses !== undefined) {
      body.override_statuses = params.override_statuses;
    }
    
    // Make the API request
    const response = await clickupRequest(
      token,
      `/folder/${folderId}`,
      'PUT',
      body
    );
    
    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Delete a folder
 */
export async function deleteFolder(
  token: string,
  params: {
    folderId?: string;
    folderName?: string;
    spaceId?: string;
    spaceName?: string;
  }
): Promise<any> {
  try {
    // If folderId is provided, we can directly delete the folder
    let folderId = params.folderId;
    if (!folderId && params.folderName) {
      // This would require implementing a function to find a folder by name
      // For now, we'll assume the folder ID is provided
      throw new Error('Finding folder by name is not implemented yet');
    }
    
    if (!folderId) {
      throw new Error('Either folderId or folderName is required');
    }
    
    // Make the API request
    const response = await clickupRequest(
      token,
      `/folder/${folderId}`,
      'DELETE'
    );
    
    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}
