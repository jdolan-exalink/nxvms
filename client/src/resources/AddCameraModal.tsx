import React, { useState, useEffect } from 'react';
import Modal from '../shared/components/Modal';
import { getApiClient } from '../shared/api-client';
import { Globe, Video, Server, Plus, RefreshCw } from 'lucide-react';

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TabType = 'onvif' | 'rtsp' | 'frigate';

const AddCameraModal: React.FC<AddCameraModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<TabType>('onvif');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for different types
  const [name, setName] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  
  // Frigate states
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServerId, setSelectedServerId] = useState('');

  // ONVIF Discovery
  const [discoveredCameras, setDiscoveredCameras] = useState<any[]>([]);

  const apiClient = getApiClient();

  useEffect(() => {
    if (isOpen) {
      loadServers();
      if (activeTab === 'onvif') discoverOnvif();
    }
  }, [isOpen]);

  const loadServers = async () => {
    try {
      const response: any = await apiClient.getServers();
      const serversList = response || [];
      setServers(serversList);
      
      // Auto-set local server for discovery if not set
      if (serversList.length > 0) {
        const localServer = serversList.find((s: any) => s.type === 'nx_vm') || serversList[0];
        if (localServer && activeTab === 'onvif') {
          discoverOnvif(localServer.id);
        }
      }
    } catch (err) {
      console.error('Failed to load servers:', err);
    }
  };

  const discoverOnvif = async (serverId?: string) => {
    const sid = serverId || servers.find(s => s.type === 'nx_vm')?.id || (servers.length > 0 ? servers[0].id : null);
    if (!sid) return;

    setLoading(true);
    try {
      const response = await apiClient.discoverOnvifCameras(sid);
      setDiscoveredCameras(response || []);
    } catch (err: any) {
      setError('Error al descubrir cámaras ONVIF');
    } finally {
      setLoading(false);
    }
  };

  const handleAddServer = async () => {
    const sName = prompt('Nombre del servidor:');
    const sUrl = prompt('URL del servidor (ej: http://192.168.1.50:5000):');
    const sMqtt = prompt('Base Topic MQTT (ej: frigate):', 'frigate');
    if (!sName || !sUrl) return;

    try {
      await apiClient.createServer({ 
        name: sName, 
        url: sUrl, 
        type: 'frigate',
        mqttBaseTopic: sMqtt || 'frigate'
      } as any);
      loadServers();
    } catch (err) {
      alert('Error al agregar servidor');
    }
  };

  const handleConnectOnvif = async (cam: any) => {
    const username = prompt('Usuario ONVIF:', 'admin');
    const password = prompt('Contraseña ONVIF:', '');
    if (username === null || password === null) return;

    const sid = servers.find(s => s.type === 'nx_vm')?.id || (servers.length > 0 ? servers[0].id : null);

    setLoading(true);
    try {
      await apiClient.connectOnvifCamera({
        address: cam.hostname || cam.address,
        username,
        password,
        serverId: sid
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError('Error al conectar con la cámara: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportFrigate = async () => {
    if (!selectedServerId) {
      setError('Por favor, seleccione un servidor Frigate');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiClient.importFrigateCameras(selectedServerId);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Frigate import failed:', err);
      setError(err.message || 'Error al importar de Frigate');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRtsp = async () => {
    if (!name || !rtspUrl) {
      setError('Nombre y URL son requeridos');
      return;
    }
    setLoading(true);
    try {
      await apiClient.createCamera({
        name,
        rtspUrl,
        description: 'Agregada manualmente via RTSP',
        provider: 'generic'
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar Cámara"
      size="lg"
      footer={
        <div className="flex gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-dark-300 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            disabled={loading}
            onClick={activeTab === 'rtsp' ? handleAddRtsp : activeTab === 'frigate' ? handleImportFrigate : undefined}
            className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {activeTab === 'frigate' ? 'Importar Cámaras' : 'Agregar'}
          </button>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex border-b border-dark-700 mb-6">
        <button
          onClick={() => setActiveTab('onvif')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'onvif' ? 'border-primary-500 text-primary-500' : 'border-transparent text-dark-400 hover:text-dark-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          ONVIF
        </button>
        <button
          onClick={() => setActiveTab('rtsp')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'rtsp' ? 'border-primary-500 text-primary-500' : 'border-transparent text-dark-400 hover:text-dark-200'
          }`}
        >
          <Video className="w-4 h-4" />
          RTSP
        </button>
        <button
          onClick={() => setActiveTab('frigate')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'frigate' ? 'border-primary-500 text-primary-500' : 'border-transparent text-dark-400 hover:text-dark-200'
          }`}
        >
          <Server className="w-4 h-4" />
          Frigate
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'rtsp' && (
          <>
            <div>
              <label className="block text-xs font-medium text-dark-400 uppercase mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Entrada Principal"
                className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 uppercase mb-1">RTSP URL</label>
              <input
                type="text"
                value={rtspUrl}
                onChange={(e) => setRtspUrl(e.target.value)}
                placeholder="rtsp://usuario:pass@ip:554/pstream"
                className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </>
        )}

        {activeTab === 'onvif' && (
          <div className="min-h-[200px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <RefreshCw className="w-10 h-10 text-primary-500 animate-spin mb-4" />
                <p className="text-dark-400 animate-pulse">Buscando cámaras en la red...</p>
              </div>
            ) : discoveredCameras.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-dark-500">No se encontraron cámaras ONVIF.</p>
                <button onClick={() => discoverOnvif()} className="mt-4 text-sm text-primary-500 hover:underline">Reintentar</button>
              </div>
            ) : (
              <div className="divide-y divide-dark-700">
                {discoveredCameras.map((cam, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{cam.name || 'Cámara Desconocida'}</p>
                      <p className="text-xs text-dark-400">{cam.hostname || cam.address}</p>
                    </div>
                    <button 
                      onClick={() => handleConnectOnvif(cam)}
                      className="px-3 py-1 bg-dark-700 hover:bg-dark-600 text-xs text-white rounded transition-colors"
                    >
                      Conectar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'frigate' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-dark-400 uppercase">Servidor Frigate</label>
                <button onClick={handleAddServer} className="text-[10px] text-primary-500 hover:underline flex items-center gap-1">
                  <Plus className="w-2 h-2" /> Agregar Servidor
                </button>
              </div>
              <select
                value={selectedServerId}
                onChange={(e) => setSelectedServerId(e.target.value)}
                className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Seleccione un servidor</option>
                {servers.filter(s => s.type === 'frigate').map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.url})</option>
                ))}
              </select>
            </div>
            
            {servers.length === 0 && (
              <p className="text-xs text-dark-500 italic">
                Para importar cámaras de Frigate, primero debe agregar la URL del servidor.
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddCameraModal;
