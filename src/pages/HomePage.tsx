import { photo } from '@/data/images';
import React, { useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, ArrowUpRight, Star, Leaf, Flame, Hourglass, Recycle } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { products, collections, testimonials } from '../data/products';
import { Button } from '@/components/ui/button';
import { ProductCard, fromPrice } from '../components/product/ProductCard';

const HERO_IMG = photo('photo-1613068431228-8cb6a1e92573', 2000, 1400);
const STORY_IMG = photo('photo-1612293905607-b003de9e54fb', 1200, 1400);

const SCENT_FAMILIES = [
  { name: 'Woody', blurb: 'Cedar, sandalwood, smoke', tint: '#3B2E24', text: '#F3E6D3' },
  { name: 'Floral', blurb: 'Rose, lavender, jasmine', tint: '#E9D5CF', text: '#3A2320' },
  { name: 'Fresh', blurb: 'Sea salt, fern, rain', tint: '#D5DDD2', text: '#1F2B22' },
  { name: 'Sweet', blurb: 'Honey, vanilla, saffron', tint: '#EFD9B4', text: '#3A2A12' },
];

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} className={i <= n ? 'fill-accent text-accent' : 'text-border'} />)}
    </span>
  );
}

function SectionHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
      <div className="max-w-xl">
        <h2 className="display-lg text-4xl sm:text-5xl">{title}</h2>
        {sub && <p className="text-muted-foreground mt-3 text-[15px]">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function HomePage() {
  const { navigate } = useApp();
  const [tab, setTab] = useState<'best' | 'new'>('best');
  const rail = useRef<HTMLDivElement>(null);
  const featured = products.find((p) => p.id === 'p1')!;
  const railItems = tab === 'best' ? products.filter((p) => p.isBestseller) : products.filter((p) => p.isNew || !p.isBestseller);
  const scroll = (dir: number) => rail.current?.scrollBy({ left: dir * (rail.current.clientWidth * 0.8), behavior: 'smooth' });
  const countFor = (c: string) => products.filter((p) => p.collection === (c === 'gift-sets' ? 'Gift Sets' : c[0].toUpperCase() + c.slice(1))).length;
  const [sig, bot, gift] = collections;

  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="px-3 sm:px-4 pt-3">
        <div className="relative rounded-[28px] overflow-hidden bg-ink min-h-[640px] h-[calc(100svh-124px)] max-h-[860px]">
          <img src={HERO_IMG} alt="Lit pillar candles among eucalyptus leaves in a dark room" className="absolute inset-0 w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_100%,rgba(22,19,15,.85)_0%,rgba(22,19,15,.35)_45%,transparent_70%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/20" />

          <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex flex-col justify-end pb-10 sm:pb-14">
            <div className="max-w-3xl text-[#F7F4EF]">
              <p className="rise rise-1 text-sm text-[#F2C27B] mb-5 flex items-center gap-2"><Flame size={15} />Autumn pour, now shipping</p>
              <h1 className="rise rise-2 display-xl text-[56px] sm:text-[84px] lg:text-[112px]">Light that lingers.</h1>
              <p className="rise rise-3 mt-6 text-lg text-[#E9E2D6]/85 max-w-lg leading-relaxed">
                Small-batch candles in coconut-soy and beeswax, with fragrance built slowly and a clean, even burn to the last centimetre.
              </p>
              <div className="rise rise-4 flex flex-wrap gap-3 mt-9">
                <Button size="lg" variant="light" onClick={() => navigate('listing', { collection: 'All' })}>Shop candles <ArrowRight size={17} /></Button>
                <Button size="lg" variant="glass" onClick={() => navigate('listing', { collection: 'Gift Sets' })}>Gift sets</Button>
              </div>
            </div>

            <button
              onClick={() => navigate('detail', { productId: featured.id })}
              className="rise rise-4 hidden lg:flex absolute right-10 bottom-14 glass rounded-2xl p-3 pr-5 items-center gap-4 text-left text-white hover:bg-white/20 w-[340px]"
            >
              <img src={featured.image} alt="" className="w-20 h-24 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="text-xs text-white/70">Most loved</p>
                <p className="font-serif text-xl leading-tight mt-0.5">{featured.name}</p>
                <p className="text-sm text-white/80 mt-1">From ${fromPrice(featured)}</p>
              </div>
              <ArrowUpRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- Values ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 lg:grid-cols-4 border-b border-border">
          {[
            [Leaf, 'Plant and bee waxes', 'Coconut-soy and beeswax, never paraffin'],
            [Flame, 'Clean fragrance', 'Phthalate-free oils from one fragrance house'],
            [Hourglass, 'Up to 70 hours', 'Burn times tested in the studio'],
            [Recycle, 'Refill programme', 'Return five jars, get a candle on us'],
          ].map(([Icon, t, d]: any, i) => (
            <li key={t} className={`py-7 px-1 lg:px-6 flex gap-3.5 ${i % 2 === 1 ? 'pl-4' : ''} ${i > 0 ? 'lg:border-l border-border' : ''} ${i === 0 ? 'lg:pl-0' : ''}`}>
              <Icon size={20} className="text-accent shrink-0 mt-0.5" />
              <div><p className="text-sm font-medium">{t}</p><p className="text-[13px] text-muted-foreground mt-0.5">{d}</p></div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- Collections (bento) ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32">
        <SectionHead title="Three ways to shop" sub="Our signatures, the botanical range, and boxed sets that are ready to give."
          action={<Button variant="outline" onClick={() => navigate('listing', { collection: 'All' })}>View all candles <ArrowRight size={15} /></Button>} />
        <div className="grid md:grid-cols-12 md:grid-rows-2 gap-4 md:h-[640px]">
          {[
            { c: sig, key: 'Signature', cls: 'md:col-span-7 md:row-span-2 min-h-[420px]' },
            { c: bot, key: 'Botanical', cls: 'md:col-span-5 min-h-[300px]' },
            { c: gift, key: 'Gift Sets', cls: 'md:col-span-5 min-h-[300px]' },
          ].map(({ c, key, cls }, i) => (
            <button key={c.id} onClick={() => navigate('listing', { collection: key })} className={`group relative rounded-3xl overflow-hidden bg-muted text-left ${cls}`}>
              <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.4s] ease-out-soft group-hover:scale-[1.05]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex items-end justify-between gap-4 text-[#F7F4EF]">
                <div className="max-w-sm">
                  <p className="text-xs text-white/70 mb-2">{countFor(c.id)} candles</p>
                  <h3 className={`font-serif leading-none ${i === 0 ? 'text-5xl' : 'text-4xl'}`}>{c.name.replace(' Collection', '')}</h3>
                  <p className="text-sm text-white/80 mt-3 line-clamp-2">{c.description}</p>
                </div>
                <span className="w-12 h-12 rounded-full bg-[#F7F4EF] text-ink flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:-rotate-45"><ArrowRight size={18} /></span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ---------------- Product rail ---------------- */}
      <section className="mt-24 lg:mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead
            title={tab === 'best' ? 'The ones people reorder' : 'Fresh from the studio'}
            action={
              <div className="flex items-center gap-3">
                <div className="inline-flex p-1 rounded-full bg-secondary" role="tablist" aria-label="Product selection">
                  {([['best', 'Bestsellers'], ['new', 'New and seasonal']] as const).map(([k, l]) => (
                    <button key={k} role="tab" aria-selected={tab === k} onClick={() => { setTab(k); rail.current?.scrollTo({ left: 0 }); }}
                      className={`h-9 px-4 rounded-full text-sm ${tab === k ? 'bg-card shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}>{l}</button>
                  ))}
                </div>
                <div className="hidden md:flex gap-2">
                  <button onClick={() => scroll(-1)} className="w-11 h-11 rounded-full border border-foreground/15 flex items-center justify-center hover:bg-card" aria-label="Scroll left"><ArrowLeft size={17} /></button>
                  <button onClick={() => scroll(1)} className="w-11 h-11 rounded-full border border-foreground/15 flex items-center justify-center hover:bg-card" aria-label="Scroll right"><ArrowRight size={17} /></button>
                </div>
              </div>
            }
          />
        </div>
        <div ref={rail} className="no-scrollbar flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 lg:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))] px-4 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          {railItems.map((p) => (
            <div key={p.id} className="snap-start shrink-0 w-[78%] sm:w-[44%] lg:w-[calc((80rem-4rem-3.75rem)/4)]">
              <ProductCard product={p} size="lg" />
            </div>
          ))}
          <button onClick={() => navigate('listing', { collection: 'All' })} className="snap-start shrink-0 w-[60%] sm:w-[30%] lg:w-[260px] aspect-[4/5] rounded-2xl border border-dashed border-foreground/20 flex flex-col items-center justify-center gap-3 hover:bg-card">
            <span className="w-12 h-12 rounded-full bg-ink text-[#F7F4EF] flex items-center justify-center"><ArrowRight size={18} /></span>
            <span className="font-serif text-xl">See all {products.length}</span>
          </button>
        </div>
      </section>

      {/* ---------------- Scent finder ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32">
        <SectionHead title="Start with a feeling" sub="Pick a scent family and we'll show you the candles in it." />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SCENT_FAMILIES.map((s) => {
            const n = products.filter((p) => matchScent(p.tags, p.scent, s.name)).length;
            return (
              <button key={s.name} onClick={() => navigate('listing', { collection: 'All', scent: s.name })}
                className="group relative rounded-3xl p-6 sm:p-7 aspect-[4/5] sm:aspect-[5/6] flex flex-col justify-between text-left overflow-hidden" style={{ background: s.tint, color: s.text }}>
                <span className="text-sm opacity-70">{n} candles</span>
                <div>
                  <p className="display-lg text-4xl sm:text-5xl">{s.name}</p>
                  <p className="text-sm mt-2 opacity-75">{s.blurb}</p>
                </div>
                <ArrowUpRight size={22} className="absolute top-6 right-6 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------------- Story ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="relative rounded-3xl overflow-hidden aspect-[6/7]">
            <img src={STORY_IMG} alt="Lighting an amber-glass candle with a match" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="display-lg text-4xl sm:text-6xl">Made slowly, fifty at a time.</h2>
            <div className="mt-8 space-y-5 text-muted-foreground leading-relaxed text-[15px] max-w-lg">
              <p>Ember &amp; Bloom began in 2016 on a kitchen stove in Portland, with a notebook of fragrance experiments and the belief that a candle deserves the care of a good meal.</p>
              <p>We develop every formula in-house, source phthalate-free oils from a single fragrance house, and cure each batch for two weeks so the scent settles before it reaches you.</p>
            </div>
            <dl className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-border max-w-lg">
              {[['2016', 'Poured our first batch'], ['50', 'Candles per batch'], ['14 days', 'Cure before shipping']].map(([k, v]) => (
                <div key={v}><dt className="font-serif text-3xl">{k}</dt><dd className="text-xs text-muted-foreground mt-1">{v}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ---------------- Reviews ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32">
        <SectionHead title="In their words" sub="4.9 average from more than 2,300 reviews." />
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t) => {
            const p = products.find((x) => x.name === t.product);
            return (
              <figure key={t.id} className="bg-card rounded-3xl p-7 flex flex-col">
                <Stars n={t.rating} />
                <blockquote className="font-serif text-[22px] leading-snug mt-5 flex-1">“{t.text}”</blockquote>
                <figcaption className="mt-7 pt-5 border-t border-border flex items-center gap-3">
                  {p && <img src={p.image} alt="" className="w-10 h-12 rounded-lg object-cover" />}
                  <div className="text-sm">
                    <p className="font-medium">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.location}{t.product ? `, on ${t.product}` : ''}</p>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/** Loose scent-family matching shared with the listing page. */
export function matchScent(tags: string[], scent: string, family: string) {
  const hay = (tags.join(' ') + ' ' + scent).toLowerCase();
  const map: Record<string, string[]> = {
    Woody: ['woody', 'cedar', 'sandalwood', 'smoky', 'oud'],
    Floral: ['floral', 'rose', 'lavender', 'jasmine'],
    Fresh: ['fresh', 'coastal', 'clean', 'green', 'sea'],
    Sweet: ['sweet', 'honey', 'vanilla', 'golden', 'amber'],
    Amber: ['amber', 'warm'],
    Citrus: ['citrus', 'bergamot', 'neroli'],
    Earthy: ['earthy', 'moss', 'vetiver', 'fern'],
  };
  return (map[family] || [family.toLowerCase()]).some((k) => hay.includes(k));
}
