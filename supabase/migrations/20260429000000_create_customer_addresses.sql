CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label TEXT,
  zip_code TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes podem ver seus endereços" ON customer_addresses
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Clientes podem inserir endereços" ON customer_addresses
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Clientes podem atualizar seus endereços" ON customer_addresses
  FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "Clientes podem remover seus endereços" ON customer_addresses
  FOR DELETE USING (auth.uid() = customer_id);

CREATE INDEX idx_customer_addresses_customer ON customer_addresses(customer_id);
