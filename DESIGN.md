### *Project Design & Requirements Document: "MMW Hubix" School Information Portal*

#### *1. Project Title & Vision*

*   *Project Title:* MMW Hubix (Temporary Name)
*   *Vision:* To create a modern, centralized, and user-friendly web portal that consolidates all essential school-related information, resources, and tools for students and staff, while also serving as a private management hub for the IT Prefect team. The goal is to replace the outdated IT Prefect sites with a superior, all-in-one solution.
*   *Project Status:* Approved by FKW. Initial planning phase complete.

#### *2. User Personas & Roles*

1.  *Public User (Students, Teachers, Staff):*
    *   Accesses the public-facing homepage and its resources.
    *   Can view announcements from school clubs.
    *   Can interact with the AI Assistant for campus-related questions.
    *   Does not require a login.

2.  *IT Prefect (Standard Member):*
    *   Logs into the system using their official school Google account.
    *   Can access the internal IT Prefect dashboard.
    *   Can view the team mission/structure, internal event calendar, and the training video library.

3.  *IT Prefect Admin:*
    *   Has all the permissions of a standard IT Prefect.
    *   Has administrative rights to manage and update all content on the website, both public and internal. This includes links, events, internal pages, training videos, and user roles within the IT Prefect system.

#### *3. Core Feature Requirements*

*Module 1: Public-Facing Website*

*   *1.1. Homepage / Resource Hub:*
    *   *Layout:* A clean, grid-based or list-based "link farm" design, similar to a minimalist start page.
    *   *Content:* A curated collection of links to essential school resources and learning sites (e.g., school portal, library, e-learning platforms, exam schedules).
    *   *Organization:* Links should be categorized for easy navigation (e.g., "Academics," "Student Life," "Resources").
    *   *Search/Filter:* A search bar to quickly find specific links.

*   *1.2. Club Announcements Section:*
    *   *Functionality:* A dedicated section on the homepage (likely below the link hub) for school clubs (e.g., Computer Club) to post announcements and event details.
    *   *Display:* Should show the event title, date, location, a brief description, and the hosting club's name.

*   *1.3. Sidebar / Quick Action Bar:*
    *   *Position:* A persistent sidebar, preferably on the right side of the screen.
    *   *Components:*
        *   *AI Assistant:* A chat interface for the campus-focused AI.
        *   *IT Prefect Login:* A clear "Login" or "Prefect System" button that initiates the Google Account authentication flow.

*Module 2: AI Assistant*

*   *2.1. Purpose:* A conversational AI trained to answer a wide range of questions about the school.
*   *Knowledge Base:* The AI should be knowledgeable about:
    *   Campus navigation (e.g., "Where is the library?").
    *   School schedules and bell times.
    *   Important dates and holidays.
    *   Basic IT support questions.
    *   School policies and procedures.
*   *Interaction:* Simple, intuitive chat interface within the sidebar.

*Module 3: Internal IT Prefect System (Authenticated Area)*

*   *3.1. Authentication:*
    *   Secure login exclusively for IT Prefect members via their school-issued Google Workspace accounts (OAuth 2.0).

*   *3.2. Internal Dashboard:*
    *   Upon login, users are directed to a central dashboard.
    *   *Team Information Page:* A clear, well-structured section displaying the IT Prefect team's mission statement, goals, and organizational structure/hierarchy.
    *   *Internal Event Calendar:* A dedicated calendar for scheduling internal meetings, duties, and training sessions. Must be viewable by all prefects and editable by Admins.
    *   *Training Video Library:* A repository of training videos for IT Prefects. Videos should be categorized, searchable, and include titles and descriptions.

*Module 4: Admin Content Management System (CMS)*

*   *4.1. Core Requirement:* A user-friendly backend interface for Admins to manage all website content without needing to code.
*   *Management Capabilities:*
    *   *Homepage Links:* Add, edit, delete, and categorize links in the Resource Hub.
    *   *Club Announcements:* Create, update, and remove event postings.
    *   *Internal Pages:* Easily edit the content on the "Team Information" page (mission, goals, etc.).
    *   *Event Calendar:* Add and manage events in the internal calendar.
    *   *Video Library:* Upload or embed videos, add titles/descriptions, and manage categories.
    *   *User Management:* Assign roles (Standard Member vs. Admin) to IT Prefect accounts.
    *   *(Optional) AI Knowledge Base:* An interface to add, update, or remove information that the AI Assistant uses to answer questions.

#### *4. Design & UX/UI Guidelines*

*   *Aesthetic:* Modern, clean, and professional. Avoid clutter.
*   *Branding:* Incorporate school colors and logo where appropriate.
*   *Responsiveness:* The website must be fully functional and visually appealing on all devices, including desktops, tablets, and mobile phones.
*   *Intuitive Navigation:* Users should be able to find what they need quickly and with minimal clicks.

#### *5. Call to Action for AI / Development Team*

Based on these requirements, please proceed with the following tasks:

1.  *Propose a Technology Stack:* Recommend a suitable front-end framework (e.g., React, Vue), back-end solution (e.g., Node.js, Python with Django/Flask), database, and potential CMS (e.g., Strapi, Sanity.io, or a custom solution).
2.  *Create Wireframes & Mockups:* Generate visual layouts for:
    *   The Homepage (including the Resource Hub and Club Announcements).
    *   The Sidebar with the AI Assistant chat open.
    *   The Internal IT Prefect Dashboard after login.
    *   The Training Video Library page.
3.  *Develop a Project Plan:* Outline the key phases of development (e.g., Setup, Backend API, Frontend UI, Authentication, Deployment) with estimated timelines.
4.  *Suggest Alternative Names:* Propose 5-10 alternative names for "MMW Hubix" that are creative, memorable, and relevant to the project's vision.
