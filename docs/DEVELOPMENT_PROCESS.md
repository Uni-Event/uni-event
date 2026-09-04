# Development Process

[Back to the main README](../README.md)

This document presents the research, technical decisions, development workflow,
and deployment process used to build UniEvent.

UniEvent was developed collaboratively as a full-stack application for
centralizing university event discovery, organization, registration, and
attendance management.

## Project Objective

University events are commonly promoted through separate channels such as
social media, email, physical posters, and internal announcements. This makes
events difficult to discover and creates additional administrative work for
organizers.

UniEvent was designed to provide a single platform through which:

- students can discover and join university events;
- organizers can create and manage events;
- administrators can review events and organizer requests;
- registrations can be represented through digital QR tickets;
- attendance can be validated at the event entrance;
- participation information can be viewed by organizers.

## Initial Research

Before implementation, the team reviewed several existing event management
platforms:

| Platform | Relevant characteristics |
| --- | --- |
| Eventbrite | Public event discovery, ticketing and organizer-oriented workflows |
| CampusGroups | University communities, institutional roles and student engagement |
| Eventus | Event management functionality for specialized organizations |

The analysis indicated that a university-oriented platform should combine:

- clear event discovery similar to public event platforms;
- role-based access and approval workflows;
- university-specific filtering;
- event registration and attendance management;
- a simple interface adapted to students and organizers.

UniEvent was designed as a focused prototype rather than a replacement for
large commercial or institutional platforms.

## Requirements

The main functional requirements were:

- user registration and authentication;
- student, organizer, and administrator roles;
- event creation, editing, deletion, and approval;
- event search and filtering;
- registration with participant capacity limits;
- favorite events;
- digital tickets and QR codes;
- participant check-in;
- notifications;
- event feedback and ratings;
- organizer statistics;
- responsive web access.

The first version did not include advanced marketing, social network
integration, public third-party APIs, or payment processing.

## Development Stages

The project was developed through the following stages:

1. Analysis of the problem and similar platforms
2. Definition of functional requirements and user stories
3. UI/UX prototyping in Figma
4. Database and backend design
5. REST API implementation
6. React interface development
7. Frontend and backend integration
8. Testing and security evaluation
9. Deployment and production service integration
10. Documentation and final validation

## Technical Architecture

UniEvent uses a separated frontend and backend architecture:

```text
React and Vite frontend
          |
          | HTTPS / REST API / JSON
          v
Django REST Framework backend
          |
          +---- Neon PostgreSQL database
          |
          +---- Cloudinary media storage
```

The frontend is responsible for the interface, navigation, forms, event
presentation, QR display, and communication with the backend.

The backend handles authentication, authorization, validation, event
management, ticket generation, notifications, database access, and business
rules.

## Technology Decisions

| Technology | Purpose | Reason for selection |
| --- | --- | --- |
| React | Web interface | Reusable components and single-page application navigation |
| Vite | Frontend development and build | Fast development server and modern build configuration |
| Django | Backend application | Built-in administration, ORM, authentication support and security features |
| Django REST Framework | REST API | Serialization, validation, permissions and standardized API development |
| PostgreSQL | Relational database | Data integrity, relationships and support for concurrent access |
| Neon | Hosted PostgreSQL | Managed database access for the deployed application |
| Cloudinary | Media storage | Persistent storage for event posters and attached media |
| JWT | API authentication | Stateless authentication between the React client and Django API |
| Google OAuth | Alternative authentication | Simplified account access through Google identities |
| Leaflet and OpenStreetMap | Event locations | Interactive map display without requiring a proprietary map platform |
| QR codes | Digital tickets | Unique ticket representation and rapid participant validation |
| Render | Application deployment | Public hosting for the portfolio and demonstration version |

## Backend Development

The backend was implemented using Django and Django REST Framework. It is
organized into three main application areas:

```text
backend/
├── users/
├── events/
└── interactions/
```

### Users

The users module manages:

- custom user accounts based on email addresses;
- registration and profile information;
- JWT authentication;
- Google authentication;
- student and organizer roles;
- organizer role requests;
- administrator permissions.

### Events

The events module manages:

- university faculties and departments;
- event categories;
- event locations;
- event information and scheduling;
- participant capacity;
- posters and attached files;
- organizer ownership;
- event publication status.

The primary event approval flow is:

```text
Draft → Pending approval → Published
                         ↘ Rejected
```

### Interactions

The interactions module manages:

- event registrations;
- digital tickets;
- unique QR identifiers;
- participant check-in status;
- favorite events;
- reviews and ratings;
- user notifications.

