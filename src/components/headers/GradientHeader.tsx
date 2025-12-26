import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Store, ShoppingCart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GradientHeaderProps {
  storeName: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  navLinks?: { href: string; label: string }[];
  cartItemsCount?: number;
  onCartClick?: () => void;
}

const GradientHeader = ({ 
  storeName, 
  logoUrl, 
  primaryColor = '#00D4FF',
  secondaryColor = '#9D4EDD',
  navLinks = [],
  cartItemsCount = 0,
  onCartClick
}: GradientHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
      }}
    >
      <div className="container max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/30" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white drop-shadow-lg">
                {storeName}
              </span>
              <Sparkles className="w-4 h-4 text-white/80" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/90 hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-4">
            {onCartClick && (
              <button
                onClick={onCartClick}
                className="relative p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-white" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-xs flex items-center justify-center font-bold"
                    style={{ color: primaryColor }}
                  >
                    {cartItemsCount}
                  </span>
                )}
              </button>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-black/20 backdrop-blur-lg"
          >
            <nav className="container max-w-7xl mx-auto px-6 py-4 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 text-lg font-medium text-white hover:opacity-80 transition-colors"
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

export default GradientHeader;
