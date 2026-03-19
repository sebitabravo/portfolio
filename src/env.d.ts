/// <reference types="astro/client" />

declare module '*.astro' {
	const component: any;
	export default component;
}

interface PortfolioToastApi {
	show: (id: string, message: string, type?: "success" | "error") => void;
}

interface Window {
	__portfolioDialogBound?: boolean;
	__portfolioTabsBound?: boolean;
	__portfolioAvatarBound?: boolean;
	__portfolioDropdownBound?: boolean;
	portfolioToast?: PortfolioToastApi;
}
