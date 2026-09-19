import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { ActiveView } from '../types.ts';

export interface BreadcrumbItem {
  label: string;
  view?: ActiveView;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap py-1">
        <li className="flex items-center">
          <button
            id="breadcrumb-home"
            onClick={items[0]?.onClick}
            className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </button>
        </li>
        {items.slice(1).map((item, idx) => (
          <li key={idx} className="flex items-center">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 mx-1 shrink-0" />
            {item.onClick && !item.active ? (
              <button
                id={`breadcrumb-item-${idx}`}
                onClick={item.onClick}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition truncate max-w-[150px] sm:max-w-[240px]"
              >
                {item.label}
              </button>
            ) : (
              <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-[300px]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
