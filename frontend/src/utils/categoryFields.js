// Category-specific attribute field configurations for CastNCart Creator Products

export const CATEGORY_FIELDS_MAP = {
  'Home Bakery': [
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 250g, 500g, 1kg', required: true },
    { key: 'flavour', label: 'Flavour', placeholder: 'e.g. Chocolate, Vanilla Bean, Red Velvet', required: true },
    { key: 'ingredients', label: 'Ingredients', placeholder: 'e.g. Flour, Cocoa, Milk, Butter, Sugar', required: true },
    { key: 'prepTime', label: 'Preparation Time', placeholder: 'e.g. 4 hours, Baked fresh on order', required: false },
    { key: 'shelfLife', label: 'Shelf Life', placeholder: 'e.g. 3 days room temp, 7 days refrigerated', required: true }
  ],
  'Baking': [
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 250g, 500g, 1kg', required: true },
    { key: 'flavour', label: 'Flavour', placeholder: 'e.g. Chocolate, Vanilla Bean, Red Velvet', required: true },
    { key: 'ingredients', label: 'Ingredients', placeholder: 'e.g. Flour, Cocoa, Milk, Butter, Sugar', required: true },
    { key: 'prepTime', label: 'Preparation Time', placeholder: 'e.g. 4 hours, Baked fresh on order', required: false },
    { key: 'shelfLife', label: 'Shelf Life', placeholder: 'e.g. 3 days room temp, 7 days refrigerated', required: true }
  ],
  'Crochet & Knitting': [
    { key: 'yarnMaterial', label: 'Yarn Material', placeholder: 'e.g. 100% Cotton, Soft Acrylic, Wool Blend', required: true },
    { key: 'color', label: 'Color', placeholder: 'e.g. Pastel Pink, Beige, Multi-tone', required: true },
    { key: 'size', label: 'Size', placeholder: 'e.g. Free Size, S/M/L, 12x12 inches', required: true },
    { key: 'handmadeTime', label: 'Handmade Time', placeholder: 'e.g. 12 Hours, 2 Days of craftsmanship', required: false }
  ],
  'Crochet': [
    { key: 'yarnMaterial', label: 'Yarn Material', placeholder: 'e.g. 100% Cotton, Soft Acrylic, Wool Blend', required: true },
    { key: 'color', label: 'Color', placeholder: 'e.g. Pastel Pink, Beige, Multi-tone', required: true },
    { key: 'size', label: 'Size', placeholder: 'e.g. Free Size, S/M/L, 12x12 inches', required: true },
    { key: 'handmadeTime', label: 'Handmade Time', placeholder: 'e.g. 12 Hours, 2 Days of craftsmanship', required: false }
  ],
  'Knitting': [
    { key: 'yarnMaterial', label: 'Yarn Material', placeholder: 'e.g. Merino Wool, Cashmere Blend, Soft Acrylic', required: true },
    { key: 'color', label: 'Color', placeholder: 'e.g. Mustard Yellow, Cream White', required: true },
    { key: 'size', label: 'Size', placeholder: 'e.g. S, M, L, XL', required: true },
    { key: 'handmadeTime', label: 'Handmade Time', placeholder: 'e.g. 3 Days', required: false }
  ],
  'Handmade Candles': [
    { key: 'waxType', label: 'Wax Type', placeholder: 'e.g. 100% Soy Wax, Organic Beeswax, Gel Wax', required: true },
    { key: 'fragrance', label: 'Fragrance', placeholder: 'e.g. French Lavender, Vanilla Caramel, Unscented', required: true },
    { key: 'burnTime', label: 'Burn Time', placeholder: 'e.g. 35-40 Hours', required: true },
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 200g, 350g candle jar', required: true }
  ],
  'Candle Making': [
    { key: 'waxType', label: 'Wax Type', placeholder: 'e.g. 100% Soy Wax, Organic Beeswax, Gel Wax', required: true },
    { key: 'fragrance', label: 'Fragrance', placeholder: 'e.g. French Lavender, Vanilla Caramel, Unscented', required: true },
    { key: 'burnTime', label: 'Burn Time', placeholder: 'e.g. 35-40 Hours', required: true },
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 200g, 350g candle jar', required: true }
  ],
  'Handmade Jewellery': [
    { key: 'material', label: 'Material', placeholder: 'e.g. Resin, Polymer Clay, 925 Silver Plated, Brass', required: true },
    { key: 'color', label: 'Color', placeholder: 'e.g. Emerald Green, Rose Gold', required: true },
    { key: 'size', label: 'Size', placeholder: 'e.g. Adjustable, 2.4 Bangle, 18-inch chain', required: true },
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 15g, Light-weight', required: false }
  ],
  'Jewellery': [
    { key: 'material', label: 'Material', placeholder: 'e.g. Resin, Polymer Clay, 925 Silver Plated, Brass', required: true },
    { key: 'color', label: 'Color', placeholder: 'e.g. Emerald Green, Rose Gold', required: true },
    { key: 'size', label: 'Size', placeholder: 'e.g. Adjustable, 2.4 Bangle, 18-inch chain', required: true },
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 15g, Light-weight', required: false }
  ],
  'Resin Art': [
    { key: 'material', label: 'Material', placeholder: 'e.g. Epoxy Resin & Teak Wood, Real Dried Flowers', required: true },
    { key: 'dimensions', label: 'Dimensions', placeholder: 'e.g. 12x12 inches, 6 inch diameter', required: true },
    { key: 'finish', label: 'Finish', placeholder: 'e.g. High Gloss Mirror Finish, Satin Matte', required: true }
  ],
  'Pottery': [
    { key: 'clayType', label: 'Clay Type', placeholder: 'e.g. Terracotta, Stoneware, Porcelain', required: true },
    { key: 'size', label: 'Size / Capacity', placeholder: 'e.g. 350ml Coffee Mug, 8 inch Bowl', required: true },
    { key: 'finish', label: 'Finish', placeholder: 'e.g. Food-Safe Gloss Glaze, Raw Terracotta', required: true }
  ]
};

// Fallback fields for other artisan categories
export const DEFAULT_CATEGORY_FIELDS = [
  { key: 'material', label: 'Primary Material', placeholder: 'e.g. Canvas, Wood, Organic Cotton', required: false },
  { key: 'dimensions', label: 'Dimensions / Size', placeholder: 'e.g. 24x36 inches, Medium', required: false },
  { key: 'weight', label: 'Weight', placeholder: 'e.g. 500g', required: false },
  { key: 'color', label: 'Color / Palette', placeholder: 'e.g. Multicolor, Earth tones', required: false }
];

export const getFieldsForCategory = (categoryName) => {
  if (!categoryName) return [];
  
  // Try exact match or partial match
  const exactKey = Object.keys(CATEGORY_FIELDS_MAP).find(
    k => k.toLowerCase() === categoryName.toLowerCase()
  );
  
  if (exactKey) {
    return CATEGORY_FIELDS_MAP[exactKey];
  }

  // Partial search (e.g. 'Baking' in 'Home Bakery & Baking')
  const partialKey = Object.keys(CATEGORY_FIELDS_MAP).find(
    k => categoryName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(categoryName.toLowerCase())
  );

  return partialKey ? CATEGORY_FIELDS_MAP[partialKey] : DEFAULT_CATEGORY_FIELDS;
};
