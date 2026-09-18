'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOC_SECTIONS } from '@/lib/docsData';
import { ChevronRight } from 'lucide-react';

export const DocsSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 py-8 pr-6 border-r border-[#242A30] hidden md:block">
      <div className="space-y-8 sticky top-24">
        {DOC_SECTIONS.map((section) => (
          <div key={section.id}>
            <div className="text-[11px] font-bold text-[#8A919C] uppercase tracking-wider mb-2.5 px-3">
              {section.title}
            </div>
            <ul className="space-y-0.5">
              {section.pages.map((page) => {
                const href = `/docs/${section.id}/${page.slug}`;
                const isActive = pathname === href || (section.id === 'start-here' && page.slug === 'index' && pathname === '/docs');

                return (
                  <li key={page.slug}>
                    <Link
                      href={href}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        isActive
                          ? 'bg-[#1B1F24] text-white font-semibold border-l-2 border-[#5B8DEF]'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#131619]'
                      }`}
                    >
                      <span className={section.id === 'instructions' ? 'font-mono' : ''}>
                        {page.title}
                      </span>
                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-[#5B8DEF]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
};
