# MMW Hubix - School Information Portal
> A modern, centralized web portal consolidating essential school information, resources, and tools for students, teachers, and IT administrators at C.C.C. Mong Man Wai College

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.14-2D3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

**Status:** Production Ready | Enhanced UI | Bug-Free

## Recent Updates

### Latest Improvements (October 2025)
- **Categories Management System**: Complete admin interface for managing resource categories with icons, colors, and sorting
- **Enhanced Resource Hub**: Resources now properly organized by dynamic categories with visual indicators
- **Database Schema Updates**: New Category model with full CRUD operations and proper relationships
- **Enhanced UI & Animations**: Smooth transitions, hover effects, staggered animations across all components
- **Bug Fixes**: Resolved TypeScript errors in admin users route and database schema issues
- **Dual Database Support**: Seamless SQLite (dev) and MySQL (production) setup
- **Documentation**: Added comprehensive database setup guide
- **Quality Assurance**: Implemented mandatory bug checking procedures
- **User Profile**: Enhanced profile management with modern UI
- **AI Chat**: Polished floating button with pulsing animation

### Coming Soon
- Advanced analytics dashboard
- Email notification system
- File upload optimization
- Performance monitoring

## Project Overview & Vision
MMW Hubix replaces outdated IT Prefect sites with a modern, unified platform that serves both public and internal needs. The portal provides:

**Public Features:**
- **Resource Hub**: Curated links to school resources organized by dynamic categories with visual indicators
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

## Design & UX Guidelines
- **Modern & Clean**: Professional aesthetic avoiding clutter
- **School Branding**: Incorporate school colors and logo appropriately
- **Responsive Design**: Fully functional on desktop, tablet, and mobile
- **Intuitive Navigation**: Quick access with minimal clicks required
- **Accessibility**: Consider users with different abilities and devices

## Getting Started

### Requirements
- Node.js 18.0 or higher
- npm or pnpm (recommended)
- MySQL 8.0+ (for production); SQLite can be used locally for development (no MySQL installation required)
- XAMPP (optional, for local MySQL server)

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

### Local Development (MySQL Workflow)
**Quick Start:**
```bash
npx prisma db push
npm run db:seed
npm run dev
```

This sequence will:
- Push the schema to your MySQL database defined in `DATABASE_URL`
- Generate/refresh the Prisma Client
- Seed demo data (optional)
- Start the development server

**Database Guide:**
See the comprehensive guide: **[DATABASE-SETUP-GUIDE.md](./DATABASE-SETUP-GUIDE.md)**

**Key Files:**
- `.env.local` - MySQL connection string
- `setup-mysql.sql` - MySQL database creation script

## Project Structure
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

## Authentication
This project uses NextAuth.js with **username-based** authentication (not email). Default behavior: Users are logged out by default; there is no auto-login.

### Default Demo Accounts
| Role | Username | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Full admin console access |
| **Helper** | `helper` | `helper123` | IT dashboard access |
| **Guest** | `guest` | `guest123` | Read-only access |

**Features:**
- ✅ Role-based access control (ADMIN, HELPER, GUEST)
- ✅ Protected routes with server-side auth
- ✅ Session management with NextAuth.js
- ✅ Password change functionality
- ✅ User profile management

**Note:** Production deployment uses Google OAuth with school accounts for IT Prefect authentication.

## Key Features

### Public Website (No Login Required)
- **Resource Hub**: Curated collection of school resources organized by dynamic categories with search functionality
  - **Dynamic Categories**: Admin-managed categories with custom icons, colors, and sorting
  - **Enhanced UI**: Smooth animations, hover effects, staggered card entrance
  - **Interactive**: Scale and shadow effects on hover
  - **Smart Search**: Real-time filtering with animated results
  - **Click Tracking**: Analytics for resource usage and popularity
- **Club Announcements**: Public posting system for school club events with details, dates, and descriptions
  - **Modern Cards**: Animated entrance with hover effects
  - **Progress Bars**: Visual attendance tracking
  - **RSVP System**: Join events with real-time updates
- **AI Assistant**: Conversational chatbot accessible via floating button for campus navigation, schedules, policies, and IT support
  - **Floating Button**: Pulsing animation with smooth transitions
  - **Chat Panel**: Slide-in animation with frosted glass effect
  - **Engaging UI**: Professional conversational interface
