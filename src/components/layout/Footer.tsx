import React from 'react';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '@/router/paths';
import { publishedPages } from '@/data/pages';

export function Footer() {
  const help: [string, string][] = [
    ['Contact us', paths.contact],
  ];
  const company: [string, string][] = [
    ['Our story', paths.story],
  ];

  return (
    <footer className="bg-ember-glow text-[#E9E2D6] mt-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="font-sans text-sm font-semibold text-[#F5D9A8] mb-4 tracking-normal">Customer support</h3>
            <ul className="space-y-3">{help.map(([l, to]) => <li key={l}><Link to={to} className="hover:text-white">{l}</Link></li>)}</ul>
          </div>
          <div>
            <h3 className="font-sans text-sm font-semibold text-[#F5D9A8] mb-4 tracking-normal">Company</h3>
            <ul className="space-y-3">{company.map(([l, to]) => <li key={l}><Link to={to} className="hover:text-white">{l}</Link></li>)}</ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-sans text-sm font-semibold text-[#F5D9A8] mb-4 tracking-normal">Studio</h3>
            <ul className="space-y-3 text-[#F3E3C8]">
              <li className="flex gap-2"><MapPin size={15} className="mt-1 shrink-0" />1824 SE Division St, Portland, OR</li>
              <li className="flex gap-2"><Mail size={15} className="mt-1 shrink-0" />hello@emberandbloom.co</li>
              <li className="flex gap-2"><Phone size={15} className="mt-1 shrink-0" />(503) 555-0142</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-[#F5D9A8] border-t border-white/10 pt-6">
          <p>© 2026 Ember &amp; Bloom</p>
          <div className="flex flex-wrap items-center gap-6">
            {publishedPages().map((p) => <Link key={p.slug} to={paths.page(p.slug)} className="hover:text-white">{p.title}</Link>)}
            <a
              href="https://www.linkedin.com/in/rishav-sarkar-383b27245"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Developed by Rishav Sarkar, opens LinkedIn in a new tab"
              className="group inline-flex items-center gap-1.5 h-8 pl-3.5 pr-3 rounded-full border border-glow/40 bg-glow/[.08] text-[#E9E2D6] transition-colors hover:bg-glow hover:border-glow hover:text-ink"
            >
              Developed by <span className="font-semibold text-glow group-hover:text-ink">Rishav Sarkar</span>
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        <Link to={paths.home} aria-label="Ember & Bloom home" className="block w-full mt-10 -mb-[0.18em] select-none">
          <span className="block font-serif font-light text-[#F7F4EF]/[.07] leading-none tracking-[-0.05em] text-center whitespace-nowrap" style={{ fontSize: 'clamp(64px, 15.5vw, 228px)' }}>
            Ember &amp; Bloom
          </span>
        </Link>
      </div>
    </footer>
  );
}
