import React, { useState } from 'react';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export function Footer() {
  const { navigate } = useApp();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const shop: [string, () => void][] = [
    ['All candles', () => navigate('listing', { collection: 'All' })],
    ['Signature', () => navigate('listing', { collection: 'Signature' })],
    ['Botanical', () => navigate('listing', { collection: 'Botanical' })],
    ['Coastal', () => navigate('listing', { collection: 'Coastal' })],
    ['Gift sets', () => navigate('listing', { collection: 'Gift Sets' })],
  ];
  const help: [string, () => void][] = [
    ['Contact us', () => navigate('contact')],
    ['Shipping and returns', () => navigate('contact')],
    ['FAQ', () => navigate('contact')],
    ['Track your order', () => navigate('account', { accountSection: 'orders' })],
  ];
  const company: [string, () => void][] = [
    ['Our story', () => navigate('story')],
    ['Visit the studio', () => navigate('contact')],
    ['Refill programme', () => navigate('story')],
  ];

  return (
    <footer className="bg-ink text-[#E9E2D6] mt-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <h2 className="font-serif text-4xl sm:text-5xl text-[#F7F4EF] leading-[1.05] max-w-md">New scents reach the list first.</h2>
            <p className="text-sm text-[#B8AE9F] mt-4 max-w-sm">One email a month with seasonal pours and restocks. 10% off your first order when you join.</p>
            {done ? (
              <p className="mt-6 text-sm text-[#F2C27B]">You're on the list. Your welcome code is on its way to {email}.</p>
            ) : (
              <form
                noValidate
                className="mt-6 flex items-center gap-2 max-w-md rounded-full bg-white/[.06] ring-1 ring-white/10 p-1.5 focus-within:ring-[#F2C27B]/60"
                onSubmit={(e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter an email like you@example.com'); setDone(true); }}
              >
                <label htmlFor="ft-email" className="sr-only">Email address</label>
                <input id="ft-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }} placeholder="you@example.com"
                  className="flex-1 min-w-0 bg-transparent px-4 text-sm text-[#F7F4EF] placeholder:text-[#8F8577] focus:outline-none" aria-invalid={!!err} />
                <button type="submit" className="h-10 pl-5 pr-4 rounded-full bg-[#F2C27B] text-ink text-sm font-medium flex items-center gap-1.5 hover:bg-[#f5cf94]">
                  Join <ArrowRight size={15} />
                </button>
              </form>
            )}
            {err && <p className="text-xs text-[#F2A597] mt-2 pl-4">{err}</p>}
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="font-sans text-xs text-[#8F8577] mb-4 tracking-normal">Shop</h3>
              <ul className="space-y-3">{shop.map(([l, fn]) => <li key={l}><button onClick={fn} className="hover:text-white">{l}</button></li>)}</ul>
            </div>
            <div>
              <h3 className="font-sans text-xs text-[#8F8577] mb-4 tracking-normal">Customer support</h3>
              <ul className="space-y-3">{help.map(([l, fn]) => <li key={l}><button onClick={fn} className="hover:text-white text-left">{l}</button></li>)}</ul>
              <h3 className="font-sans text-xs text-[#8F8577] mb-4 mt-8 tracking-normal">Company</h3>
              <ul className="space-y-3">{company.map(([l, fn]) => <li key={l}><button onClick={fn} className="hover:text-white text-left">{l}</button></li>)}</ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="font-sans text-xs text-[#8F8577] mb-4 tracking-normal">Studio</h3>
              <ul className="space-y-3 text-[#CFC6B8]">
                <li className="flex gap-2"><MapPin size={15} className="mt-1 shrink-0" />1824 SE Division St, Portland, OR</li>
                <li className="flex gap-2"><Mail size={15} className="mt-1 shrink-0" />hello@emberandbloom.co</li>
                <li className="flex gap-2"><Phone size={15} className="mt-1 shrink-0" />(503) 555-0142</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#8F8577] border-t border-white/10 pt-6">
          <p>© 2026 Ember &amp; Bloom</p>
          <div className="flex flex-wrap gap-6">
            {['Privacy policy', 'Terms of service', 'Accessibility', 'Cookie settings'].map((l) => <button key={l} className="hover:text-white">{l}</button>)}
          </div>
        </div>

        <button onClick={() => navigate('home')} aria-label="Ember & Bloom home" className="block w-full mt-10 -mb-[0.18em] select-none">
          <span className="block font-serif font-light text-[#F7F4EF]/[.07] leading-none tracking-[-0.05em] text-center whitespace-nowrap" style={{ fontSize: 'clamp(64px, 15.5vw, 228px)' }}>
            Ember &amp; Bloom
          </span>
        </button>
      </div>
    </footer>
  );
}
