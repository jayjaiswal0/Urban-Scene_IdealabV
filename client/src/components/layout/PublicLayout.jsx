import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] dark:bg-[#0b1326] text-slate-900 dark:text-slate-100 transition-colors">
      <Header />
      <main className="flex-1 page-transition">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
