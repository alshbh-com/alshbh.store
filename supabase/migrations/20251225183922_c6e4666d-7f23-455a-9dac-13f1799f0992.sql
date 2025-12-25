-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  period TEXT NOT NULL,
  max_products INTEGER NOT NULL DEFAULT 5,
  features JSONB NOT NULL DEFAULT '[]',
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp_number TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  subscription_plan_id UUID REFERENCES public.subscription_plans(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stores table
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  brand_type TEXT NOT NULL DEFAULT 'other',
  whatsapp_number TEXT NOT NULL,
  primary_color TEXT NOT NULL DEFAULT '#00D4FF',
  secondary_color TEXT NOT NULL DEFAULT '#9D4EDD',
  currency TEXT NOT NULL DEFAULT 'EGP',
  logo_url TEXT,
  cover_url TEXT,
  subscription_plan_id UUID REFERENCES public.subscription_plans(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EGP',
  image_url TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Subscription plans are readable by everyone
CREATE POLICY "Subscription plans are viewable by everyone" 
ON public.subscription_plans FOR SELECT USING (true);

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Stores policies
CREATE POLICY "Stores are viewable by everyone" 
ON public.stores FOR SELECT USING (true);

CREATE POLICY "Users can create their own stores" 
ON public.stores FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own stores" 
ON public.stores FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own stores" 
ON public.stores FOR DELETE 
USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all stores" 
ON public.stores FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Products policies
CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Store owners can manage their products" 
ON public.products FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE id = store_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all products" 
ON public.products FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stores_updated_at
BEFORE UPDATE ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'مستخدم جديد'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, name_ar, price, currency, period, max_products, features, is_popular) VALUES
('free', 'مجاني', 0, 'USD', 'للأبد', 5, '["حتى 5 منتجات", "رابط متجر فرعي", "زر واتساب", "QR Code"]', false),
('weekly', 'أسبوعي', 10, 'USD', 'أسبوع', 20, '["حتى 20 منتج", "تصميمات متقدمة", "دعم أولوية", "تحليلات أساسية"]', false),
('monthly', 'شهري', 20, 'USD', 'شهر', 50, '["حتى 50 منتج", "جميع التصميمات", "دعم 24/7", "تحليلات متقدمة", "بدون علامة مائية"]', true),
('yearly', 'سنوي', 100, 'USD', 'سنة', 200, '["حتى 200 منتج", "جميع المميزات", "دومين مخصص", "أولوية قصوى", "تصميم مخصص"]', false),
('lifetime', 'دائم', 200, 'USD', 'للأبد', -1, '["منتجات غير محدودة", "تصميم فريد حصري", "جميع المميزات للأبد", "دعم VIP", "ميزات مستقبلية مجانية"]', false);