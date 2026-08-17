type ThemePreference = 'light' | 'dark' | 'system'

let themeCleanup: (() => void) | null = null

export function initThemeToggle() {
  // Limpiar listeners de navegaciones anteriores (View Transitions)
  themeCleanup?.()
  const ac = new AbortController()
  const { signal } = ac
  const THEME_KEY = 'theme'

  const toggleElement = document.getElementById('theme-toggle')
  const menuElement = document.getElementById('theme-menu')
  const wrapperElement = document.getElementById('theme-toggle-wrapper')

  if (!(toggleElement instanceof HTMLButtonElement)) return
  if (!(menuElement instanceof HTMLElement)) return
  if (!(wrapperElement instanceof HTMLElement)) return

  const toggle = toggleElement
  const menu = menuElement
  const wrapper = wrapperElement

  function getThemePreference(): ThemePreference {
    const value = localStorage.getItem(THEME_KEY)
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value
    }

    return 'system'
  }

  function setThemePreference(theme: ThemePreference) {
    localStorage.setItem(THEME_KEY, theme)
  }

  function getSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function updateThemeIcon(theme: ThemePreference) {
    const lightIcon = wrapper.querySelector('.theme-icon-light')
    const darkIcon = wrapper.querySelector('.theme-icon-dark')
    const systemIcon = wrapper.querySelector('.theme-icon-system')
    const themeText = document.getElementById('current-theme')
    const checkLight = wrapper.querySelector('.check-light')
    const checkDark = wrapper.querySelector('.check-dark')
    const checkSystem = wrapper.querySelector('.check-system')
    const optionLight = wrapper.querySelector('[data-theme="light"]')
    const optionDark = wrapper.querySelector('[data-theme="dark"]')
    const optionSystem = wrapper.querySelector('[data-theme="system"]')

    if (!lightIcon || !darkIcon || !systemIcon) return

    lightIcon.classList.add('hidden')
    darkIcon.classList.add('hidden')
    systemIcon.classList.add('hidden')

    if (checkLight && checkDark && checkSystem) {
      checkLight.classList.add('hidden')
      checkDark.classList.add('hidden')
      checkSystem.classList.add('hidden')
    }

    const labels = {
      light: wrapper.dataset.i18nLight || 'Light',
      dark: wrapper.dataset.i18nDark || 'Dark',
      system: wrapper.dataset.i18nSystem || 'System',
    }

    if (theme === 'light') {
      lightIcon.classList.remove('hidden')
      if (themeText) themeText.textContent = labels.light
      if (checkLight) checkLight.classList.remove('hidden')
    } else if (theme === 'dark') {
      darkIcon.classList.remove('hidden')
      if (themeText) themeText.textContent = labels.dark
      if (checkDark) checkDark.classList.remove('hidden')
    } else {
      systemIcon.classList.remove('hidden')
      if (themeText) themeText.textContent = labels.system
      if (checkSystem) checkSystem.classList.remove('hidden')
    }

    optionLight?.setAttribute('aria-checked', String(theme === 'light'))
    optionDark?.setAttribute('aria-checked', String(theme === 'dark'))
    optionSystem?.setAttribute('aria-checked', String(theme === 'system'))
  }

  function applyTheme(theme: ThemePreference) {
    const effectiveTheme = theme === 'system' ? getSystemTheme() : theme
    const html = document.documentElement

    if (effectiveTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }

    updateThemeIcon(theme)
  }

  // Initialize theme
  const currentTheme = getThemePreference()
  applyTheme(currentTheme)

  // Toggle menu
  toggle.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    const isOpen = !menu.classList.toggle('hidden')
    toggle.setAttribute('aria-expanded', String(isOpen))
  }, { signal })

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target as Node)) {
      menu.classList.add('hidden')
      toggle.setAttribute('aria-expanded', 'false')
    }
  }, { signal })

  // Theme selection
  const themeButtons = menu.querySelectorAll('.theme-option')
  themeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault()
      const theme = (e.currentTarget as HTMLElement).dataset.theme
      if (theme === 'light' || theme === 'dark' || theme === 'system') {
        setThemePreference(theme)
        applyTheme(theme)
        menu.classList.add('hidden')
        toggle.setAttribute('aria-expanded', 'false')
      }
    }, { signal })
  })

  // Listen for system theme changes
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  const mqHandler = () => {
    if (getThemePreference() === 'system') {
      applyTheme('system')
    }
  }
  mql.addEventListener('change', mqHandler)

  // Keyboard navigation
  function openMenu() {
    menu.classList.remove('hidden')
    toggle.setAttribute('aria-expanded', 'true')
    const items = menu.querySelectorAll<HTMLButtonElement>('.theme-option')
    items[0]?.focus()
  }

  function closeMenu() {
    menu.classList.add('hidden')
    toggle.setAttribute('aria-expanded', 'false')
    toggle.focus()
  }

  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openMenu()
    }
  }, { signal })

  menu.addEventListener('keydown', (e) => {
    const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('.theme-option'))
    const current = document.activeElement as HTMLElement
    const idx = items.indexOf(current as HTMLButtonElement)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        items[(idx + 1) % items.length]?.focus()
        break
      case 'ArrowUp':
        e.preventDefault()
        items[(idx - 1 + items.length) % items.length]?.focus()
        break
      case 'Home':
        e.preventDefault()
        items[0]?.focus()
        break
      case 'End':
        e.preventDefault()
        items[items.length - 1]?.focus()
        break
      case 'Escape':
        e.preventDefault()
        closeMenu()
        break
    }
  }, { signal })

  // Registrar cleanup para la próxima navegación
  themeCleanup = () => {
    ac.abort()
    mql.removeEventListener('change', mqHandler)
  }
}
