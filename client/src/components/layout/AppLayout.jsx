import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] dark:bg-[#0b1326] text-slate-900 dark:text-slate-100 transition-colors">
      <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full page-transition">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AppLayout;
