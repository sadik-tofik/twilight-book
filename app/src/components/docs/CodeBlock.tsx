'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Props {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<Props> = ({ code, language = 'typescript' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-[#242A30] bg-[#0B0D10]">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#131619] border-b border-[#242A30] text-xs font-mono text-[#8A919C]">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-[#1B1F24] text-zinc-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span className="text-[11px] text-[#3ECF8E]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-[#EDEFF2] overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};
