# MMW Hubix - School Information Portal
> A modern, centralized web portal consolidating essential school information, resources, and tools for students, teachers, and IT administrators at C.C.C. Mong Man Wai College

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.14-2D3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

**Status:** Production Ready | Enhanced UI | Actively Maintained

## Recent Updates

### Latest Improvements (December 2024)
- **Categories Management System**: Complete admin interface for managing resource categories with icons, colors, and sorting
- **Enhanced Resource Hub**: Resources now properly organized by dynamic categories with visual indicators
- **Database-Backed Settings System**: Comprehensive site configuration with categories (General, Security, Notifications, Backup)
- **Database Schema Updates**: New Category and SiteSetting models with full CRUD operations and proper relationships
- **Enhanced UI & Animations**: Smooth transitions, hover effects, staggered animations across all components
- **Bug Fixes**: Resolved TypeScript errors in admin users route and database schema issues
- **Database Support**: MySQL-first workflow for development and production
- **Documentation**: Added comprehensive database setup guide
- **Quality Assurance**: Implemented mandatory bug checking procedures
- **User Profile**: Enhanced profile management with modern UI
- **AI Chat**: Polished floating button with pulsing animation
- **System Settings**: Admin interface for site configuration with real-time updates

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
- **Node.js** 18.0 or higher
- **Package Manager**: npm (included with Node.js) or pnpm (faster, recommended)
  - Install pnpm: `npm install -g pnpm`
- **MySQL** 8.0+ (required for both development and production)
- **XAMPP** (recommended for Windows users, provides MySQL + phpMyAdmin)

### Installation

1. Clone the repository
```bash
git clone https://github.com/codelsaac/mmw-hubix.git
cd mmw-hubix
```

2. Install dependencies
```bash
# Using npm
npm install

# OR using pnpm (faster, recommended)
pnpm install
```

3. Configure environment variables
```bash
# Create .env.local file in project root
# Add your MySQL connection string:
DATABASE_URL="mysql://root@localhost:3306/mmw_hubix_dev?connection_limit=5"

# See DATABASE-SETUP-GUIDE.md for detailed configuration
```

4. Set up the database
```bash
# Method 1: Using Prisma db push (faster, for development)
npx prisma generate
npx prisma db push
npm run db:seed

# Method 2: Using migrations (for production)
npm run db:migrate
```

> **💡 Quick Explanation:**  
> - `npx prisma db push` - Quick sync for development (no migration files)  
> - `npm run db:migrate` - Creates migration files for version control (production)

5. Start the development server
```bash
# Using npm
npm run dev

# OR using pnpm
pnpm dev
```

5. Open the browser
Visit http://localhost:3000 to view the site.

### Development Notes

#### Database Configuration
The project uses **MySQL** for both development and production, providing a consistent environment.

**📚 Detailed Setup Guide:** [DATABASE-SETUP-GUIDE.md](./DATABASE-SETUP-GUIDE.md)

**Key Configuration Files:**
- **`.env`** - Base configuration (committed to Git, placeholder values)
- **`.env.local`** - Local overrides (NOT committed, contains real credentials)
- **`setup-mysql.sql`** - Database creation script
- **`prisma/schema.prisma`** - Database schema definition

**Environment File Priority:**
```
.env.local (highest priority, local development)
    ↓
.env (base configuration, committed to Git)
```

> ⚠️ **Important:** Always use `.env.local` for local development with real credentials.  
> The `.env.local` file is gitignored and will not be committed.

#### Database Commands Quick Reference

**For Development (Quick Sync):**
```bash
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Sync schema to database (no migrations)
npm run db:seed          # Seed database with demo data
```

**For Production (With Migrations):**
```bash
npm run db:migrate       # Create and apply migrations
npm run db:seed          # Seed database
```

**Useful Commands:**
```bash
npx prisma studio        # Open database GUI
npx prisma format        # Format schema file
npx prisma validate      # Validate schema
```

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
  - **Inline Editing**: Edit users directly in the data grid
  - **Undo/Redo**: Roll back changes with ease
  - **Add Users**: Create new accounts with form validation
- **Category Management**: Full control over resource categories, including:
  - **CRUD Operations**: Create, read, update, and delete categories
  - **Visual Customization**: Icons, colors, and sorting order
  - **Resource Integration**: Categories automatically link to resources
  - **Status Control**: Active/inactive category management
  - **Meta API**: Dynamic icon and color options for customization
- **Article Management**: Full CMS for articles with rich content
  - **CRUD Operations**: Create, read, update, delete articles
  - **Status Workflow**: Draft → Published → Archived
  - **SEO Friendly**: Automatic slug generation
  - **Creator Tracking**: Articles linked to admin users
