import React, { useState, useEffect } from 'react';
import Modal from '../shared/components/Modal';
import { getApiClient } from '../shared/api-client';
import { StorageLocation, RwPolicy } from '../shared/types';
import { RefreshCw, HardDrive, Info, AlertTriangle, Folder, ChevronRight, Plus } from 'lucide-react';

interface StorageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    location?: StorageLocation | null;
    serverId: string;
}

// File Browser Component
const FileExplorer = ({ serverId, currentPath, onSelect, onCancel }: { serverId: string, currentPath: string, onSelect: (path: string) => void, onCancel: () => void }) => {
    const [path, setPath] = useState(currentPath || '/');
    const [items, setItems] = useState<any[]>([]);
    const [drives, setDrives] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const api = getApiClient();

    useEffect(() => {
        loadDrives();
        loadPath(path);
    }, []);

    const loadDrives = async () => {
        try {
            const d = await api.getSystemDrives(serverId);
            setDrives(d);
        } catch (e) {
            console.error('Failed to load drives', e);
        }
    };

    const loadPath = async (dirPath: string) => {
        setLoading(true);
        setError(null);
        try {
            const contents = await api.browseSystemPath(serverId, dirPath);
            setItems(contents);
            setPath(dirPath);
        } catch (e: any) {
            setError(e.message || 'Error loading directory');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async () => {
        const name = prompt('Nombre de la nueva carpeta:');
        if (!name) return;
        const newPath = path.endsWith('/') || path.endsWith('\\') ? path + name : path + '/' + name;
        try {
            await api.createSystemPath(serverId, newPath);
            loadPath(path); // Refresh
        } catch (e: any) {
            alert(e.message);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const s = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + s[i];
    };

    return (
        <div className="flex flex-col h-[400px] bg-dark-800 rounded-lg border border-dark-600">
            <div className="p-2 border-b border-dark-600 flex items-center gap-2 bg-dark-900">
                <button onClick={() => {
                    // Go up
                    const parts = path.split(/[/\\]/).filter(Boolean);
                    parts.pop();
                    const parent = parts.length === 0 ? '/' : parts.join('/'); // rudimentary, assumes linux mostly or manual fix
                    // Better parent detection for windows/linux mixed
                    // For now just basic string manipulation
                    // If windows root like C:, keep it.
                    // Simple approach: direct browse to parent
                    // We can assume the API is smart enough or we rely on 'drives' list for roots
                    loadDrives(); // Show drives if going to root?
                    // Let's just have a "Drives" button
                }} className="p-1 hover:bg-dark-700 rounded">
                    <HardDrive size={16} className="text-dark-300" />
                </button>
                <div className="flex-1 px-2 py-1 bg-dark-950 rounded text-sm font-mono text-dark-300 border border-dark-700 truncate">
                    {path}
                </div>
                <button onClick={handleCreateFolder} className="p-1 hover:bg-dark-700 rounded" title="Crear Carpeta">
                    <Plus size={16} className="text-primary-400" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {error && (
                    <div className="mb-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs text-center">
                        {error}
                        {error.includes('401') && <div className="mt-1 font-bold">Por favor, cierra sesión y vuelve a ingresar.</div>}
                    </div>
                )}

                <div className="mb-2 grid grid-cols-2 gap-2">
                    {drives.map((d, i) => (
                        <button key={i} onClick={() => loadPath(d.mountPoint)} className="flex items-center gap-2 p-2 bg-dark-700 hover:bg-dark-600 rounded text-left border border-dark-600">
                            <HardDrive size={16} className="text-secondary-400" />
                            <div className="overflow-hidden">
                                <div className="text-xs font-bold text-white truncate">{d.name}</div>
                                <div className="text-[10px] text-dark-400 truncate">{d.description} - {formatBytes(d.free)} Libres</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="space-y-1">
                    {loading ? <div className="text-center p-4 text-dark-400">Cargando...</div> :
                        items.map((item, i) => (
                            <button key={i} onClick={() => loadPath(item.path)} className="w-full flex items-center gap-2 p-2 hover:bg-dark-700 rounded text-left group">
                                <Folder size={16} className="text-yellow-500" />
                                <span className="text-sm text-dark-200 group-hover:text-white flex-1 truncate">{item.name}</span>
                                <ChevronRight size={14} className="text-dark-600 opacity-0 group-hover:opacity-100" />
                            </button>
                        ))}
                    {!loading && items.length === 0 && !error && <div className="text-center p-4 text-dark-500 text-xs">Carpeta vacía</div>}
                </div>
            </div>

            <div className="p-2 border-t border-dark-600 flex justify-end gap-2 bg-dark-900">
                <button onClick={onCancel} className="px-3 py-1.5 text-xs font-medium text-dark-300 hover:text-white">Cancelar</button>
                <button onClick={() => onSelect(path)} className="px-3 py-1.5 text-xs font-medium bg-primary-600 hover:bg-primary-500 text-white rounded">Seleccionar esta carpeta</button>
            </div>
        </div>
    );
};

const StorageModal: React.FC<StorageModalProps> = ({ isOpen, onClose, onSuccess, location, serverId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showBrowser, setShowBrowser] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [path, setPath] = useState('');
    const [rwPolicy, setRwPolicy] = useState<RwPolicy>(RwPolicy.READ_WRITE);
    const [reservedPct, setReservedPct] = useState(10);
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        if (isOpen) {
            if (location) {
                // Using description as name if name doesn't exist in type, or just fallback
                setName(location.name || (location as any).description || '');
                setPath(location.path || '');
                setRwPolicy(location.rwPolicy || RwPolicy.READ_WRITE);
                setReservedPct(location.reservedPct || 10);
                setEnabled(location.enabled !== false);
            } else {
                setName('');
                setPath('');
                setRwPolicy(RwPolicy.READ_WRITE);
                setReservedPct(10);
                setEnabled(true);
            }
            setError(null);
            setShowBrowser(false);

            // Auto-load drives if path is empty (new storage)
            if (!location && !path) {
                // We could pre-fetch drives here if we wanted
            }
        }
    }, [isOpen, location]);

    const handleSave = async () => {
        if (!name || !path) {
            setError('Nombre y Ruta son requeridos');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const api = getApiClient();
            const payload = {
                serverId,
                name,
                path,
                rwPolicy,
                reservedPct,
                enabled,
            };

            if (location) {
                await api.updateServerStorage(location.id, payload);
            } else {
                await api.addServerStorage(payload);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al guardar el almacenamiento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={location ? 'Editar Almacenamiento' : 'Agregar Almacenamiento'}
            size="lg" // Increased size for browser
            footer={
                !showBrowser && ( // Hide main footer when browsing
                    <div className="flex gap-2 w-full justify-end">
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
                            {location ? 'Guardar Cambios' : 'Agregar Almacenamiento'}
                        </button>
                    </div>
                )
            }
        >
            <div className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2">
                        <AlertTriangle size={16} />
                        {error}
                    </div>
                )}

                {showBrowser ? (
                    <FileExplorer
                        serverId={serverId}
                        currentPath={path}
                        onSelect={(newPath) => {
                            setPath(newPath);
                            // Auto-set Name if empty
                            if (!name) {
                                const parts = newPath.split(/[/\\]/);
                                const last = parts[parts.length - 1] || parts[parts.length - 2];
                                if (last) setName(last);
                            }
                            setShowBrowser(false);
                        }}
                        onCancel={() => setShowBrowser(false)}
                    />
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-dark-400 uppercase mb-1.5">Nombre del Disco</label>
                            <div className="relative">
                                <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="ej: Video Archive HDD"
                                    className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-dark-400 uppercase mb-1.5">Ruta de Montaje</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={path}
                                    onChange={(e) => setPath(e.target.value)}
                                    placeholder="ej: /mnt/storage/nxvms o D:\NXvms"
                                    className="flex-1 px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                                <button
                                    onClick={() => setShowBrowser(true)}
                                    className="px-3 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-white flex items-center gap-2"
                                    title="Explorar"
                                >
                                    <Folder size={16} />
                                </button>
                            </div>
                            <p className="mt-1 text-[10px] text-dark-500 flex items-center gap-1">
                                <Info size={10} />
                                La ruta debe existir y ser escribible por el nodo.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-dark-400 uppercase mb-1.5">Política E/S</label>
                                <select
                                    value={rwPolicy}
                                    onChange={(e) => setRwPolicy(e.target.value as RwPolicy)}
                                    className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                >
                                    <option value={RwPolicy.READ_WRITE}>Lectura/Escritura</option>
                                    <option value={RwPolicy.READ_ONLY}>Solo Lectura (Archivo)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-dark-400 uppercase mb-1.5">Reservar (%)</label>
                                <input
                                    type="number"
                                    value={reservedPct}
                                    onChange={(e) => setReservedPct(parseInt(e.target.value))}
                                    className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-lg border border-dark-700">
                            <input
                                type="checkbox"
                                id="storage-enabled"
                                checked={enabled}
                                onChange={(e) => setEnabled(e.target.checked)}
                                className="w-4 h-4 accent-primary-500 rounded"
                            />
                            <label htmlFor="storage-enabled" className="text-sm text-white">Activar este almacenamiento</label>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default StorageModal;
