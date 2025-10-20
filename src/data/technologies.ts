export interface Technology {
	name: string;
	icon: string; // Emoji fallback for technologies without SVG components
}

export const technologies: Technology[] = [
	{ name: 'React', icon: '⚛️' },
	{ name: 'TypeScript', icon: '📘' },
	{ name: 'Next.js', icon: '▲' },
	{ name: 'Node.js', icon: '🟢' },
	{ name: 'PostgreSQL', icon: '🐘' },
	{ name: 'Git', icon: '🔀' },
	{ name: 'GitHub', icon: '🐙' },
	{ name: 'Docker', icon: '🐳' },
	{ name: 'Astro', icon: '🚀' },
	{ name: 'Tailwind CSS', icon: '💨' },
	{ name: 'Bootstrap', icon: '🎨' },
	{ name: 'Cloudflare', icon: '☁️' },
	{ name: 'Django', icon: '🌿' },
	{ name: 'JavaScript', icon: '🟨' }
];
