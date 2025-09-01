
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				success: 'hsl(var(--success))',
				'sidebar-bg': 'hsl(var(--sidebar-bg))',
				'game-card': 'hsl(var(--game-card))',
			},
			fontFamily: {
				'sans': ['Inter', 'sans-serif'],
				'inter': ['Inter', 'sans-serif'],
				'poppins': ['Poppins', 'sans-serif'],
			},
			animation: {
				'neon-glow-accessible': 'neon-glow-accessible 2s ease-in-out infinite',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-up': 'slide-up 0.6s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'grid-move': 'grid-move 10s linear infinite',
				'tilt': 'tilt 0.6s ease-in-out',
				'slide-in-left': 'slide-in-left 0.4s ease-out',
			},
			keyframes: {
				'neon-glow-accessible': {
					'0%, 100%': { filter: 'drop-shadow(0 0 4px currentColor)' },
					'50%': { filter: 'drop-shadow(0 0 8px currentColor)' }
				},
				'fade-in': {
					'from': { opacity: '0', transform: 'translateY(20px)' },
					'to': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					'from': { opacity: '0', transform: 'translateY(40px)' },
					'to': { opacity: '1', transform: 'translateY(0)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'grid-move': {
					'from': { backgroundPosition: '0 0' },
					'to': { backgroundPosition: '40px 40px' }
				},
				'tilt': {
					'0%, 100%': { transform: 'rotateY(0deg) rotateX(0deg)' },
					'25%': { transform: 'rotateY(-5deg) rotateX(5deg)' },
					'75%': { transform: 'rotateY(5deg) rotateX(-5deg)' }
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-50px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
