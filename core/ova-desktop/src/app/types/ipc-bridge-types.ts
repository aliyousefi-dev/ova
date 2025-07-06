// ipc-bridge-types.ts
export {}; // This makes it a module and allows "declare global"

declare global {
  interface Window {
    IPCBridge: {
      windowControl: (action: 'minimize' | 'maximize' | 'close') => void;
      pickFolder: () => Promise<string | null>;
      folderExists: (folderPath: string) => Promise<boolean>;
      joinPaths: (folderPath: string, folderName: string) => Promise<string>;
      saveRepositoryInfo: (metadata: any) => Promise<void>; // New method
      loadRepositoryInfo: () => Promise<any>; // New method
      runOvacli: (args: string[]) => Promise<any>; // <-- Add this method
    };
  }
}
