import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Pill,
  Package,
  ShieldCheck,
  Bell,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { CapsuleLogoIcon } from '@/components/icons/CustomIcons';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/medications', label: 'Medications', icon: Pill },
  { to: '/pharmacy-orders', label: 'Pharmacy Orders', icon: Package },
  { to: '/prior-authorizations', label: 'Prior Authorizations', icon: ShieldCheck },
  { to: '/caregiver-alerts', label: 'Caregiver Alerts', icon: Bell },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

const sidebarVariants = {
  hidden: { x: -280 },
  visible: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { careCircleMembers } = useData();
  const careTeam = careCircleMembers.filter(
    (m) => m.role === 'doctor' || m.role === 'caregiver'
  ).slice(0, 2);

  return (
    <motion.aside
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="fixed left-0 top-0 bottom-0 w-[260px] bg-linear-to-b from-[#0a2e6c] to-[#0d3b8f] text-white flex flex-col z-50 shadow-2xl"
    >
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3">
        <CapsuleLogoIcon className="w-10 h-10 drop-shadow-md" />
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-linear-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Scriptly
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="block"
            >
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/15 text-white shadow-lg shadow-blue-900/20 backdrop-blur-sm'
                    : 'text-blue-200 hover:bg-white/8 hover:text-white'
                )}
              >
                <item.icon className={cn('w-[18px] h-[18px]', isActive ? 'text-cyan-300' : '')} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 w-1 h-6 bg-cyan-400 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Care Team Section */}
      <div className="px-3 pb-2">
        <div className="border-t border-white/10 pt-4 mb-3">
          <NavLink
            to="/care-circle"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-300 hover:text-white transition-colors"
          >
            <Users className="w-4 h-4" />
            Care Team
          </NavLink>
        </div>
        <div className="space-y-1">
          {careTeam.map((member) => (
            <motion.div
              key={member.id}
              whileHover={{ x: 4 }}
              onClick={() => navigate('/care-circle')}
              className="flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer text-blue-200 hover:bg-white/8 hover:text-white transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/20">
                {getInitials(member.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.name}</p>
                <p className="text-[10px] text-blue-400 truncate">{member.relationship}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="px-3 pb-5">
        <NavLink to="/settings">
          <motion.div
            whileHover={{ x: 4 }}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
              location.pathname === '/settings'
                ? 'bg-white/15 text-white'
                : 'text-blue-300 hover:bg-white/8 hover:text-white'
            )}
          >
            <Settings className="w-[18px] h-[18px]" />
            <span>Settings</span>
          </motion.div>
        </NavLink>
      </div>
    </motion.aside>
  );
}
