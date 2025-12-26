import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Store, 
  Settings, 
  LogOut, 
  Search,
  Check,
  X,
  Trash2,
  Eye,
  Crown,
  Loader2,
  BarChart3,
  CreditCard,
  AlertTriangle,
  Shield,
  Ban,
  Package,
  MessageCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  Palette,
  Sparkles,
  Power,
  Globe,
  RefreshCw,
  ChevronDown,
  Plus,
  ExternalLink
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp_number: string | null;
  role: string;
  subscription_plan_id: string | null;
  is_active: boolean;
  is_banned?: boolean;
  ban_reason?: string | null;
  created_at: string;
}

interface StoreData {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  brand_type: string;
  is_active: boolean;
  is_suspended?: boolean;
  suspension_reason?: string | null;
  is_premium?: boolean;
  badge_type?: string | null;
  enable_3d_effects?: boolean;
  enable_animations?: boolean;
  whatsapp_number: string;
  created_at: string;
  owner?: { name: string; email: string };
  products?: { count: number }[];
}

interface SubscriptionPlan {
  id: string;
  name: string;
  name_ar: string;
  price: number;
  max_products: number;
  period: string;
}

interface UserSubscription {
  id: string;
  user_id: string;
  store_id: string | null;
  plan_type: string;
  start_date: string;
  end_date: string | null;
  is_lifetime: boolean;
  max_products: number;
  price_paid: number;
  currency: string;
  notes: string | null;
}

interface PlatformStats {
  totalUsers: number;
  totalStores: number;
  activeStores: number;
  totalProducts: number;
  subscriptionsByType: Record<string, number>;
  brandTypes: Record<string, number>;
}

type TabType = 'dashboard' | 'users' | 'stores' | 'subscriptions' | 'products' | 'settings' | 'emergency';

