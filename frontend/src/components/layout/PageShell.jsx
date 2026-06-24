import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AIChatBot from '@/components/AIChatBot';
import { useSidebar } from '@/context/SidebarContext';
import { useData } from '@/context/DataContext';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function PageShell() {
  const { isOpen, closeSidebar } = useSidebar();
  const { loading, error, refetch } = useData();

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
        <main className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                <Loader2 className="absolute w-6 h-6 text-blue-600 animate-pulse" />
              </div>
              <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading your dashboard...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Couldn't load your dashboard</h2>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  {error.message || 'There was a connection issue. Please check your network and try again.'}
                </p>
                <button
                  onClick={refetch}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  Retry Connection
                </button>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      <AIChatBot />
    </div>
  );
}
