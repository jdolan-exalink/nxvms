// ============================================================================
// SERVER SELECTOR
// Multi-server directory for selecting and managing servers
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { useServerDirectoryStore } from '../core/store';
import { DirectoryServer, ServerStatus } from '../shared/types';
import { getApiClient, resetApiClient } from '../shared/api-client';
import { useNotificationsStore } from '../core/store';
import { useErrorStore, useLoadingStore } from '../core/store';

export const ServerSelector: React.FC = () => {
  const navigate = useNavigate();
  const servers = useServerDirectoryStore((state) => state.servers);
  const setServers = useServerDirectoryStore((state) => state.setServers);
  const addServer = useServerDirectoryStore((state) => state.addServer);
  const removeServer = useServerDirectoryStore((state) => state.removeServer);
  const addNotification = useNotificationsStore((state) => state.addNotification);
  const setError = useErrorStore((state) => state.setError);
  const clearError = useErrorStore((state) => state.clearError);
  const error = useErrorStore((state) => state.error);
  const startLoading = useLoadingStore((state) => state.startLoading);
  const stopLoading = useLoadingStore((state) => state.stopLoading);
  const isLoading = useLoadingStore((state) => state.isLoading);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingServer, setEditingServer] = useState<DirectoryServer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    location: '',
  });

  // Load servers from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('nxvms_servers');
    if (stored) {
      try {
        setServers(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load servers:', e);
      }
    }
  }, [setServers]);

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!formData.name || !formData.url) {
      setError('Name and URL are required');
      return;
    }

    // Ensure URL has /api/v1 suffix
    let url = formData.url;
    if (!url.endsWith('/api/v1')) {
      url = url.replace(/\/$/, '') + '/api/v1';
    }

    const newServer: DirectoryServer = {
      id: `server-${Date.now()}`,
      name: formData.name,
      url,
      location: formData.location || undefined,
      status: ServerStatus.OFFLINE,
      lastSeen: new Date().toISOString(),
    };

    addServer(newServer);
    saveServersToStorage([...servers, newServer]);
    setShowAddForm(false);
    setFormData({ name: '', url: '', location: '' });

    addNotification({
      title: 'Server Added',
      message: `${newServer.name} has been added to your directory`,
      type: 'success',
      priority: 'normal',
    });
  };

  const handleRemoveServer = (serverId: string) => {
    if (window.confirm('Are you sure you want to remove this server?')) {
      removeServer(serverId);
      saveServersToStorage(servers.filter((s) => s.id !== serverId));

      addNotification({
        title: 'Server Removed',
        message: 'Server has been removed from your directory',
        type: 'info',
        priority: 'normal',
      });
    }
  };

  const handleSelectServer = async (server: DirectoryServer) => {
    startLoading('Connecting to server...');

    try {
      // Test connection
      const apiClient = getApiClient(server.url);
      await apiClient.getCurrentUser();

      // Navigate to login with server pre-selected
      navigate('/login', { state: { serverUrl: server.url } });
    } catch (err: any) {
      setError(`Failed to connect to ${server.name}: ${err.message}`);
      addNotification({
        title: 'Connection Failed',
        message: `Could not connect to ${server.name}`,
        type: 'error',
        priority: 'high',
      });
    } finally {
      stopLoading();
    }
  };

  const saveServersToStorage = (serversList: DirectoryServer[]) => {
    localStorage.setItem('nxvms_servers', JSON.stringify(serversList));
  };

  const getStatusIcon = (status: ServerStatus) => {
    switch (status) {
      case ServerStatus.ONLINE:
        return <CheckCircle className="w-4 h-4 text-status-online" />;
      case ServerStatus.OFFLINE:
        return <XCircle className="w-4 h-4 text-status-offline" />;
      case ServerStatus.DEGRADED:
        return <Clock className="w-4 h-4 text-status-warning" />;
      default:
        return <XCircle className="w-4 h-4 text-status-offline" />;
    }
  };

  const getStatusColor = (status: ServerStatus) => {
    switch (status) {
      case ServerStatus.ONLINE:
        return 'bg-status-online/10 border-status-online/20';
      case ServerStatus.OFFLINE:
        return 'bg-status-offline/10 border-status-offline/20';
      case ServerStatus.DEGRADED:
        return 'bg-status-warning/10 border-status-warning/20';
      default:
        return 'bg-status-offline/10 border-status-offline/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Header */}
      <header className="bg-dark-800/50 backdrop-blur-sm border-b border-dark-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-dark-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Login
          </button>
          <h1 className="text-xl font-semibold text-white">Server Directory</h1>
          <div className="w-24" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Add Server Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full mb-6 p-4 border-2 border-dashed border-dark-600 rounded-xl hover:border-primary-500 hover:bg-primary-500/5 transition-all flex items-center justify-center gap-2 text-dark-400 hover:text-primary-400"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Server</span>
          </button>
        )}

        {/* Add Server Form */}
        {showAddForm && (
          <div className="mb-6 p-6 bg-dark-800 rounded-xl border border-dark-700">
            <h2 className="text-lg font-semibold text-white mb-4">Add Server</h2>
            <form onSubmit={handleAddServer} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-dark-300 mb-2">
                  Server Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Office"
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-dark-300 mb-2">
                  Server URL
                </label>
                <input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="e.g., http://vms.example.com"
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-dark-500">
                  The API path /api/v1 will be added automatically
                </p>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-dark-300 mb-2">
                  Location (optional)
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., New York, USA"
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isLoading}
                />
              </div>
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Server
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', url: '', location: '' });
                    clearError();
                  }}
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 bg-dark-700 hover:bg-dark-600 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Server List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((server) => (
            <div
              key={server.id}
              className={`p-6 rounded-xl border ${getStatusColor(
                server.status
              )} hover:shadow-lg transition-all group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-dark-400" />
                  <h3 className="text-lg font-semibold text-white">{server.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(server.status)}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-dark-400">
                  <span className="font-medium">URL:</span>
                  <span className="text-dark-300 truncate">{server.url}</span>
                </div>
                {server.location && (
                  <div className="flex items-center gap-2 text-dark-400">
                    <span className="font-medium">Location:</span>
                    <span className="text-dark-300">{server.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-dark-400">
                  <span className="font-medium">Status:</span>
                  <span className="text-dark-300 capitalize">{server.status}</span>
                </div>
                {server.version && (
                  <div className="flex items-center gap-2 text-dark-400">
                    <span className="font-medium">Version:</span>
                    <span className="text-dark-300">{server.version}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleSelectServer(server)}
                  disabled={isLoading}
                  className="flex-1 py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Connect
                </button>
                <button
                  onClick={() => handleRemoveServer(server.id)}
                  disabled={isLoading}
                  className="p-2 bg-dark-700 hover:bg-red-600 text-dark-400 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Remove server"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {servers.length === 0 && !showAddForm && (
          <div className="text-center py-16">
            <Server className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Servers Found</h3>
            <p className="text-dark-400 mb-6">
              Add a server to your directory to get started
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="py-2 px-6 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              Add Your First Server
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
