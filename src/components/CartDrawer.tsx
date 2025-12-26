import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Trash2, MessageCircle } from 'lucide-react';
import { CartItem } from '@/hooks/useCart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  totalItems: number;
  totalPrice: number;
  currency: string;
  storeName: string;
  whatsappNumber: string;
  primaryColor: string;
  secondaryColor: string;
}

const CartDrawer = ({
  isOpen,
  onClose,
  items,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
  totalItems,
  totalPrice,
  currency,
  storeName,
  whatsappNumber,
  primaryColor,
  secondaryColor,
}: CartDrawerProps) => {
  const handleWhatsAppOrder = () => {
    if (items.length === 0) return;

    const itemsList = items
      .map((item) => `• ${item.name} × ${item.quantity} = ${item.price * item.quantity} ${currency}`)
      .join('\n');

    const message = encodeURIComponent(
      `🛒 طلب جديد من ${storeName}\n\n` +
      `📦 المنتجات:\n${itemsList}\n\n` +
      `💰 الإجمالي: ${totalPrice} ${currency}\n\n` +
      `أرغب في إتمام هذا الطلب`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 z-50 h-full w-full max-w-md bg-background border-r border-border shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                السلة ({totalItems})
              </h2>
              {items.length > 0 && (
                <button
                  onClick={onClear}
                  className="text-sm text-destructive hover:underline"
                >
                  مسح الكل
                </button>
              )}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">السلة فارغة</p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-3 p-3 rounded-xl bg-muted/50 border border-border"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate mb-1">{item.name}</h3>
                      <p
                        className="text-sm font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {item.price * item.quantity} {currency}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onDecrement(item.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-background border border-border hover:bg-muted transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => onIncrement(item.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors"
                          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="mr-auto p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-border space-y-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>الإجمالي:</span>
                  <span
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {totalPrice} {currency}
                  </span>
                </div>
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle className="w-5 h-5" />
                  إتمام الطلب عبر واتساب
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
