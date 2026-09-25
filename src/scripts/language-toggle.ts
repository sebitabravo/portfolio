import { homeSectionIds } from '@/lib/home-sections'

let languageController: AbortController | null = null

export function initLanguageToggle() {
  languageController?.abort()
  languageController = new AbortController()
  const { signal } = languageController

  const toggle = document.getElementById('language-toggle')
  const menu = document.getElementById('language-menu')
  const wrapper = document.getElementById('language-toggle-wrapper')
  const currentLangEl = document.getElementById('current-language')

  if (!toggle || !menu || !wrapper || !currentLangEl) return
  const languageToggle = toggle
  const languageMenu = menu

  function updateLanguageDisplay(lang: string): void {
    if (!currentLangEl || !wrapper || !toggle) return

    currentLangEl.textContent = lang.toUpperCase()

    const labelTemplate = wrapper.getAttribute(`data-label-template-${lang}`)
    if (labelTemplate) toggle.setAttribute('aria-label', labelTemplate.replace('{code}', lang.toUpperCase()))

    const checkEs = wrapper.querySelector('.check-es')
    const checkEn = wrapper.querySelector('.check-en')
    const optionEs = wrapper.querySelector('[data-lang="es"]')
    const optionEn = wrapper.querySelector('[data-lang="en"]')

    if (checkEs && checkEn) {
      checkEs.classList.toggle('hidden', lang !== 'es')
      checkEn.classList.toggle('hidden', lang !== 'en')
    }
    optionEs?.setAttribute('aria-checked', String(lang === 'es'))
    optionEn?.setAttribute('aria-checked', String(lang === 'en'))
    languageMenu.querySelectorAll<HTMLButtonElement>('.language-option').forEach(option => {
      option.tabIndex = option.dataset.lang === lang ? 0 : -1
    })
  }

  function setMenuOpen(isOpen: boolean) {
    languageMenu.classList.toggle('hidden', !isOpen)
    languageToggle.setAttribute('aria-expanded', String(isOpen))
  }

  function switchLanguage(lang: string) {
    const currentPath = window.location.pathname
    const isEnglish = (currentPath === '/en' || currentPath.startsWith('/en/'))
    if ((lang === 'en') === isEnglish) return

    function navigate(path: string, search = window.location.search, hash = window.location.hash) {
      if (!path.startsWith('/') || path.startsWith('//')) return
      const destination = new URL(path + search + hash, window.location.origin)
      if (destination.origin !== window.location.origin) return
      window.location.assign(destination.href)
    }

    if (/^\/(?:en\/)?blog\/[^/]+\/?$/.test(currentPath)) {
      const alternate = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${lang}"]`)
      if (alternate) {
        const href = alternate.getAttribute('href') ?? alternate.href
        const url = new URL(href, window.location.href)
        navigate(
          url.pathname,
          href.split('#')[0].includes('?') ? url.search : window.location.search,
          href.includes('#') ? url.hash : window.location.hash,
        )
        return
      }
      // Spanish posts have generated English same-slug fallback pages;
      // English-only posts do not have a generated Spanish counterpart.
      if (isEnglish) {
        navigate('/blog')
        return
      }
    }

    let hash = window.location.hash
    if (currentPath === '/' || currentPath === '/en' || currentPath === '/en/') {
      const sourceSections = homeSectionIds[isEnglish ? 'en' : 'es']
      const targetSections = homeSectionIds[lang === 'en' ? 'en' : 'es']
      const section = (Object.keys(sourceSections) as Array<keyof typeof sourceSections>)
        .find(key => hash === `#${sourceSections[key]}`)
      if (section) hash = `#${targetSections[section]}`
    }

    if (lang === 'en') {
      navigate('/en' + (currentPath === '/' ? '/' : currentPath), window.location.search, hash)
    } else {
      const targetPath = currentPath.replace(/^\/en/, '') || '/'
      navigate(targetPath, window.location.search, hash)
    }
  }

  function getCurrentLanguageFromUrl(): string {
    const currentPath = window.location.pathname
    return (currentPath === '/en' || currentPath.startsWith('/en/')) ? 'en' : 'es'
  }

  const currentLang = getCurrentLanguageFromUrl()
  updateLanguageDisplay(currentLang)

  toggle.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuOpen(languageMenu.classList.contains('hidden'))
  }, { signal })

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target as Node)) {
      setMenuOpen(false)
    }
  }, { signal })

  const langButtons = languageMenu.querySelectorAll('.language-option')
  langButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault()
      const lang = (e.currentTarget as HTMLElement).dataset.lang
      if (lang) {
        updateLanguageDisplay(lang)
        setMenuOpen(false)
        if (lang === getCurrentLanguageFromUrl()) {
          languageToggle.focus()
        } else {
          switchLanguage(lang)
        }
      }
    }, { signal })
  })

  languageMenu.addEventListener('focusout', (e) => {
    if (!languageMenu.contains(e.relatedTarget as Node | null)) setMenuOpen(false)
  }, { signal })

  function focusOption(option: HTMLButtonElement | undefined) {
    if (!option) return
    languageMenu.querySelectorAll<HTMLButtonElement>('.language-option').forEach(item => {
      item.tabIndex = item === option ? 0 : -1
    })
    option.focus()
  }

  function openMenu() {
    setMenuOpen(true)
    const items = languageMenu.querySelectorAll<HTMLButtonElement>('.language-option')
    focusOption(items[0])
  }

  function closeMenu() {
    setMenuOpen(false)
    toggle!.focus()
  }

  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openMenu()
    }
  }, { signal })

  languageMenu.addEventListener('keydown', (e) => {
    const items = Array.from(languageMenu.querySelectorAll<HTMLButtonElement>('.language-option'))
    const current = document.activeElement as HTMLElement
    const idx = items.indexOf(current as HTMLButtonElement)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        focusOption(items[(idx + 1) % items.length])
        break
      case 'ArrowUp':
        e.preventDefault()
        focusOption(items[(idx - 1 + items.length) % items.length])
        break
      case 'Home':
        e.preventDefault()
        focusOption(items[0])
        break
      case 'End':
        e.preventDefault()
        focusOption(items[items.length - 1])
        break
      case 'Escape':
        e.preventDefault()
        closeMenu()
        break
    }
  }, { signal })
}
