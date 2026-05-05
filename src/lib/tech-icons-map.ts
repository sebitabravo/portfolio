/**
 * Mapeo de nombres de tecnologías a sus componentes de iconos SVG
 */

// Importar todos los iconos de tecnologías
import AstroIcon from '@/components/icons/AstroIcon.astro';
import Docker from '@/components/icons/Docker.astro';
import Git from '@/components/icons/Git.astro';
import Nextjs from '@/components/icons/Nextjs.astro';
import Nodejs from '@/components/icons/Nodejs.astro';
import PostgreSQL from '@/components/icons/PostgreSQL.astro';
import React from '@/components/icons/React.astro';
import TypeScript from '@/components/icons/TypeScript.astro';
import GitHub from '@/components/icons/GitHub.astro';
import TailwindCSS from '@/components/icons/TailwindCSS.astro';
import Bootstrap from '@/components/icons/Bootstrap.astro';
import Cloudflare from '@/components/icons/Cloudflare.astro';
import Django from '@/components/icons/Django.astro';
import JavaScript from '@/components/icons/JavaScript.astro';
import RestAPI from '@/components/icons/RestAPI.astro';
import JWT from '@/components/icons/JWT.astro';
import IoT from '@/components/icons/IoT.astro';
import Axios from '@/components/icons/Axios.astro';
import PHP from '@/components/icons/PHP.astro';
import Laravel from '@/components/icons/Laravel.astro';
import Inertia from '@/components/icons/Inertia.astro';
import Python from '@/components/icons/Python.astro';
import FastAPI from '@/components/icons/FastAPI.astro';
import Supabase from '@/components/icons/Supabase.astro';
import NestJS from '@/components/icons/NestJS.astro';
import Turso from '@/components/icons/Turso.astro';
import Groq from '@/components/icons/Groq.astro';
import WhatsApp from '@/components/icons/WhatsApp.astro';
import ShadcnUI from '@/components/icons/ShadcnUI.astro';
import MachineLearning from '@/components/icons/MachineLearning.astro';
import AWS from '@/components/icons/AWS.astro';
import Vercel from '@/components/icons/Vercel.astro';

export const techIconsMap = {
	React: React,
	TypeScript: TypeScript,
	'Next.js': Nextjs,
	'Node.js': Nodejs,
	PostgreSQL: PostgreSQL,
	Git: Git,
	GitHub: GitHub,
	Docker: Docker,
	Astro: AstroIcon,
	'Tailwind CSS': TailwindCSS,
	Bootstrap: Bootstrap,
	Cloudflare: Cloudflare,
	Django: Django,
	JavaScript: JavaScript,
	'REST API': RestAPI,
	JWT: JWT,
	IoT: IoT,
	Axios: Axios,
	PHP: PHP,
	Laravel: Laravel,
	'Inertia.js': Inertia,
	Python: Python,
	FastAPI: FastAPI,
	Supabase: Supabase,
	NestJS: NestJS,
	Turso: Turso,
	'Groq LLM': Groq,
	'WhatsApp API': WhatsApp,
	'shadcn/ui': ShadcnUI,
	'Machine Learning': MachineLearning,
	AWS: AWS,
	Vercel: Vercel,
} as const;

export type TechName = keyof typeof techIconsMap;

/**
 * Get the icon component for a tech
 * Returns the icon component if found, otherwise undefined
 */
export function getTechIcon(tech: string) {
	return techIconsMap[tech as TechName];
}
