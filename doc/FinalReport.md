# Event Ticketing and QR Code Check-in System

# **Team Information**

| Name         | Student Number | Email                                                                         |
| ------------ | -------------- | ----------------------------------------------------------------------------- |
| Yiren Zhao   |                |                                                                               |
| Yining Wang  |                |                                                                               |
| Yuting Zhang | 1011474897     | [ytlluvia.zhang@mail.utoronto.ca](img/mailto:ytlluvia.zhang@mail.utoronto.ca) |

# Motivation

Small to medium organizations face significant event management challenges without enterprise-level resources. Current processes rely on manual methods—paper forms, spreadsheets, and emails—creating error-prone workflows that scale poorly. On-site check-in using printed lists causes long queues and inaccurate attendance records. Organizations lack analytical tools for data-driven planning and struggle to maintain consistent communication with attendees.

These inefficiencies divert administrative resources away from improving core event experiences and create negative impressions for participants, potentially damaging reputation and reducing future attendance. Paper-based processes also conflict with growing sustainability priorities.

Our team, drawing from personal experience as both organizers and attendees, recognized the opportunity to create an accessible web-based platform addressing these challenges. Our solution streamlines the event lifecycle to reduce administrative overhead, enhance attendee experience, enable data-driven decisions, improve communication, and support sustainability goals while remaining intuitive for users of all technical backgrounds.

# Objectives

Our primary objective was to develop a comprehensive, user-friendly event ticketing and check-in system that balances robust functionality with intuitive design. We aimed to create a platform accessible to users with varying technical expertise while providing sophisticated event management tools.

We sought to simplify event creation and registration through an intuitive interface for customizable events with multiple ticket types, tailored registration forms, and flexible pricing options including promotional discounts. This would allow precise event configuration without technical assistance.

We focused on streamlining check-in through an efficient QR code verification system that functions effectively on mobile devices, eliminating manual procedures, reducing queues, and minimizing errors. Our goal was to enable staff to process attendees quickly regardless of location.

We aimed to provide real-time analytics and reporting for actionable insights into registration patterns, attendance metrics, and demographics, empowering data-driven decisions during planning and execution phases to optimize resources and improve experiences.

Additionally, we prioritized robust waitlist management for addressing demand fluctuations through a transparent, automated system for handling capacity constraints and ticket reallocation when space becomes available.

Finally, we committed to full responsive design across all device types, recognizing that both organizers and attendees frequently use mobile devices for event-related activities.

Through these objectives, our project delivers a cohesive solution addressing the multifaceted challenges of event management while remaining accessible to organizations without extensive technical resources.

# Technical Stack

Our Event Ticketing and QR Code Check-in System implements a comprehensive technical stack that aligns with modern web development practices while fulfilling the course requirements. We selected the Next.js Full-Stack approach as our architectural foundation, leveraging its integrated capabilities for both frontend and backend development within a unified framework.

For frontend development, we utilized Next.js 13 with the App Router pattern, enabling efficient page routing and optimized component rendering. This approach facilitated the implementation of both static and dynamic pages while maintaining consistent navigation throughout the application. We constructed our interactive user interfaces using React, employing functional components and hooks for state management and component lifecycle control. The application's styling system was implemented with Tailwind CSS, providing utility-first classes that enabled responsive design and consistent visual presentation across all device types. We further enhanced the user interface by incorporating shadcn/ui components, ensuring accessibility compliance and visual consistency throughout the platform.

Our backend implementation leverages Next.js Server Components for server-side rendering and logic execution. This approach significantly improves initial page load performance and search engine optimization while reducing client-side JavaScript payload. We implemented data handling through Next.js API Routes, creating RESTful endpoints for client-server communication. All data mutations were developed using Server Actions, Next.js's integrated approach for handling form submissions and data modifications securely.

For persistent data storage, we employed PostgreSQL as our relational database management system, implementing a normalized schema that efficiently models the relationships between entities such as users, events, tickets, and registrations. We used Prisma as our Object-Relational Mapping (ORM) tool, enabling type-safe database queries and simplified database schema management.

