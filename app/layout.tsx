import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Circuit Digitizer",
    description: "Visualize and analyze circuit diagrams",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <style>{`
          /* Global styles to prevent unwanted scrolling */
          .prevent-scroll {
            overflow: hidden;
            touch-action: none;
          }
          /* Custom class for touch action none */
          .touch-action-none {
            touch-action: none;
          }
        `}</style>
            </head>
            <body
                className={`${inter.className} bg-[#1c1c1e] text-[#ffffff] font-sans`}
            >
                {children}
            </body>
        </html>
    );
}
