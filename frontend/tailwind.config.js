/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Custom PayoutShift palette - distinct from NetShift
                primary: {
                    50: '#fdf8f3',
                    100: '#faeee0',
                    200: '#f4dbc1',
                    300: '#ecc298',
                    400: '#e2a56d',
                    500: '#d98b48', // Main amber/orange accent
                    600: '#cb7339',
                    700: '#a95a30',
                    800: '#88492d',
                    900: '#6e3d27',
                    950: '#3b1e12',
                },
                secondary: {
                    50: '#f4f3ff',
                    100: '#ebe8ff',
                    200: '#d9d4ff',
                    300: '#beb4ff',
                    400: '#9f8bff',
                    500: '#825dfc', // Vibrant violet
                    600: '#7339f4',
                    700: '#6427e0',
                    800: '#5420bc',
                    900: '#461d9a',
                    950: '#2a1068',
                },
                surface: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    850: '#172033', // Custom dark
                    900: '#0f172a',
                    950: '#020617',
                },
                success: {
                    500: '#22c55e',
                    600: '#16a34a',
                },
                warning: {
                    500: '#eab308',
                    600: '#ca8a04',
                },
                error: {
                    500: '#ef4444',
                    600: '#dc2626',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Space Grotesk', 'Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'Menlo', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'slide-down': 'slideDown 0.4s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            },
        },
    },
    plugins: [],
};
