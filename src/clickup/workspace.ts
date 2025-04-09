import { clickupRequest, handleClickUpError } from './api';

/**
 * Get the workspace hierarchy
 */
export async function getWorkspaceHierarchy(
  token: string,
  workspaceId: string
): Promise<any> {
  try {
    // Get spaces in the workspace
    const spacesResponse = await clickupRequest(
      token,
      `/team/${workspaceId}/space`
    );

    // Create the workspace hierarchy
    const hierarchy: {
      workspace: {
        id: string;
        name: string;
        spaces: any[];
      }
    } = {
      workspace: {
        id: workspaceId,
        name: 'ClickUp Workspace', // This would ideally come from a separate API call
        spaces: [],
      },
    };

    // Process each space
    for (const space of spacesResponse.spaces) {
      const spaceData: any = {
        id: space.id,
        name: space.name,
        lists: [],
        folders: [],
      };

      // Get folders in the space
      const foldersResponse = await clickupRequest(
        token,
        `/space/${space.id}/folder`
      );

      // Process each folder
      for (const folder of foldersResponse.folders) {
        const folderData: any = {
          id: folder.id,
          name: folder.name,
          lists: [],
        };

        // Get lists in the folder
        const folderListsResponse = await clickupRequest(
          token,
          `/folder/${folder.id}/list`
        );

        // Add lists to the folder
        folderData.lists = folderListsResponse.lists;

        // Add the folder to the space
        spaceData.folders.push(folderData);
      }

      // Get lists directly in the space (not in folders)
      const listsResponse = await clickupRequest(
        token,
        `/space/${space.id}/list`
      );

      // Add lists to the space
      spaceData.lists = listsResponse.lists;

      // Add the space to the workspace
      hierarchy.workspace.spaces.push(spaceData);
    }

    return hierarchy;
  } catch (error) {
    return handleClickUpError(error);
  }
}
