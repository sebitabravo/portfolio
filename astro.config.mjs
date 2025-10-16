// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://sebita.dev',
	integrations: [],
	// Enable View Transitions for faster page navigation
	experimental: {
		clientPrerender: true,
	},
	i18n: {
		defaultLocale: 'es',
		locales: ['es', 'en'],
		routing: {
			prefixDefaultLocale: false,
		}
	},
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				'@': '/src'
			}
		},
		build: {
			// Optimize chunk splitting for better caching
			rollupOptions: {
				output: {
					manualChunks: {
						// Separate vendor chunks for better caching
						'vendor': [
							'class-variance-authority',
							'clsx',
							'tailwind-merge'
						]
					}
				}
			},
			// Enable CSS code splitting
			cssCodeSplit: true,
			// Use esbuild minifier (faster than terser, already included)
			minify: 'esbuild',
			target: 'esnext'
		}
	}
});
