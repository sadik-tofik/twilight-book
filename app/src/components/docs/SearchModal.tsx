'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Hash, BookOpen } from 'lucide-react';
import { DOC_PAGES, DOC_SECTIONS } from '@/lib/docsData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  title: string;
  subtitle: string;
  href: string;
  type: 'page' | 'heading';
}

export const SearchModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Index all pages and headings
  const allItems: SearchResult[] = [];
  for (const [path, page] of Object.entries(DOC_PAGES)) {
    allItems.push({
      title: page.title,
      subtitle: `${page.sectionTitle} · ${page.description}`,
      href: `/docs/${page.section}/${page.slug}`,
      type: 'page',
    });
    for (const h of page.headings) {
      allItems.push({
        title: h.title,
        subtitle: `${page.title} › ${h.title}`,
        href: `/docs/${page.section}/${page.slug}#${h.id}`,
        type: 'heading',
      });
    }
  }

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : allItems.slice(0, 6);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      router.push(filtered[selectedIndex].href);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-[#131619] border border-[#242A30] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center border-b border-[#242A30] px-4 py-3">
          <Search className="w-5 h-5 text-zinc-400 mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search TwilightBook documentation..."
            className="w-full bg-transparent text-sm text-[#EDEFF2] placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#1B1F24]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 font-mono">
              No documentation matches &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={`${item.href}-${index}`}
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#1B1F24] text-white' : 'text-zinc-300 hover:bg-[#1B1F24]/50'
                  }`}
                >
                  <div className="mt-0.5 p-1 rounded bg-[#0B0D10] text-zinc-400">
                    {item.type === 'page' ? (
                      <BookOpen className="w-3.5 h-3.5 text-[#5B8DEF]" />
                    ) : (
                      <Hash className="w-3.5 h-3.5 text-[#B98CE8]" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-semibold">{item.title}</div>
                    <div className="text-[11px] text-zinc-500 truncate font-mono mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-[#0B0D10] border-t border-[#242A30] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span>Navigate with ↑ ↓ · Select with Enter</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
