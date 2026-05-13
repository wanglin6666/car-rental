-- ============================================================
-- 汽车租赁管理系统 — Supabase 数据库建表脚本
-- 复制全部内容到 Supabase SQL Editor → 点 Run 执行
-- ============================================================

-- 1. 品牌表
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo text default '🚗',
  created_at timestamptz default now()
);

-- 2. 颜色表
create table if not exists colors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  value text not null,
  created_at timestamptz default now()
);

-- 3. 车辆表
create table if not exists cars (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete set null,
  color_id uuid references colors(id) on delete set null,
  name text not null,
  plate_number text not null,
  daily_price integer not null default 0,
  deposit integer not null default 0,
  image text default '',
  description text default '',
  status text default 'available' check (status in ('available', 'rented', 'maintenance')),
  created_at timestamptz default now()
);

-- 4. 管理员表
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  name text not null,
  role text default 'normal' check (role in ('super', 'normal')),
  created_at timestamptz default now()
);

-- 5. 用户信息扩展表
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  name text,
  avatar text default '',
  created_at timestamptz default now()
);

-- 6. 订单表
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  car_id uuid references cars(id) on delete set null,
  start_date date not null,
  end_date date not null,
  days integer not null,
  total_price integer not null,
  deposit integer not null,
  status text default 'pending_payment' check (status in ('pending_payment', 'paid', 'renting', 'returned', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- 7. 还车记录表
create table if not exists return_records (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  car_id uuid references cars(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  actual_return_time timestamptz not null,
  is_overdue boolean default false,
  overdue_days integer default 0,
  overdue_fee integer default 0,
  damage_fee integer default 0,
  final_settlement integer default 0,
  remark text default '',
  created_at timestamptz default now()
);

-- 8. 轮播图表
create table if not exists carousels (
  id uuid primary key default gen_random_uuid(),
  image text not null,
  link text default '',
  sort integer default 1,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 9. 公告表
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 10. 收藏表
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  car_id uuid references cars(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, car_id)
);

-- ============================================================
-- RLS 策略（简化版）
-- ============================================================

alter table brands enable row level security;
create policy "brands_public_read" on brands for select using (true);

alter table colors enable row level security;
create policy "colors_public_read" on colors for select using (true);

alter table cars enable row level security;
create policy "cars_public_read" on cars for select using (true);

alter table carousels enable row level security;
create policy "carousels_public_read" on carousels for select using (true);

alter table announcements enable row level security;
create policy "announcements_public_read" on announcements for select using (true);

alter table orders enable row level security;
create policy "orders_public_read" on orders for select using (true);
create policy "orders_insert_own" on orders for insert with check (auth.uid() = user_id);
create policy "orders_update_own" on orders for update using (auth.uid() = user_id);

alter table return_records enable row level security;
create policy "returns_public_read" on return_records for select using (true);
create policy "returns_insert" on return_records for insert with check (true);

alter table favorites enable row level security;
create policy "favs_select_own" on favorites for select using (auth.uid() = user_id);
create policy "favs_insert_own" on favorites for insert with check (auth.uid() = user_id);
create policy "favs_delete_own" on favorites for delete using (auth.uid() = user_id);

alter table profiles enable row level security;
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

alter table admins enable row level security;
create policy "admins_public_read" on admins for select using (true);

-- ============================================================
-- 种子数据
-- ============================================================

insert into brands (id, name, logo) values
  ('b0000001-0000-0000-0000-000000000001', '丰田', '🚗'),
  ('b0000001-0000-0000-0000-000000000002', '本田', '🚙'),
  ('b0000001-0000-0000-0000-000000000003', '大众', '🚘'),
  ('b0000001-0000-0000-0000-000000000004', '宝马', '🏎️'),
  ('b0000001-0000-0000-0000-000000000005', '奔驰', '🚖'),
  ('b0000001-0000-0000-0000-000000000006', '比亚迪', '⚡');

insert into colors (id, name, value) values
  ('c0000001-0000-0000-0000-000000000001', '珍珠白', '#FAFAFA'),
  ('c0000001-0000-0000-0000-000000000002', '曜石黑', '#1A1A1A'),
  ('c0000001-0000-0000-0000-000000000003', '星空银', '#C0C0C0'),
  ('c0000001-0000-0000-0000-000000000004', '极光蓝', '#4169E1'),
  ('c0000001-0000-0000-0000-000000000005', '烈焰红', '#DC143C');

insert into cars (id, brand_id, color_id, name, plate_number, daily_price, deposit, image, description, status) values
  ('ca000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', '卡罗拉 2024款', '京A·88888', 200, 3000, 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600', '经济实惠，省油耐用，适合城市通勤和短途出行。', 'available'),
  ('ca000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000003', '凯美瑞 2024款', '京A·66666', 350, 5000, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600', '中型轿车，舒适平稳，商务出行首选。', 'available'),
  ('ca000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000002', '宝马3系 2024款', '京B·12345', 600, 10000, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600', '豪华运动轿车，操控精准，驾乘体验一流。', 'available'),
  ('ca000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000004', '奔驰C级 2024款', '京B·99999', 650, 10000, 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600', '德系豪华，内饰精致，乘坐舒适度极高。', 'available'),
  ('ca000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000005', '汉EV 创世版', '京C·16888', 400, 6000, 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ea5?w=600', '纯电轿车，零排放，续航长，科技感十足。', 'available'),
  ('ca000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', '思域 2024款', '京D·33333', 280, 4000, 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600', '运动风格轿车，动力充沛，外观时尚。', 'maintenance');

insert into carousels (id, image, link, sort, is_active) values
  ('d0000001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200', '/cars', 1, true),
  ('d0000001-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200', '/cars', 2, true),
  ('d0000001-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200', '/cars', 3, true);

insert into announcements (id, title, content) values
  ('a0000001-0000-0000-0000-000000000001', '新车上线通知', '2024款宝马3系、奔驰C级已到店，欢迎前来体验租赁！'),
  ('a0000001-0000-0000-0000-000000000002', '暑期优惠活动', '即日起至8月31日，租满7天享9折优惠，租满30天享8折优惠！');

-- 管理员：admin / admin123（密码 SHA-256 哈希存储）
insert into admins (id, username, password_hash, name, role) values
  ('ad000001-0000-0000-0000-000000000001', 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', '系统管理员', 'super');
