-- Jacqueline Projects Table
CREATE TABLE IF NOT EXISTS jacqueline_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  deliveryDate DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  link TEXT,
  section TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Jacqueline Sections Table
CREATE TABLE IF NOT EXISTS jacqueline_sections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Alejandro Projects Table
CREATE TABLE IF NOT EXISTS alejandro_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  deliveryDate DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  link TEXT,
  section TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Alejandro Sections Table
CREATE TABLE IF NOT EXISTS alejandro_sections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE jacqueline_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE jacqueline_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE alejandro_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE alejandro_sections ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write
CREATE POLICY "Allow public read" ON jacqueline_projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON jacqueline_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON jacqueline_projects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON jacqueline_projects FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON jacqueline_sections FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON jacqueline_sections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON jacqueline_sections FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON jacqueline_sections FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON alejandro_projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON alejandro_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON alejandro_projects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON alejandro_projects FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON alejandro_sections FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON alejandro_sections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON alejandro_sections FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON alejandro_sections FOR DELETE USING (true);
