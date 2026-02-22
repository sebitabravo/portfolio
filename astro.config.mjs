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
			cssCodeSplit: true,
			minify: 'esbuild',
			target: 'esnext'
		}
	}
});
