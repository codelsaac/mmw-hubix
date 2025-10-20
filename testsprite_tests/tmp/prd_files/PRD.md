# Product Requirements Document (PRD)
# MMW Hubix - School Information Portal

## 1. Product Overview

### 1.1 Product Name
**MMW Hubix** - School Information Portal for C.C.C. Mong Man Wai College

### 1.2 Product Vision
A modern, centralized web portal consolidating essential school information, resources, and tools for students, teachers, and IT administrators. MMW Hubix replaces outdated IT Prefect sites with a unified platform serving both public and internal needs.

### 1.3 Target Users
- **Public Users**: Students, teachers, staff (no login required)
- **IT Prefects**: Team members with dashboard access
- **HELPER**: IT Perfect system management
- **ADMIN**: Full administrative rights for content and user management

### 1.4 Key Objectives
- Provide easy access to school resources and information
- Enable efficient IT team management and collaboration
- Offer self-service tools for campus navigation and support
- Streamline content management for administrators

## 2. User Roles & Permissions

### 2.1 ADMIN (系統管理員)
- Full system access
- Can manage entire website and IT Perfect system
- User management with batch operations
- Category and resource management
- Article CMS with draft/publish workflow
- System settings configuration
- Activity and announcement management
- File uploads and training resource management

### 2.2 HELPER (IT助手)
- IT Perfect system management only
- Cannot access website admin features
- Dashboard access for internal tools
- Task and activity management
- Calendar and event access
- Training library viewing

### 2.3 GUEST (IT學會成員 / Public Users)
- View-only access for public features
- Can view training videos and resources
- Access to resource hub without login
- View club announcements and events
- Use AI chat assistant
- Register for public activities

## 3. Core Features

### 3.1 Authentication System
**Priority**: Critical
**User Role**: All authenticated users

#### Requirements:
- Username-based authentication (NOT email)
- Role-based access control (ADMIN, HELPER, GUEST)
- Session management with NextAuth.js
- Password change functionality
- Protected routes with server-side validation
- Default demo accounts for testing

#### Acceptance Criteria:
- Users can log in with username and password
- Roles are properly enforced across all routes
- Sessions persist correctly
- Password changes require current password verification
- Unauthorized users are redirected appropriately

### 3.2 Resource Hub (Public)
**Priority**: High
**User Role**: Public (no login required)

#### Requirements:
- Dynamic category-based organization
- Visual indicators with icons and colors
- Real-time search functionality
- Click tracking and analytics
- Resource status management (active/inactive)
- Responsive card layout with animations
- External link support

#### Acceptance Criteria:
- Resources load within 2 seconds
- Categories are displayed with proper icons and colors
- Search filters resources in real-time
- Click counts increment correctly
- Mobile-responsive layout works on all devices
- Links open in new tabs with proper security

### 3.3 Activity News / Announcements
**Priority**: High
**User Role**: Public viewing, ADMIN management

#### Requirements:
- Public club announcement system
- RSVP registration with student information
- Attendee management and tracking
- Max attendees limit with progress bars
- Activity status (active/inactive)
- Date/time/location information
- Activity type categorization
- Registration approval workflow

#### Acceptance Criteria:
- Announcements display with all details
- Students can register with required information
- Attendee count updates in real-time
- Registration limit is enforced
- Admins can approve/reject registrations
- Past events are properly archived

### 3.4 Article CMS
**Priority**: High
**User Role**: ADMIN (create/edit), Public (view)

#### Requirements:
- Rich text content editor
- Draft → Published → Archived workflow
- SEO-friendly slug generation
- Featured image support
- Tags and category system
- View count tracking
- Publish date scheduling
- Creator attribution

#### Acceptance Criteria:
- Articles can be created with rich content
- Slugs are automatically generated and unique
- Draft articles are not visible to public
- Published articles display correctly
- Featured images are properly optimized
- View counts increment on page load
- Search and filter functionality works

### 3.5 Training Library
**Priority**: High
**User Role**: ADMIN (manage), HELPER/GUEST (view)

#### Requirements:
- Multi-format support (VIDEO, TEXT, FILE)
- Video URL support (YouTube, Google Drive, direct)
- Text articles with markdown
- File uploads (PDF, Word, Excel, PowerPoint, archives)
- Tags and difficulty levels
- View count tracking
- Public/private visibility control
- Instructor attribution

#### Acceptance Criteria:
- All three content types are supported
- Videos embed properly from external sources
- Files upload successfully up to 50MB
- Text content renders with proper formatting
- Search filters by type, tags, difficulty
- View counts increment correctly
- Private resources are hidden from non-admins

### 3.6 User Management
**Priority**: Critical
**User Role**: ADMIN only

#### Requirements:
- Data grid with inline editing
- Multi-select and batch operations
- Role assignment (ADMIN, HELPER, GUEST)
- Account activation/deactivation
- Undo/Redo functionality
- User creation with validation
- Department assignment
- Activity tracking (last login)

