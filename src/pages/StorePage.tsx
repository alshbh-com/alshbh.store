import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { MessageCircle, Share2, Loader2, Store as StoreIcon, ShoppingCart, Plus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import CartDrawer from '@/components/CartDrawer';

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand_type: string;
  whatsapp_number: string;
  primary_color: string;
  secondary_color: string;
  currency: string;
  logo_url: string | null;
  cover_url: string | null;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
}

const StorePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  
  const cart = useCart();

  useEffect(() => {
    if (slug) {
      fetchStore();
    }
  }, [slug]);

  const fetchStore = async () => {
    setIsLoading(true);
    
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (storeError || !storeData) {
      setIsLoading(false);
      return;
    }

    setStore(storeData);

    // Fetch products for this store
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeData.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (productsData) {
      setProducts(productsData);
    }

    setIsLoading(false);
  };

  const handleAddToCart = (product: Product) => {
    cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
  };

  const handleWhatsAppOrder = (product: Product) => {
    if (!store) return;
    const message = encodeURIComponent(
      `🛒 طلب جديد من ${store.name}\n\n` +
      `📦 المنتج: ${product.name}\n` +
      `💰 السعر: ${product.price} ${store.currency}\n\n` +
      `أرغب في شراء هذا المنتج`
    );
    window.open(`https://wa.me/${store.whatsapp_number}?text=${message}`, '_blank');
  };

  // Dynamic styles based on store colors
  const dynamicStyles = useMemo(() => {
    if (!store) return {};
    return {
      '--store-primary': store.primary_color,
      '--store-secondary': store.secondary_color,
    } as React.CSSProperties;
  }, [store]);

  const storeUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center">
          <StoreIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">المتجر غير موجود</h1>
          <p className="text-muted-foreground">هذا المتجر غير متوفر أو تم إيقافه</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl" style={dynamicStyles}>
      {/* Hero Section with dynamic gradient */}
      <section 
        className="pt-12 pb-12 px-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${store.primary_color}15 0%, ${store.secondary_color}15 100%)`
        }}
      >
        <div className="container max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {store.logo_url ? (
              <img 
                src={store.logo_url} 
                alt={store.name}
                className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-lg"
              />
            ) : (
              <div 
                className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${store.primary_color}, ${store.secondary_color})` }}
              >
                <StoreIcon className="w-12 h-12 text-white" />
              </div>
            )}
            
            <h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ 
                background: `linear-gradient(135deg, ${store.primary_color}, ${store.secondary_color})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {store.name}
            </h1>
            
            {store.description && (
              <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
                {store.description}
              </p>
            )}
            
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={() => setShowQR(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                مشاركة المتجر
              </button>
              <a
                href={`https://wa.me/${store.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-colors"
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle className="w-5 h-5" />
                تواصل معنا
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">لا توجد منتجات حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card group overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${store.primary_color}20, ${store.secondary_color}20)` }}
                      >
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-2 transition-colors" style={{ color: 'inherit' }}>
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div 
                        className="text-2xl font-bold"
                        style={{ 
                          background: `linear-gradient(135deg, ${store.primary_color}, ${store.secondary_color})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        {product.price}
                        <span className="text-sm mr-1">{store.currency}</span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex items-center gap-2 py-2 px-4 text-sm rounded-xl text-white transition-colors"
                        style={{ background: `linear-gradient(135deg, ${store.primary_color}, ${store.secondary_color})` }}
                      >
                        <Plus className="w-4 h-4" />
                        أضف للسلة
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Floating Cart Button */}
      <button
        onClick={() => cart.setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-white"
        style={{ background: `linear-gradient(135deg, ${store.primary_color}, ${store.secondary_color})` }}
      >
        <ShoppingCart className="w-7 h-7" />
        {cart.totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
            {cart.totalItems}
          </span>
        )}
      </button>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${store.whatsapp_number}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-white"
        style={{ backgroundColor: '#25D366' }}
      >
        <MessageCircle className="w-7 h-7" />
      </a>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cart.isOpen}
        onClose={() => cart.setIsOpen(false)}
        items={cart.items}
        onIncrement={cart.incrementQuantity}
        onDecrement={cart.decrementQuantity}
        onRemove={cart.removeItem}
        onClear={cart.clearCart}
        totalItems={cart.totalItems}
        totalPrice={cart.totalPrice}
        currency={store.currency}
        storeName={store.name}
        whatsappNumber={store.whatsapp_number}
        primaryColor={store.primary_color}
        secondaryColor={store.secondary_color}
      />

      {/* QR Modal */}
      {showQR && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setShowQR(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">شارك المتجر</h3>
            <div className="bg-white p-4 rounded-2xl inline-block mb-4">
              <QRCodeSVG
                value={storeUrl}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              امسح الكود للوصول إلى المتجر
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(storeUrl);
              }}
              className="w-full py-3 rounded-xl text-white font-medium"
              style={{ background: `linear-gradient(135deg, ${store.primary_color}, ${store.secondary_color})` }}
            >
              نسخ الرابط
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default StorePage;