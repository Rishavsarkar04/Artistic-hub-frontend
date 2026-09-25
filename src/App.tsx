import React from 'react';
import { MotionConfig } from 'motion/react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </MotionConfig>
  );
}
