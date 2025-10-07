# MMW Hubix - School Information Portal
> A modern, centralized web portal consolidating essential school information, resources, and tools for students, teachers, and IT administrators at C.C.C. Mong Man Wai College

## 📖 Project Overview & Vision
MMW Hubix replaces outdated IT Prefect sites with a modern, unified platform that serves both public and internal needs. The portal provides:

**Public Features:**
- **Resource Hub**: Curated links to school resources organized by category (Academics, Student Life, Resources)
- **AI Assistant**: Conversational chatbot for campus navigation, schedules, policies, and IT support
- **Club Announcements**: Public posting system for school club events and activities

**Internal IT Prefect System:**
- **Team Dashboard**: Mission statement, organizational structure, and internal communications
- **Event Calendar**: Internal meetings, duties, and training session management
- **Training Library**: Categorized repository of training videos and materials
- **Admin CMS**: Content management system for updating all website content

**User Roles:**
- **Public Users**: Students, teachers, staff (no login required)
- **IT Prefects**: Team members with dashboard access via school Google accounts
- **IT Prefect Admins**: Full administrative rights for content and user management

## 🎨 Design & UX Guidelines
- **Modern & Clean**: Professional aesthetic avoiding clutter
- **School Branding**: Incorporate school colors and logo appropriately
- **Responsive Design**: Fully functional on desktop, tablet, and mobile
- **Intuitive Navigation**: Quick access with minimal clicks required
- **Accessibility**: Consider users with different abilities and devices

## 🚀 Getting Started

### Requirements
- Node.js 18.0 or higher
- npm or pnpm (recommended)
- MySQL 8.0+ (for production); SQLite can be used locally for development (no MySQL installation required)

### Installation

1. Clone the repository
```bash
git clone https://github.com/codelsaac/mmw-hubix.git
cd mmw-hubix
```

2. Install dependencies
```bash
# using npm
npm install
# or using pnpm (recommended)
pnpm install
```

3. Set up the database
```bash
# Create tables and indexes (MySQL)
npm run db:migrate

# or with pnpm
pnpm db:migrate
```

4. Start the development server
```bash
# using npm
npm run dev
# or using pnpm
pnpm dev
```

5. Open the browser
Visit http://localhost:3000 to view the site.

### Local Development (No MySQL? Use SQLite)
If you don’t have MySQL installed on your computer, you can use SQLite for local development and switch back to MySQL when deploying to the server.

1) Configure SQLite in .env.local:
```env
DATABASE_URL="file:./prisma/dev.db"
```

2) Push the schema and start the dev server (using the SQLite schema):
```bash
npm run dev:sqlite
```

3) Production (server) environment:
- Set DATABASE_URL back to the MySQL connection string
- Run npm run db:migrate to create tables

## 📁 Project Structure
```text
mmw-hubix/
├── app/                      # Next.js App Router pages
│   ├── admin/                # Admin console pages
│   ├── api/                  # API routes
│   ├── dashboard/            # IT admin dashboard
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── admin/                # Admin-related components
│   ├── auth/                 # Authentication components
│   ├── dashboard/            # Dashboard components
│   └── ui/                   # Base UI (shadcn/ui)
├── config/                   # Configuration files
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities and data logic
├── prisma/                   # Database configuration and migrations
│   ├── schema.prisma         # Database models (MySQL)
│   └── migrations/           # Migration files
├── public/                   # Static assets
└── styles/                   # Stylesheets
```

## 🔐 Authentication
This project uses NextAuth.js with **username-based** authentication (not email). Default behavior: Users are logged out by default; there is no auto-login.

### Default Demo Accounts
| Role | Username | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Full admin console access |
| **Helper** | `helper` | `helper123` | IT dashboard access |
| **Guest** | `guest` | `guest123` | Read-only access |


**Note:** Production deployment uses Google OAuth with school accounts for IT Prefect authentication.

## ✨ Key Features

### 🏠 Public Website (No Login Required)
- **Resource Hub**: Curated collection of school resources organized by category (Academics, Student Life, Resources) with search functionality
- **Club Announcements**: Public posting system for school club events with details, dates, and descriptions
- **AI Assistant**: Conversational chatbot accessible via floating button for campus navigation, schedules, policies, and IT support
- **Responsive Design**: Fully functional on desktop, tablet, and mobile devices

