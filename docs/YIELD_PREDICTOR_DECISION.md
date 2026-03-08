# Yield Predictor Scope Decision

## Context
The architecture documentation referenced a `YieldPredictor` component, but its implementation status was unclear, causing planning noise.

## Decision
We have decided to implement an MVP scaffolding of the `YieldPredictor` component to satisfy current references without blocking release on a full backend implementation.

## Implementation
- Added `src/components/Dashboard/YieldPredictor.tsx` which provides a mock visualization using Ionic components.
- Added a `useYieldData` hook to simulate the data retrieval contract (currently relying on mocked latency).
- Integrated the component into the Dashboard grid view.

## Future Work
- Connect `useYieldData` to a real backend endpoint once the yield prediction model is available.
- Enhance visualization using `Recharts` when historical and trend data can be supported.
