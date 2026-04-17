import type { ReactNode } from 'react';

export interface PanelProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  striped?: boolean;
  children: ReactNode;
}

export function Panel({ title, description, actions, striped = false, children }: PanelProps) {
  return (
    <section className={`mgt-panel ${striped ? 'mgt-panel--striped' : ''}`}>
      <header className="mgt-panel__header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {actions}
      </header>
      <div className="mgt-panel__body">{children}</div>
    </section>
  );
}
