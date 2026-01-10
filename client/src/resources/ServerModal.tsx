import React, { useState, useEffect } from 'react';
import Modal from '../shared/components/Modal';
import { getApiClient } from '../shared/api-client';
import { DirectoryServer } from '../shared/types';
import { RefreshCw, Server, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface ServerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    server?: DirectoryServer | null;
    initialType?: 'recording_node' | 'frigate' | 'onvif';
}

const ServerModal: React.FC<ServerModalProps> = ({ isOpen, onClose, onSuccess, server, initialType }) => {
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ status: 'success' | 'error' | null, message: string }>({ status: null, message: '' });
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [type, setType] = useState<'recording_node' | 'frigate' | 'onvif'>(initialType || 'recording_node');
    const [description, setDescription] = useState('');

    // Frigate specific
    const [authMode, setAuthMode] = useState<'none' | 'user_pass'>('none');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mqttBaseTopic, setMqttBaseTopic] = useState('frigate');
    const [eventIngest, setEventIngest] = useState('mqtt(reviews)');
    const [mediaFetch, setMediaFetch] = useState(true);

    useEffect(() => {
        if (isOpen) {
            if (server) {
                setName(server.name || '');
                setUrl(server.url || '');
                // Cast because of possible legacy types
                const serverType = (server.type === ('nx_vm' as any) ? 'recording_node' : server.type) as any;
                setType(serverType || 'recording_node');
                setDescription(server.description || '');
                setMqttBaseTopic(server.mqttBaseTopic || 'frigate');

                if (server.metadata) {
                    setAuthMode(server.metadata.auth?.mode || 'none');
                    setUsername(server.metadata.auth?.username || '');
                    setPassword(server.metadata.auth?.password || '');
                    setEventIngest(server.metadata.event_ingest || 'mqtt(reviews)');
                    setMediaFetch(server.metadata.media_fetch !== false);
                }
            } else {
                setName('');
                setUrl('');
                setType(initialType || 'recording_node');
                setDescription('');
                setAuthMode('none');
                setUsername('');
                setPassword('');
                setMqttBaseTopic('frigate');
                setEventIngest('mqtt(reviews)');
                setMediaFetch(true);
            }
            setTestResult({ status: null, message: '' });
            setError(null);
        }
    }, [isOpen, server, initialType]);

    const handleTest = async () => {
        if (!url) {
            setError('La URL es requerida para probar la conexión');
            return;
        }
        setTesting(true);
        setTestResult({ status: null, message: '' });
        try {
            const api = getApiClient();
            let success = false;
            let message = '';

            if (type === 'frigate' && server?.id) {
                const version = await api.getFrigateVersion(server.id);
                success = !!version;
                message = success ? `Conectado a Frigate v${version}` : 'Error al obtener versión';
            } else {
                const res = await api.testServerUrl(url);
                success = res.success;
                message = res.message;
            }

            setTestResult({
                status: success ? 'success' : 'error',
                message
            });
        } catch (err: any) {
            setTestResult({
                status: 'error',
                message: err.message || 'Error de conexión'
            });
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async () => {
        if (!name || !url) {
            setError('Nombre y URL son requeridos');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const api = getApiClient();
            const payload: any = {
                name,
                url,
                type,
                description,
                mqttBaseTopic,
                metadata: {
                    auth: { mode: authMode, username, password },
                    event_ingest: eventIngest,
                    media_fetch: mediaFetch,
                    camera_map: server?.metadata?.camera_map || {}
                }
            };

            if (server) {
                await api.updateServer(server.id, payload);
            } else {
                await api.createServer(payload);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al guardar el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={server ? 'Editar Servidor' : 'Agregar Servidor'}
            size="lg"
            footer={
                <div className="flex justify-between w-full">
                    <button
                        onClick={handleTest}
                        disabled={testing || !url}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Probar Conexión
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
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                            {server ? 'Guardar Cambios' : 'Agregar Servidor'}
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {testResult.status && (
                    <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${testResult.status === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'
                        }`}>
                        {testResult.status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {testResult.message}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-dark-400 uppercase mb-1.5">Nombre del Servidor</label>
                        <div className="relative">
                            <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ej: Servidor Principal, Frigate NVR"
                                className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-dark-400 uppercase mb-1.5">URL del Servidor</label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="ej: http://192.168.1.50:5000"
                            className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-dark-400 uppercase mb-1.5">Tipo de Servidor</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                            <option value="recording_node">Nodo de Grabación (NXvms)</option>
                            <option value="frigate">Frigate NVR Integration</option>
                            <option value="onvif">ONVIF Network Device</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-dark-400 uppercase mb-1.5">Descripción</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Opcional"
                            className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                    </div>
                </div>

                {type === 'frigate' && (
                    <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700 space-y-4">
                        <div className="flex items-center gap-2 text-primary-400">
                            <Zap size={18} />
                            <h4 className="text-sm font-bold uppercase tracking-wider">Configuración Frigate</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-medium text-dark-400 uppercase mb-1.5">Autenticación</label>
                                <select
                                    value={authMode}
                                    onChange={(e) => setAuthMode(e.target.value as any)}
                                    className="w-full px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg text-xs text-white"
                                >
                                    <option value="none">Sin Autenticación</option>
                                    <option value="user_pass">Usuario/Contraseña (JWT)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-medium text-dark-400 uppercase mb-1.5">MQTT Base Topic</label>
                                <input
                                    type="text"
                                    value={mqttBaseTopic}
                                    onChange={(e) => setMqttBaseTopic(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg text-xs text-white"
                                />
                            </div>

                            {authMode === 'user_pass' && (
                                <>
                                    <div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Usuario"
                                            className="w-full px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg text-xs text-white"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Contraseña"
                                            className="w-full px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg text-xs text-white"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-[10px] font-medium text-dark-400 uppercase mb-1.5">Ingesta de Eventos</label>
                                <select
                                    value={eventIngest}
                                    onChange={(e) => setEventIngest(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg text-xs text-white"
                                >
                                    <option value="mqtt(reviews)">MQTT (Reviews - Recomendado)</option>
                                    <option value="mqtt(events)">MQTT (Events)</option>
                                    <option value="http-poll">HTTP Polling</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg">
                                <span className="text-[10px] font-medium text-dark-400 uppercase">Media Fetching</span>
                                <input
                                    type="checkbox"
                                    checked={mediaFetch}
                                    onChange={(e) => setMediaFetch(e.target.checked)}
                                    className="accent-primary-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ServerModal;
