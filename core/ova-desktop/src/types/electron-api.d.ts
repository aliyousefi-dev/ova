export {}; // This makes it a module and allows "declare global"

declare global {
  interface Window {
    electronAPI: {
      runCli: (
        args: string[]
      ) => Promise<{ success: boolean; output?: string; error?: string }>;

      windowControl: (action: 'minimize' | 'maximize' | 'close') => void;

      pickFolder: () => Promise<string | null>;

      /**
       * Subscribe to live CLI output (stdout/stderr).
       * Called repeatedly as log lines come in.
       */
      onCliLog: (callback: (log: string) => void) => void;

      /**
       * Opens a folder in the OS file explorer.
       * @param folderPath Absolute path to the folder.
       * @returns Promise that resolves when the folder is opened.
       */
      openInExplorer: (folderPath: string) => Promise<void>;
    };
  }
}
