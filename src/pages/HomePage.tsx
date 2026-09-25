import { photo } from '@/data/images';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/router/paths';
import { motion, type Variants } from 'motion/react';
import { ArrowRight, Star, Leaf, Flame, Hourglass, Recycle } from 'lucide-react';
import { products, collections } from '../data/products';
import { testimonials } from '../data/testimonials';
import { Button } from '@/components/ui/button';
import { ProductCard } from '../components/product/ProductCard';
import { BlurText } from '../components/motion/BlurText';
import { FadeContent } from '../components/motion/FadeContent';

const HERO_IMG = photo('photo-1613068431228-8cb6a1e92573', 2000, 1400);
const STORY_IMG = photo('photo-1612293905607-b003de9e54fb', 1200, 1400);

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} className={i <= n ? 'fill-accent text-accent' : 'text-border'} />)}
    </span>
  );
}

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.96, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 90, damping: 18, mass: 0.9 } },
};

function SectionHead({ title, sub, action }: { title: React.ReactNode; sub?: string; action?: React.ReactNode }) {
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
  const navigate = useNavigate();
  const bestsellers = products.filter((p) => p.isBestseller);
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
              <BlurText text="Light that lingers." emphasis={['lingers.']} delay={0.15} stagger={0.12} className="display-xl text-[56px] sm:text-[84px] lg:text-[112px]" />
              <p className="rise rise-3 mt-6 text-lg text-[#E9E2D6]/85 max-w-lg leading-relaxed">
                Small-batch candles in coconut-soy and beeswax, with fragrance built slowly and a clean, even burn to the last centimetre.
              </p>
              <div className="rise rise-4 flex flex-wrap gap-3 mt-9">
                <Button size="lg" variant="light" onClick={() => navigate(paths.shop())}>Shop candles <ArrowRight size={17} /></Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Values ---------------- */}
      <FadeContent className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      </FadeContent>

      {/* ---------------- Collections (bento) ---------------- */}
      <FadeContent className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32">
        <SectionHead title="Three ways to shop" sub="Our signatures, the botanical range, and boxed sets that are ready to give."
          action={<Button variant="outline" onClick={() => navigate(paths.shop())}>View all candles <ArrowRight size={15} /></Button>} />
        <div className="grid md:grid-cols-12 md:grid-rows-2 gap-4 md:h-[640px]">
          {[
            { c: sig, key: 'Signature', cls: 'md:col-span-7 md:row-span-2 min-h-[420px]' },
            { c: bot, key: 'Botanical', cls: 'md:col-span-5 min-h-[300px]' },
            { c: gift, key: 'Gift Sets', cls: 'md:col-span-5 min-h-[300px]' },
          ].map(({ c, key, cls }, i) => (
            <button key={c.id} onClick={() => navigate(paths.shop({ collection: key }))} className={`group relative rounded-3xl overflow-hidden bg-muted text-left ${cls}`}>
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
      </FadeContent>

      {/* ---------------- Bestsellers ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32">
        <SectionHead
          title={<>The ones people <em>reorder</em></>}
          action={
            <button onClick={() => navigate(paths.shop())} className="group inline-flex items-center gap-2 text-sm font-medium">
              See more
              <span className="w-9 h-9 rounded-full bg-ink text-[#F7F4EF] flex items-center justify-center transition-transform duration-500 group-hover:rotate-[-45deg]"><ArrowRight size={16} /></span>
            </button>
          }
        />
        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10"
        >
          {bestsellers.map((p) => (
            <motion.div key={p.id} variants={cardVariants}>
              <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                <ProductCard product={p} size="lg" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---------------- Story ---------------- */}
      <FadeContent className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="relative rounded-3xl overflow-hidden aspect-[6/7]">
            <img src={STORY_IMG} alt="Lighting an amber-glass candle with a match" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="display-lg text-4xl sm:text-6xl">Made <em>slowly,</em> fifty at a time.</h2>
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
      </FadeContent>

      {/* ---------------- Reviews ---------------- */}
      <FadeContent className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32">
        <SectionHead title="In their words" sub="Words that stayed after the wax was gone." />
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
      </FadeContent>
    </div>
  );
}
