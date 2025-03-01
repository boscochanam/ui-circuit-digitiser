"use client";

import { useState } from "react";
import ImageUploader from "../components/ImageUploader";
import CircuitCanvas from "../components/CircuitCanvas";
import JsonEditor from "../components/JsonEditor";

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

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [circuitData, setCircuitData] = useState(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [globalScaleFactor, setGlobalScaleFactor] = useState(8000);

    const handleImageUpload = async (file: File) => {
        setIsLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(
                "http://localhost:8000/analyze-circuit",
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data.devices || !data.wires) {
                throw new Error("Invalid data format received from server");
            }
            setCircuitData(data);
            setOriginalImage(URL.createObjectURL(file));
        } catch (error) {
            console.error("Error:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleJsonUpdate = (newData: any) => {
        setCircuitData(newData);
    };

    const formatCoordinate = (value: number) => {
        const scaled = value * globalScaleFactor;
        return scaled.toFixed(2);
    };

    return (
        <div className="min-h-screen bg-[#1c1c1e] text-[#ffffff] font-sans">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-[#0a84ff] mb-8">
                    Circuit Digitizer
                </h1>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-1 space-y-6">
                        <div className="bg-[#2c2c2e] rounded-xl shadow-md p-6 border border-[#3a3a3c] transition-colors">
                            <h2 className="text-xl font-semibold mb-4 text-[#5ac8fa]">
                                Upload Circuit Image
                            </h2>
                            <ImageUploader onUpload={handleImageUpload} />
                            {isLoading && (
                                <div className="mt-4 text-center text-[#0a84ff]">
                                    Processing image...
                                </div>
                            )}
                        </div>

                        {originalImage && (
                            <div className="bg-[#2c2c2e] rounded-xl shadow-md p-6 border border-[#3a3a3c] transition-colors">
                                <h2 className="text-xl font-semibold mb-4 text-[#5ac8fa]">
                                    Original Image
                                </h2>
                                <img
                                    src={originalImage}
                                    alt="Original circuit"
                                    className="max-w-full rounded-lg border border-[#3a3a3c]"
                                />
                            </div>
                        )}

                        <div className="bg-[#2c2c2e] rounded-xl shadow-md p-6 border border-[#3a3a3c] transition-colors">
                            <h2 className="text-xl font-semibold mb-4 text-[#5ac8fa]">
                                Circuit Data Editor
                            </h2>
                            {circuitData ? (
                                <JsonEditor
                                    initialData={circuitData}
                                    onUpdate={handleJsonUpdate}
                                />
                            ) : (
                                <p className="text-[#d1d1d6]">
                                    Upload an image to edit circuit data
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="xl:col-span-2">
                        <div className="bg-[#2c2c2e] rounded-xl shadow-md p-6 h-[800px] flex flex-col border border-[#3a3a3c] transition-colors">
                            <h2 className="text-xl font-semibold mb-4 text-[#5ac8fa]">
                                Circuit Visualization
                            </h2>
                            <div className="rounded-lg overflow-hidden flex-grow">
                                <CircuitCanvas
                                    circuitData={circuitData}
                                    originalImage={null}
                                    onScaleFactorChange={setGlobalScaleFactor}
                                    initialScaleFactor={globalScaleFactor}
                                />
                            </div>
                            <div className="mt-4 text-sm text-[#d1d1d6]">
                                Use mouse wheel to zoom, drag to pan
                            </div>
                        </div>

                        {circuitData &&
                            circuitData.devices &&
                            circuitData.devices.length > 0 && (
                                <div className="mt-8 bg-[#2c2c2e] rounded-xl shadow-md p-6 border border-[#3a3a3c] transition-colors">
                                    <h2 className="text-xl font-semibold mb-4 text-[#5ac8fa]">
                                        Components Table
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border border-[#3a3a3c] text-sm">
                                            <thead className="bg-[#1c1c1e] border-b border-[#3a3a3c]">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-[#d1d1d6]">
                                                        Type
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-[#d1d1d6]">
                                                        ID
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-[#d1d1d6]">
                                                        X{" "}
                                                        <span className="text-[#5ac8fa]">
                                                            (scaled)
                                                        </span>
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-[#d1d1d6]">
                                                        Z{" "}
                                                        <span className="text-[#5ac8fa]">
                                                            (scaled)
                                                        </span>
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-[#d1d1d6]">
                                                        Rotation
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {circuitData.devices.map(
                                                    (dev, index) => {
                                                        const emoji =
                                                            componentEmojis[
                                                                dev.deviceType.toLowerCase()
                                                            ] || "⚡";
                                                        return (
                                                            <tr
                                                                key={index}
                                                                className="border-b border-[#3a3a3c] hover:bg-[#3a3a3c]"
                                                            >
                                                                <td className="px-4 py-3 text-[#ffffff] font-medium">
                                                                    <span className="mr-2">
                                                                        {emoji}
                                                                    </span>
                                                                    {
                                                                        dev.deviceType
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-[#d1d1d6] font-mono">
                                                                    {
                                                                        dev.deviceId
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-[#0a84ff] font-mono">
                                                                    {formatCoordinate(
                                                                        dev
                                                                            .position
                                                                            ?.x
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-[#0a84ff] font-mono">
                                                                    {formatCoordinate(
                                                                        dev
                                                                            .position
                                                                            ?.z
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-[#ff9f0a] font-mono">
                                                                    {
                                                                        dev.rotation
                                                                    }
                                                                    °
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-[#3d3d3f] border border-[#ff375f] rounded-lg text-[#ff375f]">
                        Error: {error}
                    </div>
                )}
            </div>
        </div>
    );
}
