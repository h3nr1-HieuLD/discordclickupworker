import { clickupRequest, handleClickUpError } from './api';

/**
 * Get all tags in a space
 */
export async function getSpaceTags(
  token: string,
  params: {
    spaceId?: string;
    spaceName?: string;
  }
): Promise<any> {
  try {
    // If spaceId is provided, we can directly fetch the tags
    let spaceId = params.spaceId;
    if (!spaceId && params.spaceName) {
      // This would require implementing a function to find a space by name
      // For now, we'll assume the space ID is provided
      throw new Error('Finding space by name is not implemented yet');
    }
    
    if (!spaceId) {
      throw new Error('Either spaceId or spaceName is required');
    }
    
    // Make the API request
    const response = await clickupRequest(
      token,
      `/space/${spaceId}/tag`
    );
    
    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Create a new tag in a space
 */
export async function createSpaceTag(
  token: string,
  params: {
    spaceId?: string;
    spaceName?: string;
    tagName: string;
    tagBg?: string;
    tagFg?: string;
    colorCommand?: string;
  }
): Promise<any> {
  try {
    // If spaceId is provided, we can directly create the tag
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
      name: params.tagName,
    };
    
    if (params.tagBg) body.tag_bg = params.tagBg;
    if (params.tagFg) body.tag_fg = params.tagFg;
    if (params.colorCommand) body.color_command = params.colorCommand;
    
    // Make the API request
    const response = await clickupRequest(
      token,
      `/space/${spaceId}/tag`,
      'POST',
      body
    );
    
    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Update a tag in a space
 */
export async function updateSpaceTag(
  token: string,
  params: {
    spaceId?: string;
    spaceName?: string;
    tagName: string;
    newTagName?: string;
    tagBg?: string;
    tagFg?: string;
    colorCommand?: string;
  }
): Promise<any> {
  try {
    // If spaceId is provided, we can directly update the tag
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
    const body: any = {};
    
    if (params.newTagName) body.name = params.newTagName;
    if (params.tagBg) body.tag_bg = params.tagBg;
    if (params.tagFg) body.tag_fg = params.tagFg;
    if (params.colorCommand) body.color_command = params.colorCommand;
    
    // Make the API request
    const response = await clickupRequest(
      token,
      `/space/${spaceId}/tag/${params.tagName}`,
      'PUT',
      body
    );
    
    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}

/**
 * Delete a tag from a space
 */
export async function deleteSpaceTag(
  token: string,
  params: {
    spaceId?: string;
    spaceName?: string;
    tagName: string;
  }
): Promise<any> {
  try {
    // If spaceId is provided, we can directly delete the tag
    let spaceId = params.spaceId;
    if (!spaceId && params.spaceName) {
      // This would require implementing a function to find a space by name
      // For now, we'll assume the space ID is provided
      throw new Error('Finding space by name is not implemented yet');
    }
    
    if (!spaceId) {
      throw new Error('Either spaceId or spaceName is required');
    }
    
    // Make the API request
    const response = await clickupRequest(
      token,
      `/space/${spaceId}/tag/${params.tagName}`,
      'DELETE'
    );
    
    return response;
  } catch (error) {
    return handleClickUpError(error);
  }
}
