'use client';

import React, { useEffect, useState } from 'react';
import { AlignLeft } from 'lucide-react';

interface Heading {
  id: string;
  title: string;
  level: number;
}

interface Props {
  headings: Heading[];
}

export const DocsTOC: React.FC<Props> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id || '');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0% -60% 0%', threshold: 0.1 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="w-56 shrink-0 py-8 pl-6 hidden xl:block">
      <div className="sticky top-24 space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-bold text-[#8A919C] uppercase tracking-wider">
          <AlignLeft className="w-3.5 h-3.5" />
          <span>On this page</span>
        </div>

        <ul className="space-y-1.5 text-xs">
          {headings.map((h) => {
            const isActive = activeId === h.id;
            return (
              <li key={h.id} style={{ paddingLeft: h.level === 3 ? '12px' : '0px' }}>
                <a
                  href={`#${h.id}`}
                  className={`block transition-colors leading-relaxed ${
                    isActive
                      ? 'text-[#5B8DEF] font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {h.title}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};