Authentication and authorization were implemented using NextAuth.js, providing secure user authentication while supporting role-based access control for organizers, staff, and attendees. For file storage requirements, we integrated cloud storage solutions to manage event images, QR codes, and exported reports.

Additional technologies incorporated into our stack include QRCode.js for generating unique ticket identifiers, React-QR-Reader for implementing the scanning functionality during check-in, and Chart.js for visualizing attendance data in the analytics dashboard. We implemented real-time updates for the check-in dashboard using WebSockets, ensuring immediate synchronization of attendance data across multiple devices.

```

Email communications were handled using Nodemailer, enabling automated notifications for registrations, ticket issuance, and event updates. For frontend testing, we employed Jest and React Testing Library to ensure component functionality and user interaction reliability. The development workflow was enhanced through ESLint and Prettier for code quality enforcement and formatting consistency.

```

This comprehensive technical stack enabled us to create a robust, scalable solution that effectively addresses the complexities of event management while maintaining accessibility and performance across various usage scenarios.

# Features

Our Event Ticketing and QR Code Check-in System offers a comprehensive suite of features designed to address the multifaceted challenges of event management. These features collectively fulfill both the course requirements and our project objectives, delivering a cohesive solution for organizations of varying sizes and technical capabilities.

The system implements sophisticated user authentication with role-based access control, distinguishing between organizers, staff, and attendees. Each role receives a tailored interface providing access to appropriate functionality while maintaining security boundaries. Organizers can manage events and analyze attendance data, staff can process check-ins and monitor participation, and attendees can register for events and access their tickets.

Our event creation module enables organizers to establish detailed event profiles with comprehensive information including descriptions, locations, dates, and capacity limits. The interface supports creating multiple ticket types with differentiated pricing, enabling strategic segmentation for different attendee categories. The platform incorporates promotional discount functionality, allowing organizers to generate unique codes for special pricing offers or targeted marketing campaigns.

The registration system features customizable forms that organizers can tailor to collect event-specific information beyond standard attendee details. Upon registration, the system automatically generates unique QR codes for each ticket, delivering them to attendees via email for convenient access. These digital tickets can be displayed on mobile devices or printed according to attendee preference.

Our platform includes an efficient check-in system with multiple verification methods. Staff can scan QR codes using mobile device cameras, upload ticket PDFs, or perform manual lookups based on attendee information. All check-in activities synchronize instantly across the platform, maintaining accurate attendance records regardless of how many staff members are processing entrants simultaneously.

The system implements comprehensive waitlist management for events reaching capacity. When tickets become unavailable, attendees can join category-specific waitlists and receive transparent information about their position in the queue. Organizers can release additional tickets when capacity increases or cancellations occur, with the system automatically allocating them based on waitlist position and notifying recipients.

Our analytics dashboard provides organizers with actionable insights through visual representations of registration patterns, attendance metrics, and demographic information. These analytics enable data-driven decision making for current and future events, helping optimize resource allocation and attendee experience.

The platform features responsive design principles throughout, ensuring all functionality remains accessible across device types. This approach particularly benefits the check-in process, allowing staff to verify attendees using mobile devices without requiring fixed stations or desktop computers.

Each feature incorporates automated email notifications for relevant actions, ensuring stakeholders receive timely information about registrations, ticket allocations, event changes, and other significant updates. This communication system enhances transparency and reduces administrative overhead for event organizers.

These features collectively address the core challenges of event management while fulfilling the course requirements for frontend implementation, database utilization, architectural approach, and advanced functionality. The resulting platform delivers a comprehensive solution that balances sophistication with accessibility, enabling efficient event management without requiring extensive technical expertise.

# **User Guide**

## User Authentication System

### Account Creation Process

The system supports three user roles: Organizer, Staff, and Attendee. To access the platform's features, users must first create an account through the registration process.

### Registration Procedure

1. From the landing page, locate and select the "Sign Up" button in the top navigation bar to access the registration interface.

![Screenshot 2025-04-19 at 17.41.48.png](img/Screenshot_2025-04-19_at_17.41.48.png)

