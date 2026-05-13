/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '请在项目根目录创建 .env 文件，填入 Supabase 凭据：\n' +
    'VITE_SUPABASE_URL=你的项目URL\n' +
    'VITE_SUPABASE_ANON_KEY=你的anon key\n\n' +
    '这些信息可以在 Supabase 项目面板的 Settings > API 中找到。'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
