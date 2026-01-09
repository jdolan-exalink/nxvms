// ============================================================================
// MAIN LAYOUT
// Main application layout with sidebar, header, and content area
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Clock,
  Activity,
  Zap,
  Bookmark,
  Download,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore, useResourcesStore } from '../core/store';
import { ResourceTree } from '../resources/resource-tree';
import { useViewModeStore } from '../core/store';
import { useNotificationsStore } from '../core/store';
import { getApiClient } from '../shared/api-client';
import { GridLayout } from './grid-layout';
import { VersionBadge } from '../shared/version-badge';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const viewMode = useViewModeStore((state) => state.viewMode);
  const setViewMode = useViewModeStore((state) => state.setViewMode);
  const setSites = useResourcesStore((state) => state.setSites);
  const setCameras = useResourcesStore((state) => state.setCameras);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  // Load resource tree on mount
  useEffect(() => {
    const loadResources = async () => {
      try {
        const apiClient = getApiClient();
        const sites = await apiClient.getResourceTree();
        setSites(sites);
        
        // Also extract all cameras for the flat camera list in store
        const allCameras = sites.flatMap(site => 
          site.servers.flatMap(server => server.cameras)
        );
        setCameras(allCameras);
        console.log('[MainLayout] 🌲 Resource tree loaded:', sites.length, 'sites,', allCameras.length, 'cameras');
      } catch (err) {
        console.error('[MainLayout] ❌ Failed to load resource tree:', err);
      }
    };

    loadResources();
  }, [setSites, setCameras]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCameraSelect = (camera: any) => {
    setSelectedCameraId(camera.id);
    setViewMode({ type: 'live', selectedCameraId: camera.id });
  };

  const navItems = [
    { id: 'live', label: 'Live View', icon: Video, path: '/live' },
    { id: 'playback', label: 'Playback', icon: Clock, path: '/playback' },
    { id: 'events', label: 'Events', icon: Zap, path: '/events' },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
    { id: 'export', label: 'Export', icon: Download, path: '/export' },
    { id: 'health', label: 'Health', icon: Activity, path: '/health' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      {/* Header */}
      <header className="h-14 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-dark-400 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white">NXvms</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-dark-400 hover:text-white">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block text-sm text-dark-300">{user?.displayName}</span>
            <button
              onClick={handleLogout}
              className="p-2 text-dark-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Resource Tree */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:relative z-40 w-64 h-full bg-dark-900 border-r border-dark-700 transition-transform duration-300 flex flex-col`}
        >
          <div className="flex-1 overflow-hidden">
            <ResourceTree
              onCameraSelect={handleCameraSelect}
              selectedCameraId={selectedCameraId}
            />
          </div>
          <div className="border-t border-dark-700 p-4">
            <VersionBadge className="text-center" />
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Navigation Tabs */}
          <nav className="h-12 bg-dark-800 border-b border-dark-700 flex items-center px-4 gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-400 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
