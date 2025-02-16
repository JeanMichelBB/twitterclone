// export const apiKey = import.meta.env.VITE_APP_API_KEY;
// export const apiUrl = import.meta.env.VITE_APP_API_URL;

export {};

declare global {
  interface Window {
    __ENV__: {
      VITE_APP_API_KEY: string;
      VITE_APP_API_URL: string;
    };
  }
}

export const apiKey = window.__ENV__.VITE_APP_API_KEY;
export const apiUrl = window.__ENV__.VITE_APP_API_URL;