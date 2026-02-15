-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  size_type VARCHAR(10) NOT NULL CHECK (size_type IN ('small', 'large')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  source VARCHAR(255),
  location VARCHAR(255),
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_size_type ON items(size_type);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);

-- Seed default categories
INSERT INTO categories (name, icon) VALUES
  ('electronics', 'Monitor'),
  ('furniture', 'Sofa'),
  ('kitchen', 'UtensilsCrossed'),
  ('clothing', 'Shirt'),
  ('tools', 'Wrench'),
  ('books', 'BookOpen'),
  ('decor', 'Lamp'),
  ('appliances', 'Refrigerator'),
  ('sports', 'Dumbbell'),
  ('other', 'Package')
ON CONFLICT (name) DO NOTHING;

-- Seed some sample items
INSERT INTO items (name, category_id, size_type, quantity, source, location, purchase_date, notes) VALUES
  ('MacBook Pro 14"', 1, 'large', 1, 'Apple Store', '书房', '2024-06-15', '工作用笔记本电脑'),
  ('iPhone 充电器', 1, 'small', 3, '京东', '客厅', '2024-08-01', 'USB-C 快充头'),
  ('实木书桌', 2, 'large', 1, '宜家', '书房', '2023-12-20', '140x70cm 工作台'),
  ('折叠椅', 2, 'small', 4, '淘宝', '储藏室', '2024-03-10', '户外活动备用'),
  ('不锈钢炒锅', 3, 'small', 2, '超市', '厨房', '2024-01-05', '32cm 无涂层'),
  ('微波炉', 3, 'large', 1, '苏宁', '厨房', '2023-09-12', '格兰仕 20L'),
  ('电动螺丝刀', 5, 'small', 1, '五金店', '工具箱', '2024-05-22', '充电式，含12个批头'),
  ('双开门冰箱', 8, 'large', 1, '国美', '厨房', '2022-11-01', '海尔 500L'),
  ('瑜伽垫', 9, 'small', 2, '京东', '卧室', '2024-07-15', 'TPE 材质 6mm'),
  ('布艺沙发', 2, 'large', 1, '红星美凯龙', '客厅', '2023-05-18', 'L型三人位')
ON CONFLICT DO NOTHING;
