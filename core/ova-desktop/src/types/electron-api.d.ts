// src/types/electron-api.d.ts

export {}; // This makes it a module and allows "declare global"

declare global {
  interface Window {
    electronAPI: {
      runCli: (
        args: string[]
      ) => Promise<{ success: boolean; output?: string; error?: string }>;
    };
  }
}
