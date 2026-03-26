import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export default function Layout() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <main className="flex-1 p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
