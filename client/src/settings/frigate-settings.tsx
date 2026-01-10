import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    RefreshCw,
    Server,
    ExternalLink,
    Zap,
    CheckCircle2,
    AlertCircle,
    Edit2,
    Video,
    Shield
} from 'lucide-react';
import { getApiClient } from '../shared/api-client';
import { DirectoryServer } from '../shared/types';
import { useResourcesStore } from '../core/store';

interface FrigateSettingsProps {
    onAddServer?: () => void;
    onEditServer?: (server: DirectoryServer) => void;
}

export const FrigateSettings: React.FC<FrigateSettingsProps> = ({ onAddServer, onEditServer }) => {
    const [servers, setServers] = useState<DirectoryServer[]>([]);
    const [loading, setLoading] = useState(true);
    const [testResult, setTestResult] = useState<Record<string, { status: 'success' | 'error' | 'testing', message?: string }>>({});
    const cameras = useResourcesStore((state) => state.cameras);
    const [frigateCameras, setFrigateCameras] = useState<Record<string, string[]>>({}); // serverId -> camNames

    const fetchServers = async () => {
        setLoading(true);
        try {
            const api = getApiClient();
            const allServers = await api.getServers();
            setServers(allServers.filter(s => s.type === 'frigate'));
        } catch (e) {
            console.error('Failed to fetch Frigate servers:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServers();
    }, []);

    const handleDeleteServer = async (id: string) => {
        if (!confirm('¿Seguro que desea eliminar esta integración?')) return;
        try {
            const api = getApiClient();
            await api.deleteServer(id);
            fetchServers();
        } catch (e: any) {
            alert('Error deleting server: ' + e.message);
        }
    };

    const handleTestConnection = async (server: DirectoryServer) => {
        setTestResult(prev => ({ ...prev, [server.id]: { status: 'testing' } }));
        try {
            const api = getApiClient();
            const res = await api.getFrigateVersion(server.id);
            if (res) {
                setTestResult(prev => ({
                    ...prev,
                    [server.id]: { status: 'success', message: `Conectado: v${res}` }
                }));
            }
        } catch (e: any) {
            setTestResult(prev => ({
                ...prev,
                [server.id]: { status: 'error', message: e.message }
            }));
        }
    };

    const handleUpdateMetadata = async (server: DirectoryServer, key: string, value: any) => {
        try {
            const api = getApiClient();
            const newMetadata = { ...server.metadata, [key]: value };
            await api.updateServer(server.id, { metadata: newMetadata });
            fetchServers();
        } catch (e: any) {
            alert('Error updating configuration: ' + e.message);
        }
    };

    const fetchFrigateConfig = async (server: DirectoryServer) => {
        try {
            const api = getApiClient();
            const config = await api.getFrigateConfig(server.id);
            if (config && config.cameras) {
                setFrigateCameras(prev => ({ ...prev, [server.id]: Object.keys(config.cameras) }));
            }
        } catch (e) {
            console.error('Failed to fetch Frigate config:', e);
        }
    };

    useEffect(() => {
        servers.forEach(s => {
            if (s.status === 'online') fetchFrigateConfig(s);
        });
    }, [servers.length]);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-center text-white">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-2xl border border-yellow-500/20">
                        <Zap size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">IA & Analíticas (Frigate)</h2>
                        <p className="text-sm text-dark-400">Detección de objetos, reconocimiento de personas y eventos inteligentes.</p>
                    </div>
                </div>
                <button
                    onClick={onAddServer}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl transition-all text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-primary-600/20"
                >
                    <Plus size={18} />
                    Conectar Frigate
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <RefreshCw className="animate-spin text-primary-500" size={48} />
                    <span className="text-xs font-black text-dark-400 uppercase tracking-widest">Sincronizando con la red...</span>
                </div>
            ) : servers.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-dark-500 border-2 border-dashed border-dark-800 rounded-3xl bg-dark-800/20">
                    <Shield size={64} className="mb-6 opacity-10" />
                    <p className="text-xl font-bold text-dark-300">Sin integraciones de analítica</p>
                    <p className="text-sm text-dark-500 mt-2 max-w-sm text-center">Conecta una instancia de Frigate NVR para recibir eventos de IA y mapear detecciones a tus cámaras.</p>
                    <button
                        onClick={onAddServer}
                        className="mt-8 px-8 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-all font-black text-xs uppercase tracking-widest"
                    >
                        Configurar primer nodo IA
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {servers.map((server) => {
                        const status = testResult[server.id];

                        return (
                            <div key={server.id} className="bg-dark-800 rounded-3xl border border-dark-700 overflow-hidden shadow-2xl relative group">
                                {/* Status Glow */}
                                <div className={`absolute top-0 left-0 w-full h-1 ${server.status === 'online' ? 'bg-green-500' : 'bg-red-500'} opacity-50 shadow-[0_4px_20px_rgba(34,197,94,0.3)]`} />

                                <div className="p-8 border-b border-dark-700 flex justify-between items-center bg-dark-900/30">
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-2xl border ${server.status === 'online' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                            <Server size={28} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-white font-black text-2xl tracking-tight">{server.name}</h3>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${server.status === 'online' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                    }`}>
                                                    {server.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-xs font-mono text-dark-500 flex items-center gap-1.5 bg-dark-950 px-2 py-1 rounded border border-dark-700">
                                                    <ExternalLink size={12} /> {server.url}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleTestConnection(server)}
                                            disabled={status?.status === 'testing'}
                                            className="px-6 py-2.5 bg-dark-700 hover:bg-dark-600 rounded-xl transition-all text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 border border-dark-600 shadow-sm"
                                        >
                                            {status?.status === 'testing' ? 'Verificando...' : 'Test'}
                                        </button>
                                        <div className="h-10 w-[1px] bg-dark-700 mx-2" />
                                        <button
                                            onClick={() => onEditServer?.(server)}
                                            className="p-3 bg-dark-700 text-white rounded-xl hover:bg-primary-600 transition-all border border-dark-600"
                                            title="Editar Configuración"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteServer(server.id)}
                                            className="p-3 bg-dark-700 text-white rounded-xl hover:bg-red-600 transition-all border border-dark-600"
                                            title="Desconectar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 bg-dark-800/40">
                                    {/* Mapeo de Cámaras */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[11px] font-black uppercase text-dark-400 tracking-[0.2em] flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                                                Mapeo de Flujo de Datos
                                            </h4>
                                            <span className="text-[10px] font-bold text-dark-500 bg-dark-900 px-2 py-0.5 rounded border border-dark-700 uppercase">
                                                {(frigateCameras[server.id] || []).length} Detectadas
                                            </span>
                                        </div>

                                        <div className="space-y-3 bg-dark-900/50 p-6 rounded-2xl border border-dark-700/50 max-h-[400px] overflow-y-auto">
                                            {(frigateCameras[server.id] || []).map(fCam => {
                                                const mappedNxId = server.metadata?.camera_map?.[fCam];

                                                return (
                                                    <div key={fCam} className="flex flex-col gap-2 p-4 bg-dark-800 rounded-xl border border-dark-700 hover:border-primary-500/30 transition-all group">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
                                                                <Video size={10} className="text-dark-500" /> {fCam}
                                                            </span>
                                                            {mappedNxId && <CheckCircle2 size={12} className="text-green-500" />}
                                                        </div>
                                                        <select
                                                            className="w-full bg-dark-950 border border-dark-600 rounded-lg py-1.5 px-3 text-[10px] text-white font-bold focus:ring-1 focus:ring-primary-500"
                                                            value={mappedNxId || ''}
                                                            onChange={(e) => {
                                                                const newMap = { ...(server.metadata?.camera_map || {}), [fCam]: e.target.value };
                                                                handleUpdateMetadata(server, 'camera_map', newMap);
                                                            }}
                                                        >
                                                            <option value="">SIN VINCULAR (IGNORAR EVENTOS)</option>
                                                            {cameras.map(nxCam => (
                                                                <option key={nxCam.id} value={nxCam.id}>{nxCam.name.toUpperCase()}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                );
                                            })}

                                            {(frigateCameras[server.id] || []).length === 0 && (
                                                <div className="py-12 flex flex-col items-center justify-center gap-4 text-dark-600 italic">
                                                    <RefreshCw size={32} className="animate-spin opacity-20" />
                                                    <p className="text-xs font-bold uppercase tracking-widest text-center">Consultando topología de Frigate...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Operational Summary */}
                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-black uppercase text-dark-400 tracking-[0.2em] flex items-center gap-3">
                                            Resumen Operacional
                                        </h4>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="p-6 bg-dark-900/50 rounded-2xl border border-dark-700/50 flex flex-col gap-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">Ingesta</span>
                                                        <p className="text-xs font-bold text-white mt-1 uppercase">{server.metadata?.event_ingest || 'MQTT (REVIEWS)'}</p>
                                                    </div>
                                                    <div className="p-2 bg-primary-600/10 rounded-lg text-primary-500">
                                                        <CheckCircle2 size={16} />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">Media Fetching</span>
                                                        <p className="text-xs font-bold text-white mt-1 uppercase">{server.metadata?.media_fetch ? 'ACTIVADO' : 'DESACTIVADO'}</p>
                                                    </div>
                                                    <div className={`p-2 rounded-lg ${server.metadata?.media_fetch ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500'}`}>
                                                        <Shield size={16} />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">Mapeo de Objetos</span>
                                                        <p className="text-xs font-bold text-white mt-1">PERSON, CAR, DOG, CAT...</p>
                                                    </div>
                                                    <div className="p-2 bg-yellow-600/10 rounded-lg text-yellow-500">
                                                        <Zap size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-primary-600/5 border border-primary-500/20 rounded-2xl">
                                                <p className="text-[10px] text-primary-400 font-bold leading-relaxed uppercase tracking-tighter">
                                                    Los eventos de Frigate se normalizan automáticamente a DetectionEventEntity.
                                                    Las capturas se almacenan localmente para garantizar disponibilidad inmediata
                                                    en el historial de eventos de NXvms.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {status && (
                                    <div className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 ${status.status === 'success' ? 'bg-green-500/20 text-green-500' :
                                        status.status === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-dark-700/30 text-dark-400 animate-pulse'
                                        }`}>
                                        {status.status === 'success' ? <CheckCircle2 size={14} /> : status.status === 'error' ? <AlertCircle size={14} /> : <RefreshCw size={14} className="animate-spin" />}
                                        {status.status === 'testing' ? 'Verificando túnel de comunicación...' : status.message}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
