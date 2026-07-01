import React, { useState, useCallback } from 'react';
import { FiStar } from 'react-icons/fi';
import { isFavPage, toggleFavPage } from './personalizationStore';

export default function FavoriteButton({ path, size = 14, tabIndex = 0, className = '' }) {
  const [fav, setFav] = useState(() => isFavPage(path));

  const toggle = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const next = toggleFavPage(path);
    setFav(next.includes(path));
  }, [path]);

  return (
    <button
      onClick={toggle}
      tabIndex={tabIndex}
      className={`p-1.5 rounded transition-colors flex-shrink-0 ${className}`}
      style={{ color: fav ? '#F59E0B' : 'var(--text-5)' }}
      aria-label={fav ? `Remove ${path} from favorites` : `Add ${path} to favorites`}
      aria-pressed={fav}
      title={fav ? 'Remove from favorites' : 'Add to favorites'}
      onMouseEnter={e => { if (!fav) e.currentTarget.style.color = '#F59E0B'; }}
      onMouseLeave={e => { if (!fav) e.currentTarget.style.color = 'var(--text-5)'; }}
    >
      <FiStar
        size={size}
        strokeWidth={1.75}
        style={{ fill: fav ? '#F59E0B' : 'none', transition: 'fill 120ms' }}
        aria-hidden="true"
      />
    </button>
  );
}
