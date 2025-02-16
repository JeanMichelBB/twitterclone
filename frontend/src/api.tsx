
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

// Safely access the properties
let apiKey: string | undefined;
let apiUrl: string | undefined;

if (window.__ENV__) {
  apiKey = window.__ENV__.VITE_APP_API_KEY;
  apiUrl = window.__ENV__.VITE_APP_API_URL;
} else {
  console.error("Environment variables are not loaded yet.");
}

export { apiKey, apiUrl };