Design a complete high-fidelity UI/UX for “Massar Fleet,” a desktop-first internal mission and fleet-management platform for DOT Algérie Télécom.

Product purpose:
Massar Fleet digitizes employee travel missions and vehicle reservations. Employees request missions; fleet managers validate requests and assign an available vehicle and driver; admins manage users, vehicles, drivers, organisational structures, rules, and statistics. A companion Flutter mobile app is for drivers only.

Design style:
Professional, calm, operational, trustworthy, modern enterprise dashboard. Avoid futuristic, flashy, glassmorphism, gradients, excessive rounded cards, or marketing-style visuals. This is a serious internal operations tool.

Brand:
Product name: Massar Fleet
Subtitle: Missions and Fleet Management
Organisation label: DOT · Algérie Télécom
Use a simple route/path motif in the logo area. Do not reproduce or redesign the official Algérie Télécom logo.

Color palette:
- Primary navy: #075985
- Primary hover: #0C4A6E
- Soft blue background: #E0F2FE
- Operational orange accent: #F97316
- Orange hover: #EA580C
- Page background: #F8FAFC
- Card surface: #FFFFFF
- Borders: #E2E8F0
- Main text: #0F172A
- Secondary text: #64748B
- Success: #15803D with soft background #DCFCE7
- Warning: #B45309 with soft background #FEF3C7
- Danger: #B91C1C with soft background #FEE2E2
- Info: #0369A1 with soft background #E0F2FE

Typography:
Use Inter or a similar clean sans-serif font. Clear hierarchy, comfortable desktop spacing, 14–16 px body text, 20–28 px page headings. Support French labels. Reserve space for Arabic labels later, but design this first version in French.

Layout:
Desktop-first at 1440 px width. Use a fixed left sidebar, top header, wide main content area, simple white cards, clear tables, status badges, filters, and confirmation modals. The left navigation uses navy; the main page background is very light gray. Use orange only for high-priority actions and small emphasis.

Create a reusable design system:
- Buttons: primary, secondary, outline, danger, disabled, loading
- Form controls: text input, select, date/time picker, textarea, checkbox, radio button
- Status badges: Brouillon, En attente, Validée, Rejetée, Affectée, Confirmée, En cours, Terminée, Annulée
- Table patterns with sorting, filters, pagination, empty state, loading state
- Alert banners, toast notifications, confirmation modal
- User avatar/menu, breadcrumbs, page header, KPI card, chart card
- Permission-denied, no-data, server-error, and login states

Design these web screens:

1. Login
- Massar Fleet logo
- Email/matricule and password
- “Se connecter” button
- Clean institutional appearance

2. Employee dashboard
- Welcome message
- KPI cards: missions pending, approved, upcoming
- “Nouvelle mission” primary CTA
- Recent missions table with status, destination, dates, vehicle assignment
- In-app notifications panel

3. New mission form
- Mission type: interne/externe
- Purpose/object
- Departure and destination
- Planned departure and return date/time
- Number of passengers
- Checkbox: “Réserver un véhicule”
- Requested vehicle type
- Save draft, submit, cancel actions
- Clear validation messages

4. My missions
- Filter by status, date, mission type
- Table and empty state
- Mission detail side panel or detail page

5. Mission detail
- Timeline: Brouillon → En attente → Validée → Affectée → En cours → Terminée
- Mission information
- Reservation and assignment information
- Status badge
- Audit trail/activity log
- Cancel mission action where permitted

6. Fleet manager dashboard
- KPI cards: missions awaiting validation, vehicles available today, drivers available today, active missions
- Pending approval queue
- Today’s active assignments
- Fleet availability summary
- Small operational charts only; prioritise tables and actions

7. Validation screen
- Mission details
- Approve / reject controls
- Mandatory rejection-reason textarea
- Clear confirmation modal

8. Assignment screen
- Mission summary at the top
- Date and time period clearly visible
- Tabs or two-column layout: available vehicles and available drivers
- Vehicle cards show registration, type, capacity, status, maintenance warning
- Driver cards show name, licence category, licence expiry, availability
- Clearly indicate conflicts and unavailable resources
- “Affecter” primary button
- Assignment confirmation modal

9. Fleet manager mission list
- Advanced filters: status, structure, date range, mission type
- Table with employee, destination, time period, driver, vehicle, status
- Quick actions appropriate to status

10. Admin dashboard
- Organisation-wide KPIs
- Vehicle utilisation chart
- Mission count by period
- Driver workload chart
- Recent alerts: expiring licences, overdue technical inspections, unassigned missions

11. Admin management pages
- Users
- Drivers
- Vehicles
- Organisational structures
- Business settings
For each: data table, filters, create/edit modal or page, confirmation before disabling or deleting.

12. Notifications center
- Read/unread notifications
- Assignment, approval, rejection, cancellation, and maintenance-alert examples

13. Driver mobile application
Create mobile screens at 390 px width only:
- Login
- My assignments
- Assignment detail
- Confirm assignment
- Start mission
- End mission with actual departure/return time
Do not design mobile administration, employee request forms, analytics, maps, GPS tracking, or offline mode.

Interactions/prototype:
- Employee submits a mission
- Fleet manager approves it
- Fleet manager assigns a valid driver and vehicle
- Driver confirms and starts/completes the mission
- Status updates appear in the timeline and notifications
- Cancellation requires a reason and visually releases the driver and vehicle

Use realistic French sample data for Algerian telecom operations, such as “Centre Télécom Tlemcen,” “Mission externe,” vehicle registrations, employee matricules, and mission destinations. Prioritise clarity, fast operational decisions, accessibility, and consistent status handling.