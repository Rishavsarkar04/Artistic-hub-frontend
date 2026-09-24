import React from 'react';
import { MotionConfig } from 'motion/react';
import { RouterProvider } from 'react-router';
import { AppProvider } from './store/AppContext';
import { router } from './router';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </MotionConfig>
  );
}