- **System Settings**: Database-backed site configuration with categories:
  - **General Settings**: Site name, description, file upload limits
  - **Security Settings**: Session timeout, login attempts, access control
  - **Notification Settings**: Email notifications and alert preferences
  - **Backup Settings**: Automatic backup configuration
  - **Real-time Updates**: Changes apply immediately across the site
  - **Export/Import**: Settings backup and restore functionality

#### User Management (/admin/users)
- Permission guard: only ADMIN can access
- Simple table view with role badges, last login, and department info
- Quick search input filters by name, username, or email in real time
- Dialog-driven create/edit form with validation via `AddUserForm`
- Per-user actions:
  - Edit user details
  - Delete user with confirmation prompt

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

```http
GET /api/admin/categories/meta
```
- Fetch available icon and color options for category customization (requires ADMIN)

#### System Settings (/admin/settings)
- Database-backed site configuration with categorized settings
- Permission guard: only ADMIN can access
- Features:
  - **General Settings**: Site name, description, file upload limits, maintenance mode
  - **Security Settings**: Session timeout, login attempts, access control
  - **Notification Settings**: Email notifications and alert preferences
  - **Backup Settings**: Automatic backup configuration and frequency
  - **Real-time Updates**: Changes apply immediately across the site
  - **Export/Import**: Settings backup and restore functionality

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
- **Simple Tables** — Native HTML tables with Tailwind styling
- **CSS Animations** — Native Tailwind animations

### Backend
- **Next.js API Routes** — RESTful API endpoints
- **NextAuth.js 4** — Authentication and session management
- **Prisma 6.14** — Type-safe ORM with migrations
- **MySQL 8+** — Production database

### Database Features
- ✅ **Type Safety**: Full TypeScript integration with Prisma
- ✅ **Migrations**: Version-controlled schema changes
- ✅ **Relations**: User ↔ Article, User ↔ Announcement, etc.
- ✅ **Indexes**: Optimized queries for performance
- ✅ **Simplified Setup**: Single database configuration

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
- **Activity**: Club events with attendees, location, scheduling, and RSVP system
- **SiteSetting**: Database-backed site configuration with categories, types, and public/private visibility

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
npm run db:migrate     # Create and apply migrations (production)
npx prisma db push     # Quick sync schema to DB (development)
npx prisma generate    # Generate Prisma Client after schema changes
npm run db:seed        # Seed database with demo data
npx prisma studio      # Open database GUI browser

# Quality Assurance
npm run quality-check   # Run TypeScript, ESLint, and build checks
npm run pre-deploy      # quality-check + build (run before deployment)
```

## 🌐 Deployment

### Prerequisites
- MySQL database (production instance)
- Node.js 18+ installed on server
- Environment variables configured

### Deploy to Vercel (Recommended)
1. **Prepare Database:**
   - Set up production MySQL database
   - Note connection string: `mysql://user:password@host:3306/dbname`

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

3. **Configure Vercel:**
   - Connect your Vercel account
   - Import the repository
   - Set environment variables:
     ```
     DATABASE_URL="mysql://user:password@host:3306/mmw_hubix_prod"
     NEXTAUTH_URL="https://your-domain.vercel.app"
     NEXTAUTH_SECRET="generate-strong-secret-key"
     ```

4. **Deploy:**
   - Vercel automatically builds and deploys
   - Run migrations after first deployment:
     ```bash
     npx prisma migrate deploy
     ```

### Deploy to VPS/Dedicated Server

1. **Prepare Server:**
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MySQL
   sudo apt-get install mysql-server
   ```

2. **Set Up Application:**
   ```bash
   # Clone repository
   git clone https://github.com/codelsaac/mmw-hubix.git
   cd mmw-hubix
   
   # Install dependencies
   npm install
   
   # Configure environment
   nano .env.production
   # Add DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET
   ```

3. **Run Migrations:**
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

4. **Build and Start:**
   ```bash
   npm run build
   npm start
   ```

5. **Set Up Process Manager (PM2):**
   ```bash
   npm install -g pm2
   pm2 start npm --name "mmw-hubix" -- start
   pm2 save
   pm2 startup
   ```

### Environment Variables Reference

**Required:**
```env
DATABASE_URL="mysql://user:password@host:3306/dbname?connection_limit=10"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="<generate-with: openssl rand -base64 32>"
```

**Optional:**
```env
NEXT_PUBLIC_APP_URL="https://your-domain.com"
OPENROUTER_API_KEY="your-openrouter-key"  # For AI chat feature
```

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

Create a **`.env.local`** file in your project root for local development:

```env
# ================================
# MMW Hubix - Local Development
# ================================

