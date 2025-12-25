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
  Edit,
  Trash2,
  Eye,
  Crown,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  owner?: { name: string };
}

interface SubscriptionPlan {
  id: string;
  name: string;
  name_ar: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, isLoading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'stores' | 'settings'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (profile && !isAdmin) {
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
    
    // Fetch users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersData) setUsers(usersData);

    // Fetch stores
    const { data: storesData } = await supabase
      .from('stores')
      .select('*, owner:profiles(name)')
      .order('created_at', { ascending: false });

    if (storesData) setStores(storesData as any);

    // Fetch plans
    const { data: plansData } = await supabase
      .from('subscription_plans')
      .select('id, name, name_ar');

    if (plansData) setPlans(plansData);

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

  const updateUserPlan = async (userId: string, planId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_plan_id: planId })
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

  const filteredUsers = users.filter(user => 
    user.name.includes(searchQuery) || 
    user.email.includes(searchQuery) ||
    (user.phone?.includes(searchQuery) || false)
  );

  const filteredStores = stores.filter(store =>
    store.name.includes(searchQuery) ||
    store.slug.includes(searchQuery)
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

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
              {activeTab === 'users' && 'المستخدمين'}
              {activeTab === 'stores' && 'المتاجر'}
              {activeTab === 'settings' && 'الإعدادات'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {activeTab === 'users' && `${users.length} مستخدم مسجل`}
              {activeTab === 'stores' && `${stores.length} متجر`}
            </p>
          </div>

          {activeTab !== 'settings' && (
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

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right px-6 py-4 text-sm font-medium">المستخدم</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">التواصل</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">الاشتراك</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">الحالة</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-muted-foreground text-sm">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm" dir="ltr">{user.phone || user.whatsapp_number || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.subscription_plan_id || ''}
                          onChange={(e) => updateUserPlan(user.id, e.target.value)}
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
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                          className={`flex items-center gap-1 text-sm ${
                            user.is_active ? 'text-green-500' : 'text-destructive'
                          }`}
                        >
                          {user.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          {user.is_active ? 'نشط' : 'معطل'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${user.whatsapp_number || user.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-green-500/10 transition-colors text-green-500"
                          >
                            📱
                          </a>
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
                        <p className="text-sm">{(store.owner as any)?.name || '-'}</p>
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
                          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
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
    </div>
  );
};

export default AdminPanel;
