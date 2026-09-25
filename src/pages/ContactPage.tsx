import { photo } from '@/data/images';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/router/paths';
import { Mail, Phone, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TextField, SelectField } from '@/components/shared/FormField';

const HEADER_IMG = photo('photo-1613068431228-8cb6a1e92573', 1600, 800);
const TOPICS = ['An order I placed', 'Returns or a damaged candle', 'Wholesale and stockists', 'Corporate and wedding gifts', 'Something else'];


interface Form { name: string; email: string; order: string; topic: string; message: string }
const EMPTY: Form = { name: '', email: '', order: '', topic: '', message: '' };

export function ContactPage() {
  const navigate = useNavigate();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <section className="relative rounded-[28px] overflow-hidden bg-secondary">
        <img src={HEADER_IMG} alt="" className="absolute inset-0 h-full w-full object-cover scale-105 blur-[3px] opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/75 to-secondary/10" />
        <div className="relative px-5 sm:px-8 lg:px-10 py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground flex gap-2">
            <button onClick={() => navigate(paths.home)} className="hover:text-foreground">Home</button><span>/</span><span className="text-foreground" aria-current="page">Contact</span>
          </nav>
          <h1 className="display-xl text-6xl sm:text-7xl lg:text-8xl mt-6 max-w-3xl">We'd <em>love</em> to hear from you.</h1>
          <p className="text-muted-foreground mt-5 max-w-lg text-[15px]">Questions about an order, a scent, or a gift for a hundred guests. A real person in the studio replies within one business day.</p>
        </div>
      </section>

      {/* Ways to reach us */}
      <div className="grid sm:grid-cols-3 gap-4 mt-12">
        {[
          { icon: Mail, title: 'Email', line: 'hello@emberandbloom.co', note: 'Replies within one business day', href: 'mailto:hello@emberandbloom.co' },
          { icon: Phone, title: 'Phone and text', line: '(503) 555-0142', note: 'Weekdays, 10 am to 6 pm PT', href: 'tel:+15035550142' },
          { icon: MapPin, title: 'Studio and shop', line: '1824 SE Division St', note: 'Portland, OR 97202', href: 'https://maps.google.com/?q=1824+SE+Division+St+Portland+OR' },
        ].map(({ icon: Icon, title, line, note, href }) => (
          <a key={title} href={href} {...(href.startsWith('http') && { target: '_blank', rel: 'noreferrer' })} className="group rounded-3xl bg-card p-7 flex flex-col gap-6 hover:shadow-[0_20px_40px_-24px_rgba(22,19,15,.35)]">
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
                  <Button onClick={() => navigate(paths.shop())}>Back to shopping <ArrowRight /></Button>
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

        <div className="lg:col-span-5">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full overflow-hidden rounded-3xl">
            <img src={photo('photo-1612198526331-66fcc90d67da', 1000, 750)} alt="A styled shelf in the studio shop with an amber candle" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