### 🔐 IT Prefect System (Authenticated)
- **Team Dashboard**: Mission statement, organizational structure, and internal communications
- **Internal Calendar**: Manage team meetings, duties, and training sessions (viewable by all prefects, editable by admins)
- **Training Library**: Categorized repository of training videos and materials with search functionality
- **Event Management**: Create and track IT-related events and activities
- **Task System**: Assign and manage team tasks and responsibilities

### ⚙️ Admin Console (Admin Only)
- **User Management**: Account permissions, role assignment, and access control
- **Content Management**: Update homepage links, club announcements, and internal pages
- **System Settings**: Site configuration, maintenance, and customization
- **Analytics**: Usage statistics and system monitoring

#### User Management (/admin/users)
- Data grid (react-data-grid) for all users
- Permission guard: only ADMIN can access
- Inline editing: edit name, email, role, department, and isActive
- Multi-select & batch actions:
  - After selecting rows, you can “Batch change role” and “Batch delete”
- Sorting & filtering:
  - Sort by columns; filter by name, email, role, etc.
- Undo/Redo:
  - Basic undo/redo buttons; supports rolling back edits and batch operations

API:
```http
GET /api/admin/users
```
- Fetch the user list (requires ADMIN)

```http
PATCH /api/admin/users
Content-Type: application/json

[
  {
    "id": "user_id",
    "name": "New Name",
    "email": "user@example.com",
    "role": "ADMIN" | "HELPER" | "GUEST",
    "department": "IT",
    "isActive": true
  }
]
```
- Batch update user fields (requires ADMIN)

```http
DELETE /api/admin/users
Content-Type: application/json

{
  "ids": ["id1", "id2", "id3"]
}
```
- Batch delete users (requires ADMIN)

## 🛠 Tech Stack

### Frontend
- Next.js 15 — Full-stack React framework
- TypeScript — Type safety
- Tailwind CSS — Utility-first styling
- shadcn/ui — UI component library
- Lucide React — Icon set

### Backend
- Next.js API Routes — Server-side APIs
- NextAuth.js — Authentication
- Prisma — ORM
- MySQL — Primary production database (SQLite for local development)

Note: Local SQLite uses prisma/schema.sqlite.prisma with file:./prisma/dev.db hard-coded, so it does not depend on DATABASE_URL in .env.

### Dev Tools
- ESLint — Linting
- PostCSS — CSS processing
- TypeScript — Static typing

## 📋 Available Scripts
```bash
# Development
npm run dev            # start dev server
npm run build          # build for production
npm run start          # start production server
npm run lint           # run linter

# Database (MySQL)
npm run db:migrate     # run database migrations

# Local (SQLite)
npm run dev:sqlite           # push SQLite schema and start dev server
npm run db:push:sqlite       # only push SQLite schema (create/update prisma/dev.db)
npm run db:generate:sqlite   # generate Prisma Client for SQLite
npm run db:seed:sqlite       # seed SQLite (creates admin account only)

# Equivalent Prisma commands (for reference)
# npx prisma db push --schema prisma/schema.sqlite.prisma
# npx prisma generate --schema prisma/schema.sqlite.prisma
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Connect your Vercel account
3. Import the project
4. Set environment variables
5. Deploy

### Manual Deployment
1. Build: npm run build
2. Upload the .next/ folder to your server
3. Configure Node.js environment
4. Start: npm start

## 🔧 Configuration

### Environment Variables
Create a .env.local file:
```env
# Database (MySQL)
# Example: mysql://USER:PASSWORD@HOST:PORT/DBNAME?connection_limit=5
DATABASE_URL="mysql://user:password@localhost:3306/mmw_hubix"

# If you don't have MySQL locally, temporarily use SQLite:
# DATABASE_URL="file:./prisma/dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Others
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Structure and Type Adjustments (MySQL Optimization)
- Long text fields use appropriate MySQL types:
  - description, textContent → @db.Text or @db.LongText
- Max lengths for URLs/image paths:
  - image, url, videoUrl, fileUrl → @db.VarChar(2048)
  - fileName → @db.VarChar(255)