- **Responsive Design**: Fully functional on desktop, tablet, and mobile devices

### User Profile & Settings
- **Profile Management**: Users can update their personal information (name, email, department)
- **Password Security**: Secure password change functionality with current password verification
- **User Preferences**: Theme selection, notification settings, and personal customization
- **Access Control**: Users can only edit their own profile information
- **Settings Access**: Available via user menu dropdown or direct navigation to `/dashboard/profile`

### IT Prefect System (Authenticated)
- **Team Dashboard**: Mission statement, organizational structure, and internal communications
- **Internal Calendar**: Manage team meetings, duties, and training sessions (viewable by all prefects, editable by admins)
- **Training Library**: Categorized repository of training videos and materials with search functionality
- **Event Management**: Create and track IT-related events and activities
- **Task System**: Assign and manage team tasks and responsibilities
- **User Profile & Settings**: Personal profile management with password change functionality and user preferences

### Admin Console (Admin Only)
- **User Management**: Account permissions, role assignment, and access control
  - **Batch Operations**: Multi-select and bulk actions
- **Category Management**: Full control over resource categories, including:
  - **CRUD Operations**: Create, read, update, and delete categories.
  - **Customization**: Assign custom icons and colors.
  - **Sorting**: Define the display order of categories.
  - **Status Control**: Toggle categories between active and inactive states.
  - **Inline Editing**: Edit users directly in the data grid
  - **Undo/Redo**: Roll back changes with ease
  - **Add Users**: Create new accounts with form validation
- **Categories Management**: Organize resources with dynamic categories
  - **CRUD Operations**: Create, read, update, delete categories
  - **Visual Customization**: Icons, colors, and sorting order
  - **Resource Integration**: Categories automatically link to resources
  - **Status Control**: Active/inactive category management
- **Article Management**: Full CMS for articles with rich content
  - **CRUD Operations**: Create, read, update, delete articles
  - **Status Workflow**: Draft → Published → Archived
  - **SEO Friendly**: Automatic slug generation
  - **Creator Tracking**: Articles linked to admin users
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

#### Categories Management (/admin/categories)
- Complete category management interface for organizing resources
- Permission guard: only ADMIN can access
- Features:
  - Create, edit, and delete resource categories
  - Visual customization with icons and colors
  - Sort order management
  - Active/inactive status control
  - Resource count tracking per category

API:
```http
GET /api/admin/categories
```
- Fetch all categories with creator info and resource counts (requires ADMIN)

```http
POST /api/admin/categories
Content-Type: application/json

{
  "name": "Academics",
  "description": "Academic resources and tools",
  "icon": "BookOpen",
  "color": "#3b82f6",
  "isActive": true,
  "sortOrder": 1
}
```
- Create new category (requires ADMIN)

```http
PATCH /api/admin/categories
Content-Type: application/json

[{
  "id": "category_id",
  "name": "Updated Name",
  "description": "Updated description",
  "icon": "Users",
  "color": "#10b981",
  "isActive": false,
  "sortOrder": 2
}]
```
- Update category (requires ADMIN)

```http
DELETE /api/admin/categories
Content-Type: application/json

{
  "ids": ["category_id1", "category_id2"]
}
```
- Delete categories (requires ADMIN, only if no resources are linked)

```http
GET /api/categories
```
- Fetch active categories for public use (no authentication required)

#### User Profile & Settings (/dashboard/profile)
- Profile management page with three tabs: Profile, Password, Preferences
- Permission guard: any authenticated user can access their own profile
- Features:
  - Edit personal information (name, email, department)
  - Change password with current password verification
  - Set user preferences (theme, notifications)

API:
```http
GET /api/dashboard/profile
```
- Fetch current user's profile data (requires authentication)

```http
PATCH /api/dashboard/profile
Content-Type: application/json

{
  "name": "New Name",
  "email": "user@example.com",
  "department": "IT"
}
```
- Update user profile information (requires authentication, can only edit own profile)

```http
PATCH /api/dashboard/profile/password
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```
- Change user password (requires authentication, current password verification)

## 🛠 Tech Stack

