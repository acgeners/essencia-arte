-- seed.sql — Dados iniciais do catálogo Essência & Arte
-- Baseado nos dados mock de src/lib/pricing/calculate.ts

-- ==========================================
-- 1. CATEGORIAS
-- ==========================================
INSERT INTO categories (slug, name) VALUES
  ('canetas', 'Canetas'),
  ('chaveiros', 'Chaveiros'),
  ('porta-aliancas', 'Porta-alianças'),
  ('lembrancas', 'Lembranças'),
  ('outros', 'Outros');

-- ==========================================
-- 2. PRODUTOS
-- ==========================================
INSERT INTO products (category_id, name, base_price) VALUES
  ((SELECT id FROM categories WHERE slug = 'canetas'), 'Caneta Personalizada', 12.00),
  ((SELECT id FROM categories WHERE slug = 'canetas'), 'Caneta Patinha de Cachorro', 12.00),
  ((SELECT id FROM categories WHERE slug = 'canetas'), 'Caneta Gatinho', 12.00),
  ((SELECT id FROM categories WHERE slug = 'canetas'), 'Caneta Harry Potter', 12.00),
  ((SELECT id FROM categories WHERE slug = 'canetas'), 'Caneta Estrela', 12.00);

-- ==========================================
-- 3. OPÇÕES — CORES
-- ==========================================
INSERT INTO options (type, name, price, is_tangible, is_active) VALUES
  ('color', 'Rosa Claro', 0, false, true),
  ('color', 'Rosa Escuro', 0, false, true),
  ('color', 'Vermelho', 0, false, true),
  ('color', 'Coral', 0, false, true),
  ('color', 'Lilás', 0, false, true),
  ('color', 'Roxo', 0, false, true),
  ('color', 'Azul', 0, false, true),
  ('color', 'Verde', 0, false, true),
  ('color', 'Amarelo', 0, false, true),
  ('color', 'Branco', 0, false, true),
  ('color', 'Preto', 0, false, true),
  ('color', 'Dourado', 0, false, true);

-- ==========================================
-- 4. OPÇÕES — GLITTER (intangível, controle manual)
-- ==========================================
INSERT INTO options (type, name, price, is_tangible, is_active) VALUES
  ('glitter', 'Rosa', 0, false, true),
  ('glitter', 'Dourado', 0, false, true),
  ('glitter', 'Prata', 0, false, true),
  ('glitter', 'Roxo', 0, false, true),
  ('glitter', 'Azul', 0, false, true),
  ('glitter', 'Verde', 0, false, true),
  ('glitter', 'Vermelho', 0, false, true),
  ('glitter', 'Holográfico', 0, false, true);

-- ==========================================
-- 5. OPÇÕES — COR DO TASSEL
-- ==========================================
INSERT INTO options (type, name, price, is_tangible, is_active) VALUES
  ('tassel_color', 'Rosa', 0, false, true),
  ('tassel_color', 'Dourado', 0, false, true),
  ('tassel_color', 'Branco', 0, false, true),
  ('tassel_color', 'Preto', 0, false, true),
  ('tassel_color', 'Lilás', 0, false, true),
  ('tassel_color', 'Azul', 0, false, true);

-- ==========================================
-- 6. OPÇÕES — ADICIONAIS (tangíveis, com estoque)
-- ==========================================
INSERT INTO options (type, name, price, is_tangible, is_active) VALUES
  ('extra', 'Folha de ouro', 1.50, true, true),
  ('extra', 'Tassel', 2.00, true, true),
  ('extra', 'Pompom', 2.00, true, true),
  ('extra', 'Pingente', 1.50, true, true),
  ('extra', 'Chaveiro', 2.50, true, true);

-- Estoque inicial dos extras tangíveis
INSERT INTO inventory (option_id, quantity) VALUES
  ((SELECT id FROM options WHERE type = 'extra' AND name = 'Folha de ouro'), 50),
  ((SELECT id FROM options WHERE type = 'extra' AND name = 'Tassel'), 30),
  ((SELECT id FROM options WHERE type = 'extra' AND name = 'Pompom'), 30),
  ((SELECT id FROM options WHERE type = 'extra' AND name = 'Pingente'), 40),
  ((SELECT id FROM options WHERE type = 'extra' AND name = 'Chaveiro'), 25);

-- ==========================================
-- 7. OPÇÕES — EMBALAGEM
-- ==========================================
INSERT INTO options (type, name, price, is_tangible, is_active) VALUES
  ('packaging', 'Embalagem normal (inclusa)', 0, false, true),
  ('packaging', 'Embalagem para presente', 3.00, true, true);

-- ==========================================
-- 8. OPÇÕES — FRETE / ENTREGA
-- ==========================================
INSERT INTO options (type, name, price, is_tangible, is_active) VALUES
  ('shipping', 'Retirar pessoalmente', 0, false, true),
  ('shipping', 'PAC', 12.50, false, true),
  ('shipping', 'SEDEX', 19.50, false, true),
  ('shipping', 'Transportadora', 0, false, true);
