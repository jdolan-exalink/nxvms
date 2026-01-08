import { ipcMain, IpcMainInvokeEvent, shell, clipboard } from 'electron';
import { WindowManager } from './window-manager';
import * as fs from 'fs';
import * as path from 'path';

export class IpcBridge {
  /**
   * Register all IPC handlers
   */
  registerHandlers(ipc: typeof ipcMain, windowManager: WindowManager): void {
    // Window management
    ipc.handle('window:get-all-displays', () => {
      return windowManager.getAllDisplays();
    });

    ipc.handle('window:get-primary-display', () => {
      return windowManager.getPrimaryDisplay();
    });

    ipc.handle('window:create-secondary', async (_event, options) => {
      const window = windowManager.createSecondaryWindow(options);
      return { windowId: window.id };
    });

    ipc.handle('window:close-secondary', (_event, windowId: string) => {
      windowManager.closeSecondaryWindow(windowId);
      return { success: true };
    });

    ipc.handle('window:toggle-fullscreen', () => {
      windowManager.toggleFullscreen();
      return { success: true };
    });

    // File system operations
    ipc.handle('fs:select-directory', async () => {
      const { dialog } = require('electron');
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
      });
      return result.canceled ? null : result.filePaths[0];
    });

    ipc.handle('fs:select-file', async (_event, options) => {
      const { dialog } = require('electron');
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: options?.filters || [],
      });
      return result.canceled ? null : result.filePaths[0];
    });

    ipc.handle('fs:save-file', async (_event, options) => {
      const { dialog } = require('electron');
      const result = await dialog.showSaveDialog({
        defaultPath: options?.defaultPath,
        filters: options?.filters || [],
      });
      return result.canceled ? null : result.filePath;
    });

    ipc.handle('fs:read-file', async (_event, filePath: string) => {
      try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        return { success: true, content };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    ipc.handle('fs:write-file', async (_event, filePath: string, content: string) => {
      try {
        await fs.promises.writeFile(filePath, content, 'utf-8');
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    ipc.handle('fs:file-exists', async (_event, filePath: string) => {
      try {
        await fs.promises.access(filePath);
        return true;
      } catch {
        return false;
      }
    });

    ipc.handle('fs:get-file-stats', async (_event, filePath: string) => {
      try {
        const stats = await fs.promises.stat(filePath);
        return {
          success: true,
          size: stats.size,
          mtime: stats.mtime,
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory(),
        };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    // Clipboard operations
    ipc.handle('clipboard:write-text', async (_event, text: string) => {
      clipboard.writeText(text);
      return { success: true };
    });

    ipc.handle('clipboard:read-text', async () => {
      return clipboard.readText();
    });

    // URL operations
    ipc.handle('url:open-external', async (_event, url: string) => {
      await shell.openExternal(url);
      return { success: true };
    });

    // App info
    ipc.handle('app:get-version', () => {
      const { app } = require('electron');
      return {
        version: app.getVersion(),
        name: app.getName(),
        platform: process.platform,
        arch: process.arch,
      };
    });

    // Notifications
    ipc.handle('notification:show', async (_event, options) => {
      const { Notification } = require('electron');
      const notification = new Notification({
        title: options.title,
        body: options.body,
        icon: options.icon,
        silent: options.silent,
      });
      notification.show();
      return { success: true };
    });

    // System info
    ipc.handle('system:get-memory-info', async () => {
      const { app } = require('electron');
      return app.getGPUFeatureStatus();
    });
  }
}
