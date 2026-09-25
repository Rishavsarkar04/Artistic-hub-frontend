@AGENTS.md

# Project: Ember & Bloom storefront

React 19 + TypeScript (strict) single-page shop for hand-poured candles. Vite build, Tailwind CSS v4, shadcn/ui on Radix, Motion for animation. Prices are in Indian rupees (₹). The backend is not connected yet: data is mocked in `src/data/`.

## Environment

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` (and optionally `VITE_API_TIMEOUT`). Variables are typed in `src/vite-env.d.ts`. Only `VITE_*` variables reach the browser, so never put secrets in them.

## Commands

Use npm (pnpm is not installed).

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
- `src/stores/` — Zustand stores, persisted to localStorage: `cartStore.ts` (`useCartStore`, `useCartCount`, `useCartTotal`), `authStore.ts` (`useAuthStore`: user, token, profile and addresses) and `ordersStore.ts` (`useOrdersStore`: orders, `add`). The orders store is a MOCK until orders come from the API.
- `src/api/config.ts` — API base URL, timeout and **every endpoint path**.
- `src/api/client.ts` — the shared **axios** instance (`http`) and `api.get/post/put/patch/delete`, which resolve to the response body. Interceptors add the Bearer token, turn failures into `ApiError` (status + message), and sign the user out on a 401. Query params go in `{ params }`.
- `src/hooks/useApi.ts` — `useApiQuery<T>(url, params?)` loads data (`data`, `error`, `isLoading`, `refetch`; pass `null` to skip; cancels on unmount). `useApiMutation(fn)` runs writes (`mutate` never throws, `mutateAsync` throws; `isLoading`, `error`).
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

### Navigation

- Routing is `react-router-dom` with JSX routes. Import from `react-router-dom`, and don't switch to `createBrowserRouter` or route-object arrays. Build every URL with `paths` from `src/router/paths.ts`. Never write path strings in components or use `window.location`.
- For plain navigation use `<Link to={paths.x}>`, so links can open in a new tab and search engines can follow them. Use `useNavigate()` only after an action (submit, sign-out, add to cart).
- Page state that should survive a refresh or a shared link belongs in the URL: path params (`useParams`) or the query string (`useSearchParams`). Examples: product id, account tab, `?collection=` and `?tag=` on /shop.
- To add a page: add its pattern to `ROUTES`, a builder to `paths`, then `<Route path={ROUTES.x}>` in `src/router/AppRoutes.tsx`. Never write a route string anywhere else; use `matchPath(ROUTES.x, pathname)` for "is this page active" checks. Wrap it in `RequireAuth` if it needs a signed-in user. That sends visitors to /login and back afterwards via `location.state.from`.
- Pages whose local state must reset when the URL changes are keyed in the router (see `ShopRoute`, `ProductRoute`, `ContentRoute`).
- CMS pages (privacy, terms, and similar) are data-driven at `/pages/:slug`, rendered by `ContentPage`. Don't hard-code new content pages.
- Back buttons use `navigate(-1)`, falling back to home when `location.key === 'default'` (the first page of the visit).

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
