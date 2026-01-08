import { BrowserWindow, screen, Display } from 'electron';
import * as path from 'path';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private secondaryWindows: Map<string, BrowserWindow> = new Map();

  /**
   * Create the main application window
   */
  createMainWindow(): BrowserWindow {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    this.mainWindow = new BrowserWindow({
      width: Math.min(1920, width),
      height: Math.min(1080, height),
      minWidth: 1024,
      minHeight: 768,
      show: false,
      backgroundColor: '#0f172a',
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        webSecurity: true,
      },
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      icon: path.join(__dirname, '../../assets/icon.png'),
    });

    // Load the app
    if (process.env.VITE_DEV_SERVER_URL) {
      this.mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    // Handle window close
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    return this.mainWindow;
  }

  /**
   * Get the main window instance
   */
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /**
   * Send a message to the main window
   */
  sendToMainWindow(channel: string, ...args: any[]): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args);
    }
  }

  /**
   * Create a secondary window (for multi-monitor support)
   */
  createSecondaryWindow(options: {
    displayId?: number;
    fullscreen?: boolean;
    cameras?: string[];
  }): BrowserWindow {
    const display = options.displayId
      ? screen.getAllDisplays().find((d) => d.id === options.displayId)
      : screen.getPrimaryDisplay();

    const bounds = display?.bounds || { x: 100, y: 100, width: 1920, height: 1080 };

    const windowId = `secondary-${Date.now()}`;

    const window = new BrowserWindow({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      fullscreen: options.fullscreen || false,
      show: false,
      backgroundColor: '#0f172a',
      frame: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    // Load the app with query params for secondary window
    const url = process.env.VITE_DEV_SERVER_URL
      ? `${process.env.VITE_DEV_SERVER_URL}?secondary=true&windowId=${windowId}`
      : `file://${path.join(__dirname, '../renderer/index.html')}?secondary=true&windowId=${windowId}`;

    window.loadURL(url);

    window.once('ready-to-show', () => {
      window.show();
    });

    window.on('closed', () => {
      this.secondaryWindows.delete(windowId);
    });

    this.secondaryWindows.set(windowId, window);

    return window;
  }

  /**
   * Close a secondary window
   */
  closeSecondaryWindow(windowId: string): void {
    const window = this.secondaryWindows.get(windowId);
    if (window && !window.isDestroyed()) {
      window.close();
    }
  }

  /**
   * Close all secondary windows
   */
  closeAllSecondaryWindows(): void {
    this.secondaryWindows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
    this.secondaryWindows.clear();
  }

  /**
   * Toggle fullscreen for the main window
   */
  toggleFullscreen(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      if (this.mainWindow.isFullScreen()) {
        this.mainWindow.setFullScreen(false);
      } else {
        this.mainWindow.setFullScreen(true);
      }
    }
  }

  /**
   * Get all displays (for multi-monitor support)
   */
  getAllDisplays(): Display[] {
    return screen.getAllDisplays();
  }

  /**
   * Get primary display
   */
  getPrimaryDisplay(): Display {
    return screen.getPrimaryDisplay();
  }
}