### Frontend
- **Next.js 15** — Full-stack React framework with App Router
- **TypeScript 5** — Type safety and developer experience
- **Tailwind CSS 4** — Utility-first styling with modern features
- **shadcn/ui** — Beautiful, accessible component library
- **Lucide React** — Modern icon set
- **React Hook Form** — Form validation and management
- **Zod** — Schema validation
- **Recharts** — Data visualization
- **React Data Grid** — Advanced data tables

### Backend
- **Next.js API Routes** — RESTful API endpoints
- **NextAuth.js 4** — Authentication and session management
- **Prisma 6.14** — Type-safe ORM with migrations
- **MySQL 8+** — Primary production database
- **SQLite** — Development database (no setup required)

### Database Features
- ✅ **Dual Database Support**: MySQL for production, SQLite for development
- ✅ **Type Safety**: Full TypeScript integration with Prisma
- ✅ **Migrations**: Version-controlled schema changes
- ✅ **Relations**: User ↔ Article, User ↔ Announcement, etc.
- ✅ **Indexes**: Optimized queries for performance

**Note:** Local SQLite uses `prisma/schema.sqlite.prisma` with `file:./prisma/dev.db` hard-coded.

### Dev Tools
- ESLint — Linting
- PostCSS — CSS processing
- TypeScript — Static typing

## 🗄️ Database Models

The application uses a comprehensive database schema with the following key models:

### Core Models
- **User**: Username-based authentication with roles (ADMIN, HELPER, GUEST), permissions, and activity tracking
- **Category**: Resource categorization with icons, colors, sorting order, and status management
- **Resource**: External links organized by category with click tracking and status control
- **Article**: CMS system with slug, content, status workflow (Draft → Published → Archived), and featured images
- **Announcement**: Club events with attendees, location, scheduling, and RSVP system

### Event & Activity Models
- **PublicEvent**: Public calendar events with visibility controls
- **InternalEvent**: Internal team events with attendee management
- **Activity**: Team activities with assignment and priority tracking
- **Task**: Task management with due dates, priorities, and assignment system

### Training & Content Models
- **TrainingResource**: Multi-format resources (video, text, file) with categories, difficulty levels, and view tracking
- **TeamNotes**: Collaborative team notes with version tracking

### System Models
- **Notification**: Real-time notification system with types, priorities, and read status
- **SiteSetting**: Database-backed settings management with categories and types
- **Account/Session**: NextAuth.js authentication models for OAuth and session management

### Key Relationships
- Users can create and manage all content types
- Resources are linked to Categories for organization
- Activities and Tasks support assignment relationships
- All models include proper indexing for performance optimization

## 📋 Available Scripts
```bash
# Development
npm run dev            # start dev server
npm run build          # build for production
npm run start          # start production server
npm run lint           # run linter

# Database (MySQL)
npm run db:migrate     # run database migrations
npm run db:seed        # seed database with demo data

# Local (SQLite) - Recommended for Development
npm run dev:sqlite           # push SQLite schema and start dev server (all-in-one)
npm run db:push:sqlite       # only push SQLite schema (create/update prisma/dev.db)
npm run db:generate:sqlite   # generate Prisma Client for SQLite
npm run db:seed:sqlite       # seed SQLite (creates admin account only)

# Quality Assurance
npm run quality-check   # run TypeScript, ESLint, and build checks
npm run pre-deploy      # quality-check + build (run before deployment)

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

## 📚 Documentation

### Directory Overview
- **For Developers**
  - **[Contributing Guide](./CONTRIBUTING.md)** – Development environment setup, code standards, testing requirements, and pull request workflow
- **API & Integration**
  - **[API Documentation](./docs/API.md)** – Endpoint reference, request/response formats, authentication, error handling, and rate limiting
- **Core Systems**
  - **[Notification System](./docs/NOTIFICATIONS.md)** – Architecture, creation workflow, user management, API endpoints, and React hook usage
  - **[Permission System](./docs/DYNAMIC_PERMISSIONS.md)** – Role defaults (ADMIN, HELPER, GUEST), custom permissions, server/client usage, and management API
  - **[Settings System](./docs/SETTINGS_IMPLEMENTATION.md)** – Model overview, default values, admin tooling, visibility, and migration guidance

### Quick Links
- **Getting Started**
  1. Read the `README.md` for project overview
  2. Follow **[Contributing Guide](./CONTRIBUTING.md)** for setup
  3. Review **[API Documentation](./docs/API.md)** for integration details
- **Common Tasks**
  - Adding a feature → **[Contributing Guide](./CONTRIBUTING.md)** (Code Patterns section)
  - Creating API endpoints → **[API Documentation](./docs/API.md)** + **[Contributing Guide](./CONTRIBUTING.md)**
  - Managing permissions → **[Permission System](./docs/DYNAMIC_PERMISSIONS.md)**
  - Working with notifications → **[Notification System](./docs/NOTIFICATIONS.md)**
  - Configuring settings → **[Settings System](./docs/SETTINGS_IMPLEMENTATION.md)**
- **Additional References**
  - **[Database Setup Guide](./DATABASE-SETUP-GUIDE.md)** – Dual database configuration and troubleshooting
  - Setup MySQL → See `setup-mysql.sql` and `DATABASE-SETUP-GUIDE.md`
  - Mandatory bug checking → See **[Contributing Guide](./CONTRIBUTING.md)**
  - Quality checks before commits → Run `npm run quality-check`

### Documentation Standards
- **Keep it current** – Update docs whenever features change
- **Be specific** – Include exact commands and working code examples
- **Stay organized** – Use clear headings and consistent structure
- **Link related docs** – Cross-reference connected guides for quicker navigation
- **Test examples** – Validate all documented commands and snippets

### Support
1. Review this `README.md`
2. Check the relevant document inside `docs/`
3. Search existing GitHub issues
4. Contact the development team if the answer is missing

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
1. **Stop all Node processes** (to avoid file locks):
   ```bash
   taskkill /F /IM node.exe
   ```

2. Edit **both** schema files:
   - `prisma/schema.prisma` (MySQL)
   - `prisma/schema.sqlite.prisma` (SQLite)

3. Run migration commands:
   ```bash
   # MySQL
   npx prisma generate
   npx prisma migrate dev
   
   # SQLite
   npm run db:generate:sqlite
   npm run db:push:sqlite
   ```

4. Update related APIs and components

5. **Run mandatory quality checks**:
   ```bash
   npm run quality-check
   ```

For detailed database migration guides and troubleshooting, see:
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development procedures
- [DATABASE-SETUP-GUIDE.md](./DATABASE-SETUP-GUIDE.md) - Database setup

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) for:
- Development setup and workflow
- Code quality standards
- Testing requirements
- Pull request process

Quick start for contributors:
1. Fork the repo
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Run quality checks: `npm run quality-check`
4. Commit changes: `git commit -am 'Add new feature'`
5. Push the branch: `git push origin feature/new-feature`
6. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for complete guidelines.

## 🚨 Troubleshooting

### Common Issues

#### Issue: "EPERM: operation not permitted"
**Cause:** Node processes are locking Prisma client files  
**Solution:**
```powershell
taskkill /F /IM node.exe
npx prisma generate
```

#### Issue: "Error validating datasource: the URL must start with mysql://"
**Cause:** DATABASE_URL not configured correctly  
**Solution:**
- Check `.env` or `.env.local` has correct DATABASE_URL
- For SQLite: `DATABASE_URL="file:./prisma/dev.db"`
- For MySQL: `DATABASE_URL="mysql://root@localhost:3306/mmw_hubix_dev"`

#### Issue: "Can't reach database server"
**Cause:** MySQL server not running  
**Solution:**
1. Open XAMPP Control Panel
2. Start MySQL service
3. Verify port 3306 is not blocked

#### Issue: Development server not starting
**Cause:** Port 3000 already in use  
**Solution:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### Issue: Database schema out of sync
**Cause:** Schema changes not applied  
**Solution:**
```powershell
# For SQLite
npm run db:push:sqlite

# For MySQL
npx prisma db push
```

### Getting Help

- **Database Issues:** See [DATABASE-SETUP-GUIDE.md](./DATABASE-SETUP-GUIDE.md)
- **Development Guide:** See [CONTRIBUTING.md](./CONTRIBUTING.md)
- **API Reference:** See [docs/API.md](./docs/API.md)
- **Report Bugs:** Open an issue on GitHub

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