'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Database, Cloud, Key, Users } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

const features = [
  { icon: Database, text: 'Gestiona múltiples buckets S3 y MinIO' },
  { icon: Cloud, text: 'Conecta AWS, Cloudflare R2, DigitalOcean' },
  { icon: Key, text: 'API Keys para acceso programático' },
  { icon: Users, text: 'Multi-usuario con roles y permisos' },
];

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-[21px] font-semibold text-[#1D1D1F] tracking-tight">
          Bienvenido a Atlas
        </h2>
        <p className="text-[14px] text-[#6E6E73]">
          Configura tu instancia en 3 pasos.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {features.map(({ icon: Icon, text }, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#F5F5F7] text-center"
          >
            <Icon size={18} className="text-[#0071E3]" aria-hidden="true" />
            <span className="text-[11px] text-[#6E6E73] leading-tight">{text}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={onNext}
        className="w-full h-10 bg-[#0071E3] hover:bg-[#0066CC] text-white rounded-lg text-[14px] font-medium"
      >
        Comenzar
        <ArrowRight size={16} className="ml-1.5" aria-hidden="true" />
      </Button>
    </div>
  );
}