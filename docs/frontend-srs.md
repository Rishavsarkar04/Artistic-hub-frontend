# Artistic Hub — Frontend Software Requirements Specification

Version: 1.1 (aligned with the codebase on 2026-10-01)
Platform: Candle e-commerce
Roles: Admin and Customer
Payment provider: Razorpay
Frontend: `Artistic-hub-frontend/` (React 19 + TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Zustand, axios, react-router-dom)

## 1. Purpose

Build a responsive customer storefront and admin panel for Artistic Hub.

Use the backend SRS (`Artistic-hub-backend/docs/backend-srs.md`) as the
shared API and business-rule contract.
Use the ER diagram (`Artistic-hub-backend/docs/database/er-diagram.md`)
to understand entity relationships.

The frontend stack is the existing repository's (above). Follow the
conventions in this repository's `CLAUDE.md`: API paths in
`src/api/config.ts`, requests through `src/api/client.ts` and the
`useApiQuery` / `useApiMutation` hooks, routes in `src/router/`,
Zustand stores in `src/stores/`, shadcn/ui components.

The app was first built on mock data (`src/data/`, marked `// MOCK:`).
Section 18 lists where it differs from this specification.

Do not implement business rules solely in the frontend.
Backend responses are authoritative for prices, stock, permissions,
payment confirmation, and order state.

## 2. Application access

Exactly two authenticated roles:
- admin
- customer

Suggested route groups:
- Public storefront and authentication.
- Customer account, cart, checkout and orders.
- Admin catalog, customers and orders.

The admin area and the storefront have separate sign-in pages, API
endpoints and sessions (backend `/admin/auth/*` and `/auth/*`):
- Admins sign in at `/admin/login` and land in the admin area. The admin
  session is kept separately (`useAdminAuthStore`).
- Customers sign in at `/login`. A customer without a profile goes to
  profile creation; one with a profile goes to the intended customer page.
- A customer session never opens the admin area, and an admin session is
  not a customer session.
- Each area has its own forgot/reset-password pages, so reset links open
  the right one.

Never infer authenticated access from token presence alone.
Load the current user/session from the backend.
Handle expired sessions and forbidden responses.

Route guards improve navigation; backend authorization remains required.

## 3. Authentication screens

### FE-AUTH-01: Registration

Fields:
- Email.
- Password.
- Confirm password.

Display:
- Field validation.
- Duplicate-email error.
- Password visibility toggle.
- Submission/loading state.
- Link to sign in.

Registration creates an active customer.
No pending-admin-approval screen is required.

After registration, direct the customer to sign in unless the agreed
authentication API explicitly returns an authenticated session.

Do not ask for profile details during this registration step.

### FE-AUTH-02: Sign in

Admin and Customer sign in using email/password, on separate pages:
the storefront sign-in for customers and `/admin/login` for admins. Each
page calls its own endpoint, which rejects the other role with the normal
invalid-credentials message.

Display:
- Invalid-credentials message.
- Blocked/suspended/inactive-account response where provided.
- Forgot-password link.

Redirect customers by profile-completion state; admins go to the admin area.

### FE-AUTH-03: Forgot/reset password

Forgot-password page:
- Email input.
- Neutral success message.

Reset-password page:
- New password.
- Confirmation.
- Expired/invalid reset-link handling.
- Link to request a new reset email.

Both roles can use these flows.

## 4. Customer profile

### FE-PROFILE-01: Initial onboarding

After first sign-in, show a profile-creation form.

Proposed fields:
- Name.
- Phone.
- Date of birth, optional.
- Gender, optional.
- Avatar, optional.

Required fields must match the agreed backend validation.

Profile creation must complete before checkout, and before items can be
saved to the server cart (carts belong to the customer profile).
Preserve the customer's intended navigation/cart during onboarding.

### FE-PROFILE-02: Profile updates

Show current profile data and allow approved fields to be edited.

Do not expose:
- Role.
- Account status.
- Internal notes.
- Email verification state as an editable field.

Include a Change Password section within the profile page:
- Current password.
- New password.
- Confirm new password.

Submit password updates through the dedicated password API.
Do not send password fields with ordinary profile updates.

Admin must also have a change-password screen or account section.

## 5. Address management

Show all saved customer addresses.

Each address card displays:
- Label.
- Recipient.
- Phone.
- Full address.
- Default badge where applicable.
- Edit action.
- Set as Default action.

Allow:
- Add address.
- Update an individual address.
- Set one address as default.

The first address becomes default according to backend behavior.
Refresh/invalidate the address list after changes.

Do not add address deletion unless requested.

Show field-level errors and prevent duplicate submissions.

## 6. Variant listing

### FE-CATALOG-01: Listing cards

Each card represents one product variant.

