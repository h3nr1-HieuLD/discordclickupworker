/**
 * Simple debug logger
 */
export function logToFile(message: string): void {
  try {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    
    // Log to console
    console.log(`DEBUG LOG: ${message}`);
    
    // In a production environment, you might want to write to a file
    // or send to a logging service
  } catch (error) {
    console.error('Error logging to file:', error);
  }
}
