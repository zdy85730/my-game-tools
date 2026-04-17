import type { ReactNode } from 'react';

export interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  footer?: ReactNode;
}

export function ToolCard({ title, description, href, footer }: ToolCardProps) {
  return (
    <a className="mgt-tool-card" href={href}>
      <div className="mgt-tool-card__header">
        <span className="mgt-tool-card__stripe" />
        <h3>{title}</h3>
      </div>
      <p>{description}</p>
      {footer ? <div className="mgt-tool-card__footer">{footer}</div> : null}
    </a>
  );
}
