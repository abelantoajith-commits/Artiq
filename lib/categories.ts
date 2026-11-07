export interface CategoryItem {
  id: string;
  label: string;
  parentId?: string; // Subcategories grouped under a parent, e.g. "traditional"
  description?: string;
}

export const CATEGORY_TAXONOMY: CategoryItem[] = [
  // Top-level categories
  {
    id: "modern",
    label: "Modern & Contemporary Art",
    description: "Contemporary paintings, experimental media, and modern aesthetics",
  },
  {
    id: "traditional",
    label: "Traditional Art",
    description: "Centuries-old visual heritage, sacred iconography, and classical traditions",
  },
  // Traditional Art Subcategories
  {
    id: "kerala-mural",
    label: "Kerala Mural",
    parentId: "traditional",
    description: "Panchavarna temple frescoes and natural mineral pigment paintings",
  },
  {
    id: "madhubani",
    label: "Madhubani Painting",
    parentId: "traditional",
    description: "Mithila folk art made with twigs, fingers, and natural dyes",
  },
  {
    id: "thanjavur",
    label: "Tanjore / Thanjavur Art",
    parentId: "traditional",
    description: "Classical South Indian painting with gold foil and semi-precious stones",
  },
  {
    id: "folk-art",
    label: "Indian Folk Art",
    parentId: "traditional",
    description: "Regional folk, tribal, and indigenous community art forms",
  },
  {
    id: "warli",
    label: "Warli Painting",
    parentId: "traditional",
    description: "Tribal geometric white rice paste art from Maharashtra",
  },
  {
    id: "pattachitra",
    label: "Pattachitra Scroll",
    parentId: "traditional",
    description: "Traditional cloth-based scroll paintings from Odisha and Bengal",
  },
  {
    id: "kalamkari",
    label: "Kalamkari Art",
    parentId: "traditional",
    description: "Hand-painted or block-printed cotton textile art from Andhra Pradesh",
  },
  // Other Distinct Disciplines
  {
    id: "handicrafts",
    label: "Handicrafts & Pottery",
    description: "Terracotta, clay crafts, papier-mâché, and artisanal homewares",
  },
  {
    id: "textiles",
    label: "Textiles & Weaving",
    description: "Handloom weaving, Kasavu, zari work, embroidery, and natural fabric craft",
  },
  {
    id: "sculpture",
    label: "Sculpture & Carving",
    description: "Lost-wax bronze casting, wood carving, stone relief, and metal mirrors",
  },
  {
    id: "digital",
    label: "Digital Art & Illustration",
    description: "Digital paintings, vector designs, concept art, and new media",
  },
];

export const VALID_CATEGORY_IDS = CATEGORY_TAXONOMY.map((c) => c.id) as [
  string,
  ...string[]
];

export const DEFAULT_SUGGESTED_CATEGORIES = [
  "traditional",
  "kerala-mural",
  "handicrafts",
  "textiles",
  "sculpture",
];

export function getCategoryById(id: string): CategoryItem | undefined {
  return CATEGORY_TAXONOMY.find((c) => c.id === id);
}

export function getCategoryLabel(id: string): string {
  const cat = getCategoryById(id);
  return cat ? cat.label : id;
}
