// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://sebita.dev',
	integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
	devToolbar: {
		enabled: false,
	},
	fonts: [
		{
			name: 'Manrope',
			cssVariable: '--font-manrope',
			provider: fontProviders.google(),
			weights: [400, 600, 700],
			styles: ['normal'],
			fallbacks: ['system-ui', '-apple-system', 'sans-serif'],
		},
		{
			name: 'Syne',
			cssVariable: '--font-syne',
			provider: fontProviders.google(),
			weights: [600, 700],
			styles: ['normal'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
		{
			name: 'JetBrains Mono',
			cssVariable: '--font-jetbrains-mono',
			provider: fontProviders.fontsource(),
			weights: [400, 500],
			styles: ['normal'],
			subsets: ['latin'],
			fallbacks: ['monospace'],
		},
	],
	markdown: {
		syntaxHighlight: false,
	},
	security: {
		csp: true,
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
