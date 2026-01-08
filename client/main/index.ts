import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { WindowManager } from './window-manager';
import { IpcBridge } from './ipc-bridge';

class Application {
  private windowManager: WindowManager;
  private ipcBridge: IpcBridge;

  constructor() {
    this.windowManager = new WindowManager();
    this.ipcBridge = new IpcBridge();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // App ready
    app.whenReady().then(() => {
      this.windowManager.createMainWindow();
      this.setupAppListeners();
    });

    // Quit when all windows are closed (except on macOS)
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Re-create window on macOS when dock icon is clicked
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.windowManager.createMainWindow();
      }
    });

    // IPC handlers
    this.ipcBridge.registerHandlers(ipcMain, this.windowManager);
  }

  private setupAppListeners(): void {
    // Handle protocol registration for custom URL schemes
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('nxvms', process.execPath, [path.resolve(process.argv[1])]);
      }
    } else {
      app.setAsDefaultProtocolClient('nxvms');
    }

    // Handle protocol open
    app.on('open-url', (event, url) => {
      event.preventDefault();
      this.handleProtocolUrl(url);
    });
  }

  private handleProtocolUrl(url: string): void {
    // Parse nxvms:// protocol URLs
    // Example: nxvms://connect?server=example.com&port=443
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'connect') {
        const server = urlObj.searchParams.get('server');
        const port = urlObj.searchParams.get('port');
        if (server) {
          this.windowManager.sendToMainWindow('protocol:connect', {
            server,
            port: port ? parseInt(port, 10) : undefined,
          });
        }
      }
    } catch (error) {
      console.error('Failed to parse protocol URL:', error);
    }
  }
}

// Initialize application
new Application();
