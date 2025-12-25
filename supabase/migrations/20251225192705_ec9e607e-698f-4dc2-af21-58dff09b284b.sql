-- Drop problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all stores" ON public.stores;

-- Recreate admin policies using the security definer function
CREATE POLICY "Admins can manage all products" 
ON public.products 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Admins can manage all stores" 
ON public.stores 
FOR ALL 
USING (public.is_admin());