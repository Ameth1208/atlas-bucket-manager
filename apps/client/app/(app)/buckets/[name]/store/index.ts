export { useURLStore } from './url';
export { useBrowserStore } from './browser';
export { usePreviewStore } from './preview';
export { useActionsStore } from './actions';

import { StorageObject } from '@/lib/api';

type Filter = 'all' | 'image' | 'video' | 'audio' | 'code' | 'doc' | 'archive';

const EXT_MAP: Record<string, Filter> = {
  // images
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image', bmp: 'image', ico: 'image', tiff: 'image', avif: 'image',
  // video
  mp4: 'video', mov: 'video', avi: 'video', mkv: 'video', webm: 'video', flv: 'video', wmv: 'video', m4v: 'video',
  // audio
  mp3: 'audio', wav: 'audio', ogg: 'audio', flac: 'audio', aac: 'audio', m4a: 'audio', wma: 'audio', opus: 'audio',
  // code
  ts: 'code', tsx: 'code', js: 'code', jsx: 'code', py: 'code', go: 'code', rs: 'code', java: 'code',
  c: 'code', cpp: 'code', h: 'code', css: 'code', html: 'code', scss: 'code',
  json: 'code', xml: 'code', yaml: 'code', yml: 'code', toml: 'code',
  sh: 'code', bash: 'code', sql: 'code',
  // archives
  zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive', bz2: 'archive', xz: 'archive', tgz: 'archive',
  // docs
  pdf: 'doc', txt: 'doc', md: 'doc', doc: 'doc', docx: 'doc', rtf: 'doc', odt: 'doc', pages: 'doc',
  csv: 'doc', xls: 'doc', xlsx: 'doc', ppt: 'doc', pptx: 'doc',
};

function getKind(key: string): Filter {
  return EXT_MAP[key.split('.').pop()?.toLowerCase() || ''] || 'all';
}

export function filteredObjects(objects: StorageObject[], search: string, filter: Filter): StorageObject[] {
  return objects.filter(o => {
    if (!o.key) return false;
    if (search && !o.key.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== 'all' && !o.isFolder && getKind(o.key) !== filter) return false;
    return true;
  });
}
