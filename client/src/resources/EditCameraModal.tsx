import React, { useState, useEffect } from 'react';
import Modal from '../shared/components/Modal';
import { getApiClient } from '../shared/api-client';
import { Camera } from '../shared/types';
import { RefreshCw, Video, Info, Settings, Trash2 } from 'lucide-react';

interface EditCameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    camera: Camera | null;
}

const EditCameraModal: React.FC<EditCameraModalProps> = ({ isOpen, onClose, onSuccess, camera }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [rtspUrl, setRtspUrl] = useState('');
    const [provider, setProvider] = useState('');

    useEffect(() => {
        if (isOpen && camera) {
            setName(camera.name || '');
            setDescription(camera.description || '');
            setRtspUrl(camera.rtspUrl || '');
            setProvider(camera.provider || 'generic');
            setError(null);
        }
    }, [isOpen, camera]);

    const handleUpdate = async () => {
        if (!camera) return;
        if (!name) {
            setError('El nombre es requerido');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const apiClient = getApiClient();
            await apiClient.updateCamera(camera.id, {
                name,
                description,
                rtspUrl,
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al actualizar la cámara');
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Cámara"
            size="lg"
            footer={
                <div className="flex justify-between w-full">
                    <button
                        disabled={loading}
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Eliminar Cámara
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-dark-300 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={loading}
                            onClick={handleUpdate}
                            className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                            Guardar Cambios
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
                {/* Info Header */}
                <div className="flex items-center gap-4 p-4 bg-dark-900 rounded-xl border border-dark-700">
                    <div className="p-3 bg-primary-600/10 text-primary-500 rounded-lg">
                        <Video className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-white font-semibold">{camera?.name}</h4>
                        <p className="text-xs text-dark-400">ID: {camera?.id}</p>
                    </div>
                    <div className="ml-auto">
                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${camera?.status?.toLowerCase() === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                            {camera?.status}
                        </span>
                    </div>
                </div>

                {/* Basic Settings */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-dark-300 mb-1">
                        <Info className="w-4 h-4" />
                        <span className="text-sm font-medium">Información General</span>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-dark-400 uppercase mb-1">Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-dark-400 uppercase mb-1">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                    </div>
                </div>

                {/* Connection Settings */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-dark-300 mb-1">
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">Configuración de Conexión</span>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-dark-400 uppercase mb-1">Proveedor</label>
                        <input
                            type="text"
                            value={provider}
                            disabled
                            className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-dark-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-dark-400 uppercase mb-1">RTSP URL</label>
                        <input
                            type="text"
                            value={rtspUrl}
                            onChange={(e) => setRtspUrl(e.target.value)}
                            className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <p className="mt-1 text-[10px] text-dark-500">
                            * Nota: El cambio de URL puede requerir un reinicio del flujo.
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default EditCameraModal;
