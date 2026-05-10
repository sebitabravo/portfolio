// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://sebita.dev',
	integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
	devToolbar: {
		enabled: false,
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
