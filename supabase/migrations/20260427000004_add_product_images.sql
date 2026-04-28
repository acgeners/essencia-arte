ALTER TABLE public.products ADD COLUMN images text[] DEFAULT '{}';

-- Comentário para o PostgREST saber que é uma lista de URLs
COMMENT ON COLUMN public.products.images IS 'Array de URLs das imagens do produto';
