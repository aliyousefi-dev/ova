export {}; // This makes it a module and allows "declare global"

declare global {
  interface Window {
    electronAPI: {
      OvaCli: (
        args: string[]
      ) => Promise<{ success: boolean; output?: string; error?: string }>;

      windowControl: (action: 'minimize' | 'maximize' | 'close') => void;

      pickFolder: () => Promise<string | null>;
    };
  }
}
