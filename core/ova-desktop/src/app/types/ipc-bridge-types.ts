// ipc-bridge-types.ts
export {}; // This makes it a module and allows "declare global"

declare global {
  interface Window {
    IPCBridge: {
      windowControl: (action: 'minimize' | 'maximize' | 'close') => void;
      pickFolder: () => Promise<string | null>;
      folderExists: (folderPath: string) => Promise<boolean>;
      joinPaths: (folderPath: string, folderName: string) => Promise<string>;
      runOvacli: (args: string[]) => Promise<any>; // <-- Add this method
      showItemInFolder: (fullPath: string) => Promise<boolean>;
      getDirectoryName: (fullPath: string) => Promise<string | null>;
    };
  }
}
