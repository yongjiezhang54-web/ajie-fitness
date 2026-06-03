# 健身打卡 PWA 应用

一款支持扫码使用的健身训练打卡 Web App，采用 Next.js + React + Tailwind CSS + Supabase 构建，支持 PWA 安装到手机桌面。

## 功能特性

- 📱 **PWA 支持**：扫码即可使用，可安装到手机桌面，无需下载
- 🔐 **用户认证**：邮箱注册登录，数据独立存储
- 🎯 **训练计划管理**：自定义训练项目、目标数量、单位
- ✅ **每日打卡**：一键打卡，实时查看完成进度
- 📅 **日历视图**：直观展示每日完成情况（绿色=完成，灰色=未完成）
- 📊 **数据统计**：连续打卡天数、累计训练天数、本月完成率、30天趋势图
- 📱 **响应式设计**：完美适配手机端，底部5 tab 导航

## 技术栈

- **前端**：Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- **后端**：Supabase (PostgreSQL + Auth + Realtime)
- **PWA**：next-pwa
- **图表**：recharts
- **部署**：Vercel (推荐)

## 快速开始

### 1. 克隆/下载项目

```bash
cd fitness-tracker
```

### 2. 配置 Supabase

1. 访问 [supabase.com](https://supabase.com) 创建新项目
2. 在 SQL Editor 中运行 `supabase-schema.sql` 文件中的 SQL 语句创建数据表
3. 在 Project Settings > API 中获取 `URL` 和 `anon public` key

### 3. 配置环境变量

复制 `.env.local` 并填入你的 Supabase 凭证：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. 安装依赖并启动

```bash
npm install
npm run dev
```

访问 `http://localhost:3000` 查看应用。

## 部署到生产环境

### 部署到 Vercel（推荐）

1. 将代码推送到 GitHub 仓库
2. 访问 [vercel.com](https://vercel.com) 导入仓库
3. 配置环境变量（`NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`）
4. 点击部署，等待完成
5. 部署完成后，Vercel 会提供一个 `https://xxx.vercel.app` 的域名

### 生成访问二维码

部署完成后，使用以下任意方式生成二维码：

**方式一：使用 qrcode.ngrok.com（在线工具）**
1. 访问 [qrcode.ngrok.com](https://qrcode.ngrok.com) 或任意二维码生成网站
2. 输入你的 Vercel 部署域名
3. 生成二维码，保存或打印

**方式二：命令行生成**
```bash
npx qrcode "https://your-app.vercel.app" -o qrcode.png
```

**方式三：Python 生成**
```bash
python -m pip install qrcode[pil]
python -m qrcode "https://your-app.vercel.app" -o qrcode.png
```

### 用户扫码使用

1. 将二维码图片分享给用户（微信/打印张贴均可）
2. 用户使用手机浏览器（微信/支付宝扫描均可）扫描二维码
3. 浏览器打开应用后，点击浏览器菜单"添加到主屏幕"
4. 应用图标出现在手机桌面，像原生 App 一样使用

## 数据库 Schema

应用使用三张表：

- **profiles**：用户资料（自动从 auth.users 创建）
- **training_plans**：训练计划（名称、目标、单位、图标）
- **check_ins**：打卡记录（日期、完成量）

详见 `supabase-schema.sql` 文件。

## 项目结构

```
fitness-tracker/
├── src/
│   ├── app/                 # Next.js App Router 页面
│   │   ├── layout.tsx      # 根布局（AuthProvider + AppShell）
│   │   ├── page.tsx        # 首页（今日训练）
│   │   ├── login/page.tsx  # 登录页
│   │   ├── plan/page.tsx   # 训练计划
│   │   ├── records/page.tsx# 打卡记录（日历）
│   │   ├── stats/page.tsx  # 数据统计
│   │   └── profile/page.tsx# 个人中心
│   ├── components/         # React 组件
│   │   ├── BottomNav.tsx   # 底部导航
│   │   ├── AppShell.tsx    # 应用外壳
│   │   └── PlanModal.tsx   # 训练计划编辑弹窗
│   ├── context/            # React Context
│   │   └── AuthContext.tsx  # 认证状态管理
│   └── lib/                # 工具库
│       ├── supabase.ts      # Supabase 客户端
│       └── database.types.ts # 数据库类型定义
├── public/                 # 静态资源
│   ├── manifest.json       # PWA 清单
│   └── icons/             # PWA 图标
├── supabase-schema.sql     # 数据库 Schema
├── package.json
└── README.md
```

## 注意事项

- Supabase 免费版每月有 500MB 数据库存储空间，足够个人使用
- 如需使用手机号登录，需在 Supabase Auth 中启用 Phone Provider
- PWA 要求 HTTPS 访问（本地 `localhost` 除外）
- 建议使用 iPhone Safari 或 Android Chrome 访问以获得最佳 PWA 体验
