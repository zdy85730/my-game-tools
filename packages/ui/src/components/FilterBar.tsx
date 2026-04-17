import type { ReactNode } from 'react';

export interface FilterBarProps {
  children: ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
  return <div className="mgt-filter-bar">{children}</div>;
}
