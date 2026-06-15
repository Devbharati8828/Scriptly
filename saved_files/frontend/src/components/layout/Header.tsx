import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Mail,
  Search,
  LogOut,
  Settings,
  User,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn, getInitials } from '@/lib/utils';
import { useData } from '@/context/DataContext';

export default function Header() {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const { currentUser, notifications } = useData();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-b border-white/30">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left: Page tagline */}
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-700 tracking-tight">
              Effortless Medication Management
            </h2>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Input
                    placeholder="Search medications, orders..."
                    className="h-9 bg-white/60 border-blue-100 focus:border-blue-300 text-sm"
                    autoFocus
                    onBlur={() => setShowSearch(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50 relative"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-3 py-2 border-b">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                </div>
                {notifications.slice(0, 4).map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className={cn(
                      'flex flex-col items-start gap-1 px-3 py-2.5 cursor-pointer',
                      !notif.read && 'bg-blue-50/50'
                    )}
                    onClick={() => notif.actionUrl && navigate(notif.actionUrl)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-sm font-medium">{notif.title}</span>
                      {!notif.read && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{notif.message}</span>
                    <span className="text-[10px] text-muted-foreground/70">{notif.timestamp}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-blue-600 font-medium justify-center cursor-pointer">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Messages */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => navigate('/care-circle')}
            >
              <Mail className="h-4 w-4" />
            </Button>

            {/* Separator */}
            <div className="h-6 w-px bg-slate-200 mx-1" />

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  className="h-9 gap-2 px-2 hover:bg-blue-50"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-blue-200">
                    {getInitials(currentUser.name)}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{currentUser.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/login')} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
