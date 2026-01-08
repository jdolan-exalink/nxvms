// ============================================================================
// GLOBAL STATE MANAGEMENT (Zustand)
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User,
  ServerInfo,
  Camera,
  Site,
  Layout,
  ViewMode,
  Notification,
  DirectoryServer,
} from '../shared/types';
import { STORAGE_KEYS } from '../shared/constants';

// ============================================================================
// AUTH STORE
// ============================================================================

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  server: ServerInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (user: User, server: ServerInfo, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      server: null,
      accessToken: null,
      refreshToken: null,

      login: (user, server, accessToken, refreshToken) =>
        set({
          isAuthenticated: true,
          user,
          server,
          accessToken,
          refreshToken,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          server: null,
          accessToken: null,
          refreshToken: null,
        }),

      updateUser: (user) => set({ user }),
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        server: state.server,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// ============================================================================
// RESOURCES STORE
// ============================================================================

interface ResourcesState {
  sites: Site[];
  cameras: Camera[];
  selectedCameraId: string | null;
  expandedNodes: Set<string>;
  setSites: (sites: Site[]) => void;
  setCameras: (cameras: Camera[]) => void;
  selectCamera: (cameraId: string | null) => void;
  toggleNode: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  getCameraById: (cameraId: string) => Camera | undefined;
}

export const useResourcesStore = create<ResourcesState>((set, get) => ({
  sites: [],
  cameras: [],
  selectedCameraId: null,
  expandedNodes: new Set(),

  setSites: (sites) => set({ sites }),

  setCameras: (cameras) => set({ cameras }),

  selectCamera: (cameraId) => set({ selectedCameraId: cameraId }),

  toggleNode: (nodeId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedNodes);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return { expandedNodes: newExpanded };
    }),

  expandNode: (nodeId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedNodes);
      newExpanded.add(nodeId);
      return { expandedNodes: newExpanded };
    }),

  collapseNode: (nodeId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedNodes);
      newExpanded.delete(nodeId);
      return { expandedNodes: newExpanded };
    }),

  getCameraById: (cameraId) => get().cameras.find((c) => c.id === cameraId),
}));

// ============================================================================
// LAYOUT STORE
// ============================================================================

interface LayoutState {
  layouts: Layout[];
  currentLayout: Layout | null;
  isFullscreen: boolean;
  selectedLayoutSize: number;
  setLayouts: (layouts: Layout[]) => void;
  setCurrentLayout: (layout: Layout | null) => void;
  createLayout: (layout: Omit<Layout, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLayout: (layoutId: string, updates: Partial<Layout>) => void;
  deleteLayout: (layoutId: string) => void;
  toggleFullscreen: () => void;
  setLayoutSize: (size: number) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      layouts: [],
      currentLayout: null,
      isFullscreen: false,
      selectedLayoutSize: 4,

      setLayouts: (layouts) => set({ layouts }),

      setCurrentLayout: (layout) => set({ currentLayout: layout }),

      createLayout: (layout) =>
        set((state) => ({
          layouts: [
            ...state.layouts,
            {
              ...layout,
              id: `layout-${Date.now()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateLayout: (layoutId, updates) =>
        set((state) => ({
          layouts: state.layouts.map((l) =>
            l.id === layoutId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
          ),
          currentLayout:
            state.currentLayout?.id === layoutId
              ? { ...state.currentLayout, ...updates, updatedAt: new Date().toISOString() }
              : state.currentLayout,
        })),

      deleteLayout: (layoutId) =>
        set((state) => ({
          layouts: state.layouts.filter((l) => l.id !== layoutId),
          currentLayout:
            state.currentLayout?.id === layoutId ? null : state.currentLayout,
        })),

      toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

      setLayoutSize: (size) => set({ selectedLayoutSize: size }),
    }),
    {
      name: STORAGE_KEYS.LAYOUTS,
      partialize: (state) => ({
        layouts: state.layouts,
        currentLayout: state.currentLayout,
        selectedLayoutSize: state.selectedLayoutSize,
      }),
    }
  )
);

// ============================================================================
// VIEW MODE STORE
// ============================================================================

interface ViewModeState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useViewModeStore = create<ViewModeState>((set) => ({
  viewMode: { type: 'live' },
  setViewMode: (viewMode) => set({ viewMode }),
}));

// ============================================================================
// NOTIFICATIONS STORE
// ============================================================================

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) =>
    set((state) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      return {
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    }),

  markAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  removeNotification: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === notificationId);
      return {
        notifications: state.notifications.filter((n) => n.id !== notificationId),
        unreadCount: notification && !notification.read ? state.unreadCount - 1 : state.unreadCount,
      };
    }),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

// ============================================================================
// SERVER DIRECTORY STORE
// ============================================================================

interface ServerDirectoryState {
  servers: DirectoryServer[];
  setServers: (servers: DirectoryServer[]) => void;
  addServer: (server: DirectoryServer) => void;
  updateServer: (serverId: string, updates: Partial<DirectoryServer>) => void;
  removeServer: (serverId: string) => void;
  getServerById: (serverId: string) => DirectoryServer | undefined;
}

export const useServerDirectoryStore = create<ServerDirectoryState>()(
  persist(
    (set, get) => ({
      servers: [],

      setServers: (servers) => set({ servers }),

      addServer: (server) =>
        set((state) => ({
          servers: [...state.servers, server],
        })),

      updateServer: (serverId, updates) =>
        set((state) => ({
          servers: state.servers.map((s) =>
            s.id === serverId ? { ...s, ...updates } : s
          ),
        })),

      removeServer: (serverId) =>
        set((state) => ({
          servers: state.servers.filter((s) => s.id !== serverId),
        })),

      getServerById: (serverId) => get().servers.find((s) => s.id === serverId),
    }),
    {
      name: STORAGE_KEYS.SERVERS,
    }
  )
);

// ============================================================================
// THEME STORE
// ============================================================================

interface ThemeState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',

      setTheme: (theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: STORAGE_KEYS.THEME,
    }
  )
);

// ============================================================================
// LOADING STORE
// ============================================================================

interface LoadingState {
  isLoading: boolean;
  loadingMessage: string | null;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  loadingMessage: null,

  startLoading: (message) => set({ isLoading: true, loadingMessage: message || null }),

  stopLoading: () => set({ isLoading: false, loadingMessage: null }),
}));

// ============================================================================
// ERROR STORE
// ============================================================================

interface ErrorState {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  error: null,

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));
