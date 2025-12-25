import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Palette, 
  QrCode, 
  Zap, 
  Shield, 
  Globe,
  MessageCircle,
  BarChart3
} from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'تصميم موبايل أولاً',
    description: 'متجرك يظهر بشكل مثالي على جميع الأجهزة، خاصة الهواتف الذكية.',
  },
  {
    icon: Palette,
    title: 'تخصيص كامل',
    description: 'اختر ألوان البراند، الخلفيات، والتصميم الذي يناسب نشاطك التجاري.',
  },
  {
    icon: MessageCircle,
    title: 'طلب عبر واتساب',
    description: 'زر طلب مباشر يرسل تفاصيل المنتج إلى رقم واتساب الخاص بك.',
  },
  {
    icon: QrCode,
    title: 'QR Code مخصص',
    description: 'كود QR لمشاركة متجرك بسهولة في أي مكان - بطاقات، ملصقات، أو سوشيال ميديا.',
  },
  {
    icon: Zap,
    title: 'سرعة فائقة',
    description: 'متجرك يعمل بسرعة البرق مع تحميل فوري للمنتجات والصور.',
  },
  {
    icon: Shield,
    title: 'أمان وحماية',
    description: 'بياناتك ومتجرك محمي بأحدث تقنيات الأمان والتشفير.',
  },
  {
    icon: Globe,
    title: 'رابط فرعي مخصص',
    description: 'احصل على رابط متجرك الخاص مثل: yourstore.alshbh.store',
  },
  {
    icon: BarChart3,
    title: 'تحليلات متقدمة',
    description: 'تابع أداء متجرك وزياراته مع إحصائيات شاملة.',
  },
];

const Features = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden" id="features">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      
      <div className="container max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">
            كل ما تحتاجه في <span className="gradient-text">منصة واحدة</span>
          </h2>
          <p className="section-subtitle">
            مميزات قوية تساعدك على إدارة متجرك وزيادة مبيعاتك بسهولة
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-3d p-6 group cursor-pointer"
            >
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
