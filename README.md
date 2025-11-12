## BVT Admin Dashboard

This project is a custom Next.js 15 + React 19 admin dashboard for the BVT Training platform. Tailwind CSS v4 powers the design system with lightweight custom components.

## Development

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). Components live under `src/components`, and the App Router pages are organised inside `src/app`.

## Instructor Preview (Frontend Only)

- The avatar menu now includes a "Preview as" switch that toggles between **admin** and **instructor** roles using mock data only.
- Instructor-facing routes live under `/instructor/*` and mirror the existing admin UI:
  - Dashboard overview (`/instructor`)
  - My courses and detail views (`/instructor/courses`, `/instructor/courses/[id]`)
  - Assessment workspace (`/instructor/tests`)
  - Supporting stubs for schedule, students, insights, and profile settings
- All data is mocked (`src/data/instructorMockData.js`). Buttons for create/edit/delete show placeholder alerts—no API requests are fired.
- When the backend role system is ready, swap the mock hooks for live API calls and remove the preview alerts.

## Notes

- Theme + sidebar context providers wrap the entire app in `src/app/layout.jsx`.
- The instructor layout (`src/app/(instructor)/instructor/layout.jsx`) forces the mock role to "instructor" so the sidebar and header stay in sync.
- `PageBreadcrumb` supports optional breadcrumb trails via the `trail` prop to reflect nested navigation.
