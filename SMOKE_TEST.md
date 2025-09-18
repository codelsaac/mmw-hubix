# Smoke Test Plan

This document outlines the steps to perform a quick smoke test to ensure the application is working correctly after the database migration from SQLite to MySQL.

## Prerequisites

- The application is successfully built (`npm run build`).
- A MySQL database is running and the `DATABASE_URL` in the `.env` file is correctly configured.

## Test Steps

1.  **Database Migration**
    -   Run the following command to apply the database schema to your MySQL database:
        ```bash
        npx prisma migrate dev --name init
        ```

2.  **Database Seeding**
    -   Run the following command to populate the database with initial data:
        ```bash
        npx prisma db seed
        ```

3.  **Start the Application**
    -   Start the development server:
        ```bash
        npm run dev
        ```

4.  **Application Functionality**
    -   Open the application in your browser.
    -   **Login:**
        -   Navigate to the login page.
        -   Log in with the default admin credentials:
            -   **Email:** `admin@cccmmw.edu.hk`
            -   **Password:** (The default password you have set)
        -   Verify that you are redirected to the admin dashboard.
    -   **Announcements:**
        -   Navigate to the announcements page.
        -   Verify that you can see the list of announcements seeded in the database.
        -   Create a new announcement and verify it appears in the list.