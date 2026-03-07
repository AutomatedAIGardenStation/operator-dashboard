# API Endpoints Migration

To solve the conflicting endpoint strings across the codebase and documentation, we have standardized canonical API paths. A new module `src/api/endpoints.ts` acts as the source-of-truth.

## Canonical Endpoints
- **Gantry Controls**: Use `/gantry/move`, `/gantry/home`, `/gantry/position` instead of deprecated `/arm/` endpoints.
- **Push Notification Registration**: Use `/notifications/register` instead of deprecated `/push-notification`.
- **System Config/Thresholds**: Use `/system/config` instead of deprecated `/system/thresholds`.

## Backend Compatibility Shims
The backend API server should be updated to drop support for the deprecated endpoints above. However, if backend changes are deployed gradually, the server must support *both* canonical and deprecated paths during the transition period.
- Ensure that the backend routes `POST /notifications/register` correctly handle what `POST /push-notification` used to.
- Ensure that the backend route `PUT /system/config` correctly receives the threshold configs as expected by `PUT /system/thresholds`.
- Ensure that the backend `gantry` controller handles the previous `arm` paths (`/arm/move`, etc.).

Frontend code enforcing these changes via strict `eslint` rules means regressions on the frontend are blocked in CI.
