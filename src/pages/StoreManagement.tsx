import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowRight, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Package,
  Save,
  X,
  AlertTriangle,
  Crown,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface Store {
  id: string;
  name: string;
  slug: string;
  currency: string;
  primary_color: string;
  secondary_color: string;
  subscription_plan_id: string | null;
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

interface SubscriptionPlan {
  id: string;
  name: string;
  max_products: number;
}

const StoreManagement = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && storeId) {
      fetchStoreData();
    }
  }, [user, storeId]);

  const fetchStoreData = async () => {
    setIsLoading(true);

    // Fetch store
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .eq('owner_id', user?.id)
      .maybeSingle();

    if (storeError || !storeData) {
      toast({
        title: 'خطأ',
        description: 'المتجر غير موجود أو ليس لديك صلاحية',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }

    setStore(storeData);

    // Fetch products
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (productsData) {
      setProducts(productsData);
    }

    // Fetch subscription plan
    const planId = storeData.subscription_plan_id || profile?.subscription_plan_id;
    if (planId) {
      const { data: planData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .maybeSingle();
      
      if (planData) {
        setPlan(planData);
      }
    } else {
      // Default free plan
      const { data: freePlan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', 'free')
        .maybeSingle();
      
      if (freePlan) {
        setPlan(freePlan);
      }
    }

    setIsLoading(false);
  };

  const canAddProduct = () => {
    if (!plan) return true;
    if (plan.max_products === -1) return true;
    return products.length < plan.max_products;
  };

  const openAddProduct = () => {
    if (!canAddProduct()) {
      toast({
        title: 'تم الوصول للحد الأقصى',
        description: `خطتك الحالية تسمح بـ ${plan?.max_products} منتجات فقط. قم بالترقية لإضافة المزيد.`,
        variant: 'destructive',
      });
      return;
    }
    setEditingProduct(null);
    setProductForm({ name: '', description: '', price: '', image_url: '', category: '' });
    setIsProductDialogOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image_url: product.image_url || '',
      category: product.category || '',
    });
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim() || !productForm.price) {
      toast({
        title: 'خطأ',
        description: 'الاسم والسعر مطلوبان',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: productForm.name.trim(),
            description: productForm.description.trim() || null,
            price: parseFloat(productForm.price),
            image_url: productForm.image_url.trim() || null,
            category: productForm.category.trim() || null,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({ title: 'تم تحديث المنتج بنجاح' });
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({
            store_id: storeId,
            name: productForm.name.trim(),
            description: productForm.description.trim() || null,
            price: parseFloat(productForm.price),
            image_url: productForm.image_url.trim() || null,
            category: productForm.category.trim() || null,
            currency: store?.currency || 'EGP',
            is_active: true,
          });

        if (error) throw error;

        toast({ title: 'تم إضافة المنتج بنجاح' });
      }

      setIsProductDialogOpen(false);
      fetchStoreData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ المنتج',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteProductId);

      if (error) throw error;

      toast({ title: 'تم حذف المنتج' });
      setDeleteProductId(null);
      fetchStoreData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف المنتج',
        variant: 'destructive',
      });
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === product.id ? { ...p, is_active: !p.is_active } : p
      ));
    } catch (error) {
      console.error('Error toggling product:', error);
    }
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
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">{store.name}</h1>
                <p className="text-sm text-muted-foreground">إدارة المنتجات</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/store-settings/${storeId}`)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
                title="إعدادات المتجر"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.open(`/store/${store.slug}`, '_blank')}
                className="text-sm text-primary hover:underline"
              >
                عرض المتجر ←
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Plan Status */}
        <div className="mb-6 glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">
                المنتجات: {products.length}
                {plan && plan.max_products !== -1 && ` / ${plan.max_products}`}
              </p>
              {plan && plan.max_products !== -1 && products.length >= plan.max_products && (
                <p className="text-xs text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  وصلت للحد الأقصى
                </p>
              )}
            </div>
          </div>
          {plan && plan.max_products !== -1 && products.length >= plan.max_products && (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl"
            >
              <Crown className="w-4 h-4" />
              ترقية الخطة
            </button>
          )}
        </div>

        {/* Add Product Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">المنتجات</h2>
          <button
            onClick={openAddProduct}
            disabled={!canAddProduct()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            إضافة منتج
          </button>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">لا توجد منتجات</h3>
            <p className="text-muted-foreground mb-6">أضف منتجك الأول الآن!</p>
            <button onClick={openAddProduct} className="btn-primary">
              إضافة منتج
            </button>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`glass-card overflow-hidden ${!product.is_active ? 'opacity-60' : ''}`}
              >
                {/* Product Image */}
                <div className="aspect-square bg-muted relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${store.primary_color}20, ${store.secondary_color}20)` }}
                    >
                      <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  {!product.is_active && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                      <span className="bg-destructive/90 text-destructive-foreground px-3 py-1 rounded-full text-sm">
                        معطل
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-bold mb-1 truncate">{product.name}</h3>
                  <p className="text-2xl font-bold text-primary mb-3">
                    {product.price} <span className="text-sm">{store.currency}</span>
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditProduct(product)}
                      className="flex-1 bg-muted hover:bg-muted/80 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      تعديل
                    </button>
                    <button
                      onClick={() => toggleProductStatus(product)}
                      className={`px-4 py-2 rounded-xl transition-colors ${
                        product.is_active 
                          ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30' 
                          : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                      }`}
                    >
                      {product.is_active ? 'إيقاف' : 'تفعيل'}
                    </button>
                    <button
                      onClick={() => setDeleteProductId(product.id)}
                      className="px-4 py-2 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم المنتج *</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="مثال: قميص أبيض"
                className="input-glass"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الوصف</label>
              <textarea
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="وصف قصير للمنتج"
                className="input-glass min-h-[80px] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">السعر ({store?.currency}) *</label>
              <input
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                placeholder="0"
                className="input-glass text-left"
                dir="ltr"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">صورة المنتج</label>
              <ImageUpload
                value={productForm.image_url}
                onChange={(url) => setProductForm({ ...productForm, image_url: url })}
                folder={`products/${storeId}`}
                aspectRatio="square"
                placeholder="اضغط لرفع صورة المنتج"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">التصنيف</label>
              <input
                type="text"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                placeholder="مثال: ملابس"
                className="input-glass"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveProduct}
                disabled={isSaving}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              <button
                onClick={() => setIsProductDialogOpen(false)}
                className="px-6 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المنتج؟</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
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

export default StoreManagement;