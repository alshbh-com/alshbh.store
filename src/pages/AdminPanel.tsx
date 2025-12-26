import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Package,
  TrendingUp,
  Calendar,
  Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp_number: string | null;
  role: string;
  subscription_plan_id: string | null;
  is_active: boolean;
  created_at: string;
}

interface StoreData {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  brand_type: string;
  is_active: boolean;
  created_at: string;
  whatsapp_number: string;
  owner?: { name: string; email: string };
}

interface SubscriptionPlan {
  id: string;
  name: string;
  name_ar: string;
}

interface Stats {
  totalUsers: number;
  totalStores: number;
  totalProducts: number;
  activeUsers: number;
  activeStores: number;
  newUsersThisMonth: number;
  newStoresThisMonth: number;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, isLoading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'stores' | 'settings'>('stats');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalStores: 0,
    totalProducts: 0,
    activeUsers: 0,
    activeStores: 0,
    newUsersThisMonth: 0,
    newStoresThisMonth: 0
  });

  // Delete dialogs
  const [deleteUserDialog, setDeleteUserDialog] = useState<{ open: boolean; user: UserProfile | null }>({ open: false, user: null });
  const [deleteStoreDialog, setDeleteStoreDialog] = useState<{ open: boolean; store: StoreData | null }>({ open: false, store: null });

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
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Fetch users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersData) setUsers(usersData);

    // Fetch stores with owner details
    const { data: storesData } = await supabase
      .from('stores')
      .select('*, owner:profiles(name, email)')
      .order('created_at', { ascending: false });

    if (storesData) setStores(storesData as any);

    // Fetch products count
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Fetch plans
    const { data: plansData } = await supabase
      .from('subscription_plans')
      .select('id, name, name_ar');

    if (plansData) setPlans(plansData);

    // Calculate stats
    if (usersData && storesData) {
      const activeUsers = usersData.filter(u => u.is_active).length;
      const activeStores = storesData.filter(s => s.is_active).length;
      const newUsersThisMonth = usersData.filter(u => new Date(u.created_at) >= startOfMonth).length;
      const newStoresThisMonth = storesData.filter(s => new Date(s.created_at) >= startOfMonth).length;

      setStats({
        totalUsers: usersData.length,
        totalStores: storesData.length,
        totalProducts: productsCount || 0,
        activeUsers,
        activeStores,
        newUsersThisMonth,
        newStoresThisMonth
      });
    }

    setIsLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

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

  const deleteStore = async (storeId: string) => {
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId);

    if (!error) {
      setStores(stores.filter(s => s.id !== storeId));
      toast({ title: 'تم حذف المتجر بنجاح' });
    } else {
      toast({ title: 'حدث خطأ أثناء الحذف', variant: 'destructive' });
    }
    setDeleteStoreDialog({ open: false, store: null });
  };

  const deleteUserPhone = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ phone: null, whatsapp_number: null })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u => 
        u.id === userId ? { ...u, phone: null, whatsapp_number: null } : u
      ));
      toast({ title: 'تم حذف رقم المستخدم' });
    }
    setDeleteUserDialog({ open: false, user: null });
  };

  const updateUserPlan = async (userId: string, planId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_plan_id: planId || null })
      .eq('id', userId);

    if (!error) {
      fetchData();
      toast({ title: 'تم تحديث اشتراك المستخدم' });
    }
  };

  const getPlanName = (planId: string | null) => {
    if (!planId) return 'مجاني';
    const plan = plans.find(p => p.id === planId);
    return plan?.name_ar || 'مجاني';
  };

  const getUserStores = (userId: string) => {
    return stores.filter(s => s.owner_id === userId);
  };

  const filteredUsers = users.filter(user => 
    user.name.includes(searchQuery) || 
    user.email.includes(searchQuery) ||
    (user.phone?.includes(searchQuery) || false)
  );

  const filteredStores = stores.filter(store =>
    store.name.includes(searchQuery) ||
    store.slug.includes(searchQuery)
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const StatCard = ({ title, value, icon: Icon, trend, color }: { title: string; value: number; icon: any; trend?: number; color: string }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value.toLocaleString()}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-500">+{trend} هذا الشهر</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 glass-card rounded-none border-l border-border/50 p-6 hidden md:flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold gradient-text">لوحة الأدمن</h2>
          <p className="text-muted-foreground text-sm">alshbh.store</p>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'stats', label: 'الإحصائيات', icon: BarChart3 },
            { id: 'users', label: 'المستخدمين', icon: Users },
            { id: 'stores', label: 'المتاجر', icon: Store },
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              {activeTab === 'stats' && 'الإحصائيات والتقارير'}
              {activeTab === 'users' && 'المستخدمين'}
              {activeTab === 'stores' && 'المتاجر'}
              {activeTab === 'settings' && 'الإعدادات'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {activeTab === 'stats' && 'نظرة عامة على المنصة'}
              {activeTab === 'users' && `${users.length} مستخدم مسجل`}
              {activeTab === 'stores' && `${stores.length} متجر`}
            </p>
          </div>

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
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="إجمالي المستخدمين"
                value={stats.totalUsers}
                icon={Users}
                trend={stats.newUsersThisMonth}
                color="bg-blue-500/10 text-blue-500"
              />
              <StatCard
                title="إجمالي المتاجر"
                value={stats.totalStores}
                icon={Store}
                trend={stats.newStoresThisMonth}
                color="bg-purple-500/10 text-purple-500"
              />
              <StatCard
                title="إجمالي المنتجات"
                value={stats.totalProducts}
                icon={Package}
                color="bg-green-500/10 text-green-500"
              />
              <StatCard
                title="المستخدمين النشطين"
                value={stats.activeUsers}
                icon={Crown}
                color="bg-yellow-500/10 text-yellow-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  أحدث المستخدمين
                </h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-muted-foreground text-sm">{u.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${u.is_active ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                        {u.is_active ? 'نشط' : 'معطل'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Stores */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" />
                  أحدث المتاجر
                </h3>
                <div className="space-y-3">
                  {stores.slice(0, 5).map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-muted-foreground text-sm" dir="ltr">{s.slug}.alshbh.store</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${s.is_active ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                        {s.is_active ? 'نشط' : 'معطل'}
                      </span>
                    </div>
                  ))}
                </div>
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
                    <th className="text-right px-6 py-4 text-sm font-medium">المتاجر</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">الاشتراك</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">الحالة</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredUsers.map((u) => {
                    const userStores = getUserStores(u.id);
                    return (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-muted-foreground text-sm">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <p className="text-sm" dir="ltr">{u.phone || u.whatsapp_number || '-'}</p>
                            {(u.phone || u.whatsapp_number) && (
                              <button
                                onClick={() => setDeleteUserDialog({ open: true, user: u })}
                                className="p-1 rounded hover:bg-destructive/10 text-destructive"
                                title="حذف الرقم"
                              >
                                <Phone className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {userStores.length > 0 ? (
                            <div className="space-y-1">
                              {userStores.map(s => (
                                <a
                                  key={s.id}
                                  href={`/store/${s.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-sm text-primary hover:underline"
                                >
                                  {s.name}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">لا يوجد متاجر</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={u.subscription_plan_id || ''}
                            onChange={(e) => updateUserPlan(u.id, e.target.value)}
                            className="bg-muted/50 rounded-lg px-3 py-1 text-sm border-0"
                          >
                            <option value="">مجاني</option>
                            {plans.map(plan => (
                              <option key={plan.id} value={plan.id}>{plan.name_ar}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleUserStatus(u.id, u.is_active)}
                            className={`flex items-center gap-1 text-sm ${
                              u.is_active ? 'text-green-500' : 'text-destructive'
                            }`}
                          >
                            {u.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            {u.is_active ? 'نشط' : 'معطل'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {(u.whatsapp_number || u.phone) && (
                              <a
                                href={`https://wa.me/${u.whatsapp_number || u.phone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-green-500/10 transition-colors text-green-500"
                              >
                                📱
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                    <th className="text-right px-6 py-4 text-sm font-medium">واتساب المتجر</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">النوع</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">الحالة</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredStores.map((store) => (
                    <tr key={store.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-muted-foreground text-sm" dir="ltr">
                            {store.slug}.alshbh.store
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm">{(store.owner as any)?.name || '-'}</p>
                          <p className="text-muted-foreground text-xs">{(store.owner as any)?.email || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`https://wa.me/${store.whatsapp_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-500 hover:underline"
                          dir="ltr"
                        >
                          {store.whatsapp_number}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-muted">
                          {store.brand_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStoreStatus(store.id, store.is_active)}
                          className={`flex items-center gap-1 text-sm ${
                            store.is_active ? 'text-green-500' : 'text-destructive'
                          }`}
                        >
                          {store.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          {store.is_active ? 'نشط' : 'معطل'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/store/${store.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </a>
                          <button 
                            onClick={() => setDeleteStoreDialog({ open: true, store })}
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="glass-card p-8 max-w-2xl">
            <h3 className="text-xl font-bold mb-6">إعدادات المنصة</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">اسم المنصة</label>
                <input
                  type="text"
                  defaultValue="alshbh.store"
                  className="input-glass"
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
        )}
      </main>

      {/* Delete Store Dialog */}
      <AlertDialog open={deleteStoreDialog.open} onOpenChange={(open) => setDeleteStoreDialog({ open, store: null })}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المتجر</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف متجر "{deleteStoreDialog.store?.name}"؟ سيتم حذف جميع المنتجات المرتبطة به.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteStoreDialog.store && deleteStore(deleteStoreDialog.store.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Phone Dialog */}
      <AlertDialog open={deleteUserDialog.open} onOpenChange={(open) => setDeleteUserDialog({ open, user: null })}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف رقم المستخدم</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف رقم المستخدم "{deleteUserDialog.user?.name}"؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteUserDialog.user && deleteUserPhone(deleteUserDialog.user.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;
