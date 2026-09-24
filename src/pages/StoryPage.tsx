import { photo } from '@/data/images';
import React from 'react';
import { useNavigate } from 'react-router';
import { paths } from '../routes';
import { ArrowRight, Leaf, Droplets, Recycle, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const img = (id: string, w = 1400, h = 1000) => photo(id, w, h);

const PROCESS = [
  { title: 'Blend', text: 'Each fragrance is built in-house over months of test burns, using phthalate-free oils from a single fragrance house in Grasse.', img: img('photo-1603905179139-db12ab535ca9', 900, 1100) },
  { title: 'Pour', text: 'We pour by hand at a controlled temperature, never more than fifty candles at a time, into jars we can refill.', img: img('photo-1643122966676-29e8597257f7', 900, 1100) },
  { title: 'Cure', text: 'Every batch rests for fourteen days so the fragrance binds with the wax. It is the difference between a scent and a throw.', img: img('photo-1605101600616-a8c6db5b98aa', 900, 1100) },
  { title: 'Trim and test', text: 'We trim every wick and burn one candle from each batch for four hours before a single jar leaves the studio.', img: img('photo-1612293905607-b003de9e54fb', 900, 1100) },
];

const TIMELINE = [
  ['2016', 'First batch of twelve candles poured on a kitchen stove in Southeast Portland.'],
  ['2019', 'Moved into a studio on Division Street and switched every candle to coconut-soy wax.'],
  ['2022', 'Launched the refill programme. Over 9,000 jars have come back to be poured again.'],
  ['2026', 'Botanical collection and our first beeswax blends, still poured fifty at a time.'],
];

const VALUES = [
  { icon: Leaf, title: 'Plant and bee waxes', text: 'Coconut-soy and beeswax blends. No paraffin in anything we make.' },
  { icon: Droplets, title: 'Clean fragrance', text: 'Phthalate-free oils, with full ingredient lists on every product page.' },
  { icon: Recycle, title: 'Jars that come back', text: 'Return five empty jars and we send you a candle, poured into one of them.' },
  { icon: HeartHandshake, title: 'Paid fairly', text: 'Everyone in the studio earns a living wage and shares in the profit.' },
];

export function StoryPage() {
  const navigate = useNavigate();
  return (
    <div>
      {/* Hero */}
      <section className="px-3 sm:px-4 pt-3">
        <div className="relative overflow-hidden rounded-[28px] bg-ink min-h-[560px] flex items-end">
          <img src={img('photo-1601479604588-68d9e6d386b5', 2000, 1200)} alt="Lit pillar candles on a wooden table beside autumn leaves" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
          <div className="relative max-w-7xl mx-auto w-full px-5 sm:px-8 lg:px-10 pb-12 sm:pb-16 text-[#F7F4EF]">
            <p className="rise rise-1 text-sm text-[#F2C27B] mb-4">Our story</p>
            <h1 className="rise rise-2 display-xl text-6xl sm:text-7xl lg:text-8xl max-w-4xl">A kitchen stove, a notebook, and ten years of <em>slow candles.</em></h1>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 lg:mt-28 grid lg:grid-cols-12 gap-10">
        <p className="lg:col-span-7 font-serif text-3xl sm:text-4xl leading-[1.2]">
          Ember &amp; Bloom began because we couldn't find a candle that smelled the same on the last night as the first. So we started pouring our own.
        </p>
        <div className="lg:col-span-5 space-y-5 text-[15px] text-muted-foreground leading-relaxed lg:pt-2">
          <p>Mara Lindqvist, a former pastry chef, and Theo Okafor, a furniture maker, spent the winter of 2016 testing waxes on their stove. Most batches were bad. Twelve were good enough to give away.</p>
          <p>Ten years on we are a studio of eleven people in Portland. We still write every fragrance by hand, still pour in small batches, and still burn a candle from every batch before we ship it.</p>
        </div>
      </section>

      {/* Process: a real sequence, so it is numbered */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32">
        <h2 className="display-lg text-4xl sm:text-5xl max-w-xl">How a candle gets <em>made</em></h2>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {PROCESS.map((s, i) => (
            <li key={s.title} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
                <img src={s.img} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out-soft group-hover:scale-[1.04]" />
                <span className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-full glass-light text-sm font-medium text-ink">{i + 1}</span>
              </div>
              <h3 className="font-serif text-2xl mt-5">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Timeline */}
      <section className="mt-24 lg:mt-32 bg-ink text-[#E9E2D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <h2 className="display-lg text-4xl sm:text-5xl text-[#F7F4EF]">Ten years, <em>one studio</em></h2>
            <p className="mt-4 text-[#B8AE9F] max-w-sm">We've grown slowly on purpose. Here's what changed, and what didn't.</p>
          </div>
          <ol className="lg:col-span-8 relative border-l border-white/15 ml-2 space-y-12">
            {TIMELINE.map(([year, text]) => (
              <li key={year} className="pl-8 relative">
                <span className="absolute -left-[5px] top-3 size-[9px] rounded-full bg-[#F2C27B]" aria-hidden />
                <p className="font-serif text-4xl text-[#F7F4EF]">{year}</p>
                <p className="mt-2 max-w-lg text-[#CFC6B8]">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32">
        <h2 className="display-lg text-4xl sm:text-5xl">What we <em>won't</em> compromise on</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl bg-card p-7">
              <Icon size={22} className="text-accent" />
              <h3 className="font-serif text-2xl mt-6">{title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founders quote + CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 lg:mt-32 grid lg:grid-cols-2 gap-10 items-center">
        <div className="relative aspect-[5/4] overflow-hidden rounded-3xl">
          <img src={img('photo-1640095889747-2090ee12fa7d', 1200, 960)} alt="A single lit candle by a window at dusk" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div>
          <blockquote className="font-serif text-3xl sm:text-4xl leading-[1.2]">“We want the last hour of a candle to smell exactly like the first. Everything we do is in service of that.”</blockquote>
          <p className="mt-6 text-sm text-muted-foreground">Mara Lindqvist and Theo Okafor, founders</p>
          <Separator className="my-8" />
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate(paths.shop())}>Shop the candles <ArrowRight /></Button>
            <Button size="lg" variant="outline" onClick={() => navigate(paths.contact)}>Visit the studio</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
