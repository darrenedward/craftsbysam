
/**
 * Formats an error object into a user-readable string.
 * Handles Supabase errors, standard JS Errors, and strings.
 */
export const formatError = (error: any): string => {
  if (!error) return 'An unknown error occurred.';
  
  // If it's already a string, return it
  if (typeof error === 'string') {
      if (error.includes("NetworkError") || error.includes("Failed to fetch")) {
          return "Network Connection Error. Please check your internet connection. If you are using an Ad Blocker, please disable it for this site as it may be blocking the database.";
      }
      return error;
  }

  // Standard JS Error
  if (error instanceof Error) {
      if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
          return "Network Connection Error. Please check your internet connection or disable Ad Blockers.";
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
