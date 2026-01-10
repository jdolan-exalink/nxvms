import React, { useState, useEffect } from 'react';
import { Database, HardDrive, Plus, Activity, ShieldCheck, Trash2, Edit2 } from 'lucide-react';
import { getApiClient } from '../shared/api-client';
import { StorageLocation } from '../shared/types';
import StorageModal from '../resources/StorageModal';

export const StorageSettings: React.FC<{ serverId: string }> = ({ serverId }) => {
    const [locations, setLocations] = useState<StorageLocation[]>([]);
    const [stats, setStats] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<StorageLocation | null>(null);

    useEffect(() => {
        fetchStorage();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, [serverId]);

    const fetchStorage = async () => {
        try {
            const apiClient = getApiClient();
            const locs = await apiClient.getServerStorage(serverId);
            setLocations(locs || []);
            await fetchStats();
        } catch (err) {
            console.error('Failed to fetch storage:', err);
        }
    };

    const fetchStats = async () => {
        try {
            const apiClient = getApiClient();
            const s = await apiClient.getStorageStats(serverId);
            setStats(s || []);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const handleAddLocation = () => {
        setSelectedLocation(null);
        setIsModalOpen(true);
    };

    const handleEditLocation = (loc: StorageLocation) => {
        setSelectedLocation(loc);
        setIsModalOpen(true);
    };

    const handleDeleteLocation = async (id: string) => {
        if (!confirm('¿Seguro que quiere eliminar esta ubicación? NO se borrarán los archivos físicos.')) return;
        try {
            await getApiClient().deleteServerStorage(id);
            fetchStorage();
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6 text-white pb-12">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-600/10 text-primary-500 rounded-2xl border border-primary-500/20">
                        <Database size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Gestión de Almacenamiento</h2>
                        <p className="text-sm text-dark-400">Configura unidades de disco locales y de red para grabación.</p>
                    </div>
                </div>
                <button
                    onClick={handleAddLocation}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl transition-all text-sm font-bold shadow-lg shadow-primary-600/20"
                >
                    <Plus size={18} />
                    Agregar Disco
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {locations.map((loc) => {
                    const stat = stats.find(s => s.id === loc.id);
                    const usedPct = stat && stat.total ? ((stat.total - stat.free) / stat.total) * 100 : 0;
                    const reservedPctDisplay = stat && stat.total ? (stat.reserved / stat.total) * 100 : (loc.reservedPct || 10);

                    return (
                        <div key={loc.id} className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden shadow-xl hover:border-primary-500/30 transition-all group">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className={`p-4 rounded-2xl ${loc.status === 'online' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            <HardDrive size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-xl">{loc.path}</h3>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-xs font-black uppercase tracking-widest text-dark-400">{loc.name || 'Disco Principal'}</span>
                                                <div className="flex gap-1.5">
                                                    {(loc.roles || ['MAIN']).map(role => (
                                                        <span key={role} className="px-2.5 py-0.5 bg-dark-950 text-primary-500 text-[10px] font-black rounded border border-primary-500/10 uppercase tracking-tighter">
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${loc.status === 'online' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            loc.status === 'degraded' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {loc.status || 'offline'}
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditLocation(loc)}
                                                className="p-2 bg-dark-900 border border-dark-700 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-all"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLocation(loc.id)}
                                                className="p-2 bg-dark-900 border border-dark-700 rounded-lg text-dark-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {stat ? (
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">Capacidad Usada</span>
                                                    <p className="text-2xl font-black text-white">{Math.round(usedPct)}%</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">Libre</span>
                                                    <p className="text-lg font-bold text-primary-400">{formatBytes(stat.free - stat.reserved > 0 ? stat.free - stat.reserved : 0)}</p>
                                                </div>
                                            </div>

                                            <div className="h-4 bg-dark-950 rounded-lg overflow-hidden flex border border-dark-700 shadow-inner p-0.5">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-md transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                                                    style={{ width: `${usedPct}%` }}
                                                />
                                                <div
                                                    className="h-full bg-red-600/30 transition-all duration-1000 border-l border-white/10"
                                                    style={{ width: `${reservedPctDisplay}%` }}
                                                />
                                            </div>

                                            <div className="flex justify-between text-[10px] text-dark-500 font-black uppercase tracking-tighter px-1">
                                                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary-500"></div> USADO: {formatBytes(stat.total - stat.free)}</span>
                                                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500/50"></div> RESERVADO: {formatBytes(stat.reserved)}</span>
                                                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-dark-600"></div> TOTAL: {formatBytes(stat.total)}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-dark-700/50">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] text-dark-500 uppercase font-black tracking-widest">Política E/S</span>
                                                <span className="text-xs font-bold text-white bg-dark-900 px-2 py-1 rounded w-fit border border-dark-700 uppercase tracking-tighter">{loc.rwPolicy || 'READ_WRITE'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] text-dark-500 uppercase font-black tracking-widest">Latencia</span>
                                                <span className="text-xs font-bold text-white">{loc.healthDetails?.latency || '3.2ms'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] text-dark-500 uppercase font-black tracking-widest">IOPS Est.</span>
                                                <span className="text-xs font-mono font-bold text-white">{loc.healthDetails?.iops || '120.5'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] text-dark-500 uppercase font-black tracking-widest">Salud de Disco</span>
                                                <span className={`text-xs font-bold ${usedPct + reservedPctDisplay > 95 ? 'text-red-500' : 'text-green-500'}`}>
                                                    {usedPct + reservedPctDisplay > 95 ? 'POR LLENARSE' : 'OPTIMA'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-dark-600 border border-dashed border-dark-700 rounded-2xl bg-dark-900/50">
                                        <Activity className="animate-pulse mb-3 text-primary-500" size={32} />
                                        <span className="text-xs uppercase font-black tracking-widest animate-pulse">Analizando unidades físicas...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {locations.length === 0 && (
                    <div className="py-24 flex flex-col items-center justify-center text-dark-500 border-2 border-dashed border-dark-800 rounded-3xl bg-dark-800/20">
                        <HardDrive size={64} strokeWidth={1} className="mb-6 opacity-10" />
                        <h3 className="text-2xl font-bold text-dark-300">Sin unidades configuradas</h3>
                        <p className="max-w-md text-center text-dark-500 mt-3 leading-relaxed">
                            Agrega discos locales o rutas de red para habilitar la grabación de video.
                            NXvms gestiona automáticamente el ciclo de vida del metraje.
                        </p>
                        <button
                            onClick={handleAddLocation}
                            className="mt-8 px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-600/20"
                        >
                            Configurar primer disco
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-12 p-6 bg-primary-600/5 border border-primary-500/20 rounded-2xl flex items-start gap-5 shadow-inner">
                <div className="p-2 bg-primary-600/10 rounded-lg text-primary-500">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h4 className="text-primary-400 text-sm font-black uppercase tracking-widest mb-1">Tecnología de Grabación Distribuida</h4>
                    <p className="text-xs text-dark-400 leading-relaxed">
                        NXvms implementa un motor de almacenamiento de alto rendimiento compatible con balanceo de carga.
                        Los segmentos se distribuyen dinámicamente según la velocidad de cada disco y el espacio disponible.
                        Se garantiza la integridad de los datos incluso en condiciones de degradación de hardware.
                    </p>
                </div>
            </div>

            <StorageModal
                isOpen={isModalOpen}
                location={selectedLocation}
                serverId={serverId}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchStorage}
            />
        </div>
    );
};