Display:
- Primary image.
- Variant name.
- Parent product name where useful.
- Selling price and currency.
- Original price when meaningfully different.
- Relevant attached tags where layout permits.

Only display variants returned as eligible by the backend.

Eligibility requires:
- Active parent.
- Active variant.
- Positive available stock.

The backend decides eligibility; do not load all variants and hide
unavailable ones only in the browser.

### FE-CATALOG-02: Filters and sorting

Filters:
- Minimum selling price.
- Maximum selling price.
- One or more tags.

Sort:
- Newest.
- Price: Low to High.
- Price: High to Low.

Price range is a filter, not another sort choice.

Proposed multi-tag behavior:
Match any selected tag, combined with the price range.

Requirements:
- Store filters, sort and pagination in URL query parameters.
- Preserve them when navigating back from details.
- Reset pagination when filters change.
- Provide Clear Filters.
- Debounce price input or apply filters with an explicit button.
- Prevent stale responses from replacing newer filter results.

Show:
- Initial loading state.
- Loading more/refetching state.
- Empty catalog state.
- No matching results state.
- Request failure with retry.

## 7. Variant details

Opening a card shows the exact selected variant.

Display:
- Product and variant names.
- Product/variant descriptions as returned.
- Ordered image gallery.
- Selling/original price.
- Tags.
- Availability.
- Quantity selector.
- Add to Cart button.

Quantity:
- Positive integer only.
- Minimum one.
- Maximum based on backend-reported available quantity where supplied.

Do not permit Add to Cart for unavailable items.

If a direct link points to a deleted, inactive or unavailable variant,
show a clear unavailable/not-found state and a link to continue shopping.

After successful Add to Cart:
Navigate to the cart page.

Optional sibling-variant switching must update the selected variant ID,
images, price and available quantity together.

## 8. Cart

Approved 2026-09-30: the backend keeps one cart per customer
(`carts` / `cart_items`; backend SRS BE-CART-01). A cart item is a
variant ID and a quantity; the cart stores no prices.

For a signed-in customer with a profile:
- Load the cart from `GET /customer/cart`; it is the source of truth.
- Add, change quantity and remove through the cart endpoints, then show
  the returned cart.
- Prices, line totals and availability shown are the backend's current
  values from the cart response.

Until the cart API exists, the browser cart in `src/stores/cartStore.ts`
stands in for it.

Open decision (guest cart): whether signed-out visitors keep a browser
cart that is merged into the server cart on sign-in, or must sign in
before adding to cart. Until decided, keep the browser cart for
signed-out visitors and do not build the merge.

A cart line shows:
- Variant image.
- Product/variant name.
- Price.
- Quantity.
- Line total.
- Remove action.

Allow:
- Quantity changes.
- Remove line.
- Continue shopping.
- Proceed to checkout.

Adding the same variant again increases its existing line quantity.

Before checkout, request backend validation/review.
Do not submit cached prices as authoritative amounts.

If a variant becomes unavailable or insufficient stock remains:
- Identify the affected line.
- Explain the problem.
- Require the customer to update/remove it before payment.

If a price changes:
- Show the updated price and total.
- Require customer confirmation.

Show an empty-cart state with a browse-products action.

Any cart kept in the browser:
- Keep it separate from authentication secrets.
- Clear or re-scope it on sign-out and account switch so a previous
  customer's cart is never shown.

## 9. Checkout

### FE-CHECKOUT-01: Address selection

Require authentication and a completed customer profile.

Load the customer's addresses.
Preselect the default address.

Allow the customer to select another address for this order.

Choosing a different checkout address must not automatically change
the customer's saved default.

If no addresses exist:
Show Add Address and continue checkout after saving.

### FE-CHECKOUT-02: Review

Request the review with the selected address ID only; the backend reads
the items from the customer's server cart.

Display:
- Selected shipping address.
- All variants and quantities.
- Unit prices and line totals.
- Subtotal.
- Discounts, if supplied.
- Shipping amount.
- Final total and currency.

Use backend-calculated values.
Do not invent shipping/tax values or perform authoritative calculations
using JavaScript floating-point arithmetic.

Provide a Pay with Razorpay action.

Disable repeated submissions while payment initiation is in progress.
Recover gracefully from network failure without blindly creating
another payment attempt.

### FE-CHECKOUT-03: Razorpay redirect

Call the backend payment-initiation endpoint.

The proposed response includes:
- Internal order number/reference.
- Hosted payment URL.

Navigate to the returned Razorpay URL.
Never expose API secrets or create payment links directly in the browser.

Preserve enough non-sensitive checkout identity to retrieve the result
after returning.

## 10. Payment result / order placed page

The return route is a payment-result page that can become the
Order Placed page once backend confirmation is complete.

Required states:

1. Confirming payment
   - Backend has not completed captured-event processing.
   - Show a neutral progress message.
   - Poll the authenticated checkout-status endpoint with a limit.
   - Offer Check Again after the polling window ends.

