'use client';
import { useBrowserStore, filteredObjects } from '../store';
import { useActionsStore } from '../store/actions';
import { ObjectCard } from './object-card';

export function ObjectGrid() {
  const { objects, search, filter, selected, thumbnails, navigate, select, clearThumbnail } = useBrowserStore();
  const { handlePreview, loadThumbnail, handleDownload } = useActionsStore();
  const filtered = filteredObjects(objects, search, filter);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
      {filtered.map(obj => (
        <ObjectCard
          key={obj.key}
          obj={obj}
          isSelected={selected.has(obj.key)}
          thumbnail={thumbnails[obj.key]}
          onSelect={select}
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
