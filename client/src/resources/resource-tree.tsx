// ============================================================================
// RESOURCE TREE
// Hierarchical tree view for sites, servers, cameras, and groups
// ============================================================================

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Video,
  Server,
  MapPin,
  Folder,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Circle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useResourcesStore } from '../core/store';
import { Site, Server as ServerType, Camera, CameraStatus } from '../shared/types';
import { STATUS_COLORS } from '../shared/constants';
import { getApiClient } from '../shared/api-client';
import AddCameraModal from './AddCameraModal';

interface ResourceTreeProps {
  onCameraSelect?: (camera: Camera) => void;
  selectedCameraId?: string | null;
}

interface TreeNodeProps {
  node: Site | ServerType | Camera;
  level: number;
  onCameraSelect?: (camera: Camera) => void;
  selectedCameraId?: string | null;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, onCameraSelect, selectedCameraId }) => {
  const expandedNodes = useResourcesStore((state) => state.expandedNodes);
  const toggleNode = useResourcesStore((state) => state.toggleNode);
  const selectCamera = useResourcesStore((state) => state.selectCamera);

  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedCameraId === node.id;

  const handleToggle = () => {
    toggleNode(node.id);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.__typename === 'Camera' && onCameraSelect) {
      onCameraSelect(node as Camera);
      selectCamera(node.id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (node.__typename === 'Camera') {
      e.dataTransfer.setData('text/plain', node.id);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const getIcon = () => {
    switch (node.__typename) {
      case 'Site':
        return <MapPin className="w-4 h-4 text-primary-400" />;
      case 'Server':
        return <Server className="w-4 h-4 text-primary-400" />;
      case 'Camera':
        return <Video className="w-4 h-4 text-primary-400" />;
      default:
        return <Folder className="w-4 h-4 text-primary-400" />;
    }
  };

  const getStatusIndicator = () => {
    if (node.__typename === 'Camera') {
      const camera = node as Camera;
      const status = String(camera.status || 'offline').toLowerCase();
      
      switch (status) {
        case 'online':
        case 'active':
          return <CheckCircle2 className="w-3 h-3 text-status-online" />;
        case 'recording':
          return <Circle className="w-3 h-3 text-status-recording animate-pulse" fill="currentColor" />;
        case 'offline':
        case 'disconnected':
        case 'inactive':
          return <XCircle className="w-3 h-3 text-status-offline" />;
        case 'error':
          return <XCircle className="w-3 h-3 text-status-offline" />;
        default:
          return <Circle className="w-3 h-3 text-dark-500" />;
      }
    }
    return null;
  };

  const hasChildren = node.__typename !== 'Camera';
  const paddingLeft = level * 16;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer transition-colors group ${
          isSelected ? 'bg-primary-600/20' : 'hover:bg-dark-700'
        }`}
        style={{ paddingLeft: `${paddingLeft + 8}px` }}
        onClick={hasChildren ? handleToggle : handleSelect}
        draggable={node.__typename === 'Camera'}
        onDragStart={node.__typename === 'Camera' ? handleDragStart : undefined}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className="p-1 hover:bg-dark-600 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-dark-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-dark-400" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}
        {getIcon()}
        <span className="flex-1 text-sm text-white truncate">{node.name}</span>
        {getStatusIndicator()}
        <button className="p-1 hover:bg-dark-600 rounded transition-colors opacity-0 group-hover:opacity-100">
          <MoreVertical className="w-4 h-4 text-dark-400" />
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.__typename === 'Site' && (
            <>
              {/* Show servers */}
              {(node as Site).servers.map((server) => (
                <TreeNode
                  key={server.id}
                  node={{ ...server, __typename: 'Server' }}
                  level={level + 1}
                  onCameraSelect={onCameraSelect}
                  selectedCameraId={selectedCameraId}
                />
              ))}
              {/* Show groups */}
              {(node as Site).groups.map((group) => (
                <TreeNode
                  key={group.id}
                  node={{ ...group, __typename: 'Group' }}
                  level={level + 1}
                  onCameraSelect={onCameraSelect}
                  selectedCameraId={selectedCameraId}
                />
              ))}
            </>
          )}
          {node.__typename === 'Server' && (
            <>
              {/* Show cameras */}
              {(node as ServerType).cameras.map((camera) => (
                <TreeNode
                  key={camera.id}
                  node={{ ...camera, __typename: 'Camera' }}
                  level={level + 1}
                  onCameraSelect={onCameraSelect}
                  selectedCameraId={selectedCameraId}
                />
              ))}
            </>
          )}
          {node.__typename === 'Group' && (
            <>
              {/* Show cameras in group */}
              {(node as any).resourceIds?.map((cameraId: string) => {
                const camera = useResourcesStore.getState().getCameraById(cameraId);
                if (!camera) return null;
                return (
                  <TreeNode
                    key={cameraId}
                    node={{ ...camera, __typename: 'Camera' }}
                    level={level + 1}
                    onCameraSelect={onCameraSelect}
                    selectedCameraId={selectedCameraId}
                  />
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const ResourceTree: React.FC<ResourceTreeProps> = ({
  onCameraSelect,
  selectedCameraId,
}) => {
  const sites = useResourcesStore((state) => state.sites);
  const setSites = useResourcesStore((state) => state.setSites);
  const setCameras = useResourcesStore((state) => state.setCameras);
  const [filter, setFilter] = useState('');
  const [showOffline, setShowOffline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const apiClient = getApiClient();
      const newSites = await apiClient.getResourceTree();
      setSites(newSites);
      const allCameras = newSites.flatMap(site => 
        site.servers.flatMap(server => server.cameras)
      );
      setCameras(allCameras);
    } catch (err) {
      console.error('[ResourceTree] Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddCamera = () => {
    setIsAddModalOpen(true);
  };

  const filteredSites = sites.map(site => ({
    ...site,
    servers: site.servers.map(server => ({
      ...server,
      cameras: server.cameras.filter(camera => {
        const matchesSearch = camera.name.toLowerCase().includes(filter.toLowerCase());
        const status = String(camera.status || 'offline').toLowerCase();
        const matchesStatus = showOffline || (status !== 'offline' && status !== 'inactive');
        return matchesSearch && matchesStatus;
      })
    })).filter(server => server.cameras.length > 0 || filter === '' || server.cameras.length === 0)
  }));

  return (
    <div className="h-full flex flex-col bg-dark-900 border-r border-dark-700">
      <div className="p-4 border-b border-dark-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-dark-500 uppercase tracking-wider">Recursos</h2>
          <div className="flex gap-1">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700 rounded-md transition-colors disabled:opacity-50"
              title="Actualizar"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleAddCamera}
              className="p-1.5 text-primary-500 hover:text-primary-400 hover:bg-primary-500/10 rounded-md transition-colors"
              title="Agregar Cámara"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Buscar cámaras..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showOffline}
                onChange={(e) => setShowOffline(e.target.checked)}
                className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-600 focus:ring-primary-500"
              />
              Mostrar offline
            </label>
          </div>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto">
        {filteredSites.length === 0 ? (
          <div className="p-8 text-center">
            <Folder className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-sm text-dark-400">No resources found</p>
          </div>
        ) : (
          filteredSites.map((site) => (
            <TreeNode
              key={site.id}
              node={{ ...site, __typename: 'Site' }}
              level={0}
              onCameraSelect={onCameraSelect}
              selectedCameraId={selectedCameraId}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700">
        <div className="text-xs text-dark-500">
          {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''}
        </div>
      </div>

      <AddCameraModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={handleRefresh} 
      />
    </div>
  );
};