Database relationships are managed through the Django ORM. Foreign keys and
uniqueness constraints are used to maintain consistency between users, events,
tickets, favorites, and reviews.

For example:

- a user can hold only one ticket for the same event;
- a user can add the same event to favorites only once;
- a user can submit only one review for an event;
- each ticket receives a unique QR identifier.

## REST API

The backend exposes REST endpoints grouped by application area:

```text
/api/users/
/api/events/
/api/interactions/
/api/token/
/api/token/refresh/
```

JWT access tokens are included in the `Authorization` header:

```text
Authorization: Bearer <access_token>
```

The React frontend uses a configured Axios client to attach the access token to
authenticated requests.

Interactive API documentation is generated through Swagger and ReDoc:

```text
/swagger/
/redoc/
```

## Frontend Development

The frontend was implemented as a React single-page application.

Its main areas include:

- authentication and registration;
- event discovery;
- event filtering and details;
- favorites;
- digital tickets;
- profile management;
- notifications;
- organizer dashboard;
- event creation and management;
- organizer statistics;
- QR ticket scanning.

Protected routes restrict access based on authentication state and user role.
Students and organizers are presented with different navigation options and
application workflows.

Material UI, custom CSS, and reusable React components were used to maintain
visual consistency.

## Authentication and Authorization

UniEvent supports:

- email and password authentication;
- JWT access and refresh tokens;
- Google authentication;
- protected frontend routes;
- backend permission checks;
- organizer-only functionality;
- administrator-only endpoints.

The original requirements considered integration with an institutional
Single Sign-On system. Because direct access to a university identity provider
was outside the scope of the prototype, the implemented version uses local
accounts and Google authentication.

## UI/UX Design

The interface was planned and prototyped in Figma before and during
implementation.

The design focused on:

- role-specific navigation;
- clear event discovery;
- reusable event cards;
- accessible forms;
- responsive layouts;
- simple organizer workflows;
- consistent visual identity.

The design workspace is available in
[Figma](https://www.figma.com/design/LXwrktdvKiK8RBDJrgsl7F/Dev-Dynasty).

The current application interface is available in Romanian because it was
designed for a Romanian university context.

## Project Organization

The development workflow was managed using Jira and Confluence.

### Jira

Jira was used to:

- create tasks and user stories;
- assign work to team members;
- track task status;
- organize work through a Kanban-style workflow;
- monitor project progress.

The main workflow was:

```text
To Do → In Progress → Review → Done
```

Although each member had a primary area of responsibility, tasks were also
distributed across different project areas to encourage collaboration and
shared understanding.

### Confluence

Confluence was used to maintain:

- project requirements;
- research and competitor analysis;
- technology decisions;
- team responsibilities;
- API and database information;
- UML diagrams;
- manual testing reports;
- automated testing reports;
- security testing results.

The public repository contains a concise version of this information rather
than a complete copy of the internal project documentation.

### GitHub

GitHub was used for:

- source code version control;
- collaborative development;
- branch and pull request workflows;
- commit history;
- documentation;
- deployment source integration.

## Deployment

The application was deployed as a public demonstration and portfolio project.

The deployed environment uses:

- Render for application hosting;
- Neon for PostgreSQL database hosting;
- Cloudinary for persistent media storage;
- environment variables for deployment configuration.

The public application is available at:

[Open UniEvent](https://unievent-14dq.onrender.com)

The deployment process required configuring:

- the frontend API base URL;
- the PostgreSQL connection URL;
- Google authentication;
- Cloudinary credentials;
- trusted CSRF origins;
- CORS behavior;
- Django host configuration.

## Testing and Validation

The project was evaluated through:

- manual API testing with Postman;
- automated backend tests with Pytest;
- end-to-end browser tests with Playwright;
- a baseline security scan with OWASP ZAP.

Testing covered authentication, permissions, events, interactions, organizer
workflows, QR tickets, input validation, and security configuration.

Detailed commands and results are available in the
[testing documentation](TESTING.md).

## Team Collaboration

UniEvent was developed by a five-member team with primary responsibilities
covering architecture, backend development, frontend development, database
work, testing, UI/UX, documentation, and project management.

Individual contributions are documented in
[Team and Contributions](TEAM_CONTRIBUTIONS.md).

## Current Status

UniEvent is a functional prototype that demonstrates the complete lifecycle of
a university event:

```text
Event creation
      ↓
Review and publication
      ↓
Student discovery and registration
      ↓
Digital ticket generation
      ↓
QR validation and participant check-in
      ↓
Participation statistics and feedback
```

The project demonstrates both the technical implementation of a full-stack
application and the collaborative process used to design, test, document, and
deploy it.
