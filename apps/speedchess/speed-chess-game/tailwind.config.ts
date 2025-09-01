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
				'midnight-blue': 'hsl(var(--midnight-blue))',
				'midnight-dark': 'hsl(var(--midnight-dark))',
				'cyan-glow': 'hsl(var(--cyan-glow))',
				'neon-blue': 'hsl(var(--neon-blue))',
				'soft-blue-grey': 'hsl(var(--soft-blue-grey))',
				'golden': 'hsl(var(--golden))',
				'pure-white': 'hsl(var(--pure-white))',
				'deep-black': 'hsl(var(--deep-black))',
				'electric-blue': 'hsl(var(--electric-blue))',
				'burnt-orange': 'hsl(var(--burnt-orange))',
				'metallic-silver': 'hsl(var(--metallic-silver))',
				'premium-gold': 'hsl(var(--premium-gold))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'glow-pulse': {
					'0%': { boxShadow: 'var(--glow-cyan)' },
					'100%': { boxShadow: '0 0 40px hsl(195 100% 60% / 0.8), 0 0 60px hsl(195 100% 60% / 0.4)' }
				},
				'title-glow': {
					'0%': { textShadow: 'var(--glow-text)' },
					'100%': { textShadow: '0 0 40px hsl(195 100% 60% / 0.5)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'slide-in': {
					'0%': { transform: 'translateY(30px)', opacity: '0' },
					'100%': { transform: 'translateY(0px)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
				'title-glow': 'title-glow 4s ease-in-out infinite alternate',
				'float': 'float 3s ease-in-out infinite',
				'slide-in': 'slide-in 0.5s ease-out',
				'slide-up': 'slide-up 0.8s ease-out forwards',
				'fade-in': 'fade-in 1s ease-out forwards',
				'mystical-glow': 'mystical-glow 2s ease-in-out infinite alternate'
			},
			backgroundImage: {
				'gradient-title': 'var(--gradient-title)',
				'gradient-mystical': 'var(--gradient-mystical)',
				'gradient-button': 'var(--gradient-button)'
			},
			boxShadow: {
				'glow-ambient': 'var(--glow-ambient)',
				'glow-text': 'var(--glow-text)',
				'glow-button': 'var(--glow-button)'
			},
			fontFamily: {
				'premium': ['DM Serif Display', 'serif'],
				'sans': ['Inter', 'sans-serif'],
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