# Database (MySQL) - Required
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE?connection_limit=5
DATABASE_URL="mysql://root@localhost:3306/mmw_hubix_dev?connection_limit=5"

# NextAuth.js - Required
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-change-in-production"

# Application URLs - Optional
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI Chat (OpenRouter) - Optional
# Get API key from: https://openrouter.ai/
OPENROUTER_API_KEY="your-api-key-here"
```

**🔑 Environment Variables Explained:**

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | MySQL connection string |
| `NEXTAUTH_URL` | ✅ Yes | Base URL for authentication callbacks |
| `NEXTAUTH_SECRET` | ✅ Yes | Secret for encrypting session tokens |
| `NEXT_PUBLIC_APP_URL` | ⚠️ Optional | Public-facing app URL (defaults to NEXTAUTH_URL) |
| `OPENROUTER_API_KEY` | ⚠️ Optional | API key for AI chat feature |

**📁 File Priority:**
```
.env.local       # Local development (highest priority, gitignored)
.env.production  # Production deployment
.env             # Base configuration (committed to Git)
```

> 💡 **Tip:** Use different database names for development and production  
> - Development: `mmw_hubix_dev`  
> - Production: `mmw_hubix_prod`

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

### Making Database Changes

**Before Making Changes:**
1. Stop all Node processes to avoid file locks:
   ```powershell
   taskkill /F /IM node.exe
   ```

**Workflow:**
1. Edit schema file: `prisma/schema.prisma`

2. Choose your approach:
   
   **Option A: Development (Quick)** - Use `db push` for rapid iteration
   ```bash
   npx prisma generate      # Regenerate Prisma Client
   npx prisma db push       # Push changes to database
   npm run db:seed          # Re-seed if needed
   ```
   
   **Option B: Production (Migrations)** - Use migrations for version control
   ```bash
   npx prisma generate           # Regenerate Prisma Client
   npx prisma migrate dev        # Create migration file
   # Prisma will prompt for migration name
   npm run db:seed               # Re-seed if needed
   ```

3. Update related code:
   - API routes that use the modified models
   - Components that display the data
   - TypeScript types if needed

4. **Run mandatory quality checks:**
   ```bash
   npm run quality-check
   ```

5. Test your changes:
   ```bash
   npm run dev              # Start dev server
   npx prisma studio        # Verify data in database
   ```

**📚 Additional Resources:**
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development procedures
- [DATABASE-SETUP-GUIDE.md](./DATABASE-SETUP-GUIDE.md) - Setup guide
- [Prisma Docs](https://www.prisma.io/docs/) - Official Prisma documentation

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

## 🪟 Windows Production Setup

Running a production build locally on Windows for testing or internal deployment.

### Quick Setup

1. **Configure Environment:**
   ```powershell
   # Create .env.production in project root
   # Add these variables (replace with your values):
   DATABASE_URL="mysql://root:password@localhost:3306/mmw_hubix_prod?connection_limit=10"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="<generate-with: openssl rand -base64 32>"
   ```

2. **Prepare Database:**
   ```powershell
   # Create production database
   mysql -u root -p
   CREATE DATABASE mmw_hubix_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   exit;
   
   # Run migrations
   npx prisma migrate deploy
   npm run db:seed
   ```

3. **Build and Run:**
   ```powershell
   npm run build
   npm start
   ```

### Alternative: PowerShell Environment Variables

Set variables for current session (temporary):
```powershell
$env:DATABASE_URL = "mysql://root:password@localhost:3306/mmw_hubix_prod"
$env:NEXTAUTH_URL = "http://localhost:3000"
$env:NEXTAUTH_SECRET = "your-secret-key"
npm start
```

Set variables permanently (persists across sessions):
```powershell
setx DATABASE_URL "mysql://root:password@localhost:3306/mmw_hubix_prod"
setx NEXTAUTH_URL "http://localhost:3000"
setx NEXTAUTH_SECRET "your-secret-key"
# Close and reopen PowerShell, then:
npm start
```

> ⚠️ **Security Note:** URL-encode special characters in passwords  
> Example: `p@ssw0rd!` → `p%40ssw0rd%21`

### Troubleshooting

**Build Fails:**
```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run build
```

**Database Connection Error:**
```powershell
# Verify MySQL is running
netstat -ano | findstr :3306

# Test connection
mysql -u root -p
```

**Port 3000 In Use:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

---

Made with ❤️ for C.C.C. Mong Man Wai College