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
	{ name: 'JavaScript', icon: '🟨' },
	{ name: 'REST API', icon: '🔌' },
	{ name: 'JWT', icon: '🔑' },
	{ name: 'IoT', icon: '📡' },
	{ name: 'Axios', icon: '🌐' },
	{ name: 'AWS', icon: '☁️' },
	{ name: 'Python', icon: '🐍' },
	{ name: 'Vercel', icon: '▲' },
	{ name: 'PHP', icon: '🐘' },
	{ name: 'Laravel', icon: '🔺' },
	{ name: 'Inertia.js', icon: '⚡' },
];
