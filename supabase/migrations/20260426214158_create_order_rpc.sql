-- Migration: create_order_rpc

CREATE OR REPLACE FUNCTION create_order_with_stock_check(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_customer_notes text,
  p_subtotal numeric,
  p_shipping_cost numeric,
  p_total numeric,
  p_deposit numeric,
  p_balance numeric,
  p_product_id uuid,
  p_personalization_name text,
  p_primary_color_id uuid,
  p_secondary_color_id uuid,
  p_glitter_id uuid,
  p_tassel_color_id uuid,
  p_packaging_id uuid,
  p_shipping_id uuid,
  p_item_price numeric,
  p_extras jsonb -- array of objects: [{ "id": "uuid", "price": 10.0 }]
) RETURNS uuid AS $$
DECLARE
  v_order_id uuid;
  v_order_code text;
  v_order_item_id uuid;
  v_extra record;
  v_all_options uuid[];
  v_opt_id uuid;
BEGIN
  -- 1. Montar array com todas as opções simples escolhidas
  v_all_options := ARRAY[
    p_primary_color_id,
    p_secondary_color_id,
    p_glitter_id,
    p_tassel_color_id,
    p_packaging_id,
    p_shipping_id
  ];

  -- 2. Checar e decrementar estoque das opções simples (se forem tangíveis)
  FOR i IN 1 .. array_length(v_all_options, 1) LOOP
    v_opt_id := v_all_options[i];
    IF v_opt_id IS NOT NULL THEN
      IF EXISTS (SELECT 1 FROM options WHERE id = v_opt_id AND is_tangible = true) THEN
        UPDATE inventory SET quantity = quantity - 1 WHERE option_id = v_opt_id AND quantity > 0;
        IF NOT FOUND THEN
          RAISE EXCEPTION 'Item fora de estoque: %', v_opt_id;
        END IF;
      END IF;
    END IF;
  END LOOP;

  -- 3. Checar e decrementar estoque dos extras
  FOR v_extra IN SELECT * FROM jsonb_to_recordset(p_extras) AS x(id uuid, price numeric)
  LOOP
    IF EXISTS (SELECT 1 FROM options WHERE id = v_extra.id AND is_tangible = true) THEN
      UPDATE inventory SET quantity = quantity - 1 WHERE option_id = v_extra.id AND quantity > 0;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Extra fora de estoque: %', v_extra.id;
      END IF;
    END IF;
  END LOOP;

  -- 4. Criar o Pedido (Order)
  -- Gera um código único do tipo PED-XXXX
  v_order_code := 'PED-' || upper(substring(md5(random()::text) from 1 for 4));
  
  INSERT INTO orders (
    code, status, customer_name, customer_phone, customer_email, customer_notes,
    subtotal, shipping_cost, total, deposit, balance
  ) VALUES (
    v_order_code, 'pending_payment', p_customer_name, p_customer_phone, p_customer_email, p_customer_notes,
    p_subtotal, p_shipping_cost, p_total, p_deposit, p_balance
  ) RETURNING id INTO v_order_id;

  -- 5. Criar o Item do Pedido (Order Item)
  INSERT INTO order_items (
    order_id, product_id, personalization_name, primary_color_id, secondary_color_id,
    glitter_id, tassel_color_id, packaging_id, shipping_id, price
  ) VALUES (
    v_order_id, p_product_id, p_personalization_name, p_primary_color_id, p_secondary_color_id,
    p_glitter_id, p_tassel_color_id, p_packaging_id, p_shipping_id, p_item_price
  ) RETURNING id INTO v_order_item_id;

  -- 6. Inserir os Extras do Item
  FOR v_extra IN SELECT * FROM jsonb_to_recordset(p_extras) AS x(id uuid, price numeric)
  LOOP
    INSERT INTO order_item_extras (order_item_id, extra_option_id, price)
    VALUES (v_order_item_id, v_extra.id, v_extra.price);
  END LOOP;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
