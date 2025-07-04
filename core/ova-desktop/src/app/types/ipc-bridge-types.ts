export {}; // This makes it a module and allows "declare global"

declare global {
  interface Window {
    IPCBridge: {
      windowControl: (action: 'minimize' | 'maximize' | 'close') => void;

      pickFolder: () => Promise<string | null>;
    };
  }
}
