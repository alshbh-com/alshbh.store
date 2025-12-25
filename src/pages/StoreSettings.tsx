import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowRight, 
  Loader2, 
  Save,
  Store as StoreIcon,
  Palette,
  Image as ImageIcon,
  Settings,
  Trash2,
  Eye
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
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
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const colorThemes = [
  { primary: '#00D4FF', secondary: '#9D4EDD', name: 'سماوي بنفسجي' },
  { primary: '#FF6B6B', secondary: '#FFE66D', name: 'أحمر ذهبي' },
  { primary: '#00C853', secondary: '#69F0AE', name: 'أخضر طبيعي' },
  { primary: '#FF9800', secondary: '#FFEB3B', name: 'برتقالي دافئ' },
  { primary: '#E91E63', secondary: '#F48FB1', name: 'وردي أنيق' },
  { primary: '#3F51B5', secondary: '#7986CB', name: 'أزرق كلاسيكي' },
];

const brandTypes = [
  { value: 'fashion', label: 'أزياء وموضة', emoji: '👗' },
  { value: 'food', label: 'طعام ومشروبات', emoji: '🍕' },
  { value: 'tech', label: 'تقنية وإلكترونيات', emoji: '📱' },
  { value: 'luxury', label: 'منتجات فاخرة', emoji: '💎' },
  { value: 'beauty', label: 'جمال وعناية', emoji: '💄' },
  { value: 'home', label: 'منزل وديكور', emoji: '🏠' },
  { value: 'other', label: 'أخرى', emoji: '✨' },
];

const StoreSettings = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    brand_type: '',
    whatsapp_number: '',
    primary_color: '#00D4FF',
    secondary_color: '#9D4EDD',
    currency: 'EGP',
    logo_url: '',
    cover_url: '',
    is_active: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && storeId) {
      fetchStore();
    }
  }, [user, storeId]);

  const fetchStore = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .eq('owner_id', user?.id)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: 'خطأ',
        description: 'المتجر غير موجود أو ليس لديك صلاحية',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }

    setStore(data);
    setFormData({
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      brand_type: data.brand_type,
      whatsapp_number: data.whatsapp_number,
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      currency: data.currency,
      logo_url: data.logo_url || '',
      cover_url: data.cover_url || '',
      is_active: data.is_active,
    });

    setIsLoading(false);
  };

  const handleSlugChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData({ ...formData, name, slug });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.whatsapp_number.trim()) {
      toast({
        title: 'خطأ',
        description: 'الاسم ورقم الواتساب مطلوبان',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Check if slug is taken by another store
      if (formData.slug !== store?.slug) {
        const { data: existingStore } = await supabase
          .from('stores')
          .select('id')
          .eq('slug', formData.slug)
          .neq('id', storeId)
          .maybeSingle();

        if (existingStore) {
          toast({
            title: 'خطأ',
            description: 'هذا الرابط مستخدم بالفعل',
            variant: 'destructive',
          });
          setIsSaving(false);
          return;
        }
      }

      const { error } = await supabase
        .from('stores')
        .update({
          name: formData.name.trim(),
          slug: formData.slug,
          description: formData.description.trim() || null,
          brand_type: formData.brand_type,
          whatsapp_number: formData.whatsapp_number.trim(),
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          currency: formData.currency,
          logo_url: formData.logo_url.trim() || null,
          cover_url: formData.cover_url.trim() || null,
          is_active: formData.is_active,
        })
        .eq('id', storeId);

      if (error) throw error;

      toast({ title: 'تم حفظ التغييرات بنجاح' });
      fetchStore();
    } catch (error) {
      console.error('Error saving store:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الحفظ',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // Delete all products first
      await supabase
        .from('products')
        .delete()
        .eq('store_id', storeId);

      // Then delete the store
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId);

      if (error) throw error;

      toast({ title: 'تم حذف المتجر' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting store:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف المتجر',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const selectColorTheme = (theme: typeof colorThemes[0]) => {
    setFormData({
      ...formData,
      primary_color: theme.primary,
      secondary_color: theme.secondary,
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/manage-store/${storeId}`)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">إعدادات المتجر</h1>
                <p className="text-sm text-muted-foreground">{store.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(`/store/${formData.slug}`, '_blank')}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                حفظ
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <StoreIcon className="w-4 h-4" />
              <span className="hidden sm:inline">عام</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">المظهر</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">الوسائط</span>
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 space-y-6"
            >
              <h2 className="text-lg font-bold flex items-center gap-2">
                <StoreIcon className="w-5 h-5" />
                المعلومات الأساسية
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم المتجر *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="input-glass"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">رابط المتجر</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="input-glass flex-1 text-left"
                      dir="ltr"
                    />
                    <span className="text-muted-foreground text-sm">.alshbh.store</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">وصف المتجر</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف قصير يظهر للزوار"
                  className="input-glass min-h-[100px] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">نوع النشاط</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {brandTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, brand_type: type.value })}
                      className={`p-3 rounded-xl text-center transition-all ${
                        formData.brand_type === type.value
                          ? 'bg-primary/20 border-2 border-primary'
                          : 'bg-muted/50 border-2 border-transparent hover:border-border'
                      }`}
                    >
                      <span className="text-xl block mb-1">{type.emoji}</span>
                      <span className="text-xs">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">رقم واتساب *</label>
                  <input
                    type="tel"
                    value={formData.whatsapp_number}
                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                    placeholder="201278006248"
                    className="input-glass text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">العملة</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['EGP', 'SAR', 'AED', 'USD'] as const).map((currency) => (
                      <button
                        key={currency}
                        type="button"
                        onClick={() => setFormData({ ...formData, currency })}
                        className={`py-2 rounded-xl font-bold transition-all text-sm ${
                          formData.currency === currency
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {currency}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-medium">حالة المتجر</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_active ? 'المتجر مفعل ومتاح للزوار' : 'المتجر معطل ولن يظهر للزوار'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    formData.is_active
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-destructive/20 text-destructive'
                  }`}
                >
                  {formData.is_active ? 'مفعل' : 'معطل'}
                </button>
              </div>
            </motion.div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 space-y-6"
            >
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Palette className="w-5 h-5" />
                ألوان المتجر
              </h2>

              <div>
                <label className="block text-sm font-medium mb-3">اختر ثيم جاهز</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {colorThemes.map((theme, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectColorTheme(theme)}
                      className={`p-4 rounded-xl transition-all ${
                        formData.primary_color === theme.primary && formData.secondary_color === theme.secondary
                          ? 'ring-2 ring-primary scale-105'
                          : 'hover:scale-102'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary}20 0%, ${theme.secondary}20 100%)`,
                      }}
                    >
                      <div className="flex gap-2 mb-2 justify-center">
                        <div className="w-8 h-8 rounded-full" style={{ background: theme.primary }} />
                        <div className="w-8 h-8 rounded-full" style={{ background: theme.secondary }} />
                      </div>
                      <span className="text-sm font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">اللون الأساسي</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-12 h-12 rounded-xl cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="input-glass flex-1 text-left font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">اللون الثانوي</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-12 h-12 rounded-xl cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="input-glass flex-1 text-left font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium mb-3">معاينة</label>
                <div 
                  className="p-6 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${formData.primary_color}15 0%, ${formData.secondary_color}15 100%)`,
                  }}
                >
                  <h3 
                    className="text-2xl font-bold mb-2"
                    style={{
                      background: `linear-gradient(135deg, ${formData.primary_color}, ${formData.secondary_color})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {formData.name || 'اسم المتجر'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {formData.description || 'وصف المتجر يظهر هنا'}
                  </p>
                  <button
                    className="px-6 py-2 rounded-xl text-white font-medium"
                    style={{ background: `linear-gradient(135deg, ${formData.primary_color}, ${formData.secondary_color})` }}
                  >
                    زر تجريبي
                  </button>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 space-y-6"
            >
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                الصور والوسائط
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3">شعار المتجر (Logo)</label>
                  <ImageUpload
                    value={formData.logo_url}
                    onChange={(url) => setFormData({ ...formData, logo_url: url })}
                    folder={`stores/${storeId}/logo`}
                    aspectRatio="logo"
                    placeholder="رفع الشعار"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">صورة الغلاف (Cover)</label>
                  <ImageUpload
                    value={formData.cover_url}
                    onChange={(url) => setFormData({ ...formData, cover_url: url })}
                    folder={`stores/${storeId}/cover`}
                    aspectRatio="cover"
                    placeholder="رفع صورة الغلاف"
                  />
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 glass-card p-6 border-destructive/30"
        >
          <h2 className="text-lg font-bold text-destructive flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5" />
            منطقة الخطر
          </h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">حذف المتجر</p>
              <p className="text-sm text-muted-foreground">
                سيتم حذف المتجر وجميع المنتجات نهائياً
              </p>
            </div>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-destructive/20 text-destructive hover:bg-destructive/30 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              حذف المتجر
            </button>
          </div>
        </motion.div>
      </main>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">حذف المتجر نهائياً؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المتجر "{store.name}" وجميع المنتجات المرتبطة به. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Trash2 className="w-4 h-4 ml-2" />
              )}
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StoreSettings;