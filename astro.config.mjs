// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://sebita.dev',
	output: 'static',
	integrations: [sitemap({ filter: (page) => !page.includes('/404') }), mdx()],
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
			minify: 'oxc',
			// The lazy WebGL enhancement is 523 KiB raw / about 129 KiB gzip.
			// Keep Vite's advisory aligned with that intentional optional chunk;
			// verify:bundle enforces both raw and compressed budgets separately.
			chunkSizeWarningLimit: 600,
			target: 'esnext'
		}
	}
});
