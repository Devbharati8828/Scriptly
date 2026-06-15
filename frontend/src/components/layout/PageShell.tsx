import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSidebar } from '@/context/SidebarContext';

export default function PageShell() {
  const { isOpen, closeSidebar } = useSidebar();

  return (
    <div className="min-h-screen page-bg flex overflow-hidden">
      <Sidebar />
      {/* Mobile overlay (closes sidebar on outside click) */}
      <div
        className={[
          'fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] transition-opacity md:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <div className="flex-1 ml-0 md:ml-[260px] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
