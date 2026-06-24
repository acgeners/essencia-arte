-- EF-5: cancelar um pedido devolvendo o estoque das opções tangíveis.
-- O create_order_with_stock_check decrementa estoque na criação; este RPC reverte
-- ao cancelar. Idempotente: não devolve estoque de um pedido já cancelado.

CREATE OR REPLACE FUNCTION cancel_order_restore_stock(p_order_id uuid)
RETURNS void AS $$
DECLARE
  v_current text;
  v_item record;
  v_all_options uuid[];
  v_opt_id uuid;
  v_extra record;
BEGIN
  SELECT status INTO v_current FROM orders WHERE id = p_order_id;

  -- Pedido inexistente ou já cancelado: nada a fazer (evita devolução dupla)
  IF v_current IS NULL OR v_current = 'cancelled' THEN
    RETURN;
  END IF;

  FOR v_item IN
    SELECT id, primary_color_id, secondary_color_id, glitter_id,
           tassel_color_id, packaging_id, shipping_id
    FROM order_items
    WHERE order_id = p_order_id
  LOOP
    -- Opções simples do item
    v_all_options := ARRAY[
      v_item.primary_color_id, v_item.secondary_color_id, v_item.glitter_id,
      v_item.tassel_color_id, v_item.packaging_id, v_item.shipping_id
    ];
    FOR i IN 1 .. array_length(v_all_options, 1) LOOP
      v_opt_id := v_all_options[i];
      IF v_opt_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM options WHERE id = v_opt_id AND is_tangible = true
      ) THEN
        UPDATE inventory SET quantity = quantity + 1 WHERE option_id = v_opt_id;
      END IF;
    END LOOP;

    -- Extras do item
    FOR v_extra IN
      SELECT extra_option_id FROM order_item_extras WHERE order_item_id = v_item.id
    LOOP
      IF EXISTS (
        SELECT 1 FROM options WHERE id = v_extra.extra_option_id AND is_tangible = true
      ) THEN
        UPDATE inventory SET quantity = quantity + 1 WHERE option_id = v_extra.extra_option_id;
      END IF;
    END LOOP;
  END LOOP;

  UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
