import React, { useState, useRef, useEffect } from 'react';
import { MousePointer2, Box, Trash2, Save, X, Info, RefreshCw } from 'lucide-react';
import { Camera } from '../shared/types';
import { getApiClient } from '../shared/api-client';

interface Point {
    x: number;
    y: number;
}

interface ROI {
    id: string;
    name: string;
    points: Point[];
    color: string;
}

interface ROIArchitectProps {
    camera: Camera;
    onSave: (rois: ROI[]) => void;
    onClose: () => void;
}

export const ROIArchitect: React.FC<ROIArchitectProps> = ({ camera, onSave, onClose }) => {
    const [rois, setRois] = useState<ROI[]>([]);
    const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
    const [activeMode, setActiveMode] = useState<'select' | 'draw'>('draw');
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    useEffect(() => {
        const fetchExisting = async () => {
            try {
                const apiClient = getApiClient();
                const existing = await apiClient.getCameraROIs(camera.id);
                setRois(existing || []);
            } catch (e) {
                console.error('Failed to fetch ROIs:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchExisting();
    }, [camera.id]);

    useEffect(() => {
        draw();
    }, [rois, currentPoints]);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw existing ROIs
        rois.forEach((roi) => {
            if (!roi.points || roi.points.length === 0) return;
            ctx.beginPath();
            ctx.moveTo(roi.points[0].x * canvas.width, roi.points[0].y * canvas.height);
            roi.points.forEach((p) => ctx.lineTo(p.x * canvas.width, p.y * canvas.height));
            ctx.closePath();

            ctx.fillStyle = roi.color + '44'; // 25% opacity
            ctx.fill();
            ctx.strokeStyle = roi.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label
            if (roi.points.length > 0) {
                ctx.fillStyle = roi.color;
                ctx.font = 'bold 12px Inter';
                ctx.fillText(roi.name, roi.points[0].x * canvas.width, roi.points[0].y * canvas.height - 5);
            }
        });

        // Draw current points
        if (activeMode === 'draw' && currentPoints.length > 0) {
            ctx.beginPath();
            ctx.moveTo(currentPoints[0].x * canvas.width, currentPoints[0].y * canvas.height);
            currentPoints.forEach((p) => ctx.lineTo(p.x * canvas.width, p.y * canvas.height));

            ctx.strokeStyle = '#fff';
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);

            currentPoints.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
            });
        }
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (activeMode !== 'draw') return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const newPoint = { x, y };

        // Check if clicking near first point to close poly
        if (currentPoints.length > 2) {
            const first = currentPoints[0];
            const dist = Math.sqrt(Math.pow(x - first.x, 2) + Math.pow(y - first.y, 2));
            if (dist < 0.03) {
                completeROI();
                return;
            }
        }

        setCurrentPoints([...currentPoints, newPoint]);
    };

    const completeROI = () => {
        if (currentPoints.length < 3) return;

        const name = prompt('Nombre de la zona (ej: Entrada, Parking):');
        if (!name) return;

        const newROI: ROI = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            points: currentPoints,
            color: colors[rois.length % colors.length],
        };

        setRois([...rois, newROI]);
        setCurrentPoints([]);
    };

    const handleDeleteROI = (id: string) => {
        setRois(rois.filter(r => r.id !== id));
    };

    // formatBytes was unused and has been removed.

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-dark-900 w-full max-w-6xl rounded-2xl border border-dark-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-dark-700 flex justify-between items-center bg-dark-800">
                    <div className="flex items-center gap-3">
                        <Box className="text-primary-500" />
                        <div>
                            <h2 className="text-white font-bold">Arquitecto de ROI (Zonas de Interés)</h2>
                            <p className="text-xs text-dark-400">{camera.name} - Define zonas para detección de IA</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-dark-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Main Workspace */}
                    <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden" ref={containerRef}>
                        {loading ? (
                            <div className="flex items-center gap-3 text-white">
                                <RefreshCw className="animate-spin" />
                                <span>Cargando zonas...</span>
                            </div>
                        ) : (
                            <div className="relative aspect-video w-full max-w-full max-h-full bg-dark-950 flex items-center justify-center overflow-hidden">
                                <img
                                    src={`https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=1280`}
                                    alt="Camera placeholder"
                                    className="w-full h-full object-contain opacity-50 select-none"
                                />
                                <canvas
                                    ref={canvasRef}
                                    width={1280}
                                    height={720}
                                    className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                                    onClick={handleCanvasClick}
                                />
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    <button
                                        onClick={() => setActiveMode('draw')}
                                        className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase transition-all ${activeMode === 'draw' ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-400'}`}
                                    >
                                        <MousePointer2 size={16} /> Dibujar Polígono
                                    </button>
                                </div>

                                {activeMode === 'draw' && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-dark-800/90 backdrop-blur border border-dark-600 px-4 py-2 rounded-full flex items-center gap-3 text-xs text-white">
                                        <Info size={14} className="text-primary-400" />
                                        <span>Click para agregar puntos. Click cerca del inicio para cerrar.</span>
                                        {currentPoints.length > 0 && (
                                            <button onClick={() => setCurrentPoints([])} className="text-red-400 hover:underline ml-2">Cancelar</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-80 bg-dark-800 border-l border-dark-700 p-6 flex flex-col">
                        <h3 className="text-dark-400 text-[10px] font-bold uppercase tracking-widest mb-4">Zonas Definidas</h3>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {rois.map((roi) => (
                                <div key={roi.id} className="group p-3 bg-dark-900 rounded-lg border border-dark-700 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: roi.color }} />
                                        <span className="text-sm font-medium text-white">{roi.name}</span>
                                    </div>
                                    <button onClick={() => handleDeleteROI(roi.id)} className="p-1.5 text-dark-600 hover:text-red-500 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {rois.length === 0 && !loading && (
                                <div className="py-12 flex flex-col items-center justify-center text-dark-600 border border-dashed border-dark-700 rounded-lg">
                                    <Box size={32} className="mb-2 opacity-10" />
                                    <span className="text-[10px] uppercase font-bold tracking-tight">Sin zonas configuradas</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-dark-700 space-y-3">
                            <button
                                onClick={() => onSave(rois)}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-sm transition-all"
                            >
                                <Save size={18} /> Guardar Configuración
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-dark-700 hover:bg-dark-600 text-dark-300 rounded-xl font-bold text-sm transition-all"
                            >
                                Descartar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
