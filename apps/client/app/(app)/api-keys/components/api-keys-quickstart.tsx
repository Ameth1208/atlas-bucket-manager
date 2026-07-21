'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

const LANGUAGES = ['cURL', 'Node.js', 'Python'] as const;
type Language = (typeof LANGUAGES)[number];

interface ApiKeysQuickstartProps {
  prefix: string;
}

const TEMPLATES: Record<Language, (prefix: string) => string> = {
  'cURL': (prefix) =>
    `# Subir un archivo a tu bucket\ncurl -X POST https://tu-atlas.app/api/v1/upload/mi-bucket \\\n  -H "Authorization: Bearer ${prefix}_••••••••••••••••" \\\n  -F "file=@./archivo.png"`,
  'Node.js': (prefix) =>
    `import { S3Client } from '@aws-sdk/client-s3';\nimport { Upload } from '@aws-sdk/lib-storage';\n\nconst s3 = new S3Client({\n  endpoint: 'https://tu-atlas.app',\n  region: 'us-east-1',\n  credentials: { accessKeyId: '${prefix}', secretAccessKey: process.env.ATLAS_SECRET },\n  forcePathStyle: true,\n});\n\nawait new Upload({\n  client: s3,\n  params: { Bucket: 'mi-bucket', Key: 'archivo.png', Body: fs.createReadStream('./archivo.png') },\n}).done();`,
  'Python': (prefix) =>
    `import boto3\n\ns3 = boto3.client(\n    's3',\n    endpoint_url='https://tu-atlas.app',\n    aws_access_key_id='${prefix}',\n    aws_secret_access_key=os.environ['ATLAS_SECRET'],\n    region_name='us-east-1',\n)\n\ns3.upload_file('./archivo.png', 'mi-bucket', 'archivo.png')`,
};

export function ApiKeysQuickstart({ prefix }: ApiKeysQuickstartProps) {
  const { t } = useI18n();
  const [language, setLanguage] = useState<Language>('cURL');
  const code = TEMPLATES[language](prefix);

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t.apiKeysQuickstart}</h3>
        <div className="flex gap-1">
          {LANGUAGES.map((lang) => (
            <button
              type="button"
              key={lang}
              onClick={() => setLanguage(lang)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs transition-colors',
                lang === language
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <pre className="p-4 font-mono text-xs text-muted-foreground overflow-x-auto bg-muted/50 whitespace-pre">
          <code>{code}</code>
        </pre>
        <Button
          variant="pearl"
          size="sm"
          className="absolute top-2 right-2"
          onClick={() => {
            navigator.clipboard.writeText(code);
            toast.success(t.toastCopied);
          }}
        >
          <Copy size={12} /> {t.apiKeysQuickstartCopy}
        </Button>
      </div>
    </Card>
  );
}