2. Order placed
   - Backend confirms successful payment and order confirmation.
   - Show order number and summary.
   - Provide View Order and Continue Shopping actions.

3. Payment failed/cancelled
   - Show the backend-confirmed outcome.
   - Offer a safe retry only when the backend permits it.

4. Status unavailable
   - Explain that confirmation could not currently be retrieved.
   - Offer retry/order-history navigation.
   - Do not instruct the customer to pay again while payment is unknown.

Never show success solely because the redirect query says paid.

Do not implement webhook handling in the frontend.

The backend removes the purchased quantities from the server cart when
it confirms payment; items added after checkout started stay. After a
confirmed order, reload the cart rather than clearing it in the browser.

Do not claim payment failure merely because polling timed out.

## 11. Customer order history and details

### FE-ORDER-01: History

Show the customer's placed orders with:
- Order number.
- Placement/confirmation date.
- Order status.
- Payment status.
- Total and currency.
- View Details action.

Provide pagination, loading, empty and error states.

Pending payment preparation must not be presented as a successful order.

### FE-ORDER-02: Details

Display:
- All purchased order items.
- Snapshot product/variant names and SKU.
- Snapshot image where available.
- Quantities, unit prices and totals.
- Snapshot customer/shipping information.
- Order status.
- Payment status.
- Tracking provider.
- Tracking number.

Use order snapshots returned by the API.
Do not reconstruct historical orders from current product/profile APIs.

If tracking is absent:
Show “Tracking details have not been added yet.”

Tracking changes appear after the next fetch or refresh.
Real-time sockets are not required.

Do not add customer cancellation, refund, or order-edit actions.

## 12. Admin catalog

### FE-ADMIN-01: Product management

Provide:
- Product list.
- Create/edit product.
- Active/inactive control.
- Delete action with confirmation.

Use the schema fields:
- Name.
- Slug.
- Description.
- Active state.

Explain that deactivating/deleting a parent affects its variants.

### FE-ADMIN-02: Variant management

Under a product, provide multiple variants.

Fields:
- Name.
- SKU.
- Slug.
- Description.
- Original price.
- Selling price.
- Stock.
- Active state.
- Attached tags.
- Images.

Display:
- Backend validation errors.
- Stock as a non-negative integer.
- Notice that zero-stock variants are excluded from customer listings.

Do not enable a variant under an inactive parent.

Images:
- Upload multiple.
- Preview.
- Remove.
- Reorder.

Use the first ordered photo as the proposed listing image.

The current uploader also collects alt text per photo, but
PRODUCT_VARIANT_PHOTOS has no alt-text column (backend SRS section 16).
Keep or remove it once that is decided.

Confirm destructive deletion.
Explain that historical orders remain intact.

### FE-ADMIN-03: Tags

Tags are managed inside the product form, not on a separate page:
each variant's Tags field has an "Add or edit tags" link that opens a
dialog (`src/components/admin/ManageTagsDialog.tsx`) where the admin can:
- Find a tag, or add a new one from the same box (the new tag is
  selected for that variant).
- Rename a tag.
- Delete a tag, confirmed inline in its row.

Renames and deletes apply immediately and to every product; the dialog
says so. Deleting a tag removes it from variants, never the variants.

Allow tags to be selected on each variant (chips in the Tags field).

The slug is generated by the backend from the name and is not shown or
edited in the UI. A standalone tag page or an editable slug would need
a decision.

## 13. Admin customer and order views

### FE-ADMIN-CUSTOMERS

Provide:
- Customer list.
- Customer details.
- Link to that customer's orders.
- Pagination and loading/error states.

Do not add customer role/status/password editing features.

### FE-ADMIN-ORDERS

Provide:
- All placed-order listing.
- Customer identity/relationship.
- Order number.
- Order and payment statuses.
- Total and date.
- Order details with multiple items and shipping snapshot.

Order details are read-only except for:
- Tracking provider.
- Tracking number.

Tracking form:
- Require both fields.
- Keep tracking number as text.
- Submit only those two fields.
- Show save progress, validation errors and success feedback.
- Reload/invalidate order details after saving.

Do not show:
- Editable order status.
- Mark as Paid.
- Edit items/address/total.
- Refund.
- Cancel.
- Delete order.

Do not label a parcel delivered or an order completed just because
tracking information was entered.

## 14. Shared response contract

Use the endpoint names proposed in the backend SRS (section 14) or agree
on revised names across both implementations before coding. Put every
path in `src/api/config.ts`.

Once an endpoint exists, the backend's generated OpenAPI spec
(`Artistic-hub-backend/docs/api/openapi.json`) is its exact contract:
read it before calling the endpoint, and match its request fields and
response shape in `src/types/`. Endpoints not yet in the spec stay mocked.

Suggested response conventions:
- Money: decimal strings. Format them for display without converting to
  a JavaScript number for any calculation the backend owns.
- Dates: timezone-aware ISO 8601 strings.
- Lists: data plus pagination metadata.
- Validation: field-keyed error messages.
- User session: roles and profile-completion state.
- Orders: order status and payment status separately.

Status mapping:
- payments.status = paid means payment is paid.
- orders.status = confirmed means the purchase is confirmed.
- Do not expect orders.status = paid; it is absent from the ER diagram.

For 401:
Clear the invalid session and direct to sign in.

For 403:
Show access denied.

For validation errors:
Keep entered data and show errors near fields.

For checkout conflicts:
Reload the backend review and ask the customer to reconfirm.

## 15. Accessibility and responsive behavior

Support mobile and desktop customer flows and usable admin layouts.

Requirements:
- Label form inputs.
- Support keyboard navigation.
- Use visible focus states.
- Associate validation errors with fields.
- Provide meaningful image alt text.
- Do not communicate status using color alone.
- Announce payment and submission status changes accessibly.
- Prevent duplicate form submissions.
- Preserve entered values when recoverable errors occur.

## 16. Acceptance tests

- Customer registers using only email/password fields.
- First sign-in routes a profile-less customer to profile creation.
- Profile page includes a functioning password-change section.
- Multiple addresses can be created/edited with one default.
- Default address is preselected at checkout.
- Choosing another shipping address does not change the saved default.
- Variant filters and sorting work together and survive back navigation.
- Add to Cart redirects to cart.
- Quantity cannot be zero, negative or fractional.
- The cart shown after sign-in is the customer's server cart.
- Stale stock/price changes are explained before payment.
- Browser redirects to the backend-provided Razorpay URL.
- Result page waits for backend confirmation.
- Paid order displays multiple snapshot items correctly.
- Admin can manage variant stock, images and tags.
- Admin can add, rename and delete tags from the product form.
- Admin can view customer-to-order relationships.
- Admin can edit only tracking provider and number on orders.
- Customer sees saved tracking after refresh.
- Expired sessions do not expose protected screens/data.

## 17. Instructions to Claude

Use this SRS together with the backend SRS and the ER diagram.

Follow this repository's `CLAUDE.md` conventions. Reuse its routing,
API client, state management and UI components.

Do not silently choose a new framework.
Do not hard-code production business rules that the backend owns.
Do not add admin order actions beyond tracking edits.
Do not add guest checkout, refunds, coupons, reviews or courier APIs.

Build and verify incrementally:
1. Authentication and profile onboarding.
2. Profile/password/address screens.
3. Variant catalog, filters and details.
4. Cart and checkout review.
5. Razorpay redirect/result handling.
6. Customer orders.
7. Admin catalog, customers, orders and tracking (already built on mock
   data; connect to the API and close the gaps in section 18).
8. Authorization, failure states and responsive validation.

Clearly report unresolved API/schema decisions before implementing
affected behavior. When changing existing behavior listed in section 18,
confirm with the user first.

## 18. Current frontend vs this specification

The app was built on mock data before this specification. These
differences need changing (after confirming with the user). API path and
field differences are listed in backend SRS section 17 and are not
repeated here.

| Area | This specification | Frontend today |
|---|---|---|
| Registration | Email, password, confirm password only | Also asks for first and last name (`AuthPage`) |
| Profile onboarding | Profile-creation step after first sign-in; required before checkout | No onboarding step; profile is edited in Account |
| Customer name | One name field | First and last name |
| Addresses | Add, edit, set default; no delete | Also has Delete with confirmation (`AddressesSection`) |
| Catalog cards | One card per eligible variant | One card per product (`ProductListingPage`) |
| Catalog filters | Min/max price and tags, in the URL; sorts newest, price asc, price desc | Price slider and tags; `?collection=` (collections are not in the schema); a Featured sort; sort not kept in the URL |
| Add to Cart | Navigates to the cart | Button changes to "Added · View cart" |
| Cart | Server cart for signed-in customers | Browser localStorage cart for everyone |
| Shipping and tax | From the backend only | Free-shipping threshold and tax calculated in the browser (`CartPage`, `CheckoutPage`, `OrderSummary`) |
| Checkout and payment | Backend review, Razorpay redirect, result page with polling | Order created in the browser (mock `ordersStore`); no Razorpay step |
| Order status | Order status and payment status shown separately | Processing, shipped, delivered, cancelled timeline |
| Admin roles | admin only | `owner` / `staff` |
| Admin password | Change-password screen or section | Not present |
| Admin money | Decimal strings | Integer paise (`formatPaise`, `rupeesToPaise`) |
| Photo alt text | Not in the schema | Collected per photo |
| Tag slug | Generated by the backend | Generated by the mock; not shown |
