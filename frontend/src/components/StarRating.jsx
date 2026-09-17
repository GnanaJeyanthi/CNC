import React, { useState } from 'react';

/**
 * StarRating — reusable star rating component
 * Props:
 *   value      : current rating (1-5)
 *   onChange   : called with new rating when interactive
 *   readonly   : disables interaction (display mode)
 *   size       : 'sm' | 'md' | 'lg'
 */
export default function StarRating({ value = 0, onChange, readonly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);

  const sizes = { sm: 16, md: 22, lg: 30 };
  const px = sizes[size] || 22;

  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || value) >= star;
        return (
          <svg
            key={star}
            width={px} height={px}
            viewBox="0 0 24 24"
            fill={filled ? '#f59e0b' : 'none'}
            stroke={filled ? '#f59e0b' : '#94a3b8'}
            strokeWidth="1.8"
            style={{
              cursor: readonly ? 'default' : 'pointer',
              transition: 'fill 0.15s, stroke 0.15s',
              transform: hovered === star && !readonly ? 'scale(1.18)' : 'scale(1)',
            }}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => !readonly && onChange && onChange(star)}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </span>
  );
}
