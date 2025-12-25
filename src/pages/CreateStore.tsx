import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store as StoreIcon, Palette, Package, ArrowLeft, ArrowRight, Sparkles, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type BrandType = 'fashion' | 'food' | 'tech' | 'luxury' | 'beauty' | 'home' | 'other' | '';

const brandTypes: { value: BrandType; label: string; emoji: string }[] = [
  { value: 'fashion', label: 'أزياء وموضة', emoji: '👗' },
  { value: 'food', label: 'طعام ومشروبات', emoji: '🍕' },
  { value: 'tech', label: 'تقنية وإلكترونيات', emoji: '📱' },
  { value: 'luxury', label: 'منتجات فاخرة', emoji: '💎' },
  { value: 'beauty', label: 'جمال وعناية', emoji: '💄' },
  { value: 'home', label: 'منزل وديكور', emoji: '🏠' },
  { value: 'other', label: 'أخرى', emoji: '✨' },
];

const colorThemes = [
  { primary: '#00D4FF', secondary: '#9D4EDD', name: 'سماوي بنفسجي' },
  { primary: '#FF6B6B', secondary: '#FFE66D', name: 'أحمر ذهبي' },
  { primary: '#00C853', secondary: '#69F0AE', name: 'أخضر طبيعي' },
  { primary: '#FF9800', secondary: '#FFEB3B', name: 'برتقالي دافئ' },
  { primary: '#E91E63', secondary: '#F48FB1', name: 'وردي أنيق' },
  { primary: '#3F51B5', secondary: '#7986CB', name: 'أزرق كلاسيكي' },
];

const CreateStore = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    storeSlug: '',
    brandType: '' as BrandType,
    whatsappNumber: '',
    colorTheme: 0,
    currency: 'EGP' as 'EGP' | 'SAR' | 'AED' | 'USD',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSlugChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData({ ...formData, storeName: name, storeSlug: slug });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'خطأ',
        description: 'يجب تسجيل الدخول أولاً',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if slug is already taken
      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', formData.storeSlug)
        .maybeSingle();

      if (existingStore) {
        toast({
          title: 'خطأ',
          description: 'هذا الرابط مستخدم بالفعل، اختر اسماً آخر',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        setStep(1);
        return;
      }

      const selectedTheme = colorThemes[formData.colorTheme];

      const { data, error } = await supabase
        .from('stores')
        .insert({
          name: formData.storeName,
          slug: formData.storeSlug,
          brand_type: formData.brandType,
          whatsapp_number: formData.whatsappNumber,
          primary_color: selectedTheme.primary,
          secondary_color: selectedTheme.secondary,
          currency: formData.currency,
          owner_id: user.id,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating store:', error);
        toast({
          title: 'خطأ',
          description: 'حدث خطأ أثناء إنشاء المتجر',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: 'تم بنجاح! 🎉',
        description: 'تم إنشاء متجرك بنجاح',
      });

      navigate(`/store/${data.slug}`);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.storeName.length >= 3;
      case 2:
        return formData.brandType !== '';
      case 3:
        return formData.whatsappNumber.length >= 10;
      default:
        return true;
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-32 pb-16 px-4">
        <div className="container max-w-2xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    s === step
                      ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground scale-110'
                      : s < step
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-12 h-1 rounded mx-1 transition-colors ${
                      s < step ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-8"
          >
            {/* Step 1: Store Name */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <StoreIcon className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">اسم متجرك</h2>
                  <p className="text-muted-foreground">اختر اسماً مميزاً لمتجرك</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">اسم المتجر</label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="مثال: متجر الأزياء الراقية"
                    className="input-glass"
                  />
                </div>

                <div className="glass-card p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">رابط متجرك:</p>
                  <p className="font-mono text-primary">
                    {formData.storeSlug || 'your-store'}.alshbh.store
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Brand Type */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">نوع النشاط</h2>
                  <p className="text-muted-foreground">اختر نوع نشاطك التجاري</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {brandTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, brandType: type.value })}
                      className={`p-4 rounded-xl text-center transition-all duration-300 ${
                        formData.brandType === type.value
                          ? 'bg-primary/20 border-2 border-primary'
                          : 'bg-muted/50 border-2 border-transparent hover:border-border'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{type.emoji}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: WhatsApp & Currency */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-whatsapp/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📱</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">رقم الواتساب</h2>
                  <p className="text-muted-foreground">رقم استقبال الطلبات</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">رقم واتساب (مع رمز الدولة)</label>
                  <input
                    type="tel"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="مثال: 201278006248"
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
                        onClick={() => setFormData({ ...formData, currency })}
                        className={`py-3 rounded-xl font-bold transition-all ${
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
            )}

            {/* Step 4: Theme */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-8 h-8 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">ألوان المتجر</h2>
                  <p className="text-muted-foreground">اختر الألوان المناسبة لبراندك</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {colorThemes.map((theme, index) => (
                    <button
                      key={index}
                      onClick={() => setFormData({ ...formData, colorTheme: index })}
                      className={`p-4 rounded-xl transition-all duration-300 ${
                        formData.colorTheme === index
                          ? 'ring-2 ring-primary scale-105'
                          : 'hover:scale-102'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary}20 0%, ${theme.secondary}20 100%)`,
                      }}
                    >
                      <div className="flex gap-2 mb-2 justify-center">
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ background: theme.primary }}
                        />
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ background: theme.secondary }}
                        />
                      </div>
                      <span className="text-sm font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
              {step > 1 ? (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isSubmitting}
                >
                  <ArrowRight className="w-5 h-5" />
                  السابق
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="btn-primary py-3 px-8 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary py-3 px-8 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء المتجر'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateStore;