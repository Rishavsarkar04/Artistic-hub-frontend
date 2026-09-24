Design a complete, responsive candle ecommerce website using **shadcn/ui components and Tailwind CSS**. Include the full customer shopping journey and account management screens, with connected prototype interactions.

Use **“Ember & Bloom”** as a placeholder brand name.

**1. Visual style and component system**

* Create a warm, elegant candle brand aesthetic with ivory backgrounds, charcoal text, and muted amber accents.
* Use high-quality candle photography, generous spacing, readable typography, and subtle hover effects.
* Use shadcn/ui patterns for buttons, inputs, cards, dialogs, sheets, dropdowns, tabs, accordions, badges, and notifications.
* Keep colors, spacing, typography, border radii, and component states consistent through reusable design tokens.
* Build layouts using Auto Layout and reusable components suitable for implementation with Tailwind CSS.
* Maintain accessible contrast, visible focus states, and clearly labeled form fields.

**2. Shared navigation and footer**

* Header with brand logo, navigation, product search, customer account, and cart icon with item count.
* Mobile navigation in a sheet/drawer.
* Footer with customer support, contact information, shipping and returns, privacy policy, and terms links.

**3. Home page**

* Hero section with candle lifestyle imagery, a clear headline, and a “Shop Candles” button.
* Featured collections, such as scented candles, decorative candles, and gift sets.
* Bestselling products with image, name, scent, price, and shopping action.
* Brand story and product benefits.
* Customer testimonials and newsletter signup.

**4. Product listing page**

* Page title, breadcrumbs, product count, and responsive product grid.
* Search, sorting, and filters for scent, price, size, and availability.
* Sorting options: featured, newest, price low to high, and price high to low.
* Desktop filter sidebar and mobile filter drawer.
* Active filter chips and a “Clear all” action.
* Product cards with image, name, price, available variants, and stock status.
* Use “Choose options” when a product requires variant selection.
* Include loading and no-results states.

**5. Product details page**

* Image gallery with thumbnails.
* Product name, price, description, scent notes, wax type, burn time, and dimensions.
* Variant selectors for available sizes or scents, with price and stock updates.
* Quantity selector and prominent “Add to Cart” action.
* Prevent unavailable variants from being added to the cart.
* Shipping and returns information, candle care instructions, and related products.
* Show an add-to-cart confirmation with “Continue Shopping” and “View Cart” actions.
* On mobile, provide a sticky purchase bar without covering page content.

**6. Cart page**

* List cart items with image, product name, selected variant, unit price, quantity, and line total.
* Allow customers to update quantities and remove items.
* Show subtotal, estimated shipping/tax where applicable, and total.
* Provide “Continue Shopping” and “Proceed to Checkout” actions.
* Include an empty-cart state and notices for unavailable items.

**7. Registration and login**

* Registration with full name, email, password, and password confirmation.
* Login, logout, forgot-password, and reset-password flows.
* Show inline validation, password visibility controls, loading states, and success/error feedback.
* Customers can browse and build a cart before signing in.
* Require login or registration before completing checkout, preserving the cart and returning customers to checkout afterward.

**8. Checkout and payment**

Create a clear checkout flow:
Shipping Address → Delivery → Payment → Review and Place Order.

* Select an existing saved address or add a new address.
* Allow customers to save a new address to their account.
* Select a delivery method and show its cost and estimated delivery time.
* Provide a billing-address option with “Same as shipping address.”
* Include a payment-provider component placeholder for secure payment entry.
* Display an order summary with products, quantities, subtotal, shipping, tax, and final total.
* Include a clear “Pay & Place Order” action.
* Design processing, successful, pending, and failed-payment states.
* Prevent duplicate submissions during payment processing.
* Allow failed-payment retries without losing checkout information.
* Do not show a successful order confirmation until payment/order status is confirmed.

**9. Order confirmation**

* Show order number, order date, payment status, purchased items, totals, shipping address, and estimated delivery.
* Include “View Order Details” and “Continue Shopping” actions.
* Give pending payments a separate message explaining their current status.

**10. Customer account**

Use desktop sidebar navigation and a mobile-friendly account menu.

Include these screens:

**Profile**

* View and update full name, email, and phone number.
* Change password in a separate section.
* Show validation and save confirmation.

**Saved addresses**

* Add, edit, and delete multiple addresses.
* Mark an address as the default.
* Include recipient name, phone number, address lines, city, state/region, postal code, and country.
* Support address labels such as Home and Work.
* Confirm address deletion.
* Editing a saved address must not change the address recorded on an existing order.

**Order history**

* Display previous orders with order number, date, total, payment status, fulfillment status, and “View Details.”
* Include pagination, status filtering, and an empty state.
* Keep payment status separate from fulfillment status.

**Order details**

* Show purchased products, variant selections, quantities, prices, and total breakdown.
* Display shipping and billing addresses recorded when the order was placed.
* Include payment method summary, transaction reference, payment status, and order progress.
* Display tracking information when available and a customer-support action.
* Show only masked payment information.

**11. Responsive behavior**

* Design desktop at approximately 1440px, tablet at 768px, and mobile at 390px.
* Adapt grids, navigation, forms, cart, checkout, and account pages for each size.
* Convert desktop order tables into readable cards on mobile.
* Use touch-friendly controls and avoid horizontal overflow.
* Keep primary actions easy to reach.

**12. Deliverables**

* Create all key screens, not just the home page.
* Include reusable components and a small design-system page.
* Provide default, hover, focus, disabled, loading, error, success, and empty states where relevant.
* Use realistic candle product names, imagery, prices, and sample order data.
* Connect the main prototype flow:
  Home → Product Listing → Product Details → Cart → Login/Register → Checkout → Payment → Order Confirmation → Order Details.
* Also connect profile editing, address management, and order-history navigation.
* Keep the scope focused on customer-facing ecommerce; no admin dashboard is required.
* If generating code, use React, Tailwind CSS, and shadcn/ui with reusable components. Clearly identify mocked authentication, payment, and order data.
