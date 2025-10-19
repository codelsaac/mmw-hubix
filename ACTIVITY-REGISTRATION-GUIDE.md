# Activity Registration System - Complete Guide

## Overview

The Activity Registration System allows students to view and join school activities through a public-facing page, while teachers can manage registrations through the admin panel.

## 🎯 Features

### For Students (Public - No Login Required)
- Browse all active upcoming activities
- View activity details (date, time, location, description)
- Join activities by filling out a registration form
- Provide personal information:
  - Full Name (required)
  - Class (e.g., F.1A)
  - Student Number
  - Email
  - Phone Number
  - Optional message/questions

### For Teachers (Admin Panel - Login Required)
- View all activities and their registrations
- See detailed student information
- Approve or reject registrations
- Track registration status (Pending/Approved/Rejected)
- Manage registration counts

## 📍 Access Points

### Student Access
**URL:** `http://localhost:3000/activity-news`
- Accessible from main navigation: "Activity News"
- No login required
- Mobile-friendly interface

### Admin Access
**URL:** `http://localhost:3000/admin/announcements`
- Login required (ADMIN role)
- Navigate: Admin Panel → Activity (formerly Announcements)
- Click "Registrations (X)" button on any activity card

## 📋 Database Schema

### New Table: ActivityRegistration
```prisma
model ActivityRegistration {
  id             String       @id @default(cuid())
  announcementId String
  studentName    String       // Required
  studentEmail   String?      // Optional
  studentPhone   String?      // Optional
  studentClass   String?      // Optional (e.g., "F.1A")
  studentNumber  String?      // Optional (Student ID)
  message        String?      // Optional message
  status         String       @default("pending") // pending, approved, rejected
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  announcement Announcement @relation(fields: [announcementId], references: [id], onDelete: Cascade)
}
```

## 🚀 How It Works

### Student Registration Flow

1. **Browse Activities**
   - Student visits `/activity-news`
   - Sees grid of active activities with details
   - Activities show available spots and registration count

2. **Join Activity**
   - Click "Join Activity" button
   - Fill out registration form
   - Only name is required, other fields optional
   - Submit registration

3. **Confirmation**
   - Success message appears
   - "Registration successful! The teacher will review your application."
   - Student info is saved to database

### Teacher Management Flow

1. **View Activities**
   - Login to admin panel
   - Navigate to Activity section
   - See all activities with registration counts

2. **Manage Registrations**
   - Click "Registrations (X)" link on activity card
   - See list of all student registrations
   - View student details:
     - Name, Class, Student Number
     - Email, Phone
     - Registration date
     - Optional message

3. **Review Applications**
   - For pending registrations:
     - Click "Approve" → Changes status to approved
     - Click "Reject" → Changes status to rejected
   - For processed registrations:
     - Click "Reset to Pending" → Returns to pending status

## 🎨 UI Components

### New Components Created

1. **`/components/activity-news-public.tsx`**
   - Public-facing activity listing
   - Registration form dialog
   - Success confirmation dialog

2. **`/components/admin/activity-registrations.tsx`**
   - Admin registration viewer
   - Status management interface
   - Student information display

3. **Updated: `/components/admin/activity-news-management.tsx`**
   - Added "Registrations" button
   - Integration with registration viewer

## 🔗 API Endpoints

### Public Endpoints

**POST `/api/announcements/[id]/join`**
- Register for an activity
- No authentication required
- Request body:
  ```json
  {
    "studentName": "John Doe",
    "studentEmail": "john@example.com",
    "studentPhone": "12345678",
    "studentClass": "F.1A",
    "studentNumber": "12345",
    "message": "Looking forward to this!"
  }
  ```

### Admin Endpoints (Authentication Required)

**GET `/api/admin/announcements/[id]/registrations`**
- Get all registrations for an activity
- Returns array of registration objects

**PUT `/api/admin/announcements/[id]/registrations`**
- Update registration status
- Request body:
  ```json
  {
    "registrationId": "clx123abc",
    "status": "approved" // or "rejected", "pending"
  }
  ```

## ✅ Validation & Security

### Input Validation
- Student name is required (trimmed)
- All other fields are optional
- Empty fields are stored as NULL
- Maximum capacity checking before registration
- Activity status checking (must be "active")

### Security Features
- Admin endpoints require authentication
- Only ADMIN role can view/manage registrations
- Registration data is sanitized
- Rate limiting recommended (future enhancement)

## 🎯 Status Types

### Registration Status
- **pending** - Default status, awaiting teacher review
- **approved** - Teacher approved the registration
- **rejected** - Teacher rejected the registration

### Activity Status
- **active** - Accepting registrations
- **completed** - Event finished
- **cancelled** - Event cancelled (no new registrations)

## 📱 Responsive Design

- Mobile-friendly registration form
- Touch-optimized buttons
- Grid layouts adapt to screen size
- Dialog components scale appropriately

## 🔄 Testing Workflow

### Test Student Registration
1. Create an activity in admin panel (Status: Active)
2. Visit `http://localhost:3000/activity-news`
3. Click "Join Activity" on an activity
4. Fill out form and submit
5. Verify success message appears

### Test Admin Review
1. Login as admin
2. Go to Admin Panel → Activity
3. Click "Registrations (X)" on activity with registrations
4. Verify student information displays correctly
5. Test Approve/Reject buttons
6. Verify status updates

## 🐛 Known Issues & Solutions

### Prisma Client Errors
- **Issue:** `Property 'activityRegistration' does not exist`
- **Solution:** Run `npx prisma generate` after schema changes

### Database Sync Issues
- **Issue:** New table not in database
- **Solution:** Run `npx prisma db push`

### Dev Server File Locks
- **Issue:** Cannot regenerate Prisma client
- **Solution:** Stop dev server first (`Ctrl+C` or `taskkill /F /IM node.exe`)

## 🚀 Deployment Checklist

1. ✅ Update Prisma schema
2. ✅ Generate Prisma client: `npx prisma generate`
3. ✅ Push database changes: `npx prisma db push`
4. ✅ Test registration flow (public)
5. ✅ Test admin review flow
6. ✅ Verify mobile responsiveness
7. ✅ Check email notifications (future enhancement)

## 🔮 Future Enhancements

### Recommended Features
1. **Email Notifications**
   - Send confirmation email to students
   - Notify when registration is approved/rejected
   - Remind teachers of pending registrations

2. **Export Functionality**
   - Export registrations to CSV/Excel
   - Generate attendance lists
   - Create reports

3. **Duplicate Detection**
   - Prevent same student from registering twice
   - Check by email or student number

4. **QR Code Check-in**
   - Generate QR codes for approved registrations
   - Scan QR codes for attendance

5. **Capacity Alerts**
   - Notify admins when activity reaches 80% capacity
   - Waitlist feature when full

6. **Student Portal**
   - Allow students to view their registrations
   - Cancel/modify registrations
   - Track attendance history

## 📞 Support & Questions

For issues or questions:
1. Check this guide first
2. Review API documentation in `/docs/API.md`
3. Check database schema in `/prisma/schema.prisma`
4. Contact system administrator

---

**Last Updated:** October 19, 2025
**Version:** 1.0.0
