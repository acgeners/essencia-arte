-- 20260426000000_schema_inicial.sql
-- Migração inicial do Essência & Arte

-- Usando gen_random_uuid() nativo do Supabase (pgcrypto)

-- ==========================================
-- 1. CATÁLOGO
-- ==========================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- options engloba: colors, glitters, extras, embalagens, métodos de entrega
CREATE TABLE options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- Valores: 'color', 'glitter', 'tassel_color', 'extra', 'packaging', 'shipping'
  name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  is_tangible BOOLEAN DEFAULT false, -- Se true, controla o estoque
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. ESTOQUE
-- ==========================================

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID REFERENCES options(id) ON DELETE CASCADE UNIQUE,
  quantity INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. PEDIDOS
-- ==========================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- Ex: PED-A8B9 (Gerado na aplicação)
  status TEXT NOT NULL DEFAULT 'pending_payment', -- pending_payment, confirmed, production, shipped, delivered
  
  -- Cliente
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_notes TEXT,
  
  -- Financeiro
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  deposit DECIMAL(10,2) NOT NULL,
  balance DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  
  -- Opções de personalização escolhidas
  personalization_name TEXT,
  primary_color_id UUID REFERENCES options(id),
  secondary_color_id UUID REFERENCES options(id),
  glitter_id UUID REFERENCES options(id),
  tassel_color_id UUID REFERENCES options(id),
  packaging_id UUID REFERENCES options(id),
  shipping_id UUID REFERENCES options(id),
  
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Como um item pode ter MÚLTIPLOS extras (ex: Folha de ouro + Pompom + Pingente)
CREATE TABLE order_item_extras (
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  extra_option_id UUID REFERENCES options(id),
  price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (order_item_id, extra_option_id)
);

-- ==========================================
-- 4. SEGURANÇA (RLS)
-- ==========================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_extras ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas (Leitura de catálogo)
CREATE POLICY "Catálogo é público para leitura" ON categories FOR SELECT USING (true);
CREATE POLICY "Produtos são públicos para leitura" ON products FOR SELECT USING (true);
CREATE POLICY "Opções são públicas para leitura" ON options FOR SELECT USING (true);

-- Políticas Públicas (Criação de pedido e consulta)
CREATE POLICY "Qualquer um pode criar um pedido" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Cliente pode ver seu pedido" ON orders FOR SELECT USING (true); -- Na aplicação, buscará apenas via WHERE code = X
CREATE POLICY "Itens do pedido são criados junto com o pedido" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Itens de extras são criados junto com o pedido" ON order_item_extras FOR INSERT WITH CHECK (true);

-- Políticas Admin (Você logado tem acesso total a TUDO)
CREATE POLICY "Admin tem acesso total a categorias" ON categories USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin tem acesso total a produtos" ON products USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin tem acesso total a opções" ON options USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin tem acesso total ao estoque" ON inventory USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin tem acesso total a pedidos" ON orders USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin tem acesso total a itens de pedido" ON order_items USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin tem acesso total a extras de pedido" ON order_item_extras USING (auth.uid() IS NOT NULL);
