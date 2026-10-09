'use client';

import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormattedCardContentProps {
  text: string;
  isFlipped?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Renders flashcard text with support for:
 * 1. KaTeX Math expressions ($formula$ or $$formula$$)
 * 2. Cloze Deletion blanks ([...]) that can be clicked to reveal
 * 3. Highlighting key terms (**bold** or *italic*)
 */
export default function FormattedCardContent({
  text,
  isFlipped = false,
  style,
  className = '',
}: FormattedCardContentProps) {
  const [revealedClozes, setRevealedClozes] = useState<Record<number, boolean>>({});

  if (!text) return null;

  // Render KaTeX formula safely
  const renderMath = (math: string, displayMode = false) => {
    try {
      const html = katex.renderToString(math.trim(), {
        displayMode,
        throwOnError: false,
      });
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (_) {
      return <span>{math}</span>;
    }
  };

  // Split by $$ (display math) first, then $ (inline math)
  const renderTextWithMath = (segment: string) => {
    // Check if segment contains $...$
    const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
    const parts = segment.split(mathRegex);

    return parts.map((part, idx) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const mathContent = part.slice(2, -2);
        return (
          <div key={idx} style={{ margin: '0.5rem 0', overflowX: 'auto' }}>
            {renderMath(mathContent, true)}
          </div>
        );
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const mathContent = part.slice(1, -1);
        return <span key={idx}>{renderMath(mathContent, false)}</span>;
      }

      // Check for Cloze deletion: [...]
      const clozeRegex = /(\[\.\.\.\])/g;
      const subParts = part.split(clozeRegex);

      return subParts.map((sub, subIdx) => {
        if (sub === '[...]') {
          const clozeKey = idx * 100 + subIdx;
          const isRevealed = isFlipped || revealedClozes[clozeKey];

          return (
            <span
              key={`cloze-${subIdx}`}
              onClick={(e) => {
                e.stopPropagation();
                setRevealedClozes((prev) => ({ ...prev, [clozeKey]: !prev[clozeKey] }));
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                margin: '0 4px',
                borderRadius: '6px',
                backgroundColor: isRevealed ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.25)',
                border: isRevealed ? '1px solid rgba(56, 189, 248, 0.5)' : '1px dashed #f59e0b',
                color: isRevealed ? '#38bdf8' : '#fbbf24',
                fontWeight: 700,
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.2s ease',
              }}
              title="Cevabı görmek için tıkla"
            >
              {isRevealed ? '✓ Açık' : '[ ? ]'}
            </span>
          );
        }

        // Simple bold formatting: **text**
        const boldRegex = /(\*\*[^*]+\*\*)/g;
        const boldParts = sub.split(boldRegex);

        return boldParts.map((b, bIdx) => {
          if (b.startsWith('**') && b.endsWith('**')) {
            return (
              <strong key={bIdx} style={{ color: '#38bdf8', fontWeight: 700 }}>
                {b.slice(2, -2)}
              </strong>
            );
          }
          return <span key={bIdx}>{b}</span>;
        });
      });
    });
  };

  return (
    <div className={className} style={{ ...style, wordBreak: 'break-word' }}>
      {renderTextWithMath(text)}
    </div>
  );
}
