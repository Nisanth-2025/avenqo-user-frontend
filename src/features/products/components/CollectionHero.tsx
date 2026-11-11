import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CollectionHeroProps {
  onShopNow: () => void;
}

export const CollectionHero: React.FC<CollectionHeroProps> = ({ onShopNow }) => (
  <section aria-labelledby="collection-title" className="relative isolate overflow-hidden rounded-[1.65rem] bg-[#e9e5de] shadow-[0_12px_32px_rgba(31,29,25,0.08)]">
    <img
      src="/images/premium-spring-collection.png"
      alt="Model in an ivory dress in a softly lit, natural setting"
      className="absolute inset-0 h-full w-full object-cover object-[62%_36%]"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-[#f8f5ef]/95 via-[#f8f5ef]/75 to-transparent" />
    <div className="relative flex min-h-[224px] items-center px-5 py-6 sm:min-h-[320px] sm:px-12">
      <div className="max-w-[15rem] sm:max-w-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-600 sm:text-xs">
          The new collection
        </p>
        <h2 id="collection-title" className="mt-2 font-display text-[2.35rem] leading-[0.98] tracking-tight text-neutral-950 sm:text-6xl">
          The spring edit
        </h2>
        <p className="mt-3 max-w-[13rem] text-[13px] leading-relaxed text-neutral-600 sm:max-w-xs sm:text-base">
          Easy layers and considered details for every day.
        </p>
        <button
          type="button"
          onClick={onShopNow}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-[#173b70] px-5 text-[13px] font-semibold text-white shadow-[0_5px_16px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#10284a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
        >
          Shop now
          <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  </section>
);
