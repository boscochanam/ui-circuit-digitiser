import React from "react";

// Generic Icon Component
interface IconProps {
    ctx: CanvasRenderingContext2D;
    size: number;
    colors: { fill: string; stroke: string };
}

// Resistor Icon
export const ResistorIcon: React.FC<IconProps> = ({ ctx, size, colors }) => {
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(-size / 2, -size / 4, size, size / 2);
    const zigzagPath = new Path2D();
    zigzagPath.moveTo(-size / 2, 0);
    for (let i = 0; i <= 4; i++) {
        zigzagPath.lineTo(
            -size / 2 + (i * size) / 4,
            ((i % 2 === 0 ? -1 : 1) * size) / 4
        );
    }
    ctx.stroke(zigzagPath);
    return null;
};

// Capacitor Icon
export const CapacitorIcon: React.FC<IconProps> = ({ ctx, size, colors }) => {
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size / 4, -size / 2);
    ctx.lineTo(-size / 4, size / 2);
    ctx.moveTo(size / 4, -size / 2);
    ctx.lineTo(size / 4, size / 2);
    ctx.stroke();
    return null;
};

// Inductor Icon
export const InductorIcon: React.FC<IconProps> = ({ ctx, size, colors }) => {
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    const coilPath = new Path2D();
    let startX = -size / 2;
    const step = size / 6;
    const radius = step / 2;
    coilPath.moveTo(startX, 0);
    for (let i = 0; i < 5; i++) {
        const x = startX + step * (i + 1);
        coilPath.arc(x - radius, 0, radius, 0, Math.PI, i % 2 === 0);
    }
    ctx.stroke(coilPath);
    return null;
};

// Voltage Source Icon
export const VoltageSourceIcon: React.FC<IconProps> = ({
    ctx,
    size,
    colors,
}) => {
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.moveTo(0, -size / 2);
    ctx.lineTo(0, size / 2);
    ctx.moveTo(-size / 2, 0);
    ctx.lineTo(size / 2, 0);
    ctx.stroke();
    return null;
};

// Current Source Icon
export const CurrentSourceIcon: React.FC<IconProps> = ({
    ctx,
    size,
    colors,
}) => {
    ctx.fillStyle = colors.fill;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.moveTo(0, -size / 2);
    ctx.lineTo(0, size / 2);
    ctx.moveTo(-size / 4, size / 4);
    ctx.lineTo(size / 4, size / 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -size / 2);
    ctx.lineTo(size / 4, -size / 4);
    ctx.lineTo(-size / 4, -size / 4);
    ctx.closePath();
    ctx.fill();
    return null;
};

// Ground Icon
export const GroundIcon: React.FC<IconProps> = ({ ctx, size, colors }) => {
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -size / 2);
    ctx.lineTo(0, size / 2);
    ctx.moveTo(-size / 2, size / 2);
    ctx.lineTo(size / 2, size / 2);
    ctx.moveTo(-size / 4, size / 2 + size / 8);
    ctx.lineTo(size / 4, size / 2 + size / 8);
    ctx.moveTo(-size / 8, size / 2 + size / 4);
    ctx.lineTo(size / 8, size / 2 + size / 4);
    ctx.stroke();
    return null;
};

// Junction Icon
export const JunctionIcon: React.FC<IconProps> = ({ ctx, size, colors }) => {
    ctx.fillStyle = colors.fill;
    ctx.beginPath();
    ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
    ctx.fill();
    return null;
};
