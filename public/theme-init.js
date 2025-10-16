(function() {
  // Prevent flash of unstyled content (FOUC)
  function getThemePreference() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  const theme = getThemePreference();
  applyTheme(theme);

  // Store theme preference
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', theme);
  }
})();
