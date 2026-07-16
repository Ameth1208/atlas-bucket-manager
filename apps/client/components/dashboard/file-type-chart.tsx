'use client';
import dynamic from 'next/dynamic';
import { FileType } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const FileTypeChart = dynamic(
  () => import('./file-type-chart-content').then((mod) => mod.FileTypeChart),
  {
    ssr: false,
    loading: () => (
      <Card className="h-full bg-card border-border">
        <CardContent className="h-full flex flex-col p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileType size={13} className="text-primary" />
            </div>
            <div className="space-y-1">
              <div className="h-3.5 w-40 rounded bg-muted" />
              <div className="h-2.5 w-24 rounded bg-muted" />
            </div>
          </div>
          <div className="flex-1 min-h-0 rounded-md bg-muted/50 animate-pulse" />
        </CardContent>
      </Card>
    ),
  }
);

export { FileTypeChart };
