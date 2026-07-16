import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SettingsInputProps {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  inputClassName?: string;
}

export function SettingsInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  readOnly = false,
  className,
  inputClassName,
}: SettingsInputProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        className={cn('h-8 rounded-sm bg-muted/30 border-border/60 focus:bg-background', inputClassName)}
      />
    </div>
  );
}
