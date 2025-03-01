import React, { useEffect, useRef, useState, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCw } from "lucide-react";

interface Position {
    x: number;
    y: number;
    z: number;
}

interface Device {
    nodes: string[];
    deviceId: string;
    position: Position;
    rotation: number;
    deviceType: string;
}

interface Wire {
    nodes: string[];
    wireId: string;
}

interface CircuitData {
    devices: Device[];
    wires: Wire[];
}

interface Props {
    circuitData: CircuitData | null;
    originalImage: string | null;
    onScaleFactorChange: (factor: number) => void;
    initialScaleFactor: number;
}

const CircuitCanvas: React.FC<Props> = ({
    circuitData,
    originalImage,
    onScaleFactorChange,
    initialScaleFactor,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const [rotation, setRotation] = useState(0); // 0, 90, 180, 270 degrees
    const [globalScaleFactor, setGlobalScaleFactor] =
        useState(initialScaleFactor);

    // Update device colors to match macOS Dark Mode theme
    const deviceColors: Record<string, { fill: string; stroke: string }> = {
        resistor: { fill: "#0a84ff", stroke: "#5ac8fa" }, // Blue/Cyan
        capacitor: { fill: "#5ac8fa", stroke: "#0a84ff" }, // Cyan/Blue
        inductor: { fill: "#cc7ef5", stroke: "#5ac8fa" }, // Purple/Cyan
        voltage_source: { fill: "#ff9f0a", stroke: "#cc7ef5" }, // Orange/Purple
        current_source: { fill: "#ff9f0a", stroke: "#0a84ff" }, // Orange/Blue
        ground: { fill: "#8e8e93", stroke: "#ffffff" }, // Gray/White
        junction: { fill: "#d1d1d6", stroke: "#ffffff" }, // Light Gray/White
        default: { fill: "#ffffff", stroke: "#d1d1d6" }, // White/Light Gray
    };

    // Component emoji mapping
    const componentEmojis: Record<string, string> = {
        resistor: "⚡",
        capacitor: "🔋",
        inductor: "🌀",
        voltage_source: "⚡",
        current_source: "↯",
        ground: "⏚",
        junction: "◉",
        default: "⚡",
    };

    const initializeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas size to parent container size
        const container = canvas.parentElement;
        if (container) {
            const { width, height } = container.getBoundingClientRect();
            setCanvasSize({ width, height });
            canvas.width = width;
            canvas.height = height;
        }

        // Remove the wheel event listener from here as we'll handle it differently
    }, []);

    // Handle wheel events at the container level
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const zoomFactor = 0.05;
            const direction = e.deltaY > 0 ? -1 : 1;
            setScale((s) =>
                Math.max(0.1, Math.min(10, s + direction * zoomFactor))
            );
        };

        container.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            container.removeEventListener("wheel", handleWheel);
        };
    }, []);

    const drawCheckerPattern = useCallback((ctx: CanvasRenderingContext2D) => {
        const squareSize = 20;
        // macOS Dark Mode-inspired checker pattern
        const darkColor = "#1c1c1e";
        const lightColor = "#2c2c2e";

        for (let x = 0; x < ctx.canvas.width; x += squareSize) {
            for (let y = 0; y < ctx.canvas.height; y += squareSize) {
                ctx.fillStyle =
                    ((x + y) / squareSize) % 2 === 0 ? lightColor : darkColor;
                ctx.fillRect(x, y, squareSize, squareSize);
            }
        }
    }, []);

    const calculateNodePositions = useCallback((devices: Device[]) => {
        const nodePositions: Record<string, Position> = {};

        devices.forEach((device) => {
            device.nodes.forEach((nodeId) => {
                // If it's a junction, use its position directly
                if (device.deviceType.toLowerCase() === "junction") {
                    nodePositions[nodeId] = device.position;
                }
            });
        });

        return nodePositions;
    }, []);

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const drawDevice = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            device: Device,
            nodePositions: Record<string, Position>,
            baseScale: number
        ) => {
            // For junctions, use their actual positions
            const isJunction = device.deviceType.toLowerCase() === "junction";

            // Normalize x and z, allow extra device-level scaleFactor
            const scaleFactor = device.position["scaleFactor"] || 1;

            // Scale x, y, z by 100
            let scaledX = device.position.x * globalScaleFactor;
            let scaledZ = device.position.z * globalScaleFactor;

            // Apply rotation transformation
            let screenX, screenY;

            switch (rotation) {
                case 0:
                    screenX = scaledX * baseScale * scale * scaleFactor + pan.x;
                    screenY = scaledZ * baseScale * scale * scaleFactor + pan.y;
                    break;
                case 90:
                    screenX =
                        -scaledZ * baseScale * scale * scaleFactor + pan.x;
                    screenY = scaledX * baseScale * scale * scaleFactor + pan.y;
                    break;
                case 180:
                    screenX =
                        -scaledX * baseScale * scale * scaleFactor + pan.x;
                    screenY =
                        -scaledZ * baseScale * scale * scaleFactor + pan.y;
                    break;
                case 270:
                    screenX = scaledZ * baseScale * scale * scaleFactor + pan.x;
                    screenY =
                        -scaledX * baseScale * scale * scaleFactor + pan.y;
                    break;
                default:
                    screenX = scaledX * baseScale * scale * scaleFactor + pan.x;
                    screenY = scaledZ * baseScale * scale * scaleFactor + pan.y;
            }

            ctx.save();
            ctx.translate(screenX, screenY);

            // Apply rotation for the box but not for the text
            ctx.rotate((device.rotation * Math.PI) / 180);

            const colors =
                deviceColors[device.deviceType.toLowerCase()] ||
                deviceColors.default;

            const size = (isJunction ? 20 : 80) * scale; // Increased base size

            if (!isJunction) {
                // Increase box size to accommodate text
                const boxWidth = size * 2.5; // Wider box
                const boxHeight = size * 1.2; // Slightly taller box
                const radius = 12 * scale;

                // Draw background with shadow
                ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
                ctx.shadowBlur = 10 * scale;
                ctx.shadowOffsetY = 4 * scale;

                // Draw rounded rectangle
                ctx.beginPath();
                ctx.moveTo(-boxWidth / 2 + radius, -boxHeight / 2);
                ctx.lineTo(boxWidth / 2 - radius, -boxHeight / 2);
                ctx.arcTo(
                    boxWidth / 2,
                    -boxHeight / 2,
                    boxWidth / 2,
                    -boxHeight / 2 + radius,
                    radius
                );
                ctx.lineTo(boxWidth / 2, boxHeight / 2 - radius);
                ctx.arcTo(
                    boxWidth / 2,
                    boxHeight / 2,
                    boxWidth / 2 - radius,
                    boxHeight / 2,
                    radius
                );
                ctx.lineTo(-boxWidth / 2 + radius, boxHeight / 2);
                ctx.arcTo(
                    -boxWidth / 2,
                    boxHeight / 2,
                    -boxWidth / 2,
                    boxHeight / 2 - radius,
                    radius
                );
                ctx.lineTo(-boxWidth / 2, -boxHeight / 2 + radius);
                ctx.arcTo(
                    -boxWidth / 2,
                    -boxHeight / 2,
                    -boxWidth / 2 + radius,
                    -boxHeight / 2,
                    radius
                );
                ctx.closePath();

                ctx.fillStyle = colors.fill;
                ctx.fill();

                ctx.shadowColor = "transparent";
                ctx.strokeStyle = colors.stroke;
                ctx.lineWidth = 3 * scale;
                ctx.stroke();

                // Reset rotation for text to keep it horizontal
                ctx.rotate(-(device.rotation * Math.PI) / 180);

                // Add text background for better contrast
                const emoji =
                    componentEmojis[device.deviceType.toLowerCase()] ||
                    componentEmojis.default;
                const text = `${emoji} ${device.deviceType}`;
                ctx.font = `bold ${
                    18 * scale
                }px -apple-system, BlinkMacSystemFont, sans-serif`;

                // Measure text width for background
                const textMetrics = ctx.measureText(text);
                const textWidth = textMetrics.width;
                const textHeight = 24 * scale;
                const padding = 8 * scale;

                // Draw semi-transparent background behind text
                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                ctx.fillRect(
                    -textWidth / 2 - padding,
                    -textHeight / 2 - padding / 2,
                    textWidth + padding * 2,
                    textHeight + padding
                );

                // Draw text
                ctx.fillStyle = "#ffffff";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(text, 0, 0);
            } else {
                // Draw junction as a simple circle
                ctx.beginPath();
                ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
                ctx.fillStyle = colors.fill;
                ctx.fill();
                ctx.strokeStyle = colors.stroke;
                ctx.lineWidth = 2 * scale;
                ctx.stroke();
            }

            ctx.restore();
        },
        [scale, pan, deviceColors, globalScaleFactor, rotation, componentEmojis]
    );

    const drawWire = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            wire: Wire,
            devices: Device[],
            nodePositions: Record<string, Position>,
            baseScale: number
        ) => {
            const [startNodeId, endNodeId] = wire.nodes;
            const startDevice = devices.find((d) =>
                d.nodes.includes(startNodeId)
            );
            const endDevice = devices.find((d) => d.nodes.includes(endNodeId));

            if (!startDevice || !endDevice) return;

            // Use junction positions if available, otherwise use device positions
            const startPos = nodePositions[startNodeId] || startDevice.position;
            const endPos = nodePositions[endNodeId] || endDevice.position;

            // Use normalized x, z for start and end
            const normStartX = startPos.x / 100;
            const normStartZ = startPos.z / 100;
            const normEndX = endPos.x / 100;
            const normEndZ = endPos.z / 100;

            // Scale start/end positions by 100
            let startScaledX = startPos.x * globalScaleFactor;
            let startScaledZ = startPos.z * globalScaleFactor;
            let endScaledX = endPos.x * globalScaleFactor;
            let endScaledZ = endPos.z * globalScaleFactor;

            // Apply rotation transformation
            let screenStartX, screenStartY, screenEndX, screenEndY;

            switch (rotation) {
                case 0:
                    screenStartX = startScaledX * baseScale * scale + pan.x;
                    screenStartY = startScaledZ * baseScale * scale + pan.y;
                    screenEndX = endScaledX * baseScale * scale + pan.x;
                    screenEndY = endScaledZ * baseScale * scale + pan.y;
                    break;
                case 90:
                    screenStartX = -startScaledZ * baseScale * scale + pan.x;
                    screenStartY = startScaledX * baseScale * scale + pan.y;
                    screenEndX = -endScaledZ * baseScale * scale + pan.x;
                    screenEndY = endScaledX * baseScale * scale + pan.y;
                    break;
                case 180:
                    screenStartX = -startScaledX * baseScale * scale + pan.x;
                    screenStartY = -startScaledZ * baseScale * scale + pan.y;
                    screenEndX = -endScaledX * baseScale * scale + pan.x;
                    screenEndY = -endScaledZ * baseScale * scale + pan.y;
                    break;
                case 270:
                    screenStartX = startScaledZ * baseScale * scale + pan.x;
                    screenStartY = -startScaledX * baseScale * scale + pan.y;
                    screenEndX = endScaledZ * baseScale * scale + pan.x;
                    screenEndY = -endScaledX * baseScale * scale + pan.y;
                    break;
                default:
                    screenStartX = startScaledX * baseScale * scale + pan.x;
                    screenStartY = startScaledZ * baseScale * scale + pan.y;
                    screenEndX = endScaledX * baseScale * scale + pan.x;
                    screenEndY = endScaledZ * baseScale * scale + pan.y;
            }

            ctx.beginPath();
            ctx.moveTo(screenStartX, screenStartY);
            ctx.lineTo(screenEndX, screenEndY);
            ctx.strokeStyle = "#0a84ff"; // macOS Dark Mode blue for wires
            ctx.lineWidth = 2 * scale;
            ctx.stroke();
        },
        [scale, pan, globalScaleFactor, rotation]
    );

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx || !circuitData) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw checker pattern
        drawCheckerPattern(ctx);

        // Calculate base scale for the entire circuit
        const baseScale =
            Math.min(canvas.width / 1000, canvas.height / 1000) * 0.9;

        // Calculate node positions first
        const nodePositions = calculateNodePositions(circuitData.devices);

        // Draw wires first (behind components)
        circuitData.wires.forEach((wire) =>
            drawWire(ctx, wire, circuitData.devices, nodePositions, baseScale)
        );

        // Draw devices on top
        circuitData.devices.forEach((device) =>
            drawDevice(ctx, device, nodePositions, baseScale)
        );
    }, [
        circuitData,
        scale,
        pan,
        drawDevice,
        drawWire,
        drawCheckerPattern,
        calculateNodePositions,
    ]);

    useEffect(() => {
        initializeCanvas();
        window.addEventListener("resize", initializeCanvas);
        return () => window.removeEventListener("resize", initializeCanvas);
    }, [initializeCanvas]);

    useEffect(() => {
        draw();
    }, [draw]);

    useEffect(() => {
        onScaleFactorChange(globalScaleFactor);
    }, [globalScaleFactor, onScaleFactorChange]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative bg-[#1c1c1e] overflow-hidden"
        >
            <Card className="absolute top-2 left-2 z-10 w-64 bg-[#2c2c2e] border-[#3a3a3c] text-[#ffffff]">
                <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#ffffff]">
                            Rotate
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRotate}
                            className="ml-2 bg-[#2c2c2e] border-[#3a3a3c] text-[#ffffff] hover:bg-[#3a3a3c] transition-colors"
                        >
                            <RotateCw className="w-4 h-4 mr-1" />
                            Rotate 90°
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-[#ffffff]">
                                Scale Factor
                            </span>
                            <span className="text-xs text-[#d1d1d6]">
                                {globalScaleFactor}
                            </span>
                        </div>
                        <Slider
                            min={1000}
                            max={15000}
                            step={100}
                            value={[globalScaleFactor]}
                            onValueChange={([value]) =>
                                setGlobalScaleFactor(value)
                            }
                            className="w-full"
                        />
                    </div>
                </CardContent>
            </Card>
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="w-full h-full border border-[#3a3a3c] rounded-md touch-action-none"
                style={{ touchAction: "none" }} // Disable default touch actions
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
        </div>
    );
};

export default CircuitCanvas;
