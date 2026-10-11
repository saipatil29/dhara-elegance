-- ============================================================
-- Remove all development seed data.
--
-- Safe: only touches rows tagged 'seed' plus the named test
-- coupons. Real orders and customer data are untouched.
-- ============================================================

-- Variants and images cascade from products.
delete from public.products where tags @> array['seed'];

delete from public.coupons
 where code in ('WELCOME10','SHINE500','FESTIVE15','EXPIRED20','DISABLED5');

-- Categories are only removed if no products remain in them.
delete from public.categories c
 where not exists (
   select 1 from public.products p where p.category_id = c.id
 );
