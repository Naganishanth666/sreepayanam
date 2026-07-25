import React from 'react';

/**
 * Smartly renders text with support for double newlines (paragraphs),
 * single newlines (line breaks), and markdown bold formatting (**text**).
 */
export const renderRichText = (text) => {
  if (!text) return null;
  
  // Split by double newlines first to create paragraphs
  return text.split('\n\n').map((paragraph, pIdx) => {
    const lines = paragraph.split('\n');
    
    return (
      <div key={pIdx} style={{ marginBottom: '12px', lineHeight: '1.7' }}>
        {lines.map((line, lIdx) => {
          // Parse markdown bold **text** within each line
          const parts = [];
          const regex = /\*\*(.*?)\*\*/g;
          let match;
          let lastIndex = 0;
          
          while ((match = regex.exec(line)) !== null) {
            // Add preceding text
            if (match.index > lastIndex) {
              parts.push(line.substring(lastIndex, match.index));
            }
            // Add bold text
            parts.push(<strong key={match.index} style={{ color: 'var(--text-main)', fontWeight: '600' }}>{match[1]}</strong>);
            lastIndex = regex.lastIndex;
          }
          
          // Add remaining text
          if (lastIndex < line.length) {
            parts.push(line.substring(lastIndex));
          }
          
          return (
            <React.Fragment key={lIdx}>
              {parts}
              {lIdx < lines.length - 1 && <br />}
            </React.Fragment>
          );
        })}
      </div>
    );
  });
};
