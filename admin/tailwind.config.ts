import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#05050F", // Very dark blue/black
                surface: "#0A0A1B",    // Slightly lighter for cards
                primary: "#4F46E5",    // Indigo/Purple
                secondary: "#0EA5E9",  // Sky blue
                accent: "#6366F1",     // Indigo
                success: "#10B981",    // Emerald
                warning: "#F59E0B",    // Amber
                error: "#EF4444",      // Red
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'card-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                'active-gradient': 'linear-gradient(90deg, rgba(79, 70, 229, 0.1) 0%, rgba(79, 70, 229, 0) 100%)',
            }
        },
    },
    plugins: [],
};
export default config;
