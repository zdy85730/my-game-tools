import { type ReactNode, useEffect, useState } from 'react';

import { type ThemeMode, defaultThemeMode, themeStorageKey } from '@my-game-tools/design-tokens';

export interface AppShellProps {
  brand: string;
  navigation?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return defaultThemeMode;
  }

  const stored = window.localStorage.getItem(themeStorageKey);

  return stored === 'dark' ? 'dark' : defaultThemeMode;
}

export function AppShell({ brand, navigation, toolbar, children, footer }: AppShellProps) {
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  return (
    <div className="mgt-shell">
      <header className="mgt-topbar">
        <div className="mgt-topbar__inner">
          <div className="mgt-topbar__brand">
            <span className="mgt-chip mgt-chip--ghost">My Game Tools</span>
            <strong>{brand}</strong>
          </div>
          <div className="mgt-topbar__actions">
            {navigation ? <nav className="mgt-topbar__nav">{navigation}</nav> : null}
            {toolbar}
            <button
              aria-label="Toggle theme"
              className="mgt-theme-toggle"
              type="button"
              onClick={() => {
                setTheme((current) => (current === 'light' ? 'dark' : 'light'));
              }}
            >
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>
      </header>
      <main className="mgt-shell__content">
        <div className="mgt-shell__inner">{children}</div>
      </main>
      <footer className="mgt-shell__footer">
        <div className="mgt-shell__inner">
          {footer ?? 'Pure frontend first. Shared system always.'}
        </div>
      </footer>
    </div>
  );
}
