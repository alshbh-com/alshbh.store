import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Store, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GlassHeaderProps {
  storeName: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  navLinks?: { href: string; label: string }[];
  cartItemsCount?: number;
  onCartClick?: () => void;
}

const GlassHeader = ({ 
  storeName, 
  logoUrl, 
  primaryColor = '#00D4FF',
  secondaryColor = '#9D4EDD',
  navLinks = [],
  cartItemsCount = 0,
  onCartClick
}: GlassHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div 
        className="mx-4 mt-4 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="container max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                >
                  <Store className="w-5 h-5 text-white" />
                </div>
              )}
              <span 
                className="text-xl font-bold"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {storeName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Cart & Mobile Menu */}
            <div className="flex items-center gap-4">
              {onCartClick && (
                <button
                  onClick={onCartClick}
                  className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 text-white" />
                  {cartItemsCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                      style={{ background: primaryColor }}
                    >
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              )}
              
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
              </button>
            </div>
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
            className="md:hidden mx-4 mt-2 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <nav className="p-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-lg font-medium text-white hover:opacity-80 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default GlassHeader;
