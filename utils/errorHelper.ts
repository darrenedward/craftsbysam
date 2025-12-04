
/**
 * Formats an error object into a user-readable string.
 * Handles Supabase errors, standard JS Errors, and strings.
 */
export const formatError = (error: any): string => {
  if (!error) return 'An unknown error occurred.';
  
  const networkErrorMsg = "Connection Failed. Please check: 1. Your internet connection. 2. Turn off Ad Blockers (uBlock, etc) - they often block Supabase database requests. 3. Check your VPN.";

  // If it's already a string, return it
  if (typeof error === 'string') {
      if (error.includes("NetworkError") || error.includes("Failed to fetch") || error.includes("Load failed")) {
          return networkErrorMsg;
      }
      return error;
  }

  // Standard JS Error
  if (error instanceof Error) {
      if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch") || error.message.includes("Load failed")) {
          return networkErrorMsg;
      }
      return error.message;
  }

  // Supabase / PostgREST Error usually has a 'message' property
  if (error.message && typeof error.message === 'string') return error.message;
  
  // Handle nested Supabase error structures often seen in edge functions or auth
  if (error?.error?.message) return error.error.message;

  // Auth errors sometimes have 'error_description'
  if (error.error_description) return error.error_description;

  // Detailed PostgREST hints
  if (error.details) return `${error.message || 'Error'}: ${error.details}`;
  
  // Network errors or others might have a 'statusText'
  if (error.statusText) return error.statusText;

  // Fallback: Try to stringify if it's an object
  try {
      const json = JSON.stringify(error, null, 2);
      // If JSON stringify returns empty object or something unhelpful, try checking constructor
      if (json === '{}' || json === '[]') {
          return (error.constructor && error.constructor.name !== 'Object') 
            ? `Error type: ${error.constructor.name}` 
            : 'An unexpected error occurred (Unknown Object).';
      }
      // Clean up the JSON if it's too raw
      return json.replace(/[{}"]/g, '').replace(/,/g, ', ');
  } catch (e) {
      return 'An error occurred (could not parse details).';
  }
};
