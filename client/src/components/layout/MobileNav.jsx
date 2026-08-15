import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Search, Library, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav() {
  const { isAdmin } = useAuth();

  const itemClass = ({ isActive }) =>
    `flex flex-col items-center justify-center py-2 text-[10px] font-medium transition ${
      isActive ? 'text-brand-400 font-bold' : 'text-slate-400 hover:text-slate-200'
    }`;

  return (
    <nav className="md:hidden fixed bottom-20 inset-x-0 z-30 bg-dark-900/95 backdrop-blur-xl border-t border-white/10 grid grid-cols-5 px-2">
      <NavLink to="/" className={itemClass}>
        <Home className="w-5 h-5 mb-0.5" />
        Home
      </NavLink>
      <NavLink to="/explore" className={itemClass}>
        <Compass className="w-5 h-5 mb-0.5" />
        Explore
      </NavLink>
      <NavLink to="/search" className={itemClass}>
        <Search className="w-5 h-5 mb-0.5" />
        Search
      </NavLink>
      <NavLink to="/library" className={itemClass}>
        <Library className="w-5 h-5 mb-0.5" />
        Library
      </NavLink>
      <NavLink to="/admin" className={itemClass}>
        <Shield className="w-5 h-5 mb-0.5 text-amber-400" />
        Admin
      </NavLink>
    </nav>
  );
}
