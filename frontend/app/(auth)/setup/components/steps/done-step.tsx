'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DoneStep() {
  const router = useRouter();

  return (
    <div className="text-center py-4 space-y-6">
      <div className="w-14 h-14 rounded-full bg-[#34C759]/10 flex items-center justify-center mx-auto">
        <Check size={24} className="text-[#34C759]" strokeWidth={2.5} aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h2 className="text-[21px] font-semibold text-[#1D1D1F] tracking-tight">
          ¡Atlas está listo!
        </h2>
        <p className="text-[14px] text-[#6E6E73] leading-relaxed">
          Tu cuenta fue creada exitosamente.
          <br />
          Conecta proveedores y gestiona tus buckets.
        </p>
      </div>

      <Button
        onClick={() => router.push('/dashboard')}
        className="w-full h-10 bg-[#0071E3] hover:bg-[#0066CC] text-white rounded-lg text-[14px] font-medium"
      >
        Ir al dashboard
        <ArrowRight size={16} className="ml-1.5" aria-hidden="true" />
      </Button>
    </div>
  );
}