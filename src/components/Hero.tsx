import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, Zap, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      <div className="container relative z-10 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              أنشئ متجرك في أقل من دقيقة
            </span>
          </motion.div>

          {/* Main Heading */}
          <h1 className="section-title text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-6">
            <span className="block text-foreground">حوّل واتساب إلى</span>
            <span className="gradient-text">متجر احترافي</span>
          </h1>

          {/* Subtitle */}
          <p className="section-subtitle text-lg md:text-xl lg:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
            منصة alshbh.store تمكّنك من إنشاء متجر إلكتروني كامل يعمل عبر واتساب.
            <br className="hidden md:block" />
            بدون خبرة تقنية، بدون تعقيدات، فقط ابدأ البيع الآن!
          </p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/create-store" className="btn-primary text-lg flex items-center gap-3">
              <Store className="w-5 h-5" />
              أنشئ متجرك مجاناً
            </Link>
            <Link to="/demo-store" className="btn-secondary text-lg flex items-center gap-3">
              <Zap className="w-5 h-5" />
              شاهد متجر تجريبي
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { value: '+1000', label: 'متجر نشط' },
              { value: '+50K', label: 'طلب مكتمل' },
              { value: '99%', label: 'رضا العملاء' },
              { value: '24/7', label: 'دعم متواصل' },
            ].map((stat, index) => (
              <div key={index} className="glass-card p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating WhatsApp Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
          className="absolute -bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-whatsapp rounded-full blur-xl opacity-50 animate-glow-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-whatsapp to-whatsapp-dark rounded-full flex items-center justify-center shadow-2xl animate-bounce-gentle">
              <MessageCircle className="w-10 h-10 text-foreground" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
