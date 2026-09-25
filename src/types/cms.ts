/** A row from the CMS `pages` table. */
export interface CmsPage {
  id: number;
  title: string;
  slug: string;
  /** Rich-text HTML from the editor. */
  content: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
