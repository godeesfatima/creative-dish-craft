-- Create storage bucket for menu images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Allow anyone to view images
CREATE POLICY "Anyone can view menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- Allow authenticated admins to upload images
CREATE POLICY "Admins can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'menu-images' 
  AND (storage.foldername(name))[1] = 'items'
  AND auth.role() = 'authenticated'
);

-- Allow admins to update images
CREATE POLICY "Admins can update menu images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'menu-images'
  AND auth.role() = 'authenticated'
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete menu images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'menu-images'
  AND auth.role() = 'authenticated'
);