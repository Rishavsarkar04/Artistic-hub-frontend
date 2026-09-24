import type { CmsPage } from '../types';

// MOCK: rows from the CMS `pages` table. Replace with API calls (list published pages, fetch one by slug).
export const cmsPages: CmsPage[] = [
  {
    id: 1,
    title: 'Privacy policy',
    slug: 'privacy-policy',
    status: 'published',
    published_at: '2026-09-24',
    created_at: '2026-09-24',
    updated_at: '2026-09-24',
    content: `
<p>This policy explains what information we collect when you use our website or shop with us, and how we use it.</p>
<h2>Information we collect</h2>
<p>When you place an order or create an account, we collect your name, email address, phone number and shipping address.</p>
<h2>How we use it</h2>
<ul>
  <li>To process and deliver your orders</li>
  <li>To reply to your messages</li>
  <li>To send order updates</li>
</ul>
<h2>Contact us</h2>
<p>If you have any questions, email us at <a href="mailto:hello@emberandbloom.co">hello@emberandbloom.co</a>.</p>
`,
  },
  {
    id: 2,
    title: 'Terms of service',
    slug: 'terms-of-service',
    status: 'published',
    published_at: '2026-09-24',
    created_at: '2026-09-24',
    updated_at: '2026-09-24',
    content: `
<p>By using this website or placing an order, you agree to the following terms.</p>
<h2>Orders</h2>
<p>All prices are in US dollars. We may cancel an order if an item is out of stock, and you will receive a full refund.</p>
<h2>Returns</h2>
<p>Unused candles can be returned within 30 days of delivery.</p>
<h2>Contact us</h2>
<p>If you have any questions, email us at <a href="mailto:hello@emberandbloom.co">hello@emberandbloom.co</a>.</p>
`,
  },
];

export const publishedPages = () => cmsPages.filter((p) => p.status === 'published');
export const getPageBySlug = (slug: string | null) => publishedPages().find((p) => p.slug === slug);

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
