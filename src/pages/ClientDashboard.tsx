import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Package, 
  Settings, 
  LogOut, 
  Plus,
  Eye,
  Edit,
  Crown,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StoreData {
  id: string;
  name: string;
  slug: string;
  brand_type: string;
  is_active: boolean;
  created_at: string;
  subscription_plan_id: string | null;
  products_count?: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  name_ar: string;
  price: number;
  max_products: number;
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stores' | 'subscription' | 'settings'>('stores');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStores();
      fetchPlans();
    }
  }, [user]);

  const fetchStores = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user?.id);

    if (!error && data) {
      setStores(data);
    }
    setIsLoading(false);
  };

  const fetchPlans = async () => {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });

    if (data) {
      setPlans(data);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getCurrentPlan = () => {
    if (!profile?.subscription_plan_id) return plans.find(p => p.name === 'free');
    return plans.find(p => p.id === profile.subscription_plan_id);
  };

  const handleUpgradeRequest = (plan: SubscriptionPlan) => {
    const message = `مرحباً، أريد ترقية اشتراكي إلى خطة ${plan.name_ar}
    
الاسم: ${profile?.name}
البريد: ${profile?.email}
الخطة المطلوبة: ${plan.name_ar} - ${plan.price}$`;
    
    window.open(`https://wa.me/201278006248?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 glass-card rounded-none border-l border-border/50 p-6 hidden md:flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold gradient-text">لوحة التحكم</h2>
          <p className="text-muted-foreground text-sm">{profile?.name}</p>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'stores', label: 'متاجري', icon: Store },
            { id: 'subscription', label: 'الاشتراك', icon: Crown },
            { id: 'settings', label: 'الإعدادات', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all mt-4"
        >
          <LogOut className="w-5 h-5" />
          تسجيل خروج
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold gradient-text">لوحة التحكم</h1>
          <button onClick={handleLogout} className="text-destructive">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'stores', label: 'متاجري', icon: Store },
            { id: 'subscription', label: 'الاشتراك', icon: Crown },
            { id: 'settings', label: 'الإعدادات', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Stores Tab */}
        {activeTab === 'stores' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">متاجري</h1>
                <p className="text-muted-foreground text-sm">
                  {stores.length} متجر
                </p>
              </div>
              <button
                onClick={() => navigate('/create-store')}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                متجر جديد
              </button>
            </div>

            {stores.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-12 text-center"
              >
                <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">لا توجد متاجر بعد</h3>
                <p className="text-muted-foreground mb-6">أنشئ متجرك الأول الآن!</p>
                <button
                  onClick={() => navigate('/create-store')}
                  className="btn-primary"
                >
                  إنشاء متجر
                </button>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map((store) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{store.name}</h3>
                        <p className="text-muted-foreground text-sm" dir="ltr">
                          {store.slug}.alshbh.store
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        store.is_active 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {store.is_active ? 'نشط' : 'معطل'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                      <Package className="w-4 h-4" />
                      <span>0 منتج</span>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 btn-primary py-2 flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        عرض
                      </button>
                      <button className="flex-1 bg-muted hover:bg-muted/80 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors">
                        <Edit className="w-4 h-4" />
                        تعديل
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">الاشتراك</h1>
              <p className="text-muted-foreground text-sm">
                خطتك الحالية: {getCurrentPlan()?.name_ar || 'مجاني'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isCurrent = getCurrentPlan()?.id === plan.id;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`glass-card p-6 relative ${
                      isCurrent ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs">
                        خطتك الحالية
                      </div>
                    )}

                    <h3 className="text-xl font-bold mb-2">{plan.name_ar}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground text-sm">/ {plan.name === 'yearly' ? 'سنة' : plan.name === 'lifetime' ? 'مرة واحدة' : 'شهر'}</span>
                      )}
                    </div>

                    <p className="text-muted-foreground text-sm mb-4">
                      {plan.max_products === -1 ? 'منتجات غير محدودة' : `حتى ${plan.max_products} منتج`}
                    </p>

                    {!isCurrent && plan.price > (getCurrentPlan()?.price || 0) && (
                      <button
                        onClick={() => handleUpgradeRequest(plan)}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        <Crown className="w-4 h-4" />
                        ترقية
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 glass-card p-6 bg-green-500/10 border-green-500/20">
              <h3 className="font-bold text-lg mb-2 text-green-500">للترقية تواصل معنا</h3>
              <p className="text-muted-foreground mb-4">
                اختر الخطة المناسبة وتواصل معنا عبر الواتساب لإتمام الترقية
              </p>
              <a
                href="https://wa.me/201278006248"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors"
              >
                📱 واتساب الدعم
              </a>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">الإعدادات</h1>
              <p className="text-muted-foreground text-sm">إدارة حسابك</p>
            </div>

            <div className="glass-card p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">الاسم</label>
                <input
                  type="text"
                  defaultValue={profile?.name}
                  className="input-glass"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  defaultValue={profile?.email}
                  className="input-glass text-left"
                  dir="ltr"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  defaultValue={profile?.phone || ''}
                  className="input-glass text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">رقم واتساب</label>
                <input
                  type="tel"
                  defaultValue={profile?.whatsapp_number || ''}
                  placeholder="مثال: 201278006248"
                  className="input-glass text-left"
                  dir="ltr"
                />
              </div>

              <button className="btn-primary">
                حفظ التغييرات
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
