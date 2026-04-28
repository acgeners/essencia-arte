-- Criar tabela de relacionamento entre Produtos e Opções
CREATE TABLE public.product_options (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    option_id UUID REFERENCES public.options(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, option_id)
);

-- Ativar RLS (Row Level Security)
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
-- Permitir leitura para todos (anônimos e autenticados) para o catálogo
CREATE POLICY "Enable read access for all users on product_options" 
ON public.product_options FOR SELECT 
USING (true);

-- Permitir todas as operações para autenticados (Admin)
CREATE POLICY "Enable all access for authenticated users on product_options" 
ON public.product_options FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- (Opcional) Script de migração de dados iniciais: 
-- Como atualmente todas as opções estão disponíveis globalmente, 
-- podemos popular essa tabela cruzando todos os produtos com todas as opções,
-- para que nada quebre imediatamente no site, e depois o admin vai desmarcando.
INSERT INTO public.product_options (product_id, option_id)
SELECT p.id, o.id 
FROM public.products p
CROSS JOIN public.options o;
