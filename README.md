# Event Ticketing and QR Code Check-in System

# **Team Information**


| Name         | Student Number | Email                                                                         |
| ------------ | -------------- | ----------------------------------------------------------------------------- |
| Yiren Zhao   | 1005092427     | [yiren.zhao@mail.utoronto.ca](mailto:yiren.zhao@mail.utoronto.ca)             |
| Yining Wang  | 1005728134     | [yning.wang@mail.utoronto.ca](mailto:yning.wang@mail.utoronto.ca)             |
| Yuting Zhang | 1011474897     | [ytlluvia.zhang@mail.utoronto.ca](mailto:ytlluvia.zhang@mail.utoronto.ca)     |

## Video demo

demo link: [[https://drive.google.com/file/d/1Hq_-tGKYt0PiNFJCN-WKe6-93Ox3vX-7/view?usp=share_link](https://drive.google.com/file/d/1U-j7z2vOSZP4nZrWmB0d1LrmBheqHfoh/view?usp=drive_link)](https://drive.google.com/file/d/1U-j7z2vOSZP4nZrWmB0d1LrmBheqHfoh/view?usp=drive_link)

# Motivation

Event organizers often struggle with managing ticketing, attendee registration, and check-in processes efficiently. Traditional paper-based methods are prone to fraud, errors, and delays, while existing digital solutions impose high service fees, offer limited customization, and fail to provide real-time tracking. Platforms like Eventbrite[1] and Ticketmaster [2], while widely used, do not allow event hosts to control the check-in process effectively, nor do they provide seamless integration with discount codes, tiered ticketing, or waitlist management.

To address these challenges, we proposes a simple, user-friendly event ticketing system with QR code check-in. The system will allow organizers to create events with customizable registration forms, manage tiered ticket pricing, generate discount codes, and track attendance efficiently. Event staff will be equipped with a real-time check-in dashboard that validates QR-coded tickets instantly, reducing wait times and eliminating fraudulent entries. Attendees will benefit from a smooth ticket purchasing experience, instant email confirmations, and a mobile-responsive check-in process.

The target users of our event ticketing and QR code check-in system include event organizers, staff, and attendees. Organizers can create events, manage tiered ticketing, apply discount codes, and track attendance in real time with full customization. Event staff benefit from a mobile-responsive check-in dashboard for instant QR code validation and fraud prevention. Attendees enjoy a seamless experience, from easy ticket purchases and automated confirmations to fast, contactless check-ins. 


# Objectives

The objective of this project is to build a secure, scalable, and feature-rich event ticketing system that enables organizers to manage ticket sales and check-ins effectively. The system will provide customizable event registration, QR code-based validation, real-time check-in tracking, automated notifications, and analytics.

Beyond technical implementation, our broader objective was to create a well-structured, maintainable codebase that reflects best practices in modern full-stack web development. This included thoughtful state management, modular design patterns, and secure backend architecture. By emphasizing clarity, flexibility, and robustness, we aimed to deliver a system that could be extended or adapted to real-world use cases beyond the classroom context.


# Technical Stack

This project adopts a Next.js full-stack architecture using the App Router and API Routes, enabling seamless integration of frontend pages, backend logic, and database operations within a unified framework. This approach simplifies the development workflow by colocating UI components and server-side endpoints, reducing context switching and ensuring consistency across the stack.

### Frontend

The frontend is developed using Next.js 15 with the App Router architecture, which enables seamless integration of server and client components within a unified full-stack framework. We chose Next.js for its built-in routing, server-side rendering capabilities, and close integration with API routes, all of which simplify application structure and improve performance.

Pages and components are implemented in TypeScript, providing static type checking and better development tooling. Styling is handled using Tailwind CSS, a utility-first CSS framework that facilitates rapid development with consistent design. We adopted shadcn/ui, a headless component library built on Radix UI, to build accessible, reusable UI elements such as modals, dropdowns, and tabs. This approach aligns with modern styling best practices discussed in the course lectures.

Frontend logic includes interactive forms for event creation, promo code application, and ticket management; dynamic rendering of components such as ticket type selectors and real-time status indicators; and fully responsive layouts that adapt to both desktop and mobile devices. Interactive data visualizations—such as attendance rates and revenue statistics—are implemented using Chart.js, which is dynamically imported inside client components to reduce server-side load. All dashboards and the check-in interface are implemented in React, with client-side state management and route handling using Next.js features.

### Backend

Our backend architecture combines Next.js API routes for most server-side logic, collaborating with the framework’s built-in support for backend development as introduced in the course. This design is inspired by the backend development workflows demonstrated in early course weeks. For example, /api/events manages event creation and retrieval; /api/purchased-tickets processes ticket purchase, updates database entries, and triggers confirmation emails. These routes interact directly with the database via Prisma Client, and return JSON responses to the frontend using NextResponse.

API routes also enforce role-based access control by validating the current session and role on each request, using getServerSession() provided by NextAuth.js.

### Database
The system uses PostgreSQL as the relational database to store all structured application data. PostgreSQL was chosen for its reliability, performance, and strong support for relational integrity and advanced query capabilities. The database schema is defined and managed using Prisma ORM, which allows us to write type-safe queries, perform schema migrations, and maintain consistency between application logic and data models.

The core entities modeled in the database include users, events, ticket types, tickets, purchases, check-in records, and promo codes. The User table stores user credentials and roles, such as organizer, staff, and attendee. The Event table contains metadata including name, description, start and end time, and an optional cover image URL. Each event can have multiple TicketType entries, defining ticket categories with associated price and quantity. For each ticket type, individual Ticket records are pre-generated and linked, each with a unique ID to support QR code issuance and validation.

When an attendee completes a purchase, a corresponding PurchasedTicket record is created, linking the user to a specific ticket and recording the time of purchase. This table also includes a checkedIn flag to track entry status. PromoCode records include fields for discount type (fixed or percentage), applicable ticket types, usage limits, and validity periods. Staff check-in actions are recorded through a one-to-one relationship between PurchasedTicket and CheckIn, which stores the check-in timestamp for traceability.

During development, we used Prisma Studio to explore, verify, and manipulate database contents. This setup ensures structured, normalized, and query-efficient data management for all parts of the system.

### Real‑time & State
Our application uses Socket.io 4 to enable real-time updates, with a server-side Socket.IO instance initialized in `/api/socket.ts` and a lightweight client initializer component (SocketInit.tsx) that connects the browser to the WebSocket backend. We collect frontend state using a hybrid strategy: immutable props are passed through React Server Components, while volatile real-time counters are managed by a centralized Zustand store. React Query is used to fetch data and perform optimistic updates, enabling UI changes that respond to both user input and backend mutations. This structure reflects knowledge on frontend reactivity, state management, real-time design principles, and supports a clean separation between server-side and client-side logic.

### Part of Additional Technologies

Additional technologies integrated into our stack include QRCode.js for generating unique ticket identifiers, React-QR-Reader for implementing the scanning functionality during check-in, and Chart.js for visualizing attendance data in the analytics dashboard. We implemented real-time updates for the check-in dashboard using WebSockets, ensuring immediate synchronization of attendance data across multiple devices.

# Features

Our project provides a comprehensive set of features designed to address the challenges of event management. These features fulfill both the course requirements and our project objectives, delivering a valid solution for event ticketing management.

### Authentication & Authorization

We implemented role-based authentication using NextAuth.js with a Credentials Provider, where each user receives a signed JWT that encodes both their user ID and role (Organizer, Staff, or Attendee). Upon login, the system verifies credentials using bcrypt and checks the selected role against the database before issuing the token. We use a stateless session strategy (strategy: "jwt"), allowing both the frontend and backend to access the user’s identity and role without querying a session store. A custom middleware layer parses the JWT on every request and attaches the user’s role and ID to the request context, enabling consistent, role-aware access control across frontend components and backend API routes. This ensures that only organizers can create events or manage promotions, only staff can perform event check-ins, and only attendees can view their purchased tickets. Input validation is performed during login to ensure all required fields are provided and credentials match stored records. We also handle invalid sessions, missing tokens, and unauthorized access with proper HTTP error responses. The implementation directly reflects the contnets covered with Better Auth and mirrors the role-based guard structures, with the objectives of building secure, authenticated flows and protecting sensitive routes based on user roles.

### Real‑time communication
We use Socket.io to implement end-to-end real-time communication for ticket purchases and check-ins. When an attendee completes a purchase or is checked in by a staff member, the backend emits ticketPurchased and ticketCheckedIn events via WebSocket. Input validation and error handling are performed on both the client (e.g. optimistic rollback on failure) and server (e.g. Socket connection validation), ensuring a resilient real-time system.

### File handling and processing

For image and QR code support, we implemented a flexible upload interface that accepts both image files and PDF documents, allowing staff to check in attendees using screenshots, printed tickets, or email attachments. Uploaded files are parsed on the client side using pdf.js (for PDFs) and html5-qrcode (for image-based decoding). For PDFs, we stream the first page using pdfjs-dist, render it to a canvas, and attempt QR extraction. These functionalities demonstrate our understanding of client-side file processing and expand on the image-handling techniques. Input validation checks are in place to reject unsupported file types or empty uploads, and try-catch blocks provide feedback on failed QR-code decoding attempts. This feature demonstrates hands-on understanding of file handling and user experience design. We also implemented pre-signed upload URLs for direct S3 uploads from the client, using PUT requests to cloud storage. In this project, we used AWS S3 instead of DigitalOcean Spaces, and their API models are compatible.

### API integration with external services

We integrated several external-service APIs to enhance functionality and user experience. For instance, the Google Maps Embed API is used on the Organizer Event Detail Page to provide a live map preview of the event location. When an organizer sets a location, it is encoded into a query string and passed to an embedded <iframe> powered by Google Maps, enabling people to visualize where the event takes place and improving usability. This implementation reflects the UI enrichment principles, where dynamic, data-driven components were emphasized. Beyond Maps, Resend is used to dispatch HTML-based confirmation emails with embedded QR codes, and AWS S3 handles image uploads using the same API model as DigitalOcean Spaces. Each service is integrated with error handling and secured access.

### Event Creation with Schema-Driven Forms

Organizers can dynamically configure registration forms, selecting which fields to include (description, location, etc.). These fields are defined in the Event model and rendered dynamically in the frontend. This pattern of schema-driven UI and dynamic form rendering links to course contents on advanced React state and reusable components.

### Tiered Ticket Types and Promo Codes

Our platform supports tiered ticket pricing and discount codes, enabling organizers to define multiple ticket types per event (Early Bird, VIP etc.), each with its own price and inventory. Promo codes offer either fixed or percentage-based discounts and support constraints like usage limits and validity dates. These codes are validated server-side during purchase using atomic Prisma transactions, ensuring consistency and enforcing ACID properties, aligning with the PostgreSQL & Prisma ORM part covered by lecture. Promo management is handled through dynamic React forms and integrated CRUD APIs, reflecting the schema-driven UI and backend integration patterns emphasized in assignments.

### QR Code Generation and Validation: Real-Time QR-Code Check-In Interface (Camera, Images, and PDFs), and Mobile-responsive check-in interface

Upon ticket purchase, a unique code (e.g., TICKET-xxxx) is generated and rendered into a QR image using the qrcode package. This image is embedded into an HTML email sent via the Resend API, showcasing real-world integration with external services as covered in lecture about API Integration.The Staff dashboard includes a real-time check-in system. It supports camera scanning via html5-qrcode, drag-and-drop image uploads, and even PDF parsing. The check-in interface is fully mobile-responsive, optimized for phones and tablets without any native app. This design highlights our ability to deliver production-grade UX beyond the desktop environment.


### Attendance analytics and reporting
Both staff and organizers can view charts for attendance and revenue (Chart.js). Detailed statistics can also be downloaded as CSV via server-generated Content-Disposition responses. Ticket type breakdowns (Total, Sold, Checked-In) are streamed from API routes and rendered into Excel-compatible file, satisfying emphasis on backend data processing and professional workflows. All numeric inputs are validated for type and range, and missing fields return appropriate HTTP errors.

### Automated email confirmations
After a successful ticket purchase, our system automatically sends a confirmation email using the Resend email API. This email includes the event name, event time, ticket type, a unique ticket code (e.g., TICKET-QmwYBfUY), and a QR code that staff can later scan for check-in. We trigger this via a POST to the `/api/email/confirmation` endpoint, passing in the attendee’s email. The message is composed in HTML using dynamic templating with template literals. Input validation ensures all required fields are present and properly formatted before dispatch. Fallback logic handles delivery failures gracefully with console logging and response monitoring. This automation demonstrates our ability to work with third-party APIs and handle errors.

### PostgreSQL for transaction data

Critical updates (like check-ins and promo validation) are provided by Prisma to guarantee updates across multiple tables (e.g., both Ticket and PurchasedTicket). This design reflects proper transaction usage discussed in class and implemented in assignments. Input data is sanitized and type-checked before transactions execute, with rollback logic automatically applied on error handelling.

## Cloud storage for event assets

We store event cover images in an AWS S3 bucket to ensure access to media content. Images can be uploaded via URL using fetch or axios, then stored in S3 through either the aws-sdk or `@aws-sdk/client-s3` libraries. The system generates a unique filename using uuidv4 or randomUUID, determines the correct content type, and uploads the file using PutObjectCommand. All objects are stored with public-read ACLs, enabling direct rendering in the frontend via the returned S3 URL. This cloud integration allows organizers to associate high-quality visual assets with events without occupying the server storage. Basic error handling (e.g., upload failures or URL fetch issues) ensures resilience during file operations.

# Development Guide

## Getting Started with Development

### Dependencies Installation

Begin by installing all required dependencies:

```bash
npm install
```

If you encounter a Tailwind CSS resolution error(probably won't) such as:

```bash
⨯ ./src/app/globals.css
Error evaluating Node.js code
Error: Can't resolve 'tailwindcss' in '/path/to/project/src/app'
```

Install the latest version of Tailwind CSS:

```bash
npm install tailwindcss@latest
```

### Database Setup

Copy `.env.example` to  `.env`, and change the username and password to your own
```bash
DATABASE_URL="postgresql://{username}:{password}@localhost:5432/event_ticketing?schema=public"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_SECRET="some_complex_secret_value"

RESEND_API_KEY="re_3jqWNuwt_NDFWCJSurCE1qXrHR2FgziVn"
EMAIL_FROM="onboarding@resend.dev"

AWS_ACCESS_KEY_ID="AKIAVRU6TNRBOCJ3DOCX"
AWS_SECRET_ACCESS_KEY="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"
AWS_BUCKET_NAME="event-ticketing-assets"
AWS_REGION="us-east-2"
```

Initialize and reset the database with:

```bash
npx prisma migrate reset
```

Create the initial database schema:

```bash
npx prisma migrate dev --name init
```

### Launch Development Server

Start the application in development mode:

```bash
npm run dev
```

The application should now be running at http://localhost:3000.

# Deployment Information

Our Event Ticketing and QR Code Check-in System is deployed and accessible at https://github.com/YirenZzz/EventTicketing.

The deployed application maintains all functionality available in the development environment, including user authentication, event management, ticket generation, QR code scanning, and analytics reporting. Users can access the system through any modern web browser on both desktop and mobile devices without requiring additional software installation.

# **User Guide**

## User Authentication System

### Account Creation Process

The system supports three user roles: Organizer, Staff, and Attendee. To access the platform's features, users must first create an account through the registration process.

### Registration Procedure

1. From the landing page, locate and select the "Sign Up" button in the top navigation bar to access the registration interface.

![Screenshot 2025-04-19 at 17.41.48.png](doc/img/Screenshot_2025-04-19_at_17.41.48.png)

1. On the registration page, complete the required personal information fields and select the appropriate user role (Organizer, Staff, or Attendee) from the dropdown menu.

![Screenshot 2025-04-19 at 17.46.08.png](doc/img/Screenshot_2025-04-19_at_17.46.08.png)

1. The registration process is identical for all user roles, though permissions and accessible features will differ based on the selected role.

![Screenshot 2025-04-19 at 17.50.42.png](doc/img/Screenshot_2025-04-19_at_17.50.42.png)

![Screenshot 2025-04-19 at 17.48.25.png](doc/img/Screenshot_2025-04-19_at_17.48.25.png)

1. The system validates email addresses to prevent duplicate registrations. If you attempt to register with an email address already in the database, the system will display an "Email already registered" notification and prompt you to use a different email address.

![Screenshot 2025-04-19 at 17.49.25.png](doc/img/Screenshot_2025-04-19_at_17.49.25.png)

The registration of organizer and staff is the same as attendee.

### Authentication Process

1. After successful registration, you will be directed to the login page. Returning users can access this page directly by selecting the "Login" button from the homepage.

![Screenshot 2025-04-19 at 17.51.43.png](doc/img/Screenshot_2025-04-19_at_17.51.43.png)

1. Enter your credentials in the designated fields. The system will verify this information against the database. If your credentials cannot be verified, the system will display an authentication error message.

![Screenshot 2025-04-19 at 17.54.14.png](doc/img/Screenshot_2025-04-19_at_17.54.14.png)

1. Upon successful authentication, you will be redirected to the role-appropriate dashboard interface, which provides access to your authorized features and functions.

![Screenshot 2025-04-19 at 17.55.15.png](doc/img/Screenshot_2025-04-19_at_17.55.15.png)

The dashboard serves as your central control panel for managing events, tickets, or registrations, depending on your assigned role in the system.

## Event Creation and Customization

The platform provides organizers with comprehensive tools to create and customize events with tailored registration forms. The following steps outline the event creation process:

### Accessing Event Management

1.  Navigate to the Events dashboard from the main organizer interface. This centralized location displays all your current and past events in a structured format.

![Screenshot 2025-04-19 at 17.55.15.png](doc/img/Screenshot_2025-04-19_at_17.55.15.png)

### Creating a New Event

1. Select the "Create Event" button located in the upper right corner of the Events dashboard to initiate the event creation process.

   ![Screenshot 2025-04-19 at 17.56.48.png](doc/img/Screenshot_2025-04-19_at_17.56.48.png)

   1. The system will present the Event Configuration interface, where you can define the essential parameters of your event.

![Screenshot 2025-04-19 at 17.57.14.png](doc/img/Screenshot_2025-04-19_at_17.57.14.png)

### Configuring Event Parameters

1. Complete the event configuration form with the necessary details: Event name, Detailed description, Physical or virtual location, Date and time parameters (start and end).

![Screenshot 2025-04-19 at 17.58.23.png](doc/img/Screenshot_2025-04-19_at_17.58.23.png)

1. Required fields are clearly marked with red asterisks (\*) to ensure all critical information is provided.

![Screenshot 2025-04-19 at 17.59.37.png](doc/img/Screenshot_2025-04-19_at_17.59.37.png)

3.  The system performs validation checks upon submission:

- If required fields are incomplete, the system will display targeted error messages directing you to complete the necessary information.
- When all required fields are properly completed, the system will process your submission and create the event.

![Screenshot 2025-04-19 at 18.00.26.png](doc/img/Screenshot_2025-04-19_at_18.00.26.png)

![Screenshot 2025-04-19 at 18.07.04.png](doc/img/Screenshot_2025-04-19_at_18.07.04.png)

### Event Status Classification

The system automatically categorizes events based on their temporal relationship to the current date:

- Events with start times in the future are classified as "Upcoming Events"
- Events with start times in the past are classified as "Past Events"

This automatic classification ensures proper organization and filtering of events within the management interface.

![Screenshot 2025-04-19 at 18.07.49.png](doc/img/Screenshot_2025-04-19_at_18.07.49.png)

## Tiered Ticket Pricing and Discount Management

The system offers robust capabilities for implementing differentiated pricing strategies and promotional discounts. This section details the configuration of tiered ticket pricing and discount codes.

### Accessing Ticket Configuration

1.  From the Events dashboard, locate the desired event and select its name. Event titles appear with interactive underlining when hovering over them to indicate their clickable nature.

![Screenshot 2025-04-19 at 18.13.58.png](doc/img/Screenshot_2025-04-19_at_18.13.58.png)

![Screenshot 2025-04-19 at 18.15.38.png](doc/img/Screenshot_2025-04-19_at_18.15.38.png)

## Location Integration

The system provides seamless integration with mapping services. Select the event location link to access the venue's precise location via Google Maps, offering attendees clear geographical context.

![Screenshot 2025-04-19 at 18.16.21.png](doc/img/Screenshot_2025-04-19_at_18.16.21.png)

### Creating Tiered Ticket Options

1. Within the event management interface, navigate to the ticket configuration section to establish various ticket categories.

2. Select the "Add Ticket Type" button to create a new ticket category.

3. For each ticket type, specify:

- Descriptive name (e.g., "Early Bird," "Standard," "VIP")
- Pricing parameters
- Available quantity
- Optional description of benefits or restrictions

![Screenshot 2025-04-19 at 18.16.45.png](doc/img/Screenshot_2025-04-19_at_18.16.45.png)

4. The system supports multiple ticket tiers for a single event, allowing for sophisticated pricing strategies that can address different market segments or provide incentives for early registration.

![Screenshot 2025-04-19 at 18.18.12.png](doc/img/Screenshot_2025-04-19_at_18.18.12.png)

### Implementing Promotional Discounts

1. Access the discount management functionality by selecting "Promo Code" from the navigation sidebar.

![Screenshot 2025-04-19 at 18.19.10.png](doc/img/Screenshot_2025-04-19_at_18.19.10.png)

2. Select "New Promo Code" to initiate the creation of a promotional discount.

![Screenshot 2025-04-19 at 18.21.29.png](doc/img/Screenshot_2025-04-19_at_18.21.29.png)

3. Associate the discount code with a specific event and define its parameters:

- Unique promotional code
- Discount value (percentage or fixed amount)
- Validity period
- Usage limitations (if applicable)

![Screenshot 2025-04-19 at 18.22.07.png](doc/img/Screenshot_2025-04-19_at_18.22.07.png)

![Screenshot 2025-04-19 at 18.22.28.png](doc/img/Screenshot_2025-04-19_at_18.22.28.png)

This comprehensive pricing and promotion system enables organizers to implement sophisticated marketing strategies, drive early registrations, and offer targeted incentives to specific attendee segments.

## QR Code Generation and Validation System

The platform implements a robust QR code system that facilitates efficient event check-in processes. This section outlines the ticket purchase, QR code generation, and validation workflow.

### Attendee Ticket Acquisition

1. After authenticating with attendee credentials, users can access available events through either the sidebar navigation menu or the "Browse Events" section of the attendee dashboard.

![Screenshot 2025-04-19 at 18.25.41.png](doc/img/Screenshot_2025-04-19_at_18.25.41.png)

![Screenshot 2025-04-19 at 19.03.07.png](doc/img/Screenshot_2025-04-19_at_19.03.07.png)

2. Events with available tickets display an actionable "Buy Now" button adjacent to each event listing, indicating ticket availability. Select the "Buy Now" button to initiate the ticket purchase process for the desired event.

![Screenshot 2025-04-19 at 19.04.18.png](doc/img/Screenshot_2025-04-19_at_19.04.18.png)

3.  Upon successful transaction completion, the system automatically generates a unique ticket with an embedded QR code.

![Screenshot 2025-04-19 at 19.14.36.png](doc/img/Screenshot_2025-04-19_at_19.14.36.png)

### Ticket Management and Access

The system redirects attendees to their personalized ticket view immediately after purchase, displaying the generated QR code and essential event information.

Attendees can also access their tickets at any time through the dashboard interface, which provides a comprehensive overview of all purchased tickets across multiple events.

![Screenshot 2025-04-19 at 19.16.02.png](doc/img/Screenshot_2025-04-19_at_19.16.02.png)

### Ticket Documentation

The platform provides document export functionality through a "Print" option, enabling attendees to generate a PDF version of their ticket.The exported PDF includes:

![Screenshot 2025-04-19 at 19.16.45.png](doc/img/Screenshot_2025-04-19_at_19.16.45.png)

- The unique QR code for event check-in
- Essential event details (name, date, location)
- Ticket-specific information (ticket type, attendee name)
- Terms and conditions (if applicable)

This digital ticket system eliminates the need for physical tickets while maintaining security through unique QR codes that are validated during the check-in process.

## Real-Time Check-In Management System

The platform provides staff members with a comprehensive real-time check-in system that enables efficient attendee verification and event access control. This section details the check-in process and monitoring capabilities.

### Accessing the Check-In Interface

Staff members can access the check-in functionality by navigating to the staff portal after authentication.

![Screenshot 2025-04-19 at 19.20.01.png](doc/img/Screenshot_2025-04-19_at_19.20.01.png)

Select "Check-In Lists" from the navigation options to access the attendee verification interface.

![Screenshot 2025-04-19 at 19.20.19.png](doc/img/Screenshot_2025-04-19_at_19.20.19.png)

### Multiple Verification Methods

The system supports multiple verification methods to accommodate various operational scenarios:

- **Document Upload Verification**: Staff can upload PDF tickets that attendees have previously downloaded or printed. The system processes the document to extract and validate the QR code.
- **Image Scanning Capability**: The interface supports processing of screenshot images containing QR codes, providing flexibility when attendees present tickets on devices.
- **Real-Time Camera Scanning**: Staff can activate the device camera to scan QR codes directly from attendees' physical or digital tickets, facilitating rapid verification.

![Screenshot 2025-04-19 at 19.21.26.png](doc/img/Screenshot_2025-04-19_at_19.21.26.png)

![Screenshot 2025-04-19 at 19.24.36.png](doc/img/Screenshot_2025-04-19_at_19.24.36.png)

### Validation and Status Updates

1. Upon scanning a valid ticket, the system immediately updates the attendee's status in the database to "Checked In."
2. If a ticket has already been processed, the system displays an "Already Checked In" notification, preventing duplicate entries and potential unauthorized access.
3. All check-in activities are recorded in real-time and displayed under the corresponding event in the events section, providing staff with continuous visibility of attendance status.

![Screenshot 2025-04-19 at 19.35.04.png](doc/img/Screenshot_2025-04-19_at_19.35.04.png)

### Attendee Information Access

The check-in system provides seamless navigation to detailed attendee information pages, where staff can view comprehensive ticket information and attendance history.

![Screenshot 2025-04-19 at 19.26.28.png](doc/img/Screenshot_2025-04-19_at_19.26.28.png)

![Screenshot 2025-04-19 at 19.26.36.png](doc/img/Screenshot_2025-04-19_at_19.26.36.png)

![Screenshot 2025-04-19 at 19.26.48.png](doc/img/Screenshot_2025-04-19_at_19.26.48.png)

![Screenshot 2025-04-19 at 19.27.10.png](doc/img/Screenshot_2025-04-19_at_19.27.10.png)

This integrated check-in system enhances event security, streamlines attendee processing, and provides organizers with accurate, real-time attendance data for improved event management.

## Attendance Analytics and Reporting System

The platform provides comprehensive analytics and reporting capabilities that enable organizers and staff to monitor attendance metrics and gain actionable insights. This section details the analytical features available through various interfaces.

### Organizer Analytics Dashboard

Organizers can access consolidated attendance data through the primary dashboard interface, which presents key metrics in an intuitive visual format.

![Screenshot 2025-04-19 at 19.27.58.png](doc/img/Screenshot_2025-04-19_at_19.27.58.png)

The system generates quantitative summaries of ticket distribution across different categories. For example, an event with 300 total tickets might display a breakdown showing 200 VIP tickets and 100 Basic tickets, providing clear visibility into registration patterns.

Check-in status reports are accessible through dedicated reporting interfaces, allowing organizers to monitor attendance rates in real-time and identify potential issues with event access.

![Screenshot 2025-04-19 at 19.28.51.png](doc/img/Screenshot_2025-04-19_at_19.28.51.png)

### Event-Specific Analytics

Within individual event management screens, organizers can access detailed analytics specific to each event. The interface provides visualization of registration trends, ticket sales velocity, and attendance patterns to support data-driven decision-making.

![Screenshot 2025-04-19 at 19.29.38.png](doc/img/Screenshot_2025-04-19_at_19.29.38.png)

### Ticket Category Analysis

Organizers can drill down into specific ticket categories by selecting individual ticket type names within the analytics interface.

This detailed view provides category-specific metrics including: Total tickets sold, Revenue generated, Attendance rate and Demographic information.

![Screenshot 2025-04-19 at 19.30.17.png](doc/img/Screenshot_2025-04-19_at_19.30.17.png)

### Staff Analytical Tools

Staff members have access to similar analytical capabilities through their dedicated interface, allowing them to monitor check-in progress and attendance patterns during event operations.

The staff analytics dashboard emphasizes operational metrics relevant to entrance management and attendee flow.

![Screenshot 2025-04-19 at 19.52.07.png](doc/img/Screenshot_2025-04-19_at_19.52.07.png)

![Screenshot 2025-04-19 at 19.50.25.png](doc/img/Screenshot_2025-04-19_at_19.50.25.png)

![Screenshot 2025-04-19 at 19.50.34.png](doc/img/Screenshot_2025-04-19_at_19.50.34.png)

### Data Filtering and Search Functionality

The system incorporates advanced filtering and search capabilities that enable users to isolate specific segments of attendance data based on various parameters.

![Screenshot 2025-04-19 at 19.51.19.png](doc/img/Screenshot_2025-04-19_at_19.51.19.png)

The analytics and reporting system serves as a valuable decision support tool, providing organizers with the quantitative insights necessary for continuous improvement of event management processes and attendee experiences.

## Automated email confirmations

## Waitlist Management System

The platform implements a waitlist management system that efficiently handles demand when capacity is limited. This section details the end-to-end waitlist process from both attendee and organizer perspectives.

### Waitlist Entry Process

When a specific ticket category reaches its allocation limit, the system automatically transitions from displaying a "Buy Now" option to offering a "Join Waitlist" alternative.

![Screenshot 2025-04-19 at 20.14.35.png](doc/img/Screenshot_2025-04-19_at_20.14.35.png)

Attendees attempting to purchase sold-out tickets are presented with the option to join the waitlist for that specific ticket category.

![Screenshot 2025-04-19 at 20.13.55.png](doc/img/Screenshot_2025-04-19_at_20.13.55.png)

![Screenshot 2025-04-19 at 20.15.21.png](doc/img/Screenshot_2025-04-19_at_20.15.21.png)

Upon selecting "Join Waitlist," the system registers the attendee's interest and assigns a sequential position in the waitlist queue.

![Screenshot 2025-04-19 at 20.16.29.png](doc/img/Screenshot_2025-04-19_at_20.16.29.png)

### Attendee Waitlist Experience

The attendee dashboard provides transparency regarding waitlist status, displaying the current queue position for each waitlisted ticket.

![Screenshot 2025-04-19 at 20.16.40.png](doc/img/Screenshot_2025-04-19_at_20.16.40.png)

While waitlisted tickets do not appear in the attendee's active tickets section, the system maintains visibility of the waitlist position to set appropriate expectations.

### Organizer Waitlist Management

Organizers have comprehensive visibility of waitlist status through the event management interface, which displays:

![Screenshot 2025-04-19 at 20.21.01.png](doc/img/Screenshot_2025-04-19_at_20.21.01.png)

The waitlist management interface empowers organizers to release additional tickets when capacity increases or cancellations occur.

### Ticket Release Mechanism

When additional capacity becomes available, organizers can specify the number of tickets to release through the numeric input field in the waitlist management interface.

The system automatically allocates released tickets based on waitlist position, prioritizing attendees with lower queue numbers.

![Screenshot 2025-04-19 at 20.21.49.png](doc/img/Screenshot_2025-04-19_at_20.21.49.png)

![Screenshot 2025-04-19 at 20.22.01.png](doc/img/Screenshot_2025-04-19_at_20.22.01.png)

Another attendee joined waitlist:

![Screenshot 2025-04-19 at 20.23.25.png](doc/img/Screenshot_2025-04-19_at_20.23.25.png)

When organizers release tickets, the system processes the allocation in sequential order:

If one ticket is released, it is assigned to the attendee in position 1. If multiple tickets are released, they are distributed sequentially through the waitlist until exhausted.

![Screenshot 2025-04-19 at 20.25.18.png](doc/img/Screenshot_2025-04-19_at_20.25.18.png)

Organizer can set the number of tickets the input box in the upper left corner:

![Screenshot 2025-04-19 at 20.25.52.png](doc/img/Screenshot_2025-04-19_at_20.25.52.png)

![Screenshot 2025-04-19 at 20.26.36.png](doc/img/Screenshot_2025-04-19_at_20.26.36.png)

![Screenshot 2025-04-19 at 20.29.27.png](doc/img/Screenshot_2025-04-19_at_20.29.27.png)

![Screenshot 2025-04-19 at 20.29.36.png](doc/img/Screenshot_2025-04-19_at_20.29.36.png)

As tickets are assigned to waitlisted attendees, the system automatically adjusts the remaining queue positions to maintain accurate sequencing.

### Attendee Notification

When a waitlisted attendee receives an allocated ticket, the system updates their dashboard to display the active ticket with the associated QR code.

![Screenshot 2025-04-19 at 20.27.24.png](doc/img/Screenshot_2025-04-19_at_20.27.24.png)

![Screenshot 2025-04-19 at 20.27.30.png](doc/img/Screenshot_2025-04-19_at_20.27.30.png)

The previously displayed waitlist position is removed, confirming successful ticket acquisition.

![Screenshot 2025-04-19 at 20.28.38.png](doc/img/Screenshot_2025-04-19_at_20.28.38.png)

### Dynamic Interface Updates

The system maintains accurate status indicators throughout the platform:

- Events with at least one available ticket category display "Buy Now" options
- Events with all ticket categories sold out uniformly display "Join Waitlist" options

![Screenshot 2025-04-19 at 20.33.51.png](doc/img/Screenshot_2025-04-19_at_20.33.51.png)

![Screenshot 2025-04-19 at 20.34.32.png](doc/img/Screenshot_2025-04-19_at_20.34.32.png)

![Screenshot 2025-04-19 at 20.35.25.png](doc/img/Screenshot_2025-04-19_at_20.35.25.png)

This comprehensive waitlist management system enhances the user experience by establishing clear expectations, maintaining transparency, and providing organizers with flexible tools to manage demand effectively.

## Mobile-Responsive Check-In Interface

The platform features a comprehensively optimized mobile experience that ensures all system functionality remains accessible and user-friendly across various device form factors. This section highlights the mobile responsiveness of the check-in system for both attendees and staff.

### Responsive Design Implementation

The system employs responsive design principles throughout the application, automatically adapting layout and interactive elements to accommodate different screen dimensions.

![21745109611_.pic.jpg](doc/img/21745109611_.pic.jpg)

![31745109613_.pic.jpg](doc/img/31745109613_.pic.jpg)

![51745109617_.pic.jpg](doc/img/51745109617_.pic.jpg)

![71745109717_.pic.jpg](doc/img/71745109717_.pic.jpg)

![91745109720_.pic.jpg](doc/img/91745109720_.pic.jpg)

The mobile ticket display presents QR codes at optimal resolution and size for reliable scanning, eliminating the need for physical tickets or desktop access.

![101745109722_.pic.jpg](doc/img/101745109722_.pic.jpg)

### Mobile Staff Operations

The check-in system is designed for mobile usage, recognizing that event staff frequently operate in dynamic environments where desktop access is impractical.

![171745109747_.pic.jpg](doc/img/171745109747_.pic.jpg)

Staff members can perform all check-in functions directly from mobile devices, including:

- QR code scanning using the device camera
- Manual attendee lookup
- Check-in status verification
- Attendance monitoring

![181745109749_.pic.jpg](doc/img/181745109749_.pic.jpg)

Real-time synchronization ensures that check-in operations performed on mobile devices immediately update the central database, improving efficiency for staff while providing attendees with convenient access to their tickets, ultimately streamlining the check-in process and improving the overall event experience.


# Individual Contributions

Yiren:
- Real-time functionality (e.g., WebSocket)

- File handling and processing (with Yining)

- Advanced state management (with Yining)

- API integration with external services (with Yining)

- Event creation with customizable registration forms

- Tiered ticket pricing and discount codes

- Attendance analytics and reporting

- Automated email confirmations

- PostgreSQL for transaction data

- Cloud storage for event assets

- Mobile-responsive check-in interface

- Bug fixing

- Demo preparation

- Final report writing and revising


Yining:
- User authentication and authorization: Organizer, Staff, Attendee

- File handling and processing (with Yiren)

- Advanced state management (with Yiren)

- API integration with external services (with Yiren)

- QR code generation and validation

- Real-time check-in dashboard

- Mobile-responsive check-in interface

- PostgreSQL for transaction data

- Basic project framework preparation

- Bug fixing and file cleanup

- Demo preparation

- Final report writing and revising


Yuting:

- Waitlist Implementation

- Mobile-responsive check-in interface

- Final report writing


# Lessons Learned and Concluding Remarks

Building our Event Ticketing and QR Code Check-in System taught us a lot， not just about full-stack development, but also about what it takes to deliver a reliable product as a team. One of the biggest lessons came from implementing QR scanning. At first, we thought it would be straightforward, but making it work smoothly across different ways took multiple iterations. Along the way, we realized how critical good error handling and fallback strategies are for user-friendly features.

Adding real-time updates for check-in also brought its own challenges. Getting multiple devices to stay in sync while keeping data consistent pushed us to better understand WebSocket communication and state management. It was a hands-on lesson in how distributed systems work in practice.

Looking ahead, we see room to grow, like adding predictive analytics for attendance, or features like SMS reminders and deeper third-party integrations. But overall, this project gave us practical experience in modern web technologies and showed us how thoughtful design can directly improve user experience in a real-world setting.