#### Acceptance Criteria:
- All users display in sortable grid
- Inline editing saves correctly
- Batch operations work for multiple users
- Role changes are immediately effective
- Inactive users cannot log in
- Undo/Redo restores previous states
- User creation validates all fields

### 3.7 Category Management
**Priority**: High
**User Role**: ADMIN only

#### Requirements:
- CRUD operations for categories
- Icon selection from library
- Color picker for visual identity
- Sort order management
- Active/inactive status control
- Resource count display
- Meta API for icon/color options
- Prevents deletion if resources exist

#### Acceptance Criteria:
- Categories can be created with all fields
- Icons display correctly on resource hub
- Colors are applied consistently
- Sort order affects display order
- Inactive categories are hidden from public
- Resource counts are accurate
- Deletion is blocked if resources exist

### 3.8 System Settings
**Priority**: High
**User Role**: ADMIN only

#### Requirements:
- Database-backed configuration
- Categorized settings (General, Security, Notifications, Backup)
- Real-time updates across site
- Export/Import functionality
- Setting type support (STRING, NUMBER, BOOLEAN, JSON)
- Public/private visibility control
- Default value management

#### Acceptance Criteria:
- Settings load on site startup
- Changes apply immediately
- Export creates valid JSON backup
- Import restores all settings
- Type validation prevents invalid values
- Public settings are accessible to all
- Private settings are admin-only

### 3.9 Calendar System
**Priority**: Medium
**User Role**: All authenticated users

#### Requirements:
- Dual calendar (public and internal events)
- Event creation with date/time/location
- Attendee management
- Event type categorization
- Visibility controls
- Month/week/day views
- Event reminders (future enhancement)

#### Acceptance Criteria:
- Events display on correct dates
- Public events visible to all
- Internal events require authentication
- Attendees can be added/removed
- Events can be edited/deleted by creators
- Calendar views switch correctly
- Mobile-responsive calendar interface

### 3.10 Task Management
**Priority**: Medium
**User Role**: ADMIN (create), assigned users (complete)

#### Requirements:
- Task creation with title/description
- Due date assignment
- Priority levels (low, medium, high, urgent)
- Status tracking (pending, in progress, completed)
- User assignment
- Task filters and sorting
- Overdue task highlighting

#### Acceptance Criteria:
- Tasks can be created and assigned
- Due dates display correctly
- Priority affects display order
- Status can be updated
- Overdue tasks are highlighted
- Assigned users receive notifications
- Tasks can be filtered by status/priority

### 3.11 AI Chat Assistant
**Priority**: Medium
**User Role**: Public (all users)

#### Requirements:
- Floating chat button with animation
- Slide-in chat panel
- Conversational interface
- Campus navigation support
- Schedule information
- Policy questions
- IT support guidance
- Persistent chat history (session-based)

#### Acceptance Criteria:
- Chat button is visible and accessible
- Panel slides in smoothly
- Messages send and receive correctly
- AI provides relevant responses
- Chat history persists during session
- Mobile-friendly interface
- Conversation can be cleared

### 3.12 Notification System
**Priority**: Medium
**User Role**: All authenticated users

#### Requirements:
- Real-time notifications
- Type categorization (INFO, SUCCESS, WARNING, ERROR, ANNOUNCEMENT, SYSTEM)
- Priority levels (LOW, NORMAL, HIGH, URGENT)
- Read/unread status
- User targeting (specific user or broadcast)
- Notification links
- Metadata support
- Notification history

#### Acceptance Criteria:
- Notifications appear in real-time
- Types display with appropriate icons/colors
- Priority affects display prominence
- Read status can be toggled
- Links navigate correctly
- History shows all past notifications
- Notifications can be cleared

### 3.13 File Upload System
**Priority**: High
**User Role**: ADMIN

#### Requirements:
- Secure file upload handling
- Type validation (documents, images, videos, archives)
- Size limits (50MB default)
- Organized storage structure
- File metadata tracking
- Access control
- Upload progress indication

#### Acceptance Criteria:
- Valid files upload successfully
- Invalid file types are rejected
- Size limits are enforced
- Files are stored in correct directories
- Metadata is saved to database
- Access is properly restricted
- Progress shows during upload

### 3.14 User Profile & Settings
**Priority**: Medium
**User Role**: All authenticated users

#### Requirements:
- Profile information editing (name, email, department)
- Secure password change
- User preferences (theme, notifications)
- Activity history viewing
- Avatar/image upload
- Profile visibility controls

#### Acceptance Criteria:
- Users can update their own profile
- Password changes require current password
- Theme changes apply immediately
- Preferences are saved correctly
- Users cannot edit other profiles
- Profile updates reflect across site

## 4. Technical Requirements

### 4.1 Technology Stack
- **Frontend**: Next.js 15 (App Router), React 18, TypeScript 5
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Backend**: Next.js API Routes, NextAuth.js 4
- **Database**: MySQL 8+, Prisma ORM 6.14
- **Form Validation**: Zod, React Hook Form
- **Icons**: Lucide React
- **Charts**: Recharts
- **Testing**: Playwright

