@AGENTS.md

# Project: Ember & Bloom storefront

React 19 + TypeScript (strict) single-page shop for hand-poured candles. Vite build, Tailwind CSS v4, shadcn/ui on Radix, Motion for animation. Prices are in Indian rupees (₹). The backend is not connected yet: data is mocked in `src/data/`.

## Environment

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` (and optionally `VITE_API_TIMEOUT`). Variables are typed in `src/vite-env.d.ts`. Only `VITE_*` variables reach the browser, so never put secrets in them.

Code reads them only through `env` from `src/config/env.ts`, never `import.meta.env` directly. Add new variables to `.env.example`, `src/vite-env.d.ts` and `env.ts`.

Hosting is Vercel. `vercel.json` rewrites every path to `index.html` so React Router URLs (`/admin/login`, `/products/p1`) work on refresh or direct visit; keep it, and add the same rule on any other host.

## Commands

The project's package manager is **pnpm 10.34.3** (pinned in `.mise.toml`), and deploys run `pnpm install --frozen-lockfile`, so `pnpm-lock.yaml` must match `package.json`. pnpm isn't installed globally here: add or remove packages with `npx -y pnpm@10.34.3 add <pkg>` (or `remove`), never plain `npm install`, which updates only `package-lock.json` and breaks the deploy. After changing dependencies, check with `npx -y pnpm@10.34.3 install --frozen-lockfile`.

- `npm run dev` — dev server (already running in Figma Make; see AGENTS.md)
- `npm run build` — production build
- `npx tsc --noEmit -p .` — type check
- `npm run format` — format with oxfmt


Run the type check and `npm run build` after every change.

## Architecture

- `src/App.tsx` — providers: `MotionConfig` and `<BrowserRouter>`.
- `src/router/AppRoutes.tsx` — `AppRoutes`: every route as JSX `<Routes>`/`<Route>` (react-router-dom v7), the navbar/footer layout route, `RequireAuth` for checkout, order confirmation and account, `ScrollToTop`, and the 404 fallback.
- `src/router/paths.ts` — `ROUTES`, every route **pattern** (e.g. `ROUTES.product = '/products/:productId'`), used by `<Route path={ROUTES.x}>` and `matchPath`. Also `paths`, which fills those patterns in with `generatePath` to build links (e.g. `paths.product(id)`, `paths.shop({ collection, tag })`, `paths.account('orders')`).
- `src/pages/NotFoundPage.tsx` — the 404 page, also used for unknown products.
- `src/pages/admin/` — the admin panel: `AdminLoginPage` (`/admin/login`), `AdminLayout` (dark sidebar and mobile menu, admin menu top-right; its `NAV` list holds the admin sections), `CustomersPage` (`/admin/customers`) and `OrdersPage` (`/admin/orders`, `?customerId=` narrows it to one customer; order numbers open `OrderDetailPage` at `/admin/orders/:orderId`: read-only snapshot line items, totals, timeline, customer, address and payment. The only thing the admin edits is the Delivery card (courier + tracking number, via `endpoints.admin.orders.shipment`); orders have no status buttons, cancel or delete) `ProductsPage` (`/admin/products`, one row per product with a variants dropdown, linking to its edit page) and `ProductFormPage` (`/admin/products/new` and `/admin/products/:productId/edit`: one form for both; variants are collapsible cards, each with its own photos; saves go back to the list with a "was added / was updated" toast; the edit page has a Delete product button top-right; it and the list's ⋯ menu share `DeleteProductDialog`, which confirms, calls `endpoints.admin.products.delete(id)`, and ends with a "was deleted" toast). Destructive confirmations use `src/components/shared/ConfirmDialog.tsx`. In the form, removing a variant is staged until Save; in the list it's immediate, so it asks first. Sample data is in `src/data/admin/`.
- `src/components/admin/ListControls.tsx` — shared pieces for admin lists: `useListQuery` (filters in the URL), `SearchBox` (debounced), `SegmentedTabs`, `SortSelect`, `Pagination`.
- `src/stores/` — Zustand stores, persisted to localStorage: `cartStore.ts` (`useCartStore`, `useCartCount`, `useCartTotal`), `authStore.ts` (`useAuthStore`: user, token, profile and addresses) and `ordersStore.ts` (`useOrdersStore`: orders, `add`). The orders store is a MOCK until orders come from the API. Their localStorage keys live in `storageKeys.ts` (`ember-bloom:session`, `ember-bloom:cart`, `ember-bloom:orders`); add new keys there, never inline.
- `src/api/config.ts` — API base URL, timeout and **every endpoint path**.
- `src/api/client.ts` — the shared **axios** instance (`http`) and `api.get/post/put/patch/delete`, which resolve to the response body. Interceptors add the Bearer token, turn failures into `ApiError` (status + message), and sign the user out on a 401. Query params go in `{ params }`.
- `src/hooks/useApi.ts` — `useApiQuery<T>(url, params?)` loads data (`data`, `error`, `isLoading`, `refetch`; pass `null` to skip; cancels on unmount). `useApiMutation<TResult, TInput>(url, method)` runs writes: `method` is `'POST' | 'PUT' | 'PATCH' | 'DELETE'` (default POST), and `url` is a path from `endpoints` or a function building it from the input (e.g. `(id) => endpoints.account.address(id)`). The input to `mutate(input)` is the request body (DELETE sends none). `mutate` never throws, `mutateAsync` throws; also `isLoading`, `error`, `data`, `reset`. Use one hook per action.
- `src/pages/` — one component per page. A page that grows past one file gets its own folder with its parts beside it: `pages/account/` (`AccountPage` shell plus `ProfileSection`, `AddressesSection`, `OrdersSection`, `OrderDetailSection` and `orderStatus.ts`) and `pages/checkout/` (`CheckoutPage`, `StepIndicator`, `OrderSummary`).
- `src/components/layout/` — `Navbar`, `Footer`.
- `src/components/product/ProductCard.tsx` — the shared product card.
- `src/lib/product.ts` — `defaultSize()`, `productPrice()` and `allSoldOut()`.
- `src/components/motion/` — `BlurText` and `FadeContent`, built on Motion.
- `src/components/shared/` — `FormField` (`TextField`, `SelectField`) and `Modal`.
- `src/components/ui/` — shadcn/ui primitives.
- `src/data/` — mock data, one file per topic: `products.ts` (products, collections), `account.ts` (`mockUser`, `mockOrders`), `shipping.ts` (`deliveryMethods`), `testimonials.ts`, `tags.ts` (flat tag list and colours), `pages.ts` (CMS pages). `images.ts` holds `photo()`.
- `src/lib/money.ts` — `formatPrice()`, `FREE_SHIPPING_MIN`, `calcTax()`.
- `src/lib/utils.ts` — `cn()` and `fullName()`.
- `src/types/` — shared types by topic: `product.ts`, `order.ts`, `user.ts`, `cms.ts`. `index.ts` re-exports them all, so import from `@/types`.

## Conventions

- Functional components with named exports. `App` is the only default export.
- Props: destructure in the signature, and type them inline or with an interface next to the component.
- Match the surrounding code's style and comment density. Keep comments for the why, not the what.
- Imports: use the `@/` alias for anything outside the current folder (`@/stores/cartStore`, `@/router/paths`) and `./` only for files in the same folder. No `../` imports.

### Feedback messages

- Success messages are toasts: `toast.success('Winter Spice was deleted.')` from `react-hot-toast` (the `<Toaster />` lives once in `App.tsx`, styled with the theme tokens). Don't build success banners or pass "saved" messages through `location.state`; call the toast before navigating.
- Errors that need action stay inline: field errors under the field, save or delete failures next to the button or inside the dialog. Don't show those as toasts.

### Navigation

- Routing is `react-router-dom` with JSX routes. Import from `react-router-dom`, and don't switch to `createBrowserRouter` or route-object arrays. Build every URL with `paths` from `src/router/paths.ts`. Never write path strings in components or use `window.location`.
- For plain navigation use `<Link to={paths.x}>`, so links can open in a new tab and search engines can follow them. Use `useNavigate()` only after an action (submit, sign-out, add to cart).
- Page state that should survive a refresh or a shared link belongs in the URL: path params (`useParams`) or the query string (`useSearchParams`). Examples: product id, account tab, `?collection=` and `?tag=` on /shop.
- To add a page: add its pattern to `ROUTES`, a builder to `paths`, then `<Route path={ROUTES.x}>` in `src/router/AppRoutes.tsx`. Never write a route string anywhere else; use `matchPath(ROUTES.x, pathname)` for "is this page active" checks. Wrap it in `RequireAuth` if it needs a signed-in user. That sends visitors to /login and back afterwards via `location.state.from`.
- Pages whose local state must reset when the URL changes are keyed in the router (see `ShopRoute`, `ProductRoute`, `ContentRoute`).
- CMS pages (privacy, terms, and similar) are data-driven at `/pages/:slug`, rendered by `ContentPage`. Don't hard-code new content pages.
- Back buttons use `navigate(-1)`, falling back to home when `location.key === 'default'` (the first page of the visit).

### Admin panel

- The admin area is separate from the shop: its own routes under `/admin`, its own layout (no shop navbar/footer), and its own session in `useAdminAuthStore` (`ember-bloom:admin-session`). A customer session never grants admin access.
- Admin pages go inside the `<Route path={ROUTES.admin}>` block in `AppRoutes.tsx`, which is wrapped in `RequireAdmin`. Add the route to `ROUTES`/`paths` and the section to `NAV` in `AdminLayout.tsx`.
- Admin API paths live under `endpoints.admin`. The API client sends the admin token for any path starting with `/admin`, and a 401 there signs out the admin only.
- Admin products mirror the API's `products` and `product_variants` tables, using the same snake_case field names (`is_active`, `original_price`, `effective_price`, `created_at`, …). A product (`AdminProduct`: name, description, is_active) always has one or more variants (`AdminVariant`: name, unique slug, description falling back to the product's, unique SKU, original and effective price, stock, is_active). Photos belong to variants: `AdminVariantImage` rows (proposed `product_variant_images` table: variant_id, url, alt_text, sort_order). A variant's cover is its lowest sort_order photo; the product's cover is the first variant's (active first), see `coverImage()`. Tags belong to variants only: `AdminTag` (proposed `tags` table: id, name, slug, linked through `product_variant_tag`). Each variant is sent with `tag_ids`; tags show in the variants dropdown, not under the product name (the list row shows only the product name). Tags are picked or created with `src/components/admin/TagPicker.tsx`, and every picker on a page shares one list from `useTagList()` (`endpoints.admin.tags`). There is no collection in this schema.
- Product photos: `src/components/admin/ImageUploader.tsx` (pick or drop, uploads each file straight away through an `upload(file) → { url }` function, reorder, remove, retry, alt text; JPG/PNG/WebP, 5 MB, 8 photos). Uploads go to `endpoints.admin.uploads.image` (multipart `file` field, returns `{ url }`), and each variant is saved with its photo URLs in display order. `uploadMockImage` stands in until then.
- Orders snapshot what was bought (backend): each order line stores product/variant name, SKU, the price actually paid (paise), image URL, plus a nullable `variant_id` (`ON DELETE SET NULL`). So editing or deleting products never changes past orders; prefer `is_active: false` over deleting when a product may return.
- **Admin prices are in paise** (50000 = ₹500). Show them with `formatPaise()`, and convert typed rupees with `rupeesToPaise()`. `effective_price` must be ≤ `original_price`; a discount shows the original struck through. (The shop side still uses whole rupees and `formatPrice()` until it moves to this API.)
- The product row shows the name, the selling-price range and total stock with a count of variants that are out or low (`LOW_STOCK` in `src/data/admin/products.ts`). A labelled "N variants ⌄" button in each row's Variants column (`VariantsToggle`, dark while open) opens a variants dropdown (`VariantsPanel`): it scrolls inside a fixed height with a sticky header, adds a filter above 6 variants, and each variant row has a ⋯ menu (`VariantActions`) with Edit variant (opens the edit page with that variant expanded: `paths.adminProductEdit(id, variantId)` → `?variant=`) and Remove variant (immediate, confirmed by `RemoveVariantDialog`, calls `endpoints.admin.products.variants.delete`, disabled for a product's last variant). Each row also has a ⋯ menu (`ProductActions`: Edit product, Delete product). New products are POSTed as `NewAdminProduct` to `endpoints.admin.products.create`; edits are PUT to `endpoints.admin.products.update(id)` with the whole product: variants with an `id` are updated, without are created, and missing ones are deleted. Until then `createMockProduct` / `updateMockProduct` / `getMockProduct` stand in, and reject a SKU or slug another product uses with a 422 like the unique columns will.
- List pages keep their filters in the URL (`?q=&status=&sort=&page=`), take a `Paginated<T>` response (`items`, `total`, `page`, `pageSize`), and use a table on desktop and cards on phones. Build them from `ListControls` rather than new controls. `CustomersPage` and `OrdersPage` are the reference; their `useCustomers` / `useOrders` hooks are the single spot to swap the mock for `useApiQuery`. When a row opens a detail page, make that obvious: the whole row is clickable (pointer + hover), there's a visible "View ›" button at the end, and the key id reads as a link; inner links (e.g. the customer name) stop the row click. Link related lists through the URL, e.g. a customer's order count → `paths.adminOrders({ customerId })`.

### Money

- Always format prices with `formatPrice()`. Never write `$` or `₹` by hand.
- Prices are whole rupees. Each size has a `price` and an optional higher `originalPrice`, shown struck through.
- There is no size picker: a product sells in `defaultSize()`, its first in-stock size. Use `productPrice()` for its price on cards, filters and sorting.
- Free-shipping threshold and tax come from `src/lib/money.ts`. Don't duplicate them.

### Data and mocks

- Mock data and simulated behaviour are marked `// MOCK:`. Keep that marker on anything that stands in for the real API or payment gateway.
- User and address names are `firstName` and `lastName`. Show them with `fullName()`.
- Product tags are flat ids from `tags` in `src/data/tags.ts`. There is no tag hierarchy.
- `variantIds` on a product lists what the product page shows under "Variants".
- Rich-text CMS HTML must go through DOMPurify before `dangerouslySetInnerHTML`.

