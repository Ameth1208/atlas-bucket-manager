'use client';
import { useBrowserStore, filteredObjects } from '../store';
import { useActionsStore } from '../store/actions';
import { ObjectCard } from './object-card';

export function ObjectGrid() {
  const { objects, search, filter, selected, thumbnails, navigate, toggleSelect, clearThumbnail } = useBrowserStore();
  const { handlePreview, loadThumbnail, handleDownload } = useActionsStore();
  const filtered = filteredObjects(objects, search, filter);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {filtered.map(obj => (
        <ObjectCard
          key={obj.key}
          obj={obj}
          isSelected={selected.has(obj.key)}
          thumbnail={thumbnails[obj.key]}
          onSelect={toggleSelect}
          onNavigate={navigate}
          onPreview={handlePreview}
          onLoadThumbnail={loadThumbnail}
          onClearThumbnail={clearThumbnail}
          onDownload={handleDownload}
        />
      ))}
    </div>
  );
}
