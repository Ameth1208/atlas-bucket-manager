'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { FileType } from 'lucide-react';
import { fmtBytes } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FileTypeChartProps {
  data: { type: string; count: number; size: number }[];
  className?: string;
}

const COLORS = [
  '#005bb5', '#0071e3', '#2997ff', '#4dacff', '#7ec1ff', '#b3daff'
];

const FILE_LABELS: Record<string, string> = {
  image: 'Imágenes', video: 'Videos', audio: 'Audio', code: 'Código', doc: 'Documentos', archive: 'Archivos', other: 'Otros'
};

export function FileTypeChart({ data, className }: FileTypeChartProps) {
  const chartData = data.length > 0 ? data : [];
  const total = chartData.reduce((sum, d) => sum + d.count, 0);
  const totalSize = chartData.reduce((sum, d) => sum + d.size, 0);

  return (
    <Card className={cn('h-full bg-card border-border', className)}>
      <CardContent className="h-full flex flex-col p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <FileType size={13} className="text-primary" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-foreground tracking-[-0.2px]">Distribución de archivos</h2>
            <p className="text-[11px] text-muted-foreground">{total > 0 ? `${total.toLocaleString()} archivos · ${fmtBytes(totalSize)}` : 'Sin archivos'}</p>
          </div>
        </div>

        {total > 0 ? (
          <div className="flex-1 min-h-0 flex flex-col sm:flex-row items-center gap-3">
            <div className="h-[140px] sm:h-full w-full sm:w-[55%]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="type"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as FileTypeChartProps['data'][number];
                        return (
                          <div className="bg-card border border-border rounded-md px-3 py-2 shadow-md">
                            <p className="text-[12px] font-medium">{FILE_LABELS[item.type] || item.type}</p>
                            <p className="text-[11px] text-muted-foreground">{item.count.toLocaleString()} archivos · {fmtBytes(item.size)}</p>
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
                const pct = Math.round((d.count / total) * 100);
                return (
                  <div key={d.type} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-medium text-foreground truncate">{FILE_LABELS[d.type] || d.type}</p>
                        <p className="text-[11px] font-semibold text-foreground tabular-nums">{pct}%</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{d.count.toLocaleString()} archivos · {fmtBytes(d.size)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-[13px] text-muted-foreground">Aún no hay archivos</p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">Sube archivos para ver la distribución</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