### Styling

- Tailwind utility classes in JSX. Global CSS and theme tokens live in `src/index.css`.
- Use the colour tokens (`bg-background`, `text-muted-foreground`, `bg-ink`, `border-border`, …) rather than new hex values.
- Fonts: Young Serif for headings (`font-serif`, `.display-xl`, `.display-lg`). An `<em>` inside a heading renders in the DM Serif Display italic accent. Geist is the body font.
- Photos go through `photo()` in `src/data/images.ts`.
- Animations use Motion (`motion/react`). `MotionConfig reducedMotion="user"` in `App.tsx` covers reduced-motion users.

## State management

- All global state lives in Zustand stores in `src/stores/`, one per concern: the cart in `useCartStore`, the session and user in `useAuthStore`, and orders (mock) in `useOrdersStore`. There is no React context for app state; don't add one. Select narrowly (`useCartStore((s) => s.items)`), and return stable references from selectors: never `?? []` inline.
- Don't copy API data into a store. In components, load server data with `useApiQuery` and send changes with `useApiMutation`, both built on `api` + `endpoints`. Use axios only through `src/api/client.ts`, never `fetch` or a new axios instance.
- Local UI state: `useState` / `useReducer`.
- Don't add Redux or React Query without discussing it first.

## TypeScript

- Strict mode. Don't use `any` unless a comment explains why.
- Shared types go in the matching file in `src/types/` (add a new topic file and re-export it from `index.ts` if none fits).

## Git

- Work on `master`, the default branch. Commit only when asked.
- Short, descriptive commit messages in the imperative.

## Do NOT

- Do not add dependencies without asking.
- Do not hard-code API URLs or paths. Use `endpoints` from `src/api/config.ts` and the `api` client.
- Do not write currency symbols or price formatting by hand. Use `formatPrice()`.
- Do not bring back UI the user has removed. They asked to take out: the gift sets nav link and hero button, the shop dropdown, the navbar search, the announcement bar, the size picker, the Delivery and Payment checkout steps, the add-to-cart popup, the FAQ, the footer newsletter, and the tag hierarchy.
- Do not use inline styles except for truly dynamic values (e.g. a colour swatch).
- Do not add US-specific copy (dollars, US addresses) without asking. The sample delivery methods in `products.ts` still name US carriers and are waiting for the real Indian couriers.
