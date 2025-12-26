import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Store, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DarkSolidHeaderProps {
  storeName: string;
  logoUrl?: string | null;
  primaryColor?: string;
  navLinks?: { href: string; label: string }[];
  cartItemsCount?: number;
  onCartClick?: () => void;
}

const DarkSolidHeader = ({ 
  storeName, 
  logoUrl, 
  primaryColor = '#00D4FF',
  navLinks = [],
  cartItemsCount = 0,
  onCartClick
}: DarkSolidHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="container max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: primaryColor }}
              >
                <Store className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="text-xl font-bold text-white">
              {storeName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
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
                className="relative p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
              >
                <ShoppingCart className="w-5 h-5 text-gray-300" />
                {cartItemsCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white font-bold"
                    style={{ background: primaryColor }}
                  >
                    {cartItemsCount}
                  </span>
                )}
              </button>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6 text-gray-300" /> : <Menu className="w-6 h-6 text-gray-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-800 bg-gray-900"
          >
            <nav className="container max-w-7xl mx-auto px-6 py-4 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 text-base font-medium text-gray-300 hover:text-white transition-colors"
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

export default DarkSolidHeader;
