'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, Edit3, ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface Props {
  filePath?: string;
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}

export const FeedbackWidget: React.FC<Props> = ({ filePath, prev, next }) => {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  const gitHubUrl = filePath
    ? `https://github.com/sadik-tofik/twilight-book/blob/main/${filePath}`
    : 'https://github.com/sadik-tofik/twilight-book';

  return (
    <div className="mt-12 pt-6 border-t border-[#242A30] space-y-6">
      {/* Prev / Next Reading Order Navigation */}
      {(prev || next) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prev ? (
            <Link
              href={prev.href}
              className="p-4 rounded-lg border border-[#242A30] bg-[#131619] hover:bg-[#1B1F24] transition-colors group flex flex-col items-start text-left"
            >
              <span className="text-[11px] text-[#8A919C] uppercase font-mono flex items-center gap-1 mb-1">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Previous
              </span>
              <span className="text-sm font-semibold text-[#EDEFF2] group-hover:text-[#5B8DEF] transition-colors">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={next.href}
              className="p-4 rounded-lg border border-[#242A30] bg-[#131619] hover:bg-[#1B1F24] transition-colors group flex flex-col items-end text-right sm:col-start-2"
            >
              <span className="text-[11px] text-[#8A919C] uppercase font-mono flex items-center gap-1 mb-1">
                Next
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="text-sm font-semibold text-[#EDEFF2] group-hover:text-[#5B8DEF] transition-colors">
                {next.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}

      {/* Helpful? and Edit page links */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 bg-[#131619] rounded-lg border border-[#242A30] text-xs">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 font-medium">Was this page helpful?</span>
          {feedback ? (
            <span className="flex items-center gap-1.5 text-[#3ECF8E] font-medium font-mono text-[11px]">
              <Check className="w-3.5 h-3.5" /> Thank you for your feedback!
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFeedback('yes')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1B1F24] hover:bg-[#242A30] text-zinc-300 hover:text-white border border-[#242A30] transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Yes
              </button>
              <button
                onClick={() => setFeedback('no')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1B1F24] hover:bg-[#242A30] text-zinc-300 hover:text-white border border-[#242A30] transition-colors"
              >
                <ThumbsDown className="w-3.5 h-3.5" /> No
              </button>
            </div>
          )}
        </div>

        <a
          href={gitHubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-zinc-400 hover:text-[#5B8DEF] transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit this page on GitHub</span>
        </a>
      </div>
    </div>
  );
};
