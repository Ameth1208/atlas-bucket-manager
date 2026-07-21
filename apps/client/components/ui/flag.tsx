'use client';

import type { CSSProperties } from 'react';
import US from 'country-flag-icons/react/3x2/US';
import ES from 'country-flag-icons/react/3x2/ES';
import BR from 'country-flag-icons/react/3x2/BR';

const FLAG_COMPONENTS: Record<string, (props: { style?: CSSProperties; className?: string; title?: string }) => React.JSX.Element> = {
  US,
  ES,
  BR,
};

export function Flag({ code, style, className }: { code: string; style?: CSSProperties; className?: string }) {
  const FlagComponent = FLAG_COMPONENTS[code] ?? US;
  return <FlagComponent style={style} className={className} title={code} />;
}
