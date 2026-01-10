import React, { useState, useEffect } from 'react';
import Modal from '../shared/components/Modal';
import { getApiClient } from '../shared/api-client';
import { Camera } from '../shared/types';
import { RefreshCw, Video, Info, Settings, Trash2, Globe, Link, Activity, Disc, Box, ZapOff, Footprints } from 'lucide-react';

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    camera?: Camera | null;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onSuccess, camera }) => {
    // ... (rest of code inside component until modes definition)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [rtspUrl, setRtspUrl] = useState('');
    const [serverId, setServerId] = useState('local');
    const [recordingMode, setRecordingMode] = useState<string>('do_not_record');
    const [servers, setServers] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            const fetchServers = async () => {
                try {
                    const api = getApiClient();
                    const res = await api.getServers();
                    setServers(res || []);
                } catch (e) { }
            };
            fetchServers();

            if (camera) {
                setName(camera.name || '');
                setDescription(camera.description || '');
                setRtspUrl(camera.rtspUrl || '');
                setServerId(camera.serverId || 'local');
                setRecordingMode(camera.recordingMode || 'do_not_record');
                setError(null);
            } else {
                setName('');
                setDescription('');
                setRtspUrl('');
                setServerId('local');
                setRecordingMode('do_not_record');
                setError(null);
            }
        }
    }, [isOpen, camera]);

    const handleSave = async () => {
        if (!name) {
            setError('El nombre es requerido');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const apiClient = getApiClient();
            const payload = {
                name,
                description,
                rtspUrl,
                serverId,
                recordingMode
            };

            if (camera) {
                await apiClient.updateCamera(camera.id, payload);
            } else {
                await apiClient.createCamera(payload);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al guardar la cámara');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!camera) return;
        if (!confirm(`¿Estás seguro de que quieres eliminar la cámara "${camera.name}"? Esta acción no se puede deshacer.`)) return;

        setLoading(true);
        try {
            const apiClient = getApiClient();
            await apiClient.deleteCamera(camera.id);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al eliminar la cámara');
        } finally {
            setLoading(false);
        }
    };

    const modes = [
        { id: 'do_not_record', label: 'Sin Grabación', icon: ZapOff, desc: 'Solo visualización en vivo' },
        { id: 'always', label: 'Grabación 24/7', icon: Disc, desc: 'Grabación continua, consume más disco' },
        { id: 'motion_only', label: 'Por Movimiento', icon: Footprints, desc: 'Graba solo cuando detecta movimiento' },
        { id: 'objects', label: 'Objetos', icon: Box, desc: 'Graba solo Personas/Vehículos' },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={camera ? 'Editar Cámara' : 'Agregar Cámara'}
            size="lg"
            footer={
                <div className="flex justify-between w-full">
                    {camera ? (
                        <button
                            disabled={loading}
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                        </button>
                    ) : <div />}
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-dark-300 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={loading}
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                            {camera ? 'Guardar Cambios' : 'Agregar Cámara'}
                        </button>
                    </div>
                </div>
            }
        >
            {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-dark-300 mb-1">
                        <Info className="w-4 h-4" />
                        <span className="text-sm font-medium">Información General</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-dark-400 uppercase mb-1">Nombre</label>
                            <div className="relative">
                                <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="ej: Entrada Principal"
                                    className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-dark-400 uppercase mb-1">Descripción</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-t border-dark-700 pt-6">
                    <div className="flex items-center gap-2 text-dark-300 mb-1">
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">Configuración de Conexión</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-dark-400 uppercase mb-1">Servidor Asignado</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
                                <select
                                    value={serverId}
                                    onChange={(e) => setServerId(e.target.value)}
                                    // Disable server change for Frigate cameras as they are bound to the Frigate server
                                    disabled={camera?.provider === 'frigate'}
                                    className={`w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500 ${camera?.provider === 'frigate' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <option value="local">Local Node (Auto)</option>
                                    {servers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {camera?.provider === 'frigate' ? (
                            <div className="col-span-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Info className="w-4 h-4 text-yellow-500" />
                                    <span className="text-xs font-bold text-yellow-500 uppercase">Integración Frigate Detectada</span>
                                </div>
                                <div className="text-xs text-dark-300">
                                    Esta cámara es gestionada automáticamente por el servidor Frigate <strong>{servers.find(s => s.id === serverId)?.name}</strong>.
                                    La URL RTSP y la gestión de streams son manejadas por la integración.
                                </div>
                            </div>
                        ) : (
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-dark-400 uppercase mb-1">RTSP URL</label>
                                <div className="relative">
                                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
                                    <input
                                        type="text"
                                        value={rtspUrl}
                                        onChange={(e) => setRtspUrl(e.target.value)}
                                        placeholder="rtsp://usuario:pass@ip:puerto/stream"
                                        className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4 border-t border-dark-700 pt-6">
                    <div className="flex items-center gap-2 text-dark-300 mb-1">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm font-medium">Modo de Grabación</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {modes.map((mode) => {
                            const Icon = mode.icon;
                            const isSelected = recordingMode === mode.id;
                            return (
                                <div
                                    key={mode.id}
                                    onClick={() => setRecordingMode(mode.id)}
                                    className={`relative cursor-pointer p-4 rounded-xl border transition-all ${isSelected
                                        ? 'bg-primary-600/10 border-primary-500 ring-1 ring-primary-500'
                                        : 'bg-dark-800 border-dark-700 hover:border-dark-600'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-400'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-dark-200'}`}>
                                                {mode.label}
                                            </div>
                                            <div className="text-xs text-dark-400 mt-1 leading-snug">
                                                {mode.desc}
                                            </div>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(var(--primary-500),0.5)]" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CameraModal;
