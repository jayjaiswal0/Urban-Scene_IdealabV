import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AppBackground from '../common/AppBackground';

export const PublicLayout = () => {
  return (
    <div className="relative min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors">
      <AppBackground />
      <Header />
      <main className="flex-1 page-transition">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
