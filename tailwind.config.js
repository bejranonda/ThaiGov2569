/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Anuphan', 'sans-serif'],
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'text-gradient': 'text-gradient-flow 4s linear infinite',
                'pulse-ring': 'pulse-ring 2s ease-out infinite',
                'shimmer': 'shimmer 3s linear infinite',
                'check-pop': 'check-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                'card-pulse': 'card-select-pulse 0.3s ease-out forwards',
                'slide-up': 'slide-up 0.5s ease-out forwards',
            },
            keyframes: {
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px) scale(1.02)' },
                },
                'text-gradient-flow': {
                    'to': { backgroundPosition: '200% center' },
                },
                'pulse-ring': {
                    '0%': { transform: 'scale(0.8)', opacity: '1' },
                    '100%': { transform: 'scale(2)', opacity: '0' },
                },
                'shimmer': {
                    'from': { backgroundPosition: '-200% 0' },
                    'to': { backgroundPosition: '200% 0' },
                },
                'check-pop': {
                    '0%': { transform: 'scale(0) rotate(-45deg)', opacity: '0' },
                    '70%': { transform: 'scale(1.2) rotate(5deg)', opacity: '1' },
                    '100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
                },
                'card-select-pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.02)' },
                    '100%': { transform: 'scale(1)' },
                },
                'slide-up': {
                    'from': { opacity: '0', transform: 'translateY(20px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
