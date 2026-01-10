import React, { useState, useEffect } from 'react';
import {
  Plus,
  RefreshCw,
  Server as ServerIcon,
  Video,
  Database,
  Edit2,
  Trash2,
  Box,
  Zap,
  Info,
  ExternalLink
} from 'lucide-react';
import { useResourcesStore, useServerDirectoryStore } from '../core/store';
import { getApiClient } from '../shared/api-client';
import { Camera, DirectoryServer, RecordingMode } from '../shared/types';
import CameraModal from '../resources/EditCameraModal';
import ServerModal from '../resources/ServerModal';
import { StorageSettings } from './storage-settings.tsx';
import { ROIArchitect } from '../cameras/ROIArchitect';
import { FrigateSettings } from './frigate-settings';

type ConfigTab = 'Overview' | 'Cameras' | 'Servers' | 'Storage' | 'Integrations' | 'Security';

export const SettingsPage: React.FC = () => {
  const { cameras, setCameras, setSites } = useResourcesStore();
  const servers = useServerDirectoryStore((state) => state.servers);
  const [activeTab, setActiveTab] = useState<ConfigTab>('Overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const [selectedServer, setSelectedServer] = useState<DirectoryServer | null>(null);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  const [isROIArchitectOpen, setIsROIArchitectOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const apiClient = getApiClient();

      // Refresh cameras
      const camerasRes = await apiClient.getCameras();
      setCameras(camerasRes || []);

      // Refresh servers
      const serversResponse = await apiClient.getServers();
      useServerDirectoryStore.getState().setServers(serversResponse || []);

      // Refresh resource tree
      const newSites = await apiClient.getResourceTree();
      setSites(newSites || []);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleAddCamera = () => {
    setSelectedCamera(null);
    setIsCameraModalOpen(true);
  };

  const handleEditCamera = (camera: Camera) => {
    setSelectedCamera(camera);
    setIsCameraModalOpen(true);
  };

  const handleAddServer = () => {
    setSelectedServer(null);
    setIsServerModalOpen(true);
  };

  const handleEditServer = (server: DirectoryServer) => {
    setSelectedServer(server);
    setIsServerModalOpen(true);
  };

  const handleDeleteServer = async (id: string) => {
    if (!confirm('¿Seguro que desea eliminar este servidor?')) return;
    try {
      const api = getApiClient();
      await api.deleteServer(id);
      handleRefresh();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Cameras':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-white">
              <h2 className="text-xl font-semibold">Cámaras ({cameras.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg border border-dark-700 transition-colors disabled:opacity-50 text-sm"
                >
                  <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                  Actualizar
                </button>
                <button
                  onClick={handleAddCamera}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors text-white text-sm font-bold shadow-lg shadow-primary-600/20"
                >
                  <Plus size={16} />
                  Agregar Cámara
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-dark-700 shadow-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-dark-800 text-dark-400 font-medium">
                  <tr>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Servidor</th>
                    <th className="px-6 py-4">Modo Grabación</th>
                    <th className="px-6 py-4">URL RTSP</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700 bg-dark-800/50">
                  {cameras.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-dark-500">
                        No hay cámaras configuradas
                      </td>
                    </tr>
                  ) : (
                    cameras.map((cam) => {
                      const server = servers.find(s => s.id === cam.serverId);
                      const isFrigate = server?.type === 'frigate';
                      const serverColor = isFrigate ? 'text-yellow-500' : 'text-primary-400';

                      // Modo de grabación badge
                      let modeBadge = { text: 'N/A', class: 'bg-dark-600/50 text-dark-400 border-dark-600' };
                      if (cam.recordingMode) {
                        switch (cam.recordingMode) {
                          case RecordingMode.ALWAYS:
                            modeBadge = { text: 'Siempre', class: 'bg-red-500/10 text-red-400 border-red-500/20' };
                            break;
                          case RecordingMode.MOTION_ONLY:
                            modeBadge = { text: 'Movimiento', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
                            break;
                          case RecordingMode.MOTION_LOW_RES:
                            modeBadge = { text: 'Mov. LowRes', class: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
                            break;
                          case RecordingMode.OBJECTS:
                            modeBadge = { text: 'Objetos', class: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
                            break;
                          case RecordingMode.DO_NOT_RECORD:
                            modeBadge = { text: 'No grabar', class: 'bg-dark-600/50 text-dark-400 border-dark-600' };
                            break;
                        }
                      }

                      return (
                        <tr key={cam.id} className="text-white hover:bg-dark-700/50 transition-colors">
                          <td className="px-6 py-4 font-medium">{cam.name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${cam.status?.toLowerCase() === 'online'
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                              : cam.status?.toLowerCase() === 'recording'
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                : 'bg-dark-600/50 text-dark-400 border border-dark-600'
                              }`}>
                              {cam.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs flex items-center gap-1 ${serverColor}`}>
                              <ServerIcon size={12} />
                              {server?.name || 'Local'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase ${modeBadge.class}`}>
                              {modeBadge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-dark-400 font-mono text-[10px] truncate max-w-[150px]">{cam.rtspUrl || 'N/A'}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 text-dark-400">
                              <button
                                onClick={() => {
                                  setSelectedCamera(cam);
                                  setIsROIArchitectOpen(true);
                                }}
                                className="p-2 hover:text-primary-400 transition-colors bg-dark-900 rounded-lg border border-dark-700"
                                title="Configurar ROI"
                              >
                                <Box size={16} />
                              </button>
                              <button
                                onClick={() => handleEditCamera(cam)}
                                className="p-2 hover:text-white transition-colors bg-dark-900 rounded-lg border border-dark-700"
                                title="Editar"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('¿Seguro?')) {
                                    getApiClient().deleteCamera(cam.id).then(() => handleRefresh());
                                  }
                                }}
                                className="p-2 hover:text-red-500 transition-colors bg-dark-900 rounded-lg border border-dark-700"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Servers':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-white">
              <h2 className="text-xl font-semibold">Servidores ({servers.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg border border-dark-700 transition-colors disabled:opacity-50 text-sm"
                >
                  <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                  Actualizar
                </button>
                <button
                  onClick={handleAddServer}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors text-white text-sm font-bold shadow-lg shadow-primary-600/20"
                >
                  <Plus size={16} />
                  Agregar Servidor
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servers.length === 0 ? (
                <div className="col-span-full py-12 text-center text-dark-500 border-2 border-dashed border-dark-800 rounded-2xl bg-dark-900/50">
                  <ServerIcon size={48} className="mx-auto mb-4 opacity-10" />
                  No hay servidores configurados
                </div>
              ) : (
                servers.map((server) => (
                  <div key={server.id} className="group p-6 bg-dark-800 rounded-2xl border border-dark-700 hover:border-primary-500/50 transition-all shadow-lg hover:shadow-primary-500/10 relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl border ${server.type === 'frigate' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-primary-600/10 text-primary-500 border-primary-500/20'
                          }`}>
                          <ServerIcon size={20} />
                        </div>
                        <div>
                          <h3 className="text-white font-bold">{server.name}</h3>
                          <p className="text-[10px] text-dark-400 uppercase font-black tracking-widest">{server.type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${server.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                        {server.status}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between bg-dark-900/50 p-2 rounded-lg border border-dark-700/50">
                        <span className="text-dark-400 font-medium">URL</span>
                        <span className="text-white font-mono flex items-center gap-1">
                          {server.url}
                          <ExternalLink size={10} className="text-dark-500" />
                        </span>
                      </div>
                      {server.description && (
                        <div className="p-2 text-dark-400 italic text-[11px]">
                          "{server.description}"
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-dark-700 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditServer(server)}
                        className="p-2 bg-dark-700 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteServer(server.id)}
                        className="p-2 bg-dark-700 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'Storage':
        return <StorageSettings serverId={servers[0]?.id || 'local'} />;

      case 'Integrations':
        return <FrigateSettings onAddServer={handleAddServer} onEditServer={handleEditServer} />;

      case 'Overview':
      default:
        const sections = [
          { title: 'Cameras', icon: Video, count: cameras.length, color: 'text-primary-500', bg: 'bg-primary-500/10', border: 'border-primary-500/20' },
          { title: 'Servers', icon: ServerIcon, count: servers.length, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
          { title: 'Integrations', icon: Zap, count: servers.filter(s => s.type === 'frigate').length, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
          { title: 'Storage', icon: Database, count: 1, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        ];

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sections.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(s.title as ConfigTab)}
                className={`flex flex-col items-start p-6 rounded-2xl border transition-all text-left bg-dark-800 border-dark-700 shadow-lg hover:shadow-primary-500/5 hover:scale-[1.02] group`}
              >
                <div className={`p-4 rounded-2xl ${s.bg} ${s.border} mb-6 transition-transform group-hover:rotate-12`}>
                  <s.icon size={28} className={s.color} />
                </div>
                <div>
                  <h3 className="text-dark-400 font-bold uppercase tracking-widest text-[10px] mb-1">{s.title}</h3>
                  <p className="text-4xl font-black text-white">{s.count}</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-dark-500 uppercase">
                  Configurar <Info size={12} />
                </div>
              </button>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto bg-dark-900/40">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Configuración</h1>
          <p className="text-dark-400 max-w-lg">Control total sobre la arquitectura del sistema. Administra nodos, almacenamiento de red e integraciones de IA.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 bg-dark-800/50 p-1.5 rounded-xl border border-dark-700 w-fit shadow-inner">
        {(['Overview', 'Cameras', 'Servers', 'Storage', 'Integrations', 'Security'] as ConfigTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
              : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {renderContent()}
      </div>

      {isCameraModalOpen && (
        <CameraModal
          isOpen={isCameraModalOpen}
          camera={selectedCamera}
          onClose={() => setIsCameraModalOpen(false)}
          onSuccess={handleRefresh}
        />
      )}

      {isServerModalOpen && (
        <ServerModal
          isOpen={isServerModalOpen}
          server={selectedServer}
          onClose={() => setIsServerModalOpen(false)}
          onSuccess={handleRefresh}
        />
      )}

      {isROIArchitectOpen && selectedCamera && (
        <ROIArchitect
          camera={selectedCamera}
          onClose={() => setIsROIArchitectOpen(false)}
          onSave={async (rois) => {
            try {
              const apiClient = getApiClient();
              await apiClient.saveCameraROIs(selectedCamera.id, rois);
              setIsROIArchitectOpen(false);
              handleRefresh();
            } catch (err: any) {
              alert('Error al guardar ROI: ' + err.message);
            }
          }}
        />
      )}
    </div>
  );
};