const SUBSCRIPTION_TYPES = [
  { value: 'free', label: 'مجاني', price: 0, maxProducts: 5 },
  { value: 'weekly', label: 'أسبوعي', price: 10, maxProducts: 20 },
  { value: 'monthly', label: 'شهري', price: 20, maxProducts: 100 },
  { value: 'yearly', label: 'سنوي', price: 100, maxProducts: -1 },
  { value: 'lifetime', label: 'دائم', price: 200, maxProducts: -1 },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, isLoading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialogs
  const [subscriptionDialog, setSubscriptionDialog] = useState<{ open: boolean; userId?: string; storeId?: string }>({ open: false });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'user' | 'store'; id: string; name: string } | null>(null);
  const [banDialog, setBanDialog] = useState<{ open: boolean; userId: string; userName: string } | null>(null);
  const [storeEditDialog, setStoreEditDialog] = useState<StoreData | null>(null);
  
  // Subscription form
  const [subForm, setSubForm] = useState({
    plan_type: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_lifetime: false,
    max_products: 100,
    price_paid: 20,
    notes: ''
  });

  // Platform settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [blockedIp, setBlockedIp] = useState('');
  const [blockedIps, setBlockedIps] = useState<{ id: string; ip_address: string; reason: string | null }[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      if (profile && !isAdmin) {
        toast({
          title: 'غير مصرح',
          description: 'هذه الصفحة للأدمن فقط',
          variant: 'destructive'
        });
        navigate('/dashboard');
      }
    }
  }, [user, profile, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchUsers(),
      fetchStores(),
      fetchPlans(),
      fetchSubscriptions(),
      fetchPlatformSettings(),
      fetchBlockedIps()
    ]);
    calculateStats();
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  const fetchStores = async () => {
    const { data } = await supabase
      .from('stores')
      .select('*, owner:profiles(name, email)')
      .order('created_at', { ascending: false });
    if (data) setStores(data as any);
  };

  const fetchPlans = async () => {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*');
    if (data) setPlans(data);
  };

  const fetchSubscriptions = async () => {
    const { data } = await supabase
      .from('user_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSubscriptions(data as any);
  };

  const fetchPlatformSettings = async () => {
    const { data } = await supabase
      .from('platform_settings')
      .select('*');
    
    if (data) {
      const maintenance = data.find(s => s.key === 'maintenance_mode');
      if (maintenance) {
        const value = maintenance.value as any;
        setMaintenanceMode(value.enabled || false);
        setMaintenanceMessage(value.message || '');
      }
    }
  };

  const fetchBlockedIps = async () => {
    const { data } = await supabase
      .from('blocked_ips')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBlockedIps(data as any);
  };

  const calculateStats = () => {
    const activeStoreCount = stores.filter(s => s.is_active && !s.is_suspended).length;
    
    const subscriptionsByType: Record<string, number> = {};
    subscriptions.forEach(sub => {
      subscriptionsByType[sub.plan_type] = (subscriptionsByType[sub.plan_type] || 0) + 1;
    });

    const brandTypes: Record<string, number> = {};
    stores.forEach(store => {
      brandTypes[store.brand_type] = (brandTypes[store.brand_type] || 0) + 1;
    });

    setStats({
      totalUsers: users.length,
      totalStores: stores.length,
      activeStores: activeStoreCount,
      totalProducts: 0,
      subscriptionsByType,
      brandTypes
    });
  };

  useEffect(() => {
    if (users.length || stores.length) {
      calculateStats();
    }
  }, [users, stores, subscriptions]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // User Actions
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_active: !currentStatus } : u
      ));
      toast({ title: 'تم تحديث حالة المستخدم' });
    }
  };

  const banUser = async (userId: string, reason: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: true, ban_reason: reason, is_active: false })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_banned: true, ban_reason: reason, is_active: false } : u
      ));
      toast({ title: 'تم حظر المستخدم' });
    }
    setBanDialog(null);
  };

  const unbanUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: false, ban_reason: null, is_active: true })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_banned: false, ban_reason: null, is_active: true } : u
      ));
      toast({ title: 'تم إلغاء حظر المستخدم' });
    }
  };

  const deleteUser = async (userId: string) => {
    // Delete user's stores first
    await supabase.from('stores').delete().eq('owner_id', userId);
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (!error) {
      setUsers(users.filter(u => u.id !== userId));
      setStores(stores.filter(s => s.owner_id !== userId));
      toast({ title: 'تم حذف المستخدم' });
    }
    setDeleteDialog(null);
  };

  // Store Actions
  const toggleStoreStatus = async (storeId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('stores')
      .update({ is_active: !currentStatus })
      .eq('id', storeId);

    if (!error) {
      setStores(stores.map(s => 
        s.id === storeId ? { ...s, is_active: !currentStatus } : s
      ));
      toast({ title: 'تم تحديث حالة المتجر' });
    }
  };

  const suspendStore = async (storeId: string, reason: string) => {
    const { error } = await supabase
      .from('stores')
      .update({ is_suspended: true, suspension_reason: reason, is_active: false })
      .eq('id', storeId);

    if (!error) {
      setStores(stores.map(s => 
        s.id === storeId ? { ...s, is_suspended: true, suspension_reason: reason, is_active: false } : s
      ));
      toast({ title: 'تم إيقاف المتجر' });
    }
  };

  const unsuspendStore = async (storeId: string) => {
    const { error } = await supabase
      .from('stores')
      .update({ is_suspended: false, suspension_reason: null, is_active: true })
      .eq('id', storeId);

    if (!error) {
      setStores(stores.map(s => 
        s.id === storeId ? { ...s, is_suspended: false, suspension_reason: null, is_active: true } : s
      ));
      toast({ title: 'تم إعادة تفعيل المتجر' });
    }
  };

  const deleteStore = async (storeId: string) => {
    // Delete store's products first
    await supabase.from('products').delete().eq('store_id', storeId);
    
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId);

    if (!error) {
      setStores(stores.filter(s => s.id !== storeId));
      toast({ title: 'تم حذف المتجر' });
    }
    setDeleteDialog(null);
  };

  const updateStoreDesign = async (storeId: string, updates: Partial<StoreData>) => {
    const { error } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', storeId);

    if (!error) {
      setStores(stores.map(s => 
        s.id === storeId ? { ...s, ...updates } : s
      ));
      toast({ title: 'تم تحديث تصميم المتجر' });
    }
    setStoreEditDialog(null);
  };

  // Subscription Actions
  const createSubscription = async () => {
    if (!subscriptionDialog.userId) return;

    const endDate = subForm.is_lifetime ? null : subForm.end_date || null;
    
    const { error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: subscriptionDialog.userId,
        store_id: subscriptionDialog.storeId || null,
        plan_type: subForm.plan_type,
        start_date: subForm.start_date,
        end_date: endDate,
        is_lifetime: subForm.is_lifetime,
        max_products: subForm.max_products,
        price_paid: subForm.price_paid,
        currency: 'USD',
        notes: subForm.notes || null,
        activated_by: user?.id
      });

    if (!error) {
      fetchSubscriptions();
      toast({ title: 'تم تفعيل الاشتراك بنجاح' });
    }
    setSubscriptionDialog({ open: false });
  };

  // Platform Settings
  const updateMaintenanceMode = async (enabled: boolean) => {
    const { error } = await supabase
      .from('platform_settings')
      .update({ 
        value: { enabled, message: maintenanceMessage },
        updated_by: user?.id
      })
      .eq('key', 'maintenance_mode');

    if (!error) {
      setMaintenanceMode(enabled);
      toast({ title: enabled ? 'تم تفعيل وضع الصيانة' : 'تم إلغاء وضع الصيانة' });
    }
  };

  const blockIp = async () => {
    if (!blockedIp.trim()) return;

    const { error } = await supabase
      .from('blocked_ips')
      .insert({
        ip_address: blockedIp.trim(),
        blocked_by: user?.id
      });

    if (!error) {
      fetchBlockedIps();
      setBlockedIp('');
      toast({ title: 'تم حظر الـ IP' });
    }
  };

  const unblockIp = async (id: string) => {
    const { error } = await supabase
      .from('blocked_ips')
      .delete()
      .eq('id', id);

    if (!error) {
      setBlockedIps(blockedIps.filter(ip => ip.id !== id));
      toast({ title: 'تم إلغاء الحظر' });
    }
  };

  // Filtering
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.phone?.includes(searchQuery) || false)
  );

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const tabs = [
    { id: 'dashboard' as TabType, label: 'الإحصائيات', icon: BarChart3 },
    { id: 'users' as TabType, label: 'المستخدمين', icon: Users },
    { id: 'stores' as TabType, label: 'المتاجر', icon: Store },
    { id: 'subscriptions' as TabType, label: 'الاشتراكات', icon: CreditCard },
    { id: 'settings' as TabType, label: 'الإعدادات', icon: Settings },
    { id: 'emergency' as TabType, label: 'الطوارئ', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen flex bg-background" dir="rtl">
      {/* Sidebar */}
      <aside className="w-72 glass-card rounded-none border-l border-border/50 p-6 hidden lg:flex flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold gradient-text">لوحة الأدمن</h2>
              <p className="text-muted-foreground text-xs">alshbh.store</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.id === 'emergency' && maintenanceMode && (
                <span className="mr-auto w-2 h-2 rounded-full bg-destructive animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-border/50">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all mb-2"
          >
            <Globe className="w-5 h-5" />
            عرض الموقع
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            تسجيل خروج
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold gradient-text">لوحة الأدمن</h2>
          <Select value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tabs.map(tab => (
                <SelectItem key={tab.id} value={tab.id}>{tab.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto lg:mt-0 mt-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            {activeTab === 'users' && (
              <p className="text-muted-foreground text-sm">{users.length} مستخدم مسجل</p>
            )}
            {activeTab === 'stores' && (
              <p className="text-muted-foreground text-sm">{stores.length} متجر</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {(activeTab === 'users' || activeTab === 'stores') && (
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث..."
                  className="input-glass pr-12 w-64"
                />
              </div>
            )}
            <button
              onClick={fetchAllData}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-primary" />
                  <span className="text-3xl font-bold">{stats.totalUsers}</span>
                </div>
                <p className="text-muted-foreground">إجمالي المستخدمين</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Store className="w-8 h-8 text-secondary" />
                  <span className="text-3xl font-bold">{stats.totalStores}</span>
                </div>
                <p className="text-muted-foreground">إجمالي المتاجر</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <span className="text-3xl font-bold">{stats.activeStores}</span>
                </div>
                <p className="text-muted-foreground">متاجر نشطة</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-yellow-500" />
                  <span className="text-3xl font-bold">
                    ${subscriptions.reduce((acc, s) => acc + (s.price_paid || 0), 0)}
                  </span>
                </div>
                <p className="text-muted-foreground">إجمالي الإيرادات</p>
              </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subscriptions by Type */}
              <div className="glass-card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  الاشتراكات حسب النوع
                </h3>
                <div className="space-y-3">
                  {SUBSCRIPTION_TYPES.map(type => (
                    <div key={type.value} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{type.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ 
                              width: `${((stats.subscriptionsByType[type.value] || 0) / Math.max(subscriptions.length, 1)) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="font-medium w-8">{stats.subscriptionsByType[type.value] || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Types */}
              <div className="glass-card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-secondary" />
                  أنواع البراند
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.brandTypes).slice(0, 6).map(([brand, count]) => (
                    <div key={brand} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{brand}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-secondary rounded-full"
                            style={{ 
                              width: `${(count / Math.max(stats.totalStores, 1)) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                آخر المستخدمين المسجلين
              </h3>
              <div className="space-y-3">
                {users.slice(0, 5).map(user => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right px-6 py-4 text-sm font-medium">المستخدم</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">التواصل</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">التسجيل</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">الحالة</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {u.name}
                              {u.role === 'admin' && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                            </p>
                            <p className="text-muted-foreground text-sm">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm" dir="ltr">{u.phone || '-'}</p>
                          {u.whatsapp_number && (
                            <a
                              href={`https://wa.me/${u.whatsapp_number}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-green-500 hover:underline flex items-center gap-1"
                            >
                              <MessageCircle className="w-3 h-3" />
                              واتساب
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString('ar-EG')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => toggleUserStatus(u.id, u.is_active)}
                            className={`flex items-center gap-1 text-sm ${
                              u.is_active ? 'text-green-500' : 'text-destructive'
                            }`}
                          >
                            {u.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            {u.is_active ? 'نشط' : 'معطل'}
                          </button>
                          {u.is_banned && (
                            <span className="text-xs text-destructive flex items-center gap-1">
                              <Ban className="w-3 h-3" />
                              محظور
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSubscriptionDialog({ open: true, userId: u.id })}
                            className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-primary"
                            title="تفعيل اشتراك"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          {u.is_banned ? (
                            <button
                              onClick={() => unbanUser(u.id)}
                              className="p-2 rounded-lg hover:bg-green-500/10 transition-colors text-green-500"
                              title="إلغاء الحظر"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setBanDialog({ open: true, userId: u.id, userName: u.name })}
                              className="p-2 rounded-lg hover:bg-yellow-500/10 transition-colors text-yellow-500"
                              title="حظر"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteDialog({ open: true, type: 'user', id: u.id, name: u.name })}
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stores Tab */}
        {activeTab === 'stores' && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right px-6 py-4 text-sm font-medium">المتجر</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">المالك</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">النوع</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">التصميم</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">الحالة</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredStores.map((store) => (
                    <tr key={store.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {store.name}
                            {store.is_premium && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                            {store.badge_type && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                                {store.badge_type}
                              </span>
                            )}
                          </p>
                          <a 
                            href={`/store/${store.slug}`}
                            target="_blank"
                            className="text-muted-foreground text-sm hover:text-primary flex items-center gap-1"
                          >
                            alshbh.store/store/{store.slug}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm">{(store.owner as any)?.name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{(store.owner as any)?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-muted">
                          {store.brand_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {store.enable_animations && (
                            <span className="text-xs text-primary" title="Animations">✨</span>
                          )}
                          {store.enable_3d_effects && (
                            <span className="text-xs text-secondary" title="3D Effects">🎨</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {store.is_suspended ? (
                            <span className="text-xs text-destructive flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              موقوف
                            </span>
                          ) : (
                            <button
                              onClick={() => toggleStoreStatus(store.id, store.is_active)}
                              className={`flex items-center gap-1 text-sm ${
                                store.is_active ? 'text-green-500' : 'text-destructive'
                              }`}
                            >
                              {store.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                              {store.is_active ? 'نشط' : 'معطل'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <a
                            href={`/store/${store.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            title="عرض المتجر"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </a>
                          <button
                            onClick={() => setStoreEditDialog(store)}
                            className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-primary"
                            title="تعديل التصميم"
                          >
                            <Palette className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSubscriptionDialog({ open: true, userId: store.owner_id, storeId: store.id })}
                            className="p-2 rounded-lg hover:bg-green-500/10 transition-colors text-green-500"
                            title="تفعيل اشتراك"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          {store.is_suspended ? (
                            <button
                              onClick={() => unsuspendStore(store.id)}
                              className="p-2 rounded-lg hover:bg-green-500/10 transition-colors text-green-500"
                              title="إعادة التفعيل"
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => suspendStore(store.id, 'مخالفة الشروط')}
                              className="p-2 rounded-lg hover:bg-yellow-500/10 transition-colors text-yellow-500"
                              title="إيقاف"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteDialog({ open: true, type: 'store', id: store.id, name: store.name })}
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-right px-6 py-4 text-sm font-medium">المستخدم</th>
                      <th className="text-right px-6 py-4 text-sm font-medium">نوع الاشتراك</th>
                      <th className="text-right px-6 py-4 text-sm font-medium">تاريخ البداية</th>
                      <th className="text-right px-6 py-4 text-sm font-medium">تاريخ النهاية</th>
                      <th className="text-right px-6 py-4 text-sm font-medium">المبلغ</th>
                      <th className="text-right px-6 py-4 text-sm font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {subscriptions.map((sub) => {
                      const subUser = users.find(u => u.id === sub.user_id);
                      const isActive = sub.is_lifetime || (sub.end_date && new Date(sub.end_date) > new Date());
                      return (
                        <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium">{subUser?.name || 'غير معروف'}</p>
                            <p className="text-sm text-muted-foreground">{subUser?.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              sub.is_lifetime 
                                ? 'bg-yellow-500/20 text-yellow-500' 
                                : 'bg-primary/20 text-primary'
                            }`}>
                              {SUBSCRIPTION_TYPES.find(t => t.value === sub.plan_type)?.label || sub.plan_type}
                              {sub.is_lifetime && ' (دائم)'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm">
                              {new Date(sub.start_date).toLocaleDateString('ar-EG')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm">
                              {sub.is_lifetime ? '∞' : (sub.end_date ? new Date(sub.end_date).toLocaleDateString('ar-EG') : '-')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium">${sub.price_paid}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`flex items-center gap-1 text-sm ${
                              isActive ? 'text-green-500' : 'text-destructive'
                            }`}>
                              {isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                              {isActive ? 'نشط' : 'منتهي'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                إعدادات المنصة
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم المنصة</label>
                  <input
                    type="text"
                    defaultValue="alshbh.store"
                    className="input-glass"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">رقم واتساب الدعم</label>
                  <input
                    type="tel"
                    defaultValue="201278006248"
                    className="input-glass text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    defaultValue="support@alshbh.store"
                    className="input-glass text-left"
                    dir="ltr"
                  />
                </div>
                <button className="btn-primary">
                  حفظ التغييرات
                </button>
              </div>
            </div>

            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-secondary" />
                أسعار الاشتراكات
              </h3>
              <div className="space-y-4">
                {SUBSCRIPTION_TYPES.map(type => (
                  <div key={type.value} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {type.maxProducts === -1 ? 'منتجات غير محدودة' : `${type.maxProducts} منتج`}
                      </p>
                    </div>
                    <span className="font-bold text-primary">${type.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Emergency Tab */}
        {activeTab === 'emergency' && (
          <div className="space-y-6">
            {/* Maintenance Mode */}
            <div className="glass-card p-8 border-destructive/20">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-destructive">
                <Power className="w-5 h-5" />
                وضع الصيانة
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">تفعيل وضع الصيانة</p>
                    <p className="text-sm text-muted-foreground">سيتم إيقاف المنصة مؤقتاً لجميع المستخدمين</p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={updateMaintenanceMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">رسالة الصيانة</label>
                  <textarea
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    className="input-glass min-h-[100px]"
                    placeholder="المنصة تحت الصيانة، يرجى المحاولة لاحقاً"
                  />
                </div>
              </div>
            </div>

            {/* IP Blocking */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Ban className="w-5 h-5 text-yellow-500" />
                حظر IP
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={blockedIp}
                    onChange={(e) => setBlockedIp(e.target.value)}
                    className="input-glass flex-1"
                    placeholder="أدخل عنوان IP"
                    dir="ltr"
                  />
                  <button
                    onClick={blockIp}
                    className="btn-primary px-6"
                  >
                    حظر
                  </button>
                </div>
                {blockedIps.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">عناوين IP المحظورة:</p>
                    {blockedIps.map(ip => (
                      <div key={ip.id} className="flex items-center justify-between py-2 px-4 bg-muted/50 rounded-lg">
                        <span className="font-mono text-sm" dir="ltr">{ip.ip_address}</span>
                        <button
                          onClick={() => unblockIp(ip.id)}
                          className="text-destructive hover:underline text-sm"
                        >
                          إلغاء الحظر
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Actions */}
            <div className="glass-card p-8 border-destructive/50">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                إجراءات الطوارئ
              </h3>
              <p className="text-muted-foreground mb-4">
                هذه الإجراءات لا يمكن التراجع عنها. استخدمها بحذر.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={fetchAllData}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  تحديث جميع البيانات
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Subscription Dialog */}
      <Dialog open={subscriptionDialog.open} onOpenChange={(open) => setSubscriptionDialog({ open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفعيل اشتراك جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">نوع الاشتراك</label>
              <Select
                value={subForm.plan_type}
                onValueChange={(v) => {
                  const plan = SUBSCRIPTION_TYPES.find(t => t.value === v);
                  setSubForm({
                    ...subForm,
                    plan_type: v,
                    price_paid: plan?.price || 0,
                    max_products: plan?.maxProducts || 5,
                    is_lifetime: v === 'lifetime'
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} - ${type.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">تاريخ البداية</label>
              <input
                type="date"
                value={subForm.start_date}
                onChange={(e) => setSubForm({ ...subForm, start_date: e.target.value })}
                className="input-glass"
              />
            </div>
            {!subForm.is_lifetime && (
              <div>
                <label className="block text-sm font-medium mb-2">تاريخ النهاية</label>
                <input
                  type="date"
                  value={subForm.end_date}
                  onChange={(e) => setSubForm({ ...subForm, end_date: e.target.value })}
                  className="input-glass"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">اشتراك دائم</label>
              <Switch
                checked={subForm.is_lifetime}
                onCheckedChange={(v) => setSubForm({ ...subForm, is_lifetime: v })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">المبلغ المدفوع ($)</label>
              <input
                type="number"
                value={subForm.price_paid}
                onChange={(e) => setSubForm({ ...subForm, price_paid: Number(e.target.value) })}
                className="input-glass"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">حد المنتجات</label>
              <input
                type="number"
                value={subForm.max_products}
                onChange={(e) => setSubForm({ ...subForm, max_products: Number(e.target.value) })}
                className="input-glass"
                placeholder="-1 لغير محدود"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ملاحظات</label>
              <textarea
                value={subForm.notes}
                onChange={(e) => setSubForm({ ...subForm, notes: e.target.value })}
                className="input-glass"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setSubscriptionDialog({ open: false })}
              className="btn-secondary"
            >
              إلغاء
            </button>
            <button
              onClick={createSubscription}
              className="btn-primary"
            >
              تفعيل الاشتراك
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Store Edit Dialog */}
      <Dialog open={!!storeEditDialog} onOpenChange={() => setStoreEditDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل تصميم المتجر</DialogTitle>
          </DialogHeader>
          {storeEditDialog && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">متجر مميز (Premium)</label>
                <Switch
                  checked={storeEditDialog.is_premium || false}
                  onCheckedChange={(v) => setStoreEditDialog({ ...storeEditDialog, is_premium: v })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">شارة المتجر</label>
                <Select
                  value={storeEditDialog.badge_type || 'none'}
                  onValueChange={(v) => setStoreEditDialog({ ...storeEditDialog, badge_type: v === 'none' ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون شارة</SelectItem>
                    <SelectItem value="Premium Store">Premium Store</SelectItem>
                    <SelectItem value="Lifetime">Lifetime</SelectItem>
                    <SelectItem value="Top Seller">Top Seller</SelectItem>
                    <SelectItem value="Verified">Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">تأثيرات 3D</label>
                <Switch
                  checked={storeEditDialog.enable_3d_effects || false}
                  onCheckedChange={(v) => setStoreEditDialog({ ...storeEditDialog, enable_3d_effects: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">الحركات والتأثيرات</label>
                <Switch
                  checked={storeEditDialog.enable_animations !== false}
                  onCheckedChange={(v) => setStoreEditDialog({ ...storeEditDialog, enable_animations: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => setStoreEditDialog(null)}
              className="btn-secondary"
            >
              إلغاء
            </button>
            <button
              onClick={() => storeEditDialog && updateStoreDesign(storeEditDialog.id, {
                is_premium: storeEditDialog.is_premium,
                badge_type: storeEditDialog.badge_type,
                enable_3d_effects: storeEditDialog.enable_3d_effects,
                enable_animations: storeEditDialog.enable_animations
              })}
              className="btn-primary"
            >
              حفظ التغييرات
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف {deleteDialog?.type === 'user' ? 'المستخدم' : 'المتجر'} "{deleteDialog?.name}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog?.type === 'user') {
                  deleteUser(deleteDialog.id);
                } else if (deleteDialog?.type === 'store') {
                  deleteStore(deleteDialog.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban Dialog */}
      <AlertDialog open={!!banDialog} onOpenChange={() => setBanDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حظر المستخدم</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حظر المستخدم "{banDialog?.userName}"؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => banDialog && banUser(banDialog.userId, 'مخالفة الشروط')}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حظر
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;