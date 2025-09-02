# MMW Hubix - 學校資訊門戶網站

> 為中華基督教會蒙民偉書院打造的現代化學校資訊門戶網站

## 📖 專案簡介

**MMW Hubix** 是一個全功能的學校資訊門戶網站，旨在為學生、教師和 IT 管理員提供統一的資源平台。該平台整合了：

- **公開資源中心**：為學生和教職員工提供快速存取學校資源的連結集合
- **社團公告**：社團活動和事件的公告系統
- **AI 智慧助手**：回答校園相關問題的聊天機器人
- **IT 管理後台**：內部管理系統，包含活動管理、任務追蹤、訓練影片庫等

## 🚀 快速開始

### 環境要求

- **Node.js** 18.0 或更高版本
- **npm** 或 **pnpm**（推薦）
- **SQLite**（用於開發環境）

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone https://github.com/codelsaac/mmw-hubix.git
   cd mmw-hubix
   ```

2. **安裝依賴**
   ```bash
   # 使用 npm
   npm install

   # 或使用 pnpm (推薦)
   pnpm install
   ```

3. **設置資料庫**
   ```bash
   # 運行資料庫遷移
   npm run db:migrate

   # 或使用 pnpm
   pnpm db:migrate
   ```

4. **啟動開發伺服器**
   ```bash
   # 使用 npm
   npm run dev

   # 或使用 pnpm
   pnpm dev
   ```

5. **打開瀏覽器**
   
   訪問 [http://localhost:3000](http://localhost:3000) 查看網站

## 📁 專案結構

```
mmw-hubix/
├── app/                    # Next.js App Router 頁面
│   ├── admin/             # 管理員後台頁面
│   ├── api/               # API 路由
│   ├── dashboard/         # IT 管理員儀表板
│   ├── globals.css        # 全局樣式
│   ├── layout.tsx         # 根佈局
│   └── page.tsx          # 首頁
├── components/            # React 元件
│   ├── admin/            # 管理員相關元件
│   ├── auth/             # 認證相關元件
│   ├── dashboard/        # 儀表板元件
│   └── ui/               # 基礎 UI 元件 (shadcn/ui)
├── config/               # 配置文件
├── hooks/                # 自定義 React Hooks
├── lib/                  # 工具庫和數據處理
├── prisma/              # 資料庫配置和遷移
│   ├── schema.prisma    # 資料庫模型
│   └── migrations/      # 資料庫遷移文件
├── public/              # 靜態資源
└── styles/              # 樣式文件
```

## 🔐 認證系統

該專案使用 NextAuth.js 進行認證管理，支援演示帳戶登入：

### 預設帳戶

| 角色 | 電子郵件 | 密碼 | 權限 |
|------|----------|------|------|
| 管理員 | `admin@cccmmw.edu.hk` | `mmw2025` | 完整後台管理權限 |
| IT 管理員 | `itprefect@cccmmw.edu.hk` | `prefect123` | IT 儀表板權限 |

### 管理員快速登入密碼
- `admin123`
- `mmw-admin-2025`

## ✨ 主要功能

### 🏠 公開首頁
- **資源中心**：分類整理的學校資源連結
- **社團公告**：最新活動和事件公告
- **搜尋功能**：快速查找所需資源
- **響應式設計**：支援所有裝置

### 🤖 AI 智慧助手
- 校園導航協助
- 學校政策查詢
- IT 技術支援
- 課程表和重要日期查詢

### 📊 IT 管理儀表板
- **活動管理**：建立和追蹤 IT 相關活動
- **任務系統**：分配和管理團隊任務
- **內部行事曆**：團隊會議和訓練安排
- **訓練影片庫**：IT 技能培訓資源

### ⚙️ 管理員後台
- **使用者管理**：帳戶權限控制
- **內容管理**：公告、資源、事件管理
- **系統設定**：網站配置和維護
- **分析報告**：使用統計和系統監控

## 🛠 技術棧

### 前端
- **Next.js 15** - React 全端框架
- **TypeScript** - 類型安全
- **Tailwind CSS** - 樣式框架
- **shadcn/ui** - UI 元件庫
- **Lucide React** - 圖示庫

### 後端
- **Next.js API Routes** - 伺服器端 API
- **NextAuth.js** - 認證系統
- **Prisma** - 資料庫 ORM
- **SQLite** - 開發環境資料庫

### 開發工具
- **ESLint** - 程式碼檢查
- **PostCSS** - CSS 處理
- **TypeScript** - 靜態類型檢查

## 📋 可用指令

```bash
# 開發
npm run dev          # 啟動開發伺服器
npm run build        # 建置生產版本
npm run start        # 啟動生產伺服器
npm run lint         # 執行程式碼檢查

# 資料庫
npm run db:migrate   # 執行資料庫遷移
```

## 🌐 部署

### Vercel 部署（推薦）
1. 推送程式碼到 GitHub
2. 連接 Vercel 帳戶
3. 導入專案
4. 設置環境變數
5. 部署

### 手動部署
1. 建置專案：`npm run build`
2. 上傳 `.next/` 資料夾到伺服器
3. 設置 Node.js 環境
4. 啟動：`npm start`

## 🔧 配置

### 環境變數
創建 `.env.local` 文件：

```env
# 資料庫
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# 其他配置
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 網站配置
編輯 `config/site.ts` 來自定義網站基本資訊：

```typescript
export const siteConfig = {
  name: "MMW Hubix",
  description: "School Information Portal for C.C.C. Mong Man Wai College",
  url: "https://mmw-hubix.vercel.app",
  // ... 其他設定
}
```

## 📝 開發指南

### 添加新頁面
1. 在 `app/` 目錄下創建新文件夾
2. 添加 `page.tsx` 文件
3. 使用 App Router 約定

### 創建新元件
1. 在 `components/` 目錄下創建元件文件
2. 使用 TypeScript 和 React
3. 遵循命名約定

### 資料庫修改
1. 編輯 `prisma/schema.prisma`
2. 運行 `npm run db:migrate`
3. 更新相關的 API 和元件

## 🤝 貢獻指南

1. Fork 專案
2. 創建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 提交 Pull Request

## 📞 支援

如有問題或建議，請：

- 提交 [Issue](https://github.com/codelsaac/mmw-hubix/issues)
- 聯繫開發團隊
- 查看專案 [Wiki](https://github.com/codelsaac/mmw-hubix/wiki)

## 📄 授權

本專案採用 MIT 授權條款 - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 🙏 致謝

- 中華基督教會蒙民偉書院
- IT Prefect 團隊
- 所有貢獻者

---

**Made with ❤️ for C.C.C. Mong Man Wai College**
