import { contextBridge, ipcRenderer } from 'electron';

/**
 * Expose protected methods that allow the renderer process to use
 * the ipcRenderer without exposing the entire object
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Window management
  window: {
    getAllDisplays: () => ipcRenderer.invoke('window:get-all-displays'),
    getPrimaryDisplay: () => ipcRenderer.invoke('window:get-primary-display'),
    createSecondary: (options: any) => ipcRenderer.invoke('window:create-secondary', options),
    closeSecondary: (windowId: string) => ipcRenderer.invoke('window:close-secondary', windowId),
    toggleFullscreen: () => ipcRenderer.invoke('window:toggle-fullscreen'),
  },

  // File system
  fs: {
    selectDirectory: () => ipcRenderer.invoke('fs:select-directory'),
    selectFile: (options?: any) => ipcRenderer.invoke('fs:select-file', options),
    saveFile: (options?: any) => ipcRenderer.invoke('fs:save-file', options),
    readFile: (filePath: string) => ipcRenderer.invoke('fs:read-file', filePath),
    writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:write-file', filePath, content),
    fileExists: (filePath: string) => ipcRenderer.invoke('fs:file-exists', filePath),
    getFileStats: (filePath: string) => ipcRenderer.invoke('fs:get-file-stats', filePath),
  },

  // Clipboard
  clipboard: {
    writeText: (text: string) => ipcRenderer.invoke('clipboard:write-text', text),
    readText: () => ipcRenderer.invoke('clipboard:read-text'),
  },

  // URL
  url: {
    openExternal: (url: string) => ipcRenderer.invoke('url:open-external', url),
  },

  // App
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
  },

  // Notifications
  notification: {
    show: (options: any) => ipcRenderer.invoke('notification:show', options),
  },

  // System
  system: {
    getMemoryInfo: () => ipcRenderer.invoke('system:get-memory-info'),
  },

  // Event listeners
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = [
      'protocol:connect',
      'camera:status-change',
      'event:new',
      'health:update',
      'notification',
      'recording:status',
      'export:progress',
    ];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    }
  },

  // Remove event listener
  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback as any);
  },
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      window: {
        getAllDisplays: () => Promise<any[]>;
        getPrimaryDisplay: () => Promise<any>;
        createSecondary: (options: any) => Promise<{ windowId: number }>;
        closeSecondary: (windowId: string) => Promise<{ success: boolean }>;
        toggleFullscreen: () => Promise<{ success: boolean }>;
      };
      fs: {
        selectDirectory: () => Promise<string | null>;
        selectFile: (options?: any) => Promise<string | null>;
        saveFile: (options?: any) => Promise<string | null>;
        readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
        writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
        fileExists: (filePath: string) => Promise<boolean>;
        getFileStats: (filePath: string) => Promise<any>;
      };
      clipboard: {
        writeText: (text: string) => Promise<{ success: boolean }>;
        readText: () => Promise<string>;
      };
      url: {
        openExternal: (url: string) => Promise<{ success: boolean }>;
      };
      app: {
        getVersion: () => Promise<any>;
      };
      notification: {
        show: (options: any) => Promise<{ success: boolean }>;
      };
      system: {
        getMemoryInfo: () => Promise<any>;
      };
      on: (channel: string, callback: (...args: any[]) => void) => void;
      off: (channel: string, callback: (...args: any[]) => void) => void;
    };
  }
}
