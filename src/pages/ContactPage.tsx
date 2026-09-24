import { photo } from '@/data/images';
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { TextField, SelectField } from '@/components/shared/FormField';

const TOPICS = ['An order I placed', 'Returns or a damaged candle', 'Wholesale and stockists', 'Corporate and wedding gifts', 'Something else'];

const FAQS = [
  { q: 'How long does shipping take?', a: 'Standard shipping takes 5 to 7 business days and is free over $75. Expedited (2 to 3 days) and overnight options are shown at checkout.' },
  { q: 'My candle arrived damaged. What do I do?', a: 'Send us a photo within 7 days of delivery using the form on this page and choose "Returns or a damaged candle". We will ship a replacement at no cost.' },
  { q: 'Can I return a candle?', a: 'Unused candles in their original packaging can be returned within 30 days. Gift-wrapped and personalised orders are final sale.' },
  { q: 'How does the refill programme work?', a: 'Rinse out five empty Ember & Bloom jars and send them back with the prepaid label from your account. We will send you a free 8 oz candle.' },
  { q: 'Do you offer wholesale?', a: 'Yes, for independent shops and hotels. Choose "Wholesale and stockists" in the form and tell us a little about your space.' },
];

const HOURS = [['Monday to Friday', '10 am to 6 pm'], ['Saturday', '11 am to 5 pm'], ['Sunday', 'Closed']];

interface Form { name: string; email: string; order: string; topic: string; message: string }
const EMPTY: Form = { name: '', email: '', order: '', topic: '', message: '' };

