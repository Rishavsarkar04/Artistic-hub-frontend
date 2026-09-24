import React, { useLayoutEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
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
import { ROUTES, paths } from './routes';
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

/** Starts each new page at the top; in-page `#anchor` links keep their own scrolling. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
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

/** All routes. Rendered inside <BrowserRouter> in App.tsx. */
export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path={ROUTES.login} element={<AuthPage mode="login" />} />
        <Route path={ROUTES.register} element={<AuthPage mode="register" />} />
        <Route path={ROUTES.forgotPassword} element={<AuthPage mode="forgot" />} />

        <Route element={<ShopLayout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.shop} element={<ShopRoute />} />
          <Route path={ROUTES.product} element={<ProductRoute />} />
          <Route path={ROUTES.cart} element={<CartPage />} />
          <Route path={ROUTES.checkout} element={<RequireAuth><CheckoutPage /></RequireAuth>} />
          <Route path={ROUTES.orderConfirmation} element={<RequireAuth><OrderConfirmationPage /></RequireAuth>} />
          <Route path={ROUTES.account} element={<Navigate to={paths.account()} replace />} />
          <Route path={ROUTES.accountOrder} element={<RequireAuth><AccountPage /></RequireAuth>} />
          <Route path={ROUTES.accountTab} element={<RequireAuth><AccountPage /></RequireAuth>} />
          <Route path={ROUTES.story} element={<StoryPage />} />
          <Route path={ROUTES.contact} element={<ContactPage />} />
          <Route path={ROUTES.page} element={<ContentRoute />} />
          <Route path={ROUTES.notFound} element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
