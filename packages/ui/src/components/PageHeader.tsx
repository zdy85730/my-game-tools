import type { ReactNode } from 'react';

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <section className="mgt-page-header">
      <div className="mgt-page-header__copy">
        {eyebrow ? <span className="mgt-chip">{eyebrow}</span> : null}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="mgt-page-header__actions">{actions}</div> : null}
    </section>
  );
}