### 4.2 Performance Requirements
- Page load time < 3 seconds
- API response time < 500ms
- Database query optimization with indexes
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Caching strategies for static content

### 4.3 Security Requirements
- Username-based authentication (NOT email)
- Role-based access control on all routes
- Server-side permission validation
- SQL injection prevention (Prisma)
- XSS protection
- CSRF token implementation
- Rate limiting on API endpoints
- Secure password hashing
- File upload validation

### 4.4 Accessibility Requirements
- WCAG 2.1 Level AA compliance
- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Color contrast requirements
- Responsive design for all devices

### 4.5 Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 5. Database Schema

### 5.1 Core Models
- **User**: Authentication, roles, permissions, activity tracking
- **Category**: Resource categorization with icons and colors
- **Resource**: External links with click tracking
- **Article**: CMS content with workflow
- **Announcement**: Activity/event management
- **ActivityRegistration**: Student event registrations
- **TrainingResource**: Multi-format training content

### 5.2 Event & Activity Models
- **PublicEvent**: Public calendar events
- **InternalEvent**: Team-only events
- **Activity**: Team activities and assignments
- **Task**: Task management with assignments

### 5.3 System Models
- **Notification**: Notification system
- **SiteSetting**: Site configuration
- **TeamNotes**: Collaborative notes
- **Account/Session**: NextAuth.js models

## 6. API Endpoints

### 6.1 Public APIs (No Auth Required)
- `GET /api/resources` - Fetch active resources
- `GET /api/categories` - Fetch active categories
- `GET /api/activity-news` - Fetch public announcements
- `GET /api/articles` - Fetch published articles
- `GET /api/public/events` - Fetch public events
- `POST /api/activity-news/[id]/register` - Register for activity
- `POST /api/chat` - AI chat assistant

### 6.2 Dashboard APIs (Auth Required)
- `GET /api/dashboard/profile` - User profile
- `PATCH /api/dashboard/profile` - Update profile
- `PATCH /api/dashboard/profile/password` - Change password
- `GET /api/dashboard/calendar` - Internal events
- `GET /api/dashboard/tasks` - User tasks
- `GET /api/dashboard/activities` - Team activities
- `GET /api/notifications` - User notifications

### 6.3 Admin APIs (ADMIN Only)
- `GET /api/admin/users` - User list
- `PATCH /api/admin/users` - Update users
- `DELETE /api/admin/users` - Delete users
- `GET /api/admin/categories` - Category management
- `POST /api/admin/categories` - Create category
- `PATCH /api/admin/categories` - Update category
- `DELETE /api/admin/categories` - Delete category
- `GET /api/admin/articles` - Article management
- `POST /api/admin/articles` - Create article
- `PATCH /api/admin/articles/[id]` - Update article
- `DELETE /api/admin/articles/[id]` - Delete article
- `GET /api/settings` - System settings
- `PATCH /api/settings` - Update settings

## 7. Non-Functional Requirements

### 7.1 Scalability
- Support 500+ concurrent users
- Handle 10,000+ resources
- Process 1,000+ daily registrations
- Database connection pooling
- Horizontal scaling capability

### 7.2 Reliability
- 99.5% uptime target
- Automatic error logging
- Database backup strategy
- Graceful error handling
- Data validation at all levels

### 7.3 Maintainability
- Comprehensive documentation
- Code quality checks (ESLint, TypeScript)
- Consistent code style
- Component-based architecture
- API versioning strategy

### 7.4 Usability
- Intuitive navigation
- Consistent UI/UX patterns
- Clear error messages
- Helpful tooltips and hints
- Progressive disclosure
- Mobile-first design

## 8. Success Metrics

### 8.1 User Engagement
- Daily active users
- Resource click-through rate
- Activity registration rate
- Article view counts
- Training resource completion rate

### 8.2 Performance Metrics
- Average page load time
- API response time
- Database query performance
- Error rate
- Uptime percentage

### 8.3 Content Metrics
- Number of published articles
- Active resources count
- Training resources created
- Announcements posted
- User registrations

## 9. Future Enhancements

### 9.1 Phase 2 Features
- Advanced analytics dashboard
- Email notification system
- File upload optimization
- Performance monitoring
- Mobile app (PWA)

### 9.2 Phase 3 Features
- Multi-language support (English, Chinese)
- Calendar event reminders
- Real-time collaboration tools
- Advanced search with filters
- Export functionality for reports
- Integration with school systems

## 10. Appendix

### 10.1 Demo Accounts
| Role | Username | Password | Access Level |
|------|----------|----------|-------------|
| ADMIN | admin | admin123 | Full access |
| HELPER | helper | helper123 | Dashboard access |
| GUEST | guest | guest123 | Read-only |

### 10.2 Environment Requirements
- Node.js 18.0+
- MySQL 8.0+
- npm or pnpm
- XAMPP (recommended for local MySQL)

### 10.3 References
- [README.md](../../README.md) - Project overview
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Development guide
- [DATABASE-SETUP-GUIDE.md](../../DATABASE-SETUP-GUIDE.md) - Database setup
- [API.md](../../docs/API.md) - API documentation
