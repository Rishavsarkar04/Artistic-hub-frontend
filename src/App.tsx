import React from 'react';
import { MotionConfig } from 'motion/react';
import { AppProvider, useApp } from './store/AppContext';
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

function AppRouter() {
  const { state } = useApp();
  const { currentPage } = state;

  // Pages without shared shell
  if (currentPage === 'auth') return <AuthPage />;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'listing' && <ProductListingPage key={`${state.listingCollection}-${state.listingScent}`} />}
        {currentPage === 'detail' && <ProductDetailPage key={state.currentProductId ?? 'none'} />}
        {currentPage === 'cart' && <CartPage />}
        {currentPage === 'checkout' && <CheckoutPage />}
        {currentPage === 'confirmation' && <OrderConfirmationPage />}
        {currentPage === 'account' && <AccountPage />}
        {currentPage === 'story' && <StoryPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'page' && <ContentPage key={state.currentSlug ?? 'none'} />}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </MotionConfig>
  );
}
