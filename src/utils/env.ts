/**
 * Validate required environment variables
 */
export function validateEnv(env: any): void {
  const requiredVars = [
    'DISCORD_PUBLIC_KEY',
    'DISCORD_TOKEN',
    'DISCORD_APPLICATION_ID',
    'CLICKUP_API_TOKEN',
    'CLICKUP_WORKSPACE_ID',
  ];
  
  const missingVars = requiredVars.filter(varName => !env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}
