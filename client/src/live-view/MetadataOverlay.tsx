import React from 'react';

interface Detection {
    id: string;
    label: string;
    score: number;
    box: [number, number, number, number]; // [x, y, w, h] normalized 0-1
    color?: string;
    attributes?: Record<string, any>;
}

interface MetadataOverlayProps {
    detections: Detection[];
    width: number;
    height: number;
}

export const MetadataOverlay: React.FC<MetadataOverlayProps> = ({ detections, width, height }) => {
    return (
        <div
            className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
            style={{ width: '100%', height: '100%' }}
        >
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                className="absolute inset-0"
            >
                {detections.map((det) => {
                    const [x, y, w, h] = det.box;
                    const rectX = x * width;
                    const rectY = y * height;
                    const rectW = w * width;
                    const rectH = h * height;
                    const color = det.color || '#3b82f6';

                    return (
                        <g key={det.id}>
                            {/* Bounding Box */}
                            <rect
                                x={rectX}
                                y={rectY}
                                width={rectW}
                                height={rectH}
                                fill="none"
                                stroke={color}
                                strokeWidth="2"
                                className="transition-all duration-200"
                            />

                            {/* Label Background */}
                            <rect
                                x={rectX}
                                y={rectY - 20 < 0 ? rectY : rectY - 20}
                                width={Math.max(60, det.label.length * 8 + 30)}
                                height="20"
                                fill={color}
                                className="transition-all duration-200"
                            />

                            {/* Label Text */}
                            <text
                                x={rectX + 5}
                                y={rectY - 20 < 0 ? rectY + 14 : rectY - 6}
                                fill="white"
                                fontSize="12"
                                fontWeight="bold"
                                className="font-mono uppercase transition-all duration-200"
                            >
                                {det.label} {Math.round(det.score * 100)}%
                            </text>

                            {/* Attributes (Optional) */}
                            {det.attributes?.plate && (
                                <g>
                                    <rect
                                        x={rectX}
                                        y={rectY + rectH}
                                        width={80}
                                        height={24}
                                        fill="#fbbf24"
                                    />
                                    <text
                                        x={rectX + 5}
                                        y={rectY + rectH + 17}
                                        fill="black"
                                        fontSize="14"
                                        fontWeight="black"
                                        fontFamily="monospace"
                                    >
                                        {det.attributes.plate}
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};