export function ContactPage() {
  const { navigate } = useApp();
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setF({ ...f, [k]: e.target.value });
    setErrors({ ...errors, [k]: undefined });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: typeof errors = {};
    if (f.name.trim().length < 2) er.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = 'Enter an email like you@example.com.';
    if (!f.topic) er.topic = 'Choose what your message is about.';
    if (f.message.trim().length < 10) er.message = 'Tell us a little more, at least 10 characters.';
    setErrors(er);
    if (Object.keys(er).length) return;
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 900); // MOCK: replace with your form endpoint
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground flex gap-2">
        <button onClick={() => navigate('home')} className="hover:text-foreground">Home</button><span>/</span><span className="text-foreground" aria-current="page">Contact</span>
      </nav>
      <div className="grid lg:grid-cols-12 gap-8 mt-6">
        <div className="lg:col-span-7">
          <h1 className="display-xl text-6xl sm:text-7xl lg:text-8xl">We'd love to hear from you.</h1>
          <p className="text-muted-foreground mt-5 max-w-lg text-[15px]">Questions about an order, a scent, or a gift for a hundred guests. A real person in the studio replies within one business day.</p>
        </div>
      </div>

      {/* Ways to reach us */}
      <div className="grid sm:grid-cols-3 gap-4 mt-12">
        {[
          { icon: Mail, title: 'Email', line: 'hello@emberandbloom.co', note: 'Replies within one business day', href: 'mailto:hello@emberandbloom.co' },
          { icon: Phone, title: 'Phone and text', line: '(503) 555-0142', note: 'Weekdays, 10 am to 6 pm PT', href: 'tel:+15035550142' },
          { icon: MapPin, title: 'Studio and shop', line: '1824 SE Division St', note: 'Portland, OR 97202', href: '#visit' },
        ].map(({ icon: Icon, title, line, note, href }) => (
          <a key={title} href={href} className="group rounded-3xl bg-card p-7 flex flex-col gap-6 hover:shadow-[0_20px_40px_-24px_rgba(22,19,15,.35)]">
            <span className="flex size-11 items-center justify-center rounded-full bg-secondary"><Icon size={18} /></span>
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="font-serif text-2xl mt-1 group-hover:underline underline-offset-4">{line}</p>
              <p className="text-sm text-muted-foreground mt-1">{note}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Form + visit */}
      <div className="grid lg:grid-cols-12 gap-8 mt-16 lg:mt-24">
        <Card className="lg:col-span-7 border-0">
          <CardContent className="p-7 sm:p-10">
            {status === 'sent' ? (
              <div className="py-10 text-center flex flex-col items-center" role="status">
                <CheckCircle2 size={44} className="text-[#2F5E36]" />
                <h2 className="font-serif text-4xl mt-5">Message sent</h2>
                <p className="text-muted-foreground mt-3 max-w-sm">Thanks, {f.name.split(' ')[0]}. We'll reply to {f.email} within one business day.</p>
                <div className="flex gap-3 mt-8">
                  <Button variant="outline" onClick={() => { setF(EMPTY); setStatus('idle'); }}>Send another</Button>
                  <Button onClick={() => navigate('listing', { collection: 'All' })}>Back to shopping <ArrowRight /></Button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-5">
                <h2 className="font-serif text-4xl">Send a message</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <TextField id="c-name" label="Your name" autoComplete="name" value={f.name} onChange={set('name')} error={errors.name} />
                  <TextField id="c-email" label="Email" type="email" autoComplete="email" value={f.email} onChange={set('email')} error={errors.email} />
                  <SelectField id="c-topic" label="What is it about?" value={f.topic} onChange={set('topic')} error={errors.topic}>
                    <option value="">Choose a topic</option>
                    {TOPICS.map((t) => <option key={t}>{t}</option>)}
                  </SelectField>
                  <TextField id="c-order" label="Order number (optional)" placeholder="EB-10234" value={f.order} onChange={set('order')} hint="Helps us find your order faster" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="c-msg">Message</Label>
                  <Textarea id="c-msg" rows={6} value={f.message} onChange={set('message')} aria-invalid={!!errors.message || undefined} aria-describedby={errors.message ? 'c-msg-err' : undefined} />
                  {errors.message && <p id="c-msg-err" className="text-xs text-destructive">{errors.message}</p>}
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <p className="text-xs text-muted-foreground">We only use your details to reply to this message.</p>
                  <Button type="submit" size="lg" loading={status === 'sending'}>{status === 'sending' ? 'Sending' : 'Send message'}</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div id="visit" className="lg:col-span-5 flex flex-col gap-4 scroll-mt-28">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <img src={photo('photo-1612198526331-66fcc90d67da', 1000, 750)} alt="A styled shelf in the studio shop with an amber candle" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="rounded-3xl bg-card p-7">
            <h2 className="font-serif text-3xl">Visit the studio</h2>
            <p className="text-sm text-muted-foreground mt-2">Smell every scent, refill your jars, and watch a pour on Saturday mornings.</p>
            <dl className="mt-6 space-y-3 text-sm">
              {HOURS.map(([d, h]) => (
                <div key={d} className="flex justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                  <dt className="flex items-center gap-2 text-muted-foreground"><Clock size={14} />{d}</dt><dd>{h}</dd>
                </div>
              ))}
            </dl>
            <Button variant="outline" className="w-full mt-6" asChild>
              <a href="https://maps.google.com/?q=1824+SE+Division+St+Portland+OR" target="_blank" rel="noreferrer">Get directions</a>
            </Button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section id="faq" className="grid lg:grid-cols-12 gap-8 mt-24 lg:mt-32 scroll-mt-28">
        <div className="lg:col-span-4">
          <h2 className="display-lg text-4xl sm:text-5xl">Before you write</h2>
          <p className="text-muted-foreground mt-3">The questions we answer most often.</p>
        </div>
        <Accordion type="single" collapsible defaultValue="faq-0" className="lg:col-span-8 border-t border-border">
          {FAQS.map((x, i) => (
            <AccordionItem key={x.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-lg font-serif font-normal">{x.q}</AccordionTrigger>
              <AccordionContent className="text-[15px] max-w-2xl">{x.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
