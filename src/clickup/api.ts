/**
 * Base ClickUp API client
 */
export async function clickupRequest(
  token: string,
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> {
  const url = `https://api.clickup.com/api/v2${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': token,
  };
  
  const options: RequestInit = {
    method,
    headers,
  };
  
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    
    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '5';
      const waitTime = parseInt(retryAfter, 10) * 1000;
      
      // Wait for the specified time and retry
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return clickupRequest(token, endpoint, method, body);
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ClickUp API error (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error making ClickUp API request:', error);
    throw error;
  }
}

/**
 * Handle errors from the ClickUp API
 */
export function handleClickUpError(error: any): never {
  // Extract the error message
  let message = 'Unknown error occurred';
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    message = error.message || JSON.stringify(error);
  }
  
  // Check for specific error types
  if (message.includes('NOT_FOUND')) {
    throw new Error(`Resource not found: ${message}`);
  }
  
  if (message.includes('MISSING_PARAMETER')) {
    throw new Error(`Missing parameter: ${message}`);
  }
  
  if (message.includes('UNAUTHORIZED')) {
    throw new Error('Unauthorized: Please check your ClickUp API token');
  }
  
  throw new Error(`ClickUp API error: ${message}`);
}
