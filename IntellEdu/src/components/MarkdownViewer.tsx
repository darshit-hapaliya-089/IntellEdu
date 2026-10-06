import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Terminal, Sparkles, Quote, BookOpen, ArrowRight } from 'lucide-react';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { cx } from '../utils/cx';

export interface MarkdownViewerProps {
  content: string;
  compact?: boolean;
  className?: string;
}

/**
 * Luxury Code Block with macOS window controls & copy button
 */
const CodeBlock: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* macOS Terminal Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block shadow-2xs"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block shadow-2xs"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block shadow-2xs"></span>
          </div>
          <div className="ml-3 flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>adaptive_recommender.py</span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy code"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Text */}
      <pre className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-emerald-300 bg-slate-950/95 scrollbar-none">
        <code>{children}</code>
      </pre>
    </div>
  );
};

/**
 * Ultra-Luxury Markdown Viewer with High-Contrast Typography & Visual Richness
 */
export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  compact = false,
  className = ''
}) => {
  const { highGraphics } = usePerformanceMode();

  return (
    <div
      className={cx(
        'markdown-viewer space-y-4 text-slate-800 antialiased',
        compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <div className="pb-3 mb-4 border-b border-slate-200/80">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 flex-wrap">
                <span className={cx(
                  highGraphics
                    ? 'bg-linear-to-r from-indigo-700 via-purple-700 to-indigo-900 bg-clip-text text-transparent'
                    : 'text-slate-900'
                )}>
                  {children}
                </span>
              </h1>
            </div>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-6 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-indigo-600 inline-block"></span>
              <span>{children}</span>
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-5 mb-2.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{children}</span>
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-slate-700 font-medium leading-relaxed my-2.5 text-sm sm:text-base">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-extrabold text-indigo-950 bg-indigo-50/90 px-1.5 py-0.5 rounded-md border border-indigo-200/60 inline-block my-0.5">
              {children}
            </strong>
          ),
          ul: ({ children }) => (
            <ul className="my-3 space-y-2 pl-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 space-y-3 pl-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2.5 text-slate-700 font-medium leading-relaxed text-xs sm:text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0"></span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className={cx(
              'my-5 p-4 sm:p-5 rounded-2xl border-l-4 transition-all',
              highGraphics
                ? 'bg-linear-to-r from-indigo-50/80 to-purple-50/40 border-indigo-500 shadow-xs'
                : 'bg-slate-100 border-slate-500'
            )}>
              <div className="flex items-start gap-3">
                <Quote className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm font-semibold text-slate-800 italic leading-relaxed">
                  {children}
                </div>
              </div>
            </blockquote>
          ),
          code: ({ node, className, children, ...props }) => {
            const isBlock = String(children).includes('\n') || (className && className.includes('language-'));
            if (isBlock) {
              return <CodeBlock className={className}>{children}</CodeBlock>;
            }
            return (
              <code
                className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-200/70"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;

