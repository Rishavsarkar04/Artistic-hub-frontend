import React from 'react';
import { MotionConfig } from 'motion/react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from '@/router/AppRoutes';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      {/* Success messages everywhere use toast.success(); errors that need fixing stay inline. */}
      <Toaster
        position="top-center"
        gutter={10}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '1rem',
            padding: '10px 14px',
            fontSize: '14px',
            boxShadow: '0 20px 50px -20px rgba(122,40,12,.35)',
          },
          success: { iconTheme: { primary: '#3cdb54', secondary: '#FFFFFF' } },
        }}
      />
    </MotionConfig>
  );
}
