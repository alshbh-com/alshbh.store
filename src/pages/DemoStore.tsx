import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Share2, Plus, Edit, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Header from '@/components/Header';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

const demoProducts: Product[] = [
  {
    id: '1',
    name: 'قميص كلاسيكي أبيض',
    description: 'قميص رجالي فاخر من القطن المصري 100%',
    price: 450,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop',
  },
  {
    id: '2',
    name: 'حقيبة جلد طبيعي',
    description: 'حقيبة يد نسائية من الجلد الطبيعي الفاخر',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
  },
  {
    id: '3',
    name: 'ساعة ذكية برو',
    description: 'ساعة ذكية مع مستشعرات متقدمة ومقاومة للماء',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  },
  {
    id: '4',
    name: 'سماعات لاسلكية',
    description: 'سماعات بلوتوث مع إلغاء الضوضاء النشط',
    price: 800,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  },
  {
    id: '5',
    name: 'عطر فاخر',
    description: 'عطر رجالي فرنسي بنفحات خشبية دافئة',
    price: 650,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
  },
  {
    id: '6',
    name: 'نظارة شمسية',
    description: 'نظارة شمسية إيطالية مع حماية UV400',
    price: 550,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
  },
];

const DemoStore = () => {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [showQR, setShowQR] = useState(false);
  const [storeData, setStoreData] = useState({
    storeName: 'متجر الأناقة',
    whatsappNumber: '201278006248',
    currency: 'EGP',
  });

  useEffect(() => {
    const saved = localStorage.getItem('demoStore');
    if (saved) {
      const parsed = JSON.parse(saved);
      setStoreData({
        storeName: parsed.storeName || 'متجر الأناقة',
        whatsappNumber: parsed.whatsappNumber || '201278006248',
        currency: parsed.currency || 'EGP',
      });
    }
  }, []);

  const handleWhatsAppOrder = (product: Product) => {
    const message = encodeURIComponent(
      `🛒 طلب جديد من ${storeData.storeName}\n\n` +
      `📦 المنتج: ${product.name}\n` +
      `💰 السعر: ${product.price} ${storeData.currency}\n\n` +
      `أرغب في شراء هذا المنتج`
    );
    window.open(`https://wa.me/${storeData.whatsappNumber}?text=${message}`, '_blank');
  };

  const storeUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="container max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              {storeData.storeName}
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              أهلاً بك في متجرنا - اكتشف أفضل المنتجات بأفضل الأسعار
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setShowQR(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                مشاركة المتجر
              </button>
              <a
                href={`https://wa.me/${storeData.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-btn"
              >
                <MessageCircle className="w-5 h-5" />
                تواصل معنا
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="pb-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-3d group overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold gradient-text">
                      {product.price}
                      <span className="text-sm mr-1">{storeData.currency}</span>
                    </div>
                    <button
                      onClick={() => handleWhatsAppOrder(product)}
                      className="whatsapp-btn py-2 px-4 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      اطلب الآن
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${storeData.whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-whatsapp rounded-full flex items-center justify-center shadow-lg shadow-whatsapp/30 hover:scale-110 transition-transform"
      >
        <MessageCircle className="w-7 h-7 text-foreground" />
      </a>

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
            <h3 className="text-xl font-bold mb-4">شارك متجرك</h3>
            <div className="bg-foreground p-4 rounded-2xl inline-block mb-4">
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
              className="btn-primary w-full"
            >
              نسخ الرابط
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DemoStore;