1. On the registration page, complete the required personal information fields and select the appropriate user role (Organizer, Staff, or Attendee) from the dropdown menu.

![Screenshot 2025-04-19 at 17.46.08.png](img/Screenshot_2025-04-19_at_17.46.08.png)

1. The registration process is identical for all user roles, though permissions and accessible features will differ based on the selected role.

![Screenshot 2025-04-19 at 17.50.42.png](img/Screenshot_2025-04-19_at_17.50.42.png)

![Screenshot 2025-04-19 at 17.48.25.png](img/Screenshot_2025-04-19_at_17.48.25.png)

1. The system validates email addresses to prevent duplicate registrations. If you attempt to register with an email address already in the database, the system will display an "Email already registered" notification and prompt you to use a different email address.

![Screenshot 2025-04-19 at 17.49.25.png](img/Screenshot_2025-04-19_at_17.49.25.png)

The registration of organizer and staff is the same as attendee.

### Authentication Process

1. After successful registration, you will be directed to the login page. Returning users can access this page directly by selecting the "Login" button from the homepage.

![Screenshot 2025-04-19 at 17.51.43.png](img/Screenshot_2025-04-19_at_17.51.43.png)

1. Enter your credentials in the designated fields. The system will verify this information against the database. If your credentials cannot be verified, the system will display an authentication error message.

![Screenshot 2025-04-19 at 17.54.14.png](img/Screenshot_2025-04-19_at_17.54.14.png)

1. Upon successful authentication, you will be redirected to the role-appropriate dashboard interface, which provides access to your authorized features and functions.

![Screenshot 2025-04-19 at 17.55.15.png](img/Screenshot_2025-04-19_at_17.55.15.png)

The dashboard serves as your central control panel for managing events, tickets, or registrations, depending on your assigned role in the system.

## Event Creation and Customization

The platform provides organizers with comprehensive tools to create and customize events with tailored registration forms. The following steps outline the event creation process:

### Accessing Event Management

1.  Navigate to the Events dashboard from the main organizer interface. This centralized location displays all your current and past events in a structured format.

![Screenshot 2025-04-19 at 17.55.15.png](img/Screenshot_2025-04-19_at_17.55.15.png)

### Creating a New Event

1. Select the "Create Event" button located in the upper right corner of the Events dashboard to initiate the event creation process.

   ![Screenshot 2025-04-19 at 17.56.48.png](img/Screenshot_2025-04-19_at_17.56.48.png)

   1. The system will present the Event Configuration interface, where you can define the essential parameters of your event.

![Screenshot 2025-04-19 at 17.57.14.png](img/Screenshot_2025-04-19_at_17.57.14.png)

### Configuring Event Parameters

1. Complete the event configuration form with the necessary details: Event name, Detailed description, Physical or virtual location, Date and time parameters (start and end).

![Screenshot 2025-04-19 at 17.58.23.png](img/Screenshot_2025-04-19_at_17.58.23.png)

1. Required fields are clearly marked with red asterisks (\*) to ensure all critical information is provided.

![Screenshot 2025-04-19 at 17.59.37.png](img/Screenshot_2025-04-19_at_17.59.37.png)

3.  The system performs validation checks upon submission:

- If required fields are incomplete, the system will display targeted error messages directing you to complete the necessary information.
- When all required fields are properly completed, the system will process your submission and create the event.

![Screenshot 2025-04-19 at 18.00.26.png](img/Screenshot_2025-04-19_at_18.00.26.png)

![Screenshot 2025-04-19 at 18.07.04.png](img/Screenshot_2025-04-19_at_18.07.04.png)

### Event Status Classification

The system automatically categorizes events based on their temporal relationship to the current date:

- Events with start times in the future are classified as "Upcoming Events"
- Events with start times in the past are classified as "Past Events"

This automatic classification ensures proper organization and filtering of events within the management interface.

![Screenshot 2025-04-19 at 18.07.49.png](img/Screenshot_2025-04-19_at_18.07.49.png)

## Tiered Ticket Pricing and Discount Management

The system offers robust capabilities for implementing differentiated pricing strategies and promotional discounts. This section details the configuration of tiered ticket pricing and discount codes.

### Accessing Ticket Configuration

1.  From the Events dashboard, locate the desired event and select its name. Event titles appear with interactive underlining when hovering over them to indicate their clickable nature.

![Screenshot 2025-04-19 at 18.13.58.png](img/Screenshot_2025-04-19_at_18.13.58.png)

![Screenshot 2025-04-19 at 18.15.38.png](img/Screenshot_2025-04-19_at_18.15.38.png)

## Location Integration

The system provides seamless integration with mapping services. Select the event location link to access the venue's precise location via Google Maps, offering attendees clear geographical context.

![Screenshot 2025-04-19 at 18.16.21.png](img/Screenshot_2025-04-19_at_18.16.21.png)

### Creating Tiered Ticket Options

1. Within the event management interface, navigate to the ticket configuration section to establish various ticket categories.

2. Select the "Add Ticket Type" button to create a new ticket category.

3. For each ticket type, specify:

- Descriptive name (e.g., "Early Bird," "Standard," "VIP")
- Pricing parameters
- Available quantity
- Optional description of benefits or restrictions

![Screenshot 2025-04-19 at 18.16.45.png](img/Screenshot_2025-04-19_at_18.16.45.png)

4. The system supports multiple ticket tiers for a single event, allowing for sophisticated pricing strategies that can address different market segments or provide incentives for early registration.

![Screenshot 2025-04-19 at 18.18.12.png](img/Screenshot_2025-04-19_at_18.18.12.png)

### Implementing Promotional Discounts

1. Access the discount management functionality by selecting "Promo Code" from the navigation sidebar.

![Screenshot 2025-04-19 at 18.19.10.png](img/Screenshot_2025-04-19_at_18.19.10.png)

2. Select "New Promo Code" to initiate the creation of a promotional discount.

![Screenshot 2025-04-19 at 18.21.29.png](img/Screenshot_2025-04-19_at_18.21.29.png)

3. Associate the discount code with a specific event and define its parameters:

- Unique promotional code
- Discount value (percentage or fixed amount)
- Validity period
- Usage limitations (if applicable)

![Screenshot 2025-04-19 at 18.22.07.png](img/Screenshot_2025-04-19_at_18.22.07.png)

![Screenshot 2025-04-19 at 18.22.28.png](img/Screenshot_2025-04-19_at_18.22.28.png)

This comprehensive pricing and promotion system enables organizers to implement sophisticated marketing strategies, drive early registrations, and offer targeted incentives to specific attendee segments.

## QR Code Generation and Validation System

The platform implements a robust QR code system that facilitates efficient event check-in processes. This section outlines the ticket purchase, QR code generation, and validation workflow.

### Attendee Ticket Acquisition

1. After authenticating with attendee credentials, users can access available events through either the sidebar navigation menu or the "Browse Events" section of the attendee dashboard.

![Screenshot 2025-04-19 at 18.25.41.png](img/Screenshot_2025-04-19_at_18.25.41.png)

![Screenshot 2025-04-19 at 19.03.07.png](img/Screenshot_2025-04-19_at_19.03.07.png)

2. Events with available tickets display an actionable "Buy Now" button adjacent to each event listing, indicating ticket availability. Select the "Buy Now" button to initiate the ticket purchase process for the desired event.

![Screenshot 2025-04-19 at 19.04.18.png](img/Screenshot_2025-04-19_at_19.04.18.png)

3.  Upon successful transaction completion, the system automatically generates a unique ticket with an embedded QR code.

![Screenshot 2025-04-19 at 19.14.36.png](img/Screenshot_2025-04-19_at_19.14.36.png)

### Ticket Management and Access

The system redirects attendees to their personalized ticket view immediately after purchase, displaying the generated QR code and essential event information.

Attendees can also access their tickets at any time through the dashboard interface, which provides a comprehensive overview of all purchased tickets across multiple events.

![Screenshot 2025-04-19 at 19.16.02.png](img/Screenshot_2025-04-19_at_19.16.02.png)

### Ticket Documentation

The platform provides document export functionality through a "Print" option, enabling attendees to generate a PDF version of their ticket.The exported PDF includes:

![Screenshot 2025-04-19 at 19.16.45.png](img/Screenshot_2025-04-19_at_19.16.45.png)

- The unique QR code for event check-in
- Essential event details (name, date, location)
- Ticket-specific information (ticket type, attendee name)
- Terms and conditions (if applicable)

This digital ticket system eliminates the need for physical tickets while maintaining security through unique QR codes that are validated during the check-in process.

## Real-Time Check-In Management System

The platform provides staff members with a comprehensive real-time check-in system that enables efficient attendee verification and event access control. This section details the check-in process and monitoring capabilities.

### Accessing the Check-In Interface

Staff members can access the check-in functionality by navigating to the staff portal after authentication.

![Screenshot 2025-04-19 at 19.20.01.png](img/Screenshot_2025-04-19_at_19.20.01.png)

Select "Check-In Lists" from the navigation options to access the attendee verification interface.

![Screenshot 2025-04-19 at 19.20.19.png](img/Screenshot_2025-04-19_at_19.20.19.png)

### Multiple Verification Methods

The system supports multiple verification methods to accommodate various operational scenarios:

- **Document Upload Verification**: Staff can upload PDF tickets that attendees have previously downloaded or printed. The system processes the document to extract and validate the QR code.
- **Image Scanning Capability**: The interface supports processing of screenshot images containing QR codes, providing flexibility when attendees present tickets on devices.
- **Real-Time Camera Scanning**: Staff can activate the device camera to scan QR codes directly from attendees' physical or digital tickets, facilitating rapid verification.

![Screenshot 2025-04-19 at 19.21.26.png](img/Screenshot_2025-04-19_at_19.21.26.png)

![Screenshot 2025-04-19 at 19.24.36.png](img/Screenshot_2025-04-19_at_19.24.36.png)

### Validation and Status Updates

1. Upon scanning a valid ticket, the system immediately updates the attendee's status in the database to "Checked In."
2. If a ticket has already been processed, the system displays an "Already Checked In" notification, preventing duplicate entries and potential unauthorized access.
3. All check-in activities are recorded in real-time and displayed under the corresponding event in the events section, providing staff with continuous visibility of attendance status.

![Screenshot 2025-04-19 at 19.35.04.png](img/Screenshot_2025-04-19_at_19.35.04.png)

### Attendee Information Access

The check-in system provides seamless navigation to detailed attendee information pages, where staff can view comprehensive ticket information and attendance history.

![Screenshot 2025-04-19 at 19.26.28.png](img/Screenshot_2025-04-19_at_19.26.28.png)

![Screenshot 2025-04-19 at 19.26.36.png](img/Screenshot_2025-04-19_at_19.26.36.png)

![Screenshot 2025-04-19 at 19.26.48.png](img/Screenshot_2025-04-19_at_19.26.48.png)

![Screenshot 2025-04-19 at 19.27.10.png](img/Screenshot_2025-04-19_at_19.27.10.png)

This integrated check-in system enhances event security, streamlines attendee processing, and provides organizers with accurate, real-time attendance data for improved event management.

## Attendance Analytics and Reporting System

The platform provides comprehensive analytics and reporting capabilities that enable organizers and staff to monitor attendance metrics and gain actionable insights. This section details the analytical features available through various interfaces.

### Organizer Analytics Dashboard

Organizers can access consolidated attendance data through the primary dashboard interface, which presents key metrics in an intuitive visual format.

![Screenshot 2025-04-19 at 19.27.58.png](img/Screenshot_2025-04-19_at_19.27.58.png)

The system generates quantitative summaries of ticket distribution across different categories. For example, an event with 300 total tickets might display a breakdown showing 200 VIP tickets and 100 Basic tickets, providing clear visibility into registration patterns.

Check-in status reports are accessible through dedicated reporting interfaces, allowing organizers to monitor attendance rates in real-time and identify potential issues with event access.

![Screenshot 2025-04-19 at 19.28.51.png](img/Screenshot_2025-04-19_at_19.28.51.png)

### Event-Specific Analytics

Within individual event management screens, organizers can access detailed analytics specific to each event. The interface provides visualization of registration trends, ticket sales velocity, and attendance patterns to support data-driven decision-making.

![Screenshot 2025-04-19 at 19.29.38.png](img/Screenshot_2025-04-19_at_19.29.38.png)

### Ticket Category Analysis

Organizers can drill down into specific ticket categories by selecting individual ticket type names within the analytics interface.

This detailed view provides category-specific metrics including: Total tickets sold, Revenue generated, Attendance rate and Demographic information (when collected).

![Screenshot 2025-04-19 at 19.30.17.png](img/Screenshot_2025-04-19_at_19.30.17.png)

### Staff Analytical Tools

Staff members have access to similar analytical capabilities through their dedicated interface, allowing them to monitor check-in progress and attendance patterns during event operations.

The staff analytics dashboard emphasizes operational metrics relevant to entrance management and attendee flow.

![Screenshot 2025-04-19 at 19.52.07.png](img/Screenshot_2025-04-19_at_19.52.07.png)

![Screenshot 2025-04-19 at 19.50.25.png](img/Screenshot_2025-04-19_at_19.50.25.png)

![Screenshot 2025-04-19 at 19.50.34.png](img/Screenshot_2025-04-19_at_19.50.34.png)

### Data Filtering and Search Functionality

The system incorporates advanced filtering and search capabilities that enable users to isolate specific segments of attendance data based on various parameters. And these data management tools support customized reporting and targeted analysis of specific attendee segments or ticket categories.

![Screenshot 2025-04-19 at 19.51.19.png](img/Screenshot_2025-04-19_at_19.51.19.png)

The analytics and reporting system serves as a valuable decision support tool, providing organizers with the quantitative insights necessary for continuous improvement of event management processes and attendee experiences.

## Automated email confirmations

## Waitlist Management System

The platform implements a sophisticated waitlist management system that efficiently handles demand when ticket availability is limited. This section details the end-to-end waitlist process from both attendee and organizer perspectives.

### Waitlist Entry Process

When a specific ticket category reaches its allocation limit, the system automatically transitions from displaying a "Buy Now" option to offering a "Join Waitlist" alternative.

![Screenshot 2025-04-19 at 20.14.35.png](img/Screenshot_2025-04-19_at_20.14.35.png)

Attendees attempting to purchase sold-out tickets are presented with the option to join the waitlist for that specific ticket category.

![Screenshot 2025-04-19 at 20.13.55.png](img/Screenshot_2025-04-19_at_20.13.55.png)

![Screenshot 2025-04-19 at 20.15.21.png](img/Screenshot_2025-04-19_at_20.15.21.png)

Upon selecting "Join Waitlist," the system registers the attendee's interest and assigns a sequential position in the waitlist queue.

![Screenshot 2025-04-19 at 20.16.29.png](img/Screenshot_2025-04-19_at_20.16.29.png)

### Attendee Waitlist Experience

The attendee dashboard provides transparency regarding waitlist status, displaying the current queue position for each waitlisted ticket.

![Screenshot 2025-04-19 at 20.16.40.png](img/Screenshot_2025-04-19_at_20.16.40.png)

While waitlisted tickets do not appear in the attendee's active tickets section, the system maintains visibility of the waitlist position to set appropriate expectations.

### Organizer Waitlist Management

Organizers have comprehensive visibility of waitlist status through the event management interface, which displays:

![Screenshot 2025-04-19 at 20.21.01.png](img/Screenshot_2025-04-19_at_20.21.01.png)

The waitlist management interface empowers organizers to release additional tickets when capacity increases or cancellations occur.

### Ticket Release Mechanism

When additional capacity becomes available, organizers can specify the number of tickets to release through the numeric input field in the waitlist management interface.

The system automatically allocates released tickets based on waitlist position, prioritizing attendees with lower queue numbers.

![Screenshot 2025-04-19 at 20.21.49.png](img/Screenshot_2025-04-19_at_20.21.49.png)

![Screenshot 2025-04-19 at 20.22.01.png](img/Screenshot_2025-04-19_at_20.22.01.png)

Another attendee joined waitlist:

![Screenshot 2025-04-19 at 20.23.25.png](img/Screenshot_2025-04-19_at_20.23.25.png)

When organizers release tickets, the system processes the allocation in sequential order:

1. If one ticket is released, it is assigned to the attendee in position 1.
2. If multiple tickets are released, they are distributed sequentially through the waitlist until exhausted.

![Screenshot 2025-04-19 at 20.25.18.png](img/Screenshot_2025-04-19_at_20.25.18.png)

Organizer can set the number of tickets the input box in the upper left corner:

![Screenshot 2025-04-19 at 20.25.52.png](img/Screenshot_2025-04-19_at_20.25.52.png)

![Screenshot 2025-04-19 at 20.26.36.png](img/Screenshot_2025-04-19_at_20.26.36.png)

![Screenshot 2025-04-19 at 20.29.27.png](img/Screenshot_2025-04-19_at_20.29.27.png)

![Screenshot 2025-04-19 at 20.29.36.png](img/Screenshot_2025-04-19_at_20.29.36.png)

As tickets are assigned to waitlisted attendees, the system automatically adjusts the remaining queue positions to maintain accurate sequencing.

### Attendee Notification

When a waitlisted attendee receives an allocated ticket, the system updates their dashboard to display the active ticket with the associated QR code.

![Screenshot 2025-04-19 at 20.27.24.png](img/Screenshot_2025-04-19_at_20.27.24.png)

![Screenshot 2025-04-19 at 20.27.30.png](img/Screenshot_2025-04-19_at_20.27.30.png)

The previously displayed waitlist position is removed, confirming successful ticket acquisition.

![Screenshot 2025-04-19 at 20.28.38.png](img/Screenshot_2025-04-19_at_20.28.38.png)

### Dynamic Interface Updates

The system maintains accurate status indicators throughout the platform:

- Events with at least one available ticket category display "Buy Now" options
- Events with all ticket categories sold out uniformly display "Join Waitlist" options

![Screenshot 2025-04-19 at 20.33.51.png](img/Screenshot_2025-04-19_at_20.33.51.png)

![Screenshot 2025-04-19 at 20.34.32.png](img/Screenshot_2025-04-19_at_20.34.32.png)

![Screenshot 2025-04-19 at 20.35.25.png](img/Screenshot_2025-04-19_at_20.35.25.png)

This comprehensive waitlist management system enhances the user experience by establishing clear expectations, maintaining transparency, and providing organizers with flexible tools to manage demand effectively.

## Mobile-Responsive Check-In Interface

The platform features a comprehensively optimized mobile experience that ensures all system functionality remains accessible and user-friendly across various device form factors. This section highlights the mobile responsiveness of the check-in system for both attendees and staff.

### Responsive Design Implementation

The system employs responsive design principles throughout the application, automatically adapting layout, typography, and interactive elements to accommodate different screen dimensions.

Navigation elements reconfigure appropriately for mobile devices, maintaining intuitive access to all platform functions while optimizing for touch-based interaction.

![21745109611_.pic.jpg](img/21745109611_.pic.jpg)

![31745109613_.pic.jpg](img/31745109613_.pic.jpg)

![51745109617_.pic.jpg](img/51745109617_.pic.jpg)

![71745109717_.pic.jpg](img/71745109717_.pic.jpg)

![91745109720_.pic.jpg](img/91745109720_.pic.jpg)

The mobile ticket display presents QR codes at optimal resolution and size for reliable scanning, eliminating the need for physical tickets or desktop access.

![101745109722_.pic.jpg](img/101745109722_.pic.jpg)

### Mobile Staff Operations

The check-in system is specifically engineered for mobile usage, recognizing that event staff frequently operate in dynamic environments where desktop access is impractical.

![171745109747_.pic.jpg](img/171745109747_.pic.jpg)

Staff members can perform all check-in functions directly from mobile devices, including:

- QR code scanning using the device camera
- Manual attendee lookup
- Check-in status verification
- Attendance monitoring

![181745109749_.pic.jpg](img/181745109749_.pic.jpg)

Real-time synchronization ensures that check-in operations performed on mobile devices immediately update the central database, maintaining data consistency across all platform access points.

This mobile-optimized approach enhances operational efficiency for event staff while providing attendees with convenient access to their tickets, ultimately streamlining the check-in process and improving the overall event experience.

## PostgreSQL for transaction data

## Cloud storage for event assets

# Development Guide

## Getting Started with Development

### 1. Dependencies Installation

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

### 2. Database Setup

Initialize and reset the database with:

```bash
npx prisma migrate reset
```

Create the initial database schema:

```bash
npx prisma migrate dev --name init
```

### 3. Launch Development Server

Start the application in development mode:

```bash
npm run dev
```

The application should now be running at http://localhost:3000.

# Deployment Information

Our Event Ticketing and QR Code Check-in System is deployed and accessible at https://github.com/YirenZzz/EventTicketing.

The deployed application maintains all functionality available in the development environment, including user authentication, event management, ticket generation, QR code scanning, and analytics reporting. Users can access the system through any modern web browser on both desktop and mobile devices without requiring additional software installation.

# Individual Contributions

# Lessons Learned and Concluding Remarks

The development of our Event Ticketing and QR Code Check-in System provided valuable insights into both technical implementation strategies and effective project management approaches. Throughout this process, we encountered various challenges that ultimately enhanced our understanding of full-stack web development and collaborative software creation.

One significant lesson emerged from our experience implementing the QR code scanning functionality. We initially underestimated the complexity of developing a reliable scanning mechanism that functions consistently across various devices and lighting conditions. Through iterative testing and refinement, we discovered the importance of incorporating error handling and fallback mechanisms to ensure operational reliability even in suboptimal conditions. This experience reinforced the value of progressive enhancement in feature development, ensuring core functionality remains accessible regardless of environmental variables.

Our implementation of real-time synchronization for the check-in process revealed the challenges of managing concurrent operations and data consistency across multiple clients. By adopting WebSocket technology and implementing appropriate state management, we developed a deeper understanding of distributed system principles and their application in web development contexts. This knowledge proved invaluable for creating an efficient, responsive check-in experience that maintains data integrity even during high-volume events.

The project also highlighted the importance of responsive design implementation from the outset rather than as a subsequent adaptation. By adopting a mobile-first approach, we created interfaces that naturally adapted to various screen sizes while maintaining functionality and usability. This strategy significantly reduced development time compared to retrofitting responsiveness onto desktop-oriented interfaces and ensured a consistent experience across all devices.

From a project management perspective, we found that clearly defining feature priorities and maintaining a flexible implementation schedule allowed us to adapt to unexpected challenges while ensuring delivery of essential functionality. Our structured approach to GitHub-based collaboration, including branch management, pull requests, and code reviews, facilitated efficient parallel development while maintaining code quality and consistency.

As we reflect on this project, we recognize several areas for potential enhancement in future iterations. Expanding analytics capabilities to include predictive attendance modeling could provide additional value for event planners. Implementing more sophisticated communication options, such as automated SMS notifications and in-app messaging, would further streamline organizer-attendee interactions. Additionally, enhancing the platform's integration capabilities with external services would increase its utility within broader organizational ecosystems.

In conclusion, the development of our Event Ticketing and QR Code Check-in System provided both practical experience in modern web development techniques and valuable insights into effective software development practices. The resulting platform successfully addresses the challenges identified in our initial motivation, delivering a comprehensive solution that enhances efficiency, improves user experience, and enables data-driven decision making for event management. We believe this project demonstrates our ability to conceptualize, implement, and refine complex web applications while maintaining focus on user needs and operational requirements.
