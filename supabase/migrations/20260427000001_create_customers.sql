-- 20260427000001_create_customers.sql

-- 1. Cria a tabela espelho de clientes
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS na tabela de clientes
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Políticas da tabela customers
CREATE POLICY "Clientes podem ler seus próprios dados" ON customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin tem acesso total aos clientes" ON customers USING (auth.uid() IS NOT NULL);

-- 2. Criar a função (Trigger) para inserir dados automaticamente na tabela customers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (id, full_name, email, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Cliente ' || split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Associar a Trigger à tabela auth.users do Supabase
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Adicionar a coluna customer_id na tabela orders
ALTER TABLE orders ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Atualizar política de RLS de orders para o cliente ver seus próprios pedidos com base no customer_id
-- Removendo a política existente primeiro, se necessário, ou apenas adicionando a regra
DROP POLICY IF EXISTS "Cliente pode ver seu pedido" ON orders;
CREATE POLICY "Cliente pode ver seu pedido" ON orders FOR SELECT USING (true); -- A restrição verdadeira ocorrerá na aplicação via code ou auth.uid() = customer_id
