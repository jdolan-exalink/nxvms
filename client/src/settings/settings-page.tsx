// ============================================================================
// SETTINGS PAGE
// Application and system configuration
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Shield, Database, Globe, Video, Server, Plus, RefreshCw, Trash2, Edit2 } from 'lucide-react';
import { useResourcesStore } from '../core/store';
import { getApiClient } from '../shared/api-client';

import { Camera, DirectoryServer } from '../shared/types';
import EditCameraModal from '../resources/EditCameraModal';

export const SettingsPage: React.FC = () => {
  const { cameras, setCameras, setSites } = useResourcesStore();
  const [servers, setServers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleEditCamera = (camera: Camera) => {
    setSelectedCamera(camera);
    setIsEditModalOpen(true);
  };

  const handleDeleteCamera = async (id: string) => {
    // We already moved delete to the modal, but keeping this as a helper if needed or just for standard list
    if (!confirm('¿Estás seguro de que quieres eliminar esta cámara?')) return;
    try {
      const apiClient = getApiClient();
      await apiClient.deleteCamera(id);
      handleRefresh();
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const sections = [
    { title: 'Overview', icon: Globe, desc: 'Estado general del sistema' },
    { title: 'Cameras', icon: Video, desc: 'Gestionar cámaras y dispositivos' },
    { title: 'Servers', icon: Server, desc: 'Nodos de grabación y Frigate' },
    { title: 'Storage', icon: Database, desc: 'Rutas de grabación y retención' },
    { title: 'Security', icon: Shield, desc: 'Usuarios y control de acceso' },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const apiClient = getApiClient();

      // Refresh servers
      const serversResponse = await apiClient.getServers();
      setServers(serversResponse || []);

      // Refresh resource tree
      const newSites = await apiClient.getResourceTree();
      setSites(newSites);
      const allCameras = newSites.flatMap(site =>
        site.servers.flatMap(server => server.cameras)
      );
      setCameras(allCameras);
    } catch (err) {
      console.error('[Settings] Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteServer = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servidor? (Se desvincularán sus cámaras)')) return;
    try {
      const apiClient = getApiClient();
      await apiClient.deleteServer(id);
      handleRefresh();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleAddServer = async () => {
    const name = prompt('Nombre del servidor (ej: Frigate Garage):');
    if (!name) return;
    const url = prompt('URL del servidor:', 'http://192.168.1.10:5000');
    if (!url) return;
    const type = prompt('Tipo (frigate/nx_vm):', 'frigate');
    if (!type) {
      alert('Tipo inválido. Use frigate o nx_vm');
      return;
    }

    try {
      const apiClient = getApiClient();
      await apiClient.createServer({
        name,
        url,
        type: type as any,
        mqttBaseTopic: type === 'frigate' ? 'frigate' : undefined
      });
      handleRefresh();
      alert('Servidor guardado correctamente');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleEditServer = async (server: DirectoryServer) => {
    const name = prompt('Nombre del servidor:', server.name);
    if (!name) return;
    const url = prompt('URL del servidor:', server.url);
    if (!url) return;
    const mqtt = prompt('MQTT Base Topic:', server.mqttBaseTopic || 'frigate');

    try {
      const apiClient = getApiClient();
      await apiClient.updateServer(server.id, {
        name,
        url,
        mqttBaseTopic: mqtt || undefined
      });
      handleRefresh();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleTestServer = async (id: string) => {
    try {
      const apiClient = getApiClient();
      const result = await apiClient.testServerConnection(id);
      alert(result.message);
    } catch (err: any) {
      alert('Error de test: ' + err.message);
    }
  };

  const handleAddCamera = async () => {
    const name = prompt('Nombre de la cámara:');
    if (!name) return;
    const rtspUrl = prompt('URL RTSP:', 'rtsp://admin:admin123@192.168.1.100:554/stream1');
    if (!rtspUrl) return;

    try {
      const apiClient = getApiClient();
      await apiClient.createCamera({
        name,
        description: 'Agregada desde Configuración',
        rtspUrl,
      });
      handleRefresh();
      alert('Cámara guardada correctamente');
    } catch (err: any) {
      alert('Error: ' + err.message);
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
                  className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg border border-dark-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                  Actualizar
                </button>
                <button
                  onClick={handleAddCamera}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  Agregar Cámara
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-dark-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-dark-800 text-dark-400 font-medium">
                  <tr>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">URL RTSP</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700 bg-dark-800/50">
                  {cameras.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-dark-500">
                        No hay cámaras configuradas
                      </td>
                    </tr>
                  ) : (
                    cameras.map((cam) => (
                      <tr key={cam.id} className="text-white hover:bg-dark-700/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{cam.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${cam.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                            {cam.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-dark-400 font-mono text-xs truncate max-w-[200px]">{cam.rtspUrl || 'N/A'}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditCamera(cam)}
                              className="p-2 text-dark-400 hover:text-white transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCamera(cam.id)}
                              className="p-2 text-dark-400 hover:text-red-500 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
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
                  className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg border border-dark-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                  Actualizar
                </button>
                <button
                  onClick={handleAddServer}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  Agregar Servidor
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {servers.length === 0 ? (
                <div className="col-span-full py-12 text-center text-dark-500 border-2 border-dashed border-dark-800 rounded-xl">
                  No hay servidores configurados
                </div>
              ) : (
                servers.map((server) => (
                  <div key={server.id} className="p-6 bg-dark-800 rounded-xl border border-dark-700 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-600/10 text-primary-500 rounded-lg">
                          <Server size={20} />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{server.name}</h3>
                          <p className="text-xs text-dark-400 uppercase tracking-wider">{server.type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${server.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                        {server.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-dark-400">URL</span>
                        <span className="text-white font-mono text-xs">{server.url}</span>
                      </div>
                      {server.mqttBaseTopic && (
                        <div className="flex justify-between">
                          <span className="text-dark-400">MQTT Topic</span>
                          <span className="text-white">{server.mqttBaseTopic}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex justify-end gap-2 border-t border-dark-700">
                      <button
                        onClick={() => handleTestServer(server.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-md transition-colors"
                      >
                        <RefreshCw size={14} />
                        Probar
                      </button>
                      <button
                        onClick={() => handleEditServer(server)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-dark-300 hover:text-white hover:bg-dark-700 rounded-md transition-colors"
                      >
                        <Edit2 size={14} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteServer(server.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(s.title)}
                className={`flex items-start gap-4 p-6 rounded-xl border transition-all group text-left ${activeTab === s.title
                  ? 'bg-primary-600/10 border-primary-500'
                  : 'bg-dark-800 border-dark-700 hover:border-primary-500/50 hover:bg-dark-700/50'
                  }`}
              >
                <div className={`p-3 rounded-lg transition-colors ${activeTab === s.title ? 'bg-primary-600 text-white' : 'bg-dark-900 text-primary-500 group-hover:bg-primary-600 group-hover:text-white'
                  }`}>
                  <s.icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{s.title}</h3>
                  <p className="text-sm text-dark-400">{s.desc}</p>
                </div>
              </button>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-900 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full p-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
            <p className="text-dark-400">Administra tu sistema de videovigilancia NXvms</p>
          </div>
          {activeTab !== 'Overview' && (
            <button
              onClick={() => setActiveTab('Overview')}
              className="text-primary-500 hover:text-primary-400 font-medium text-sm"
            >
              Volver al Inicio
            </button>
          )}
        </div>

        {renderContent()}

        <div className="mt-12 flex justify-between items-center p-6 bg-dark-800/50 rounded-xl border border-dark-700">
          <div>
            <h4 className="text-white font-medium">Sobre NXvms</h4>
            <p className="text-sm text-dark-400">Versión 0.1.3 (Alpha) - Backend: http://localhost:3000</p>
          </div>
          <button className="text-primary-500 hover:text-primary-400 text-sm font-medium">
            Buscar actualizaciones
          </button>
        </div>
      </div>
      <EditCameraModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        camera={selectedCamera}
        onSuccess={handleRefresh}
      />
    </div>
  );
};
