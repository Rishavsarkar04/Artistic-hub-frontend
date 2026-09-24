import React from 'react';
import { createBrowserRouter, Navigate, Outlet, ScrollRestoration, useLocation, useParams } from 'react-router';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { AuthPage } from './pages/AuthPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { StoryPage } from './pages/StoryPage';
import { ContactPage } from './pages/ContactPage';
import { ContentPage } from './pages/ContentPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAuthStore } from './stores/authStore';
import { paths } from './routes';
import { products } from './data/products';

/** Navbar + footer around every page except sign-in. */
function ShopLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Root() {
  return (
    <>
      <Outlet />
      {/* Scrolls to top on new pages and restores position on back/forward. */}
      <ScrollRestoration />
    </>
  );
}

/** Sends signed-out visitors to sign in, then back here afterwards. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to={paths.login} replace state={{ from: location }} />;
  return <>{children}</>;
}

// Remount these pages when their URL changes, so local state (quantity, filters…) starts fresh.
function ShopRoute() {
  return <ProductListingPage key={useLocation().search} />;
}
function ProductRoute() {
  const { productId } = useParams();
  const product = products.find((p) => p.id === productId); // MOCK: load with useApiQuery(endpoints.products.detail(productId))
  if (!product) return <NotFoundPage title="Product not found" message="This candle may have sold out for good or moved." />;
  return <ProductDetailPage key={product.id} product={product} />;
}
function ContentRoute() {
  return <ContentPage key={useParams().slug} />;
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/login', element: <AuthPage mode="login" /> },
      { path: '/register', element: <AuthPage mode="register" /> },
      { path: '/forgot-password', element: <AuthPage mode="forgot" /> },
      {
        element: <ShopLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'shop', element: <ShopRoute /> },
          { path: 'products/:productId', element: <ProductRoute /> },
          { path: 'cart', element: <CartPage /> },
          { path: 'checkout', element: <RequireAuth><CheckoutPage /></RequireAuth> },
          { path: 'order-confirmation/:orderId', element: <RequireAuth><OrderConfirmationPage /></RequireAuth> },
          { path: 'account', element: <Navigate to={paths.account()} replace /> },
          { path: 'account/orders/:orderId', element: <RequireAuth><AccountPage /></RequireAuth> },
          { path: 'account/:tab', element: <RequireAuth><AccountPage /></RequireAuth> },
          { path: 'story', element: <StoryPage /> },
          { path: 'contact', element: <ContactPage /> },
          { path: 'pages/:slug', element: <ContentRoute /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
