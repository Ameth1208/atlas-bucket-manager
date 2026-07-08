'use client';

import { Cloud, Database, KeyRound, ShieldCheck, Zap } from 'lucide-react';

const features = [
  {
    icon: Cloud,
    title: 'Multi-cloud',
    body: 'Connect MinIO, AWS S3, Cloudflare R2, DigitalOcean, and any S3-compatible endpoint.',
    accent: 'from-cyan-500 to-blue-500',
    iconBg: 'from-cyan-500/15 to-blue-500/15',
  },
  {
    icon: Database,
    title: 'All your buckets',
    body: 'List, browse, search, upload, download and copy across every bucket from a single dashboard.',
    accent: 'from-blue-500 to-indigo-500',
    iconBg: 'from-blue-500/15 to-indigo-500/15',
  },
  {
    icon: KeyRound,
    title: 'API keys',
    body: 'Generate scoped Bearer keys (atl_…) for CI/CD, scripts and third-party tools.',
    accent: 'from-indigo-500 to-purple-500',
    iconBg: 'from-indigo-500/15 to-purple-500/15',
  },
  {
    icon: ShieldCheck,
    title: 'Self-hosted & secure',
    body: 'Your data never leaves your machine. JWT cookies, scoped keys, audit log included.',
    accent: 'from-emerald-500 to-cyan-500',
    iconBg: 'from-emerald-500/15 to-cyan-500/15',
  },
];

export function SetupHero() {
  return (
    <div className="relative h-full flex flex-col justify-between p-8 lg:p-10 xl:p-14">
      {/* Background orbs (different from the page-level ones, more contained) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-cyan-300/40 via-blue-300/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-indigo-200/30 via-purple-200/20 to-transparent blur-3xl" />
      </div>

      <div className="relative space-y-10">
        {/* Wordmark + tagline */}
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/70 backdrop-blur border border-white/70 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <span className="size-1.5 rounded-full bg-[#34C759] animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wide uppercase text-[#1D1D1F]/80">
              Atlas 1.0
            </span>
          </div>
          <h1 className="text-[42px] lg:text-[48px] xl:text-[56px] font-semibold text-[#1D1D1F] tracking-[-0.02em] leading-[1.05]">
            All your storage.
            <br />
            <span className="bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              One interface.
            </span>
          </h1>
          <p className="text-[15px] lg:text-[16px] text-[#6E6E73] leading-[1.55] max-w-[480px]">
            A self-hosted multi-cloud bucket manager for MinIO, AWS S3, Cloudflare R2, and any
            S3-compatible storage. Built for teams that manage more than one cloud.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
          {features.map(({ icon: Icon, title, body, accent, iconBg }, i) => (
            <div
              key={i}
              className="group relative p-4 lg:p-5 rounded-2xl bg-white/55 backdrop-blur-sm border border-white/70 hover:bg-white/80 hover:border-white/90 hover:shadow-[0_8px_24px_rgba(8,145,178,0.08)] transition-all duration-300"
            >
              <div className="relative flex items-start gap-3.5">
                <div
                  className={`shrink-0 size-10 rounded-xl bg-gradient-to-br ${iconBg} ring-1 ring-inset ring-white/60 flex items-center justify-center`}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.7}
                    className={`bg-gradient-to-br ${accent} bg-clip-text text-transparent`}
                    style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text' }}
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1D1D1F]">{title}</p>
                  <p className="text-[12.5px] text-[#6E6E73] leading-[1.5]">{body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer stat row */}
      <div className="relative flex flex-wrap gap-x-8 gap-y-3 pt-6 mt-6 border-t border-black/[0.06]">
        <div>
          <p className="text-[22px] font-semibold tracking-tight text-[#1D1D1F]">6+</p>
          <p className="text-[11.5px] text-[#86868B] mt-0.5">S3-compatible providers</p>
        </div>
        <div>
          <p className="text-[22px] font-semibold tracking-tight text-[#1D1D1F]">6</p>
          <p className="text-[11.5px] text-[#86868B] mt-0.5">Languages</p>
        </div>
        <div>
          <p className="text-[22px] font-semibold tracking-tight text-[#1D1D1F]">0</p>
          <p className="text-[11.5px] text-[#86868B] mt-0.5">Vendor lock-in</p>
        </div>
        <div>
          <p className="text-[22px] font-semibold tracking-tight text-[#1D1D1F]">∞</p>
          <p className="text-[11.5px] text-[#86868B] mt-0.5">Buckets per instance</p>
        </div>
      </div>
    </div>
  );
}
