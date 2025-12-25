import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Store, 
  Settings, 
  LogOut, 
  Search,
  MoreVertical,
  Check,
  X,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  subscription: string;
  storesCount: number;
  createdAt: string;
  isActive: boolean;
}

interface StoreListing {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  productsCount: number;
  subscription: string;
  isActive: boolean;
}

const mockUsers: User[] = [
  { id: '1', name: 'أحمد محمد', email: 'ahmed@example.com', phone: '01012345678', whatsapp: '201012345678', subscription: 'monthly', storesCount: 2, createdAt: '2024-01-15', isActive: true },
  { id: '2', name: 'سارة علي', email: 'sara@example.com', phone: '01123456789', whatsapp: '201123456789', subscription: 'free', storesCount: 1, createdAt: '2024-02-20', isActive: true },
  { id: '3', name: 'محمد حسن', email: 'mohamed@example.com', phone: '01234567890', whatsapp: '201234567890', subscription: 'yearly', storesCount: 3, createdAt: '2024-03-10', isActive: false },
];

const mockStores: StoreListing[] = [
  { id: '1', name: 'متجر الأزياء', slug: 'fashion-store', ownerName: 'أحمد محمد', productsCount: 25, subscription: 'monthly', isActive: true },
  { id: '2', name: 'متجر التقنية', slug: 'tech-store', ownerName: 'سارة علي', productsCount: 5, subscription: 'free', isActive: true },
  { id: '3', name: 'متجر الفخامة', slug: 'luxury-store', ownerName: 'محمد حسن', productsCount: 50, subscription: 'yearly', isActive: false },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'stores' | 'settings'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = () => {
    if (password === '01278006248@01204486263') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">لوحة التحكم</h1>
            <p className="text-muted-foreground text-sm mt-2">أدخل كلمة المرور للوصول</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="كلمة المرور"
              className="input-glass text-center"
              dir="ltr"
            />
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
            <button onClick={handleLogin} className="btn-primary w-full">
              دخول
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const filteredUsers = mockUsers.filter(user => 
    user.name.includes(searchQuery) || 
    user.email.includes(searchQuery) ||
    user.phone.includes(searchQuery)
  );

  const filteredStores = mockStores.filter(store =>
    store.name.includes(searchQuery) ||
    store.slug.includes(searchQuery) ||
    store.ownerName.includes(searchQuery)
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 glass-card rounded-none border-l border-border/50 p-6 hidden md:block">
        <div className="mb-8">
          <h2 className="text-xl font-bold gradient-text">لوحة الأدمن</h2>
          <p className="text-muted-foreground text-sm">alshbh.store</p>
        </div>

        <nav className="space-y-2">
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
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all mt-auto absolute bottom-6 left-6 right-6"
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
              {activeTab === 'users' && `${mockUsers.length} مستخدم مسجل`}
              {activeTab === 'stores' && `${mockStores.length} متجر نشط`}
            </p>
          </div>

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
                    <th className="text-right px-6 py-4 text-sm font-medium">المتاجر</th>
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
                        <p className="text-sm" dir="ltr">{user.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.subscription === 'yearly' ? 'bg-primary/20 text-primary' :
                          user.subscription === 'monthly' ? 'bg-secondary/20 text-secondary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {user.subscription}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{user.storesCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <span className="flex items-center gap-1 text-green-500 text-sm">
                            <Check className="w-4 h-4" /> نشط
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-destructive text-sm">
                            <X className="w-4 h-4" /> معطل
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                            <Edit className="w-4 h-4 text-muted-foreground" />
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

        {/* Stores Tab */}
        {activeTab === 'stores' && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right px-6 py-4 text-sm font-medium">المتجر</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">المالك</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">المنتجات</th>
                    <th className="text-right px-6 py-4 text-sm font-medium">الاشتراك</th>
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
                        <p className="text-sm">{store.ownerName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{store.productsCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          store.subscription === 'yearly' ? 'bg-primary/20 text-primary' :
                          store.subscription === 'monthly' ? 'bg-secondary/20 text-secondary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {store.subscription}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {store.isActive ? (
                          <span className="flex items-center gap-1 text-green-500 text-sm">
                            <Check className="w-4 h-4" /> نشط
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-destructive text-sm">
                            <X className="w-4 h-4" /> معطل
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                            <Edit className="w-4 h-4 text-muted-foreground" />
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