- JSON string fields:
  - permissions, attendees → @db.Text
- Other notes:
  - Keep primary key id as cuid() for cross-database compatibility
  - Remove composite unique keys if unnecessary
  - Align FK delete strategies with Prisma definitions (e.g., NextAuth relations onDelete: Cascade)

### Verification
- Start the local server and check data completeness for each module (resources, events, tasks, training resources, etc.)
- Verify create/update/delete actions via the admin pages

### Site Config
Edit config/site.ts to customize site basics:
```typescript
export const siteConfig = {
  name: "MMW Hubix",
  description: "School Information Portal for C.C.C. Mong Man Wai College",
  url: "https://mmw-hubix.vercel.app",
  // ... other settings
}
```

## 📝 Development Guide

### Add a New Page
1. Create a new folder under app/
2. Add a page.tsx file
3. Follow the App Router conventions

### Create a New Component
1. Add a file under components/
2. Use TypeScript and React
3. Follow naming conventions

### Database Changes
1. Edit prisma/schema.prisma
2. Run npm run db:migrate
3. Update related APIs and components

## 🤝 Contribution Guide
1. Fork the repo
2. Create a feature branch: git checkout -b feature/new-feature
3. Commit changes: git commit -am 'Add new feature'
4. Push the branch: git push origin feature/new-feature
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

## 🙏 Acknowledgements
- C.C.C. Mong Man Wai College
- IT Prefect Team
- All contributors

---

## Deploying on Windows (Using MySQL)
The following describes how to set up and run a production build connected to a MySQL database on Windows.

### Step 1: Set Environment Variables
You need to set DATABASE_URL so Prisma can connect to your MySQL database. Choose one of the methods below:

#### Method A: Use a .env file (Recommended)
This is the simplest method because it keeps your production settings within the project.

1. In your project root (c:\Users\user\Documents\IT perfect\mmw-hubix), create a file named .env
2. Put your MySQL connection string and other production env variables in it. Replace placeholders with your actual DB credentials.
```dotenv
# Production environment variables

# 1. Database (MySQL)
# Replace USER, PASSWORD, HOST, and DBNAME with your MySQL details.
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DBNAME?connection_limit=5"

# 2. NextAuth.js
# If you have a production domain, use it; otherwise localhost works for local prod testing.
NEXTAUTH_URL="http://localhost:3000"

# Generate a strong secret for production.
# You can run `openssl rand -base64 32` in Git Bash or use an online generator.
NEXTAUTH_SECRET="your-super-strong-random-secret-for-production"
```

Example:
If your MySQL server runs on the same machine, your DATABASE_URL might look like:
DATABASE_URL="mysql://root:my-secret-password@127.0.0.1:3306/mmw_hubix_prod?connection_limit=5"

Important:
Remember to URL-encode any special characters in the password (e.g., @ becomes %40, ! becomes %21).

#### Method B: Set system variables via PowerShell
This method sets variables directly in your Windows environment.

- Current session only (lost when you close the terminal):
```powershell
$env:DATABASE_URL = "mysql://USER:PASSWORD@HOST:3306/DBNAME?connection_limit=5"
$env:NEXTAUTH_URL = "http://localhost:3000"
$env:NEXTAUTH_SECRET = "your-super-strong-random-secret-for-production"
```

- Persist for your user account:
```powershell
setx DATABASE_URL "mysql://USER:PASSWORD@HOST:3306/DBNAME?connection_limit=5"
setx NEXTAUTH_URL "http://localhost:3000"
setx NEXTAUTH_SECRET "your-super-strong-random-secret-for-production"
```
After running setx, you must close and reopen your PowerShell terminal for changes to take effect.

### Step 2: Run the Application
After setting the environment variables using one of the methods above, run the following commands from your project directory to start the production server connected to MySQL:

1. Migrate the database:
This creates tables in your MySQL database.
```powershell
npm run db:migrate
```
Prisma will prompt you to name the migration. You can call it initial-migration or drop-announcements-model.

2. Build for production:
```powershell
npm run build
```

3. Start the production server:
```powershell
npm start
```

Your application will now run at http://localhost:3000 and be connected to your MySQL database.

---

Made with ❤️ for C.C.C. Mong Man Wai College