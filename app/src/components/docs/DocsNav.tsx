'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOC_SECTIONS } from '@/lib/docsData';
import { SearchModal } from './SearchModal';
import { Search, ArrowLeft, Menu, X } from 'lucide-react';

export const DocsNav: React.FC = () => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="border-b border-[#242A30] bg-[#0B0D10] sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand & Cockpit Link */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-[#3ECF8E] to-[#B98CE8] flex items-center justify-center font-bold text-black text-sm tracking-wider">
                TB
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-base text-[#EDEFF2] tracking-tight">
                  TwilightBook
                </span>
                <span className="text-xs text-[#5B8DEF] font-mono font-medium">/docs</span>
              </div>
            </Link>

            <Link
              href="/"
              className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-mono transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Trading Cockpit</span>
            </Link>
          </div>

          {/* Top Nav Sections (solana.com/docs style) */}
          <nav className="hidden lg:flex items-center gap-1">
            {DOC_SECTIONS.map((sec) => {
              const isActive = pathname.startsWith(`/docs/${sec.id}`) || (sec.id === 'start-here' && pathname === '/docs');
              return (
                <Link
                  key={sec.id}
                  href={`/docs/${sec.id}/${sec.pages[0].slug}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'bg-[#1B1F24] text-white border border-[#242A30]'
                      : 'text-[#8A919C] hover:text-white hover:bg-[#131619]'
                  }`}
                >
                  {sec.title}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search + GitHub */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#131619] hover:bg-[#1B1F24] border border-[#242A30] text-xs text-zinc-400 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search docs...</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#0B0D10] text-zinc-500 rounded border border-[#242A30]">
                ⌘K
              </kbd>
            </button>

            <a
              href="https://github.com/sadik-tofik/twilight-book"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[#131619] hover:bg-[#1B1F24] border border-[#242A30] text-zinc-400 hover:text-white transition-colors"
              title="View on GitHub"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-[#131619] border border-[#242A30] text-zinc-400"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#242A30] bg-[#131619] px-4 py-3 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded text-xs text-zinc-400 hover:text-white"
            >
              ← Back to Trading Cockpit
            </Link>
            {DOC_SECTIONS.map((sec) => (
              <Link
                key={sec.id}
                href={`/docs/${sec.id}/${sec.pages[0].slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-xs font-semibold text-zinc-300 hover:bg-[#1B1F24]"
              >
                {sec.title}
              </Link>
            ))}
          </div>
        )}
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
