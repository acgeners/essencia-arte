-- 20260427000003_expand_relations.sql

-- 1. Criar tabela de junção para Produtos e Categorias (Muitos para Muitos)
CREATE TABLE product_category_links (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- Migrar dados existentes da coluna products.category_id para a nova tabela
INSERT INTO product_category_links (product_id, category_id)
SELECT id, category_id FROM products WHERE category_id IS NOT NULL;

-- Remover a coluna antiga (Opcional: você pode manter por um tempo, mas o plano é migrar para M2M)
-- ALTER TABLE products DROP COLUMN category_id;

-- 2. Habilitar Realtime para a tabela de estoque
-- Isso permite que o frontend ouça mudanças instantâneas
begin;
  -- Remove a tabela se já estiver na publicação (segurança)
  drop publication if exists supabase_realtime;
  -- Recria a publicação incluindo as tabelas que queremos tempo real
  create publication supabase_realtime for table inventory, orders, customers;
commit;

-- 3. Garantir índices para performance nas novas relações
CREATE INDEX IF NOT EXISTS idx_product_category_links_product ON product_category_links(product_id);
CREATE INDEX IF NOT EXISTS idx_product_category_links_category ON product_category_links(category_id);
CREATE INDEX IF NOT EXISTS idx_product_options_product ON product_options(product_id);
CREATE INDEX IF NOT EXISTS idx_product_options_option ON product_options(option_id);

-- 4. RLS para a nova tabela de links
ALTER TABLE product_category_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de categorias de produtos" ON product_category_links FOR SELECT USING (true);
CREATE POLICY "Admin total em links de categorias" ON product_category_links USING (auth.uid() IS NOT NULL);
