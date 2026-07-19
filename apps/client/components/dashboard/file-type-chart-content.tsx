'use client';
import { Card, CardContent } from '@/components/ui/card';
// react-doctor-disable-next-line prefer-dynamic-import -- loaded via next/dynamic({ ssr: false }) from file-type-chart.tsx
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { FileType } from 'lucide-react';
import { fmtBytes } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

interface FileTypeChartProps {
  data: { type: string; count: number; size: number }[];
  className?: string;
}

const COLORS = [
  '#005bb5', '#0071e3', '#2997ff', '#4dacff', '#7ec1ff', '#b3daff'
];

export function FileTypeChart({ data, className }: FileTypeChartProps) {
  const { t, tx } = useI18n();
  const chartData = data.length > 0 ? data : [];
  const totalSize = chartData.reduce((sum, d) => sum + d.size, 0);
  const totalCount = chartData.reduce((sum, d) => sum + d.count, 0);

  const labels: Record<string, string> = {
    image: t.fileTypeImage,
    video: t.fileTypeVideo,
    audio: t.fileTypeAudio,
    code: t.fileTypeCode,
    doc: t.fileTypeDoc,
    archive: t.fileTypeArchive,
    other: t.fileTypeOther,
  };

  return (
    <Card className={cn('h-full bg-card border-border', className)}>
      <CardContent className="h-full flex flex-col p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <FileType size={13} className="text-primary" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-foreground tracking-[-0.2px]">{t.fileTypeTitle}</h2>
            <p className="text-[11px] text-muted-foreground">
              {totalSize > 0
                ? tx('fileTypeSummary', { size: fmtBytes(totalSize), count: totalCount.toLocaleString() })
                : t.fileTypeEmpty}
            </p>
          </div>
        </div>

        {totalSize > 0 ? (
          <div className="flex-1 min-h-0 flex flex-col sm:flex-row items-center gap-3">
            <div className="h-[140px] sm:h-full w-full sm:w-[55%]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="size"
                    nameKey="type"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={entry.type} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as FileTypeChartProps['data'][number];
                        const pct = totalSize > 0 ? Math.round((item.size / totalSize) * 100) : 0;
                        return (
                          <div className="bg-card border border-border rounded-md px-3 py-2 shadow-md">
                            <p className="text-[12px] font-medium">{labels[item.type] || item.type}</p>
                            <p className="text-[11px] text-muted-foreground">{pct}% · {fmtBytes(item.size)}</p>
                            <p className="text-[10px] text-muted-foreground/80">
                              {tx('fileTypeFileCount', { count: item.count.toLocaleString() })}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full sm:w-[45%] flex flex-col justify-center gap-2 overflow-y-auto pr-1">
              {chartData.map((d, i) => {
                const pct = Math.round((d.size / totalSize) * 100);
                return (
                  <div key={d.type} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-medium text-foreground truncate">{labels[d.type] || d.type}</p>
                        <p className="text-[11px] font-semibold text-foreground tabular-nums">{pct}%</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {fmtBytes(d.size)} · {tx('fileTypeFileCount', { count: d.count.toLocaleString() })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-[13px] text-muted-foreground">{t.fileTypeEmpty}</p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">{t.fileTypeEmptyHint}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
