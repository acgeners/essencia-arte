-- Asaas payment integration

-- Add CPF/CNPJ to orders (captured at checkout regardless of login)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_cpf_cnpj TEXT;

-- Add Asaas fields to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;

-- Payments table: tracks each Asaas charge (deposit and balance)
CREATE TABLE IF NOT EXISTS payments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  asaas_payment_id   TEXT UNIQUE,
  payment_type       TEXT NOT NULL CHECK (payment_type IN ('deposit', 'balance')),
  method             TEXT NOT NULL CHECK (method IN ('PIX', 'BOLETO', 'CREDIT_CARD', 'MANUAL')),
  status             TEXT NOT NULL DEFAULT 'PENDING',
  amount             DECIMAL(10,2) NOT NULL,
  -- PIX fields
  pix_qr_code        TEXT,
  pix_copy_paste     TEXT,
  pix_expiry         TIMESTAMPTZ,
  -- Boleto fields
  boleto_url         TEXT,
  boleto_barcode     TEXT,
  boleto_expiry      TIMESTAMPTZ,
  -- General
  invoice_url        TEXT,
  external_reference TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_order_id_idx ON payments(order_id);
CREATE INDEX IF NOT EXISTS payments_asaas_payment_id_idx ON payments(asaas_payment_id);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (order creation flow)
CREATE POLICY "payments_insert" ON payments
  FOR INSERT WITH CHECK (true);

-- Customers can view payments linked to their orders
CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = payments.order_id
        AND (o.customer_id = auth.uid() OR auth.uid() IS NULL)
    )
  );

-- Admin full access
CREATE POLICY "payments_admin_all" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.app_metadata->>'role' = 'admin'
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_payments_updated_at();
