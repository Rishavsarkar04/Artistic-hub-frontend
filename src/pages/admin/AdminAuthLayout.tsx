import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/layout/Navbar';

/** Shared shell for the admin sign-in screens: logo, "Admin panel" badge, heading, a card and a back link. */
export function AdminAuthLayout({ title, subtitle, back, children }: {
  title: string;
  subtitle: string;
  back: { to: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-secondary/40 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo />
          <span className="mt-4 inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-ink text-[#F7F4EF] text-xs font-medium">
            <ShieldCheck size={13} /> Admin panel
          </span>
          <h1 className="font-serif text-3xl mt-5">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">{children}</div>

        <Link to={back.to} className="mt-6 inline-flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> {back.label}
        </Link>
      </div>
    </div>
  );
}
