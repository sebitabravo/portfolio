/// <reference types="astro/client" />

import type { AstroComponentFactory } from "astro/runtime/server/index.js"

declare module '*.astro' {
	const component: AstroComponentFactory;
	export default component;
}

interface PortfolioToastApi {
	show: (id: string, message: string, type?: "success" | "error") => void;
}

declare global {
	interface Window {
		__portfolioDialogBound?: boolean;
		__portfolioTabsBound?: boolean;
		__portfolioAvatarBound?: boolean;
		__portfolioDropdownBound?: boolean;
		portfolioToast?: PortfolioToastApi;
	}
}
