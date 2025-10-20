/**
 * Tech Skills Color Mapping
 *
 * Colors are designed to work with both light and dark modes.
 * Each technology has a brand color that's visible and accessible in both themes.
 */

export interface TechStyle {
  bg: string
  text: string
  border: string
  hoverBg: string
}

export const techColors: Record<string, TechStyle> = {
  // Frontend Frameworks & Libraries
  'React': {
    bg: 'bg-[#61DAFB]/10 dark:bg-[#61DAFB]/20',
    text: 'text-[#00A8D8]',
    border: 'border-[#61DAFB]/30',
    hoverBg: 'hover:bg-[#61DAFB]/20 dark:hover:bg-[#61DAFB]/30'
  },
  'Next.js': {
    bg: 'bg-transparent dark:bg-white/10',
    text: 'text-black dark:text-white',
    border: 'border-black/20 dark:border-white/20',
    hoverBg: 'hover:bg-black/20 dark:hover:bg-white/20'
  },
  'Vue.js': {
    bg: 'bg-[#42b883]/10 dark:bg-[#42b883]/20',
    text: 'text-[#2D8F6E] dark:text-[#42b883]',
    border: 'border-[#42b883]/30',
    hoverBg: 'hover:bg-[#42b883]/20 dark:hover:bg-[#42b883]/30'
  },
  'Astro': {
    bg: 'bg-[#FF5D01]/10 dark:bg-[#FF5D01]/20',
    text: 'text-[#CC4B00] dark:text-[#FF5D01]',
    border: 'border-[#FF5D01]/30',
    hoverBg: 'hover:bg-[#FF5D01]/20 dark:hover:bg-[#FF5D01]/30'
  },

  // Languages
  'TypeScript': {
    bg: 'bg-[#3178C6]/10 dark:bg-[#3178C6]/20',
    text: 'text-[#3178C6] dark:text-[#3178C6]',
    border: 'border-[#3178C6]/30',
    hoverBg: 'hover:bg-[#3178C6]/20 dark:hover:bg-[#3178C6]/30'
  },
  'JavaScript': {
    bg: 'bg-[#F7DF1E]/10 dark:bg-[#F7DF1E]/20',
    text: 'text-[#B7A00D] dark:text-[#F7DF1E]',
    border: 'border-[#F7DF1E]/30',
    hoverBg: 'hover:bg-[#F7DF1E]/20 dark:hover:bg-[#F7DF1E]/30'
  },
  'Python': {
    bg: 'bg-[#3776AB]/10 dark:bg-[#3776AB]/20',
    text: 'text-[#3776AB] dark:text-[#3776AB]',
    border: 'border-[#3776AB]/30',
    hoverBg: 'hover:bg-[#3776AB]/20 dark:hover:bg-[#3776AB]/30'
  },

  // Styling
  'Tailwind CSS': {
    bg: 'bg-[#06B6D4]/10 dark:bg-[#06B6D4]/20',
    text: 'text-[#0596A8] dark:text-[#06B6D4]',
    border: 'border-[#06B6D4]/30',
    hoverBg: 'hover:bg-[#06B6D4]/20 dark:hover:bg-[#06B6D4]/30'
  },
  'CSS': {
    bg: 'bg-[#1572B6]/10 dark:bg-[#1572B6]/20',
    text: 'text-[#1572B6] dark:text-[#1572B6]',
    border: 'border-[#1572B6]/30',
    hoverBg: 'hover:bg-[#1572B6]/20 dark:hover:bg-[#1572B6]/30'
  },
  'SCSS': {
    bg: 'bg-[#CC6699]/10 dark:bg-[#CC6699]/20',
    text: 'text-[#A85B7F] dark:text-[#CC6699]',
    border: 'border-[#CC6699]/30',
    hoverBg: 'hover:bg-[#CC6699]/20 dark:hover:bg-[#CC6699]/30'
  },

  // Backend & APIs
  'Node.js': {
    bg: 'bg-[#339933]/10 dark:bg-[#339933]/20',
    text: 'text-[#339933] dark:text-[#339933]',
    border: 'border-[#339933]/30',
    hoverBg: 'hover:bg-[#339933]/20 dark:hover:bg-[#339933]/30'
  },
  'GraphQL': {
    bg: 'bg-[#E10098]/10 dark:bg-[#E10098]/20',
    text: 'text-[#E10098] dark:text-[#E10098]',
    border: 'border-[#E10098]/30',
    hoverBg: 'hover:bg-[#E10098]/20 dark:hover:bg-[#E10098]/30'
  },
  'REST': {
    bg: 'bg-[#009688]/10 dark:bg-[#009688]/20',
    text: 'text-[#009688] dark:text-[#009688]',
    border: 'border-[#009688]/30',
    hoverBg: 'hover:bg-[#009688]/20 dark:hover:bg-[#009688]/30'
  },

  // State Management
  'Redux': {
    bg: 'bg-[#764ABC]/10 dark:bg-[#764ABC]/20',
    text: 'text-[#764ABC] dark:text-[#764ABC]',
    border: 'border-[#764ABC]/30',
    hoverBg: 'hover:bg-[#764ABC]/20 dark:hover:bg-[#764ABC]/30'
  },

  // Testing
  'Jest': {
    bg: 'bg-[#C21325]/10 dark:bg-[#C21325]/20',
    text: 'text-[#C21325] dark:text-[#C21325]',
    border: 'border-[#C21325]/30',
    hoverBg: 'hover:bg-[#C21325]/20 dark:hover:bg-[#C21325]/30'
  },
  'Cypress': {
    bg: 'bg-[#17202C]/10 dark:bg-[#69D3A7]/20',
    text: 'text-[#17202C] dark:text-[#69D3A7]',
    border: 'border-[#17202C]/20 dark:border-[#69D3A7]/30',
    hoverBg: 'hover:bg-[#17202C]/20 dark:hover:bg-[#69D3A7]/30'
  },

  // Build Tools & Bundlers
  'Webpack': {
    bg: 'bg-[#8DD6F9]/10 dark:bg-[#8DD6F9]/20',
    text: 'text-[#6BADD3] dark:text-[#8DD6F9]',
    border: 'border-[#8DD6F9]/30',
    hoverBg: 'hover:bg-[#8DD6F9]/20 dark:hover:bg-[#8DD6F9]/30'
  },
  'Vite': {
    bg: 'bg-[#646CFF]/10 dark:bg-[#646CFF]/20',
    text: 'text-[#646CFF] dark:text-[#646CFF]',
    border: 'border-[#646CFF]/30',
    hoverBg: 'hover:bg-[#646CFF]/20 dark:hover:bg-[#646CFF]/30'
  },

  // Databases
  'MongoDB': {
    bg: 'bg-[#47A248]/10 dark:bg-[#47A248]/20',
    text: 'text-[#47A248] dark:text-[#47A248]',
    border: 'border-[#47A248]/30',
    hoverBg: 'hover:bg-[#47A248]/20 dark:hover:bg-[#47A248]/30'
  },
  'PostgreSQL': {
    bg: 'bg-[#4169E1]/10 dark:bg-[#4169E1]/20',
    text: 'text-[#4169E1] dark:text-[#4169E1]',
    border: 'border-[#4169E1]/30',
    hoverBg: 'hover:bg-[#4169E1]/20 dark:hover:bg-[#4169E1]/30'
  },
  'MySQL': {
    bg: 'bg-[#4479A1]/10 dark:bg-[#4479A1]/20',
    text: 'text-[#4479A1] dark:text-[#4479A1]',
    border: 'border-[#4479A1]/30',
    hoverBg: 'hover:bg-[#4479A1]/20 dark:hover:bg-[#4479A1]/30'
  },

  // CMS & Misc
  'WordPress': {
    bg: 'bg-[#21759B]/10 dark:bg-[#21759B]/20',
    text: 'text-[#21759B] dark:text-[#21759B]',
    border: 'border-[#21759B]/30',
    hoverBg: 'hover:bg-[#21759B]/20 dark:hover:bg-[#21759B]/30'
  },
  'jQuery': {
    bg: 'bg-[#0769AD]/10 dark:bg-[#0769AD]/20',
    text: 'text-[#0769AD] dark:text-[#0769AD]',
    border: 'border-[#0769AD]/30',
    hoverBg: 'hover:bg-[#0769AD]/20 dark:hover:bg-[#0769AD]/30'
  },
  'HTML': {
    bg: 'bg-[#E34F26]/10 dark:bg-[#E34F26]/20',
    text: 'text-[#E34F26] dark:text-[#E34F26]',
    border: 'border-[#E34F26]/30',
    hoverBg: 'hover:bg-[#E34F26]/20 dark:hover:bg-[#E34F26]/30'
  },
  'Bootstrap': {
    bg: 'bg-[#7952B3]/10 dark:bg-[#7952B3]/20',
    text: 'text-[#7952B3] dark:text-[#7952B3]',
    border: 'border-[#7952B3]/30',
    hoverBg: 'hover:bg-[#7952B3]/20 dark:hover:bg-[#7952B3]/30'
  },
  'Django': {
    bg: 'bg-[#092E20]/10 dark:bg-[#44B78B]/20',
    text: 'text-[#092E20] dark:text-[#44B78B]',
    border: 'border-[#092E20]/20 dark:border-[#44B78B]/30',
    hoverBg: 'hover:bg-[#092E20]/20 dark:hover:bg-[#44B78B]/30'
  },
  'Docker': {
    bg: 'bg-[#2496ED]/10 dark:bg-[#2496ED]/20',
    text: 'text-[#2496ED] dark:text-[#2496ED]',
    border: 'border-[#2496ED]/30',
    hoverBg: 'hover:bg-[#2496ED]/20 dark:hover:bg-[#2496ED]/30'
  },
  'REST API': {
    bg: 'bg-[#009688]/10 dark:bg-[#009688]/20',
    text: 'text-[#009688] dark:text-[#009688]',
    border: 'border-[#009688]/30',
    hoverBg: 'hover:bg-[#009688]/20 dark:hover:bg-[#009688]/30'
  },
  'JWT': {
    bg: 'bg-[#000000]/10 dark:bg-[#FB015B]/20',
    text: 'text-[#000000] dark:text-[#FB015B]',
    border: 'border-[#000000]/20 dark:border-[#FB015B]/30',
    hoverBg: 'hover:bg-[#000000]/20 dark:hover:bg-[#FB015B]/30'
  },
  'IoT': {
    bg: 'bg-[#00C7B7]/10 dark:bg-[#00C7B7]/20',
    text: 'text-[#00A89D] dark:text-[#00C7B7]',
    border: 'border-[#00C7B7]/30',
    hoverBg: 'hover:bg-[#00C7B7]/20 dark:hover:bg-[#00C7B7]/30'
  },
  'Axios': {
    bg: 'bg-[#5A29E4]/10 dark:bg-[#5A29E4]/20',
    text: 'text-[#5A29E4] dark:text-[#5A29E4]',
    border: 'border-[#5A29E4]/30',
    hoverBg: 'hover:bg-[#5A29E4]/20 dark:hover:bg-[#5A29E4]/30'
  },
  'Git': {
    bg: 'bg-[#F05032]/10 dark:bg-[#F05032]/20',
    text: 'text-[#F05032] dark:text-[#F05032]',
    border: 'border-[#F05032]/30',
    hoverBg: 'hover:bg-[#F05032]/20 dark:hover:bg-[#F05032]/30'
  }
}

/**
 * Get the style for a tech skill
 * Returns default style if tech not found in mapping
 */
export function getTechStyle(tech: string): TechStyle {
  return techColors[tech] || {
    bg: 'bg-neutral-100 dark:bg-neutral-800',
    text: 'text-neutral-900 dark:text-neutral-100',
    border: 'border-neutral-300 dark:border-neutral-700',
    hoverBg: 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
  }
}
