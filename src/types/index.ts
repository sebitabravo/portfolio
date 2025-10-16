import type { CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export type WorkExperience = CollectionEntry<'work'>;

export interface SiteConfig {
	name: string;
	title: string;
	description: string;
	author: string;
	email: string;
	social: {
		github?: string;
		linkedin?: string;
		twitter?: string;
		instagram?: string;
	};
}

export interface NavItem {
	label: string;
	href: string;
}
