-- ARTIQ: Initial Database Seed

-- Categories
INSERT INTO public.categories (id, name, parent_id) VALUES
  ('all', 'All', NULL),
  ('traditional', 'Traditional', NULL),
  ('kerala-mural', 'Kerala Mural', 'traditional'),
  ('textiles', 'Textiles & Weaving', NULL),
  ('handicrafts', 'Handicrafts', NULL),
  ('sculpture', 'Sculpture & Carving', NULL),
  ('modern', 'Modern & Contemporary', NULL)
ON CONFLICT (id) DO NOTHING;

