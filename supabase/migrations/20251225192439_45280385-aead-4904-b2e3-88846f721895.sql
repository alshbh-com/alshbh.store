-- Create storage bucket for store assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('store-assets', 'store-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Allow anyone to view store assets (public bucket)
CREATE POLICY "Store assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-assets');

-- Allow store owners to upload their store assets
CREATE POLICY "Store owners can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-assets' 
  AND auth.uid() IS NOT NULL
);

-- Allow store owners to update their assets
CREATE POLICY "Store owners can update their assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'store-assets' 
  AND auth.uid() IS NOT NULL
);

-- Allow store owners to delete their assets
CREATE POLICY "Store owners can delete their assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'store-assets' 
  AND auth.uid() IS NOT NULL
);