import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Store, LogIn, User, LayoutDashboard, ShoppingBag, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, profile, isAdmin, signOut, isLoading } = useAuth();
  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/#features', label: 'المميزات' },
    { href: '/#pricing', label: 'الأسعار' },
    { href: '/demo-store', label: 'متجر تجريبي' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-card mx-4 mt-4 rounded-2xl">
        <div className="container max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold gradient-text">
                alshbh.store
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === link.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-medium max-w-[100px] truncate">
                        {profile?.name || 'حسابي'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{profile?.name || 'مستخدم'}</p>
                        <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="w-4 h-4" />
                        لوحة التحكم
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <ShoppingBag className="w-4 h-4" />
                        متاجري
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center gap-2 cursor-pointer text-primary">
                            <Settings className="w-4 h-4" />
                            لوحة الإدارة
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={signOut}
                      className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link 
                    to="/auth" 
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    تسجيل الدخول
                  </Link>
                  <Link to="/auth" className="btn-primary py-2 px-6 text-sm">
                    أنشئ متجرك
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden glass-card mx-4 mt-2 rounded-2xl overflow-hidden"
          >
            <nav className="p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-lg font-medium hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{profile?.name || 'مستخدم'}</p>
                        <p className="text-sm text-muted-foreground">{profile?.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 py-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    لوحة التحكم
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 py-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    متاجري
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 py-2 text-lg font-medium text-primary hover:opacity-80 transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      لوحة الإدارة
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut(); setIsOpen(false); }}
                    className="flex items-center gap-3 w-full text-right py-2 text-lg font-medium text-destructive hover:opacity-80 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 py-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="block btn-primary text-center mt-4"
                  >
                    أنشئ متجرك
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
