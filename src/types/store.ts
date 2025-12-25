export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'EGP' | 'SAR' | 'AED' | 'USD';
  image: string;
  category?: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  brandType: 'fashion' | 'food' | 'tech' | 'luxury' | 'beauty' | 'home' | 'other';
  whatsappNumber: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  coverImage?: string;
  products: Product[];
  ownerId: string;
  subscription: SubscriptionPlan;
  isActive: boolean;
  createdAt: Date;
}

export type SubscriptionPlan = 'free' | 'weekly' | 'monthly' | 'yearly' | 'lifetime';

export interface SubscriptionDetails {
  name: string;
  nameAr: string;
  price: number;
  currency: string;
  period: string;
  maxProducts: number;
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionDetails> = {
  free: {
    name: 'Free',
    nameAr: 'مجاني',
    price: 0,
    currency: 'USD',
    period: 'للأبد',
    maxProducts: 5,
    features: ['حتى 5 منتجات', 'رابط متجر فرعي', 'زر واتساب', 'QR Code']
  },
  weekly: {
    name: 'Weekly',
    nameAr: 'أسبوعي',
    price: 10,
    currency: 'USD',
    period: 'أسبوع',
    maxProducts: 20,
    features: ['حتى 20 منتج', 'تصميمات متقدمة', 'دعم أولوية', 'تحليلات أساسية']
  },
  monthly: {
    name: 'Monthly',
    nameAr: 'شهري',
    price: 20,
    currency: 'USD',
    period: 'شهر',
    maxProducts: 50,
    popular: true,
    features: ['حتى 50 منتج', 'جميع التصميمات', 'دعم 24/7', 'تحليلات متقدمة', 'بدون علامة مائية']
  },
  yearly: {
    name: 'Yearly',
    nameAr: 'سنوي',
    price: 100,
    currency: 'USD',
    period: 'سنة',
    maxProducts: 200,
    features: ['حتى 200 منتج', 'جميع المميزات', 'دومين مخصص', 'أولوية قصوى', 'تصميم مخصص']
  },
  lifetime: {
    name: 'Lifetime',
    nameAr: 'دائم',
    price: 200,
    currency: 'USD',
    period: 'للأبد',
    maxProducts: -1,
    features: ['منتجات غير محدودة', 'تصميم فريد حصري', 'جميع المميزات للأبد', 'دعم VIP', 'ميزات مستقبلية مجانية']
  }
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  subscription: SubscriptionPlan;
  stores: string[];
  createdAt: Date;
}
