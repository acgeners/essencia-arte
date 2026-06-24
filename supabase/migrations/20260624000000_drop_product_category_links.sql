-- COE-6: remove a tabela M2M product_category_links (semeada mas nunca usada).
-- O modelo em uso é products.category_id (1 categoria por produto); todas as
-- queries (catalog.ts) usam category_id. Elimina a fonte de verdade duplicada.

DROP TABLE IF EXISTS product_category_links CASCADE;
