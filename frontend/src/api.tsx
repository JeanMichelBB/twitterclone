
// export const apiKey = import.meta.env.VITE_APP_API_KEY;
// export const apiUrl = import.meta.env.VITE_APP_API_URL;
// api.tsx
export {};

declare global {
  interface Window {
    __ENV__: {
      VITE_APP_API_KEY: string;
      VITE_APP_API_URL: string;
    };
  }
}

// Safely access environment variables
let apiKey: string;
let apiUrl: string;

// First check if `import.meta.env` is available (for Vite environments)
if (import.meta.env.VITE_APP_API_KEY && import.meta.env.VITE_APP_API_URL) {
  apiKey = import.meta.env.VITE_APP_API_KEY;
  apiUrl = import.meta.env.VITE_APP_API_URL;
} else if (window.__ENV__) {
  // Fallback to window.__ENV__ if running in another context
  apiKey = window.__ENV__.VITE_APP_API_KEY;
  apiUrl = window.__ENV__.VITE_APP_API_URL;
} else {
  console.error("Environment variables are not loaded.");
}

export { apiKey, apiUrl };