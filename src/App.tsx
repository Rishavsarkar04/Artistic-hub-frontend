import React from 'react';
import { MotionConfig } from 'motion/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { AppRoutes } from './router';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </MotionConfig>
  );
}
