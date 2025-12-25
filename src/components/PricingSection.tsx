import { motion } from 'framer-motion';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/types/store';

const planIcons: Record<SubscriptionPlan, React.ReactNode> = {
  free: <Zap className="w-6 h-6" />,
  weekly: <Star className="w-6 h-6" />,
  monthly: <Crown className="w-6 h-6" />,
  yearly: <Crown className="w-6 h-6" />,
  lifetime: <Crown className="w-6 h-6" />,
};

const PricingSection = () => {
  const plans = Object.entries(SUBSCRIPTION_PLANS) as [SubscriptionPlan, typeof SUBSCRIPTION_PLANS[SubscriptionPlan]][];

  return (
    <section className="py-24 px-4 relative overflow-hidden" id="pricing">
      <div className="container max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">
            خطط <span className="gradient-text">أسعار مرنة</span>
          </h2>
          <p className="section-subtitle">
            اختر الخطة التي تناسب احتياجاتك وابدأ البيع فوراً
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map(([key, plan], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative card-3d p-6 flex flex-col ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-secondary rounded-full text-xs font-bold text-primary-foreground">
                  الأكثر شيوعاً
                </div>
              )}

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  {planIcons[key]}
                </div>
                <h3 className="text-xl font-bold mb-2">{plan.nameAr}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold gradient-text">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    /{plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 flex-grow mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                  plan.popular
                    ? 'btn-primary'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                {plan.price === 0 ? 'ابدأ مجاناً' : 'اشترك الآن'}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center text-muted-foreground mt-8 text-sm"
        >
          للاشتراك تواصل معنا عبر واتساب وسيتم تفعيل حسابك فوراً
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;
