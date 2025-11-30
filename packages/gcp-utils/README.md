# @yohs/gcp-utils

Utility helpers for core Google Cloud Platform services outside of Firebase,
including Pub/Sub, CloudEvents, Eventarc, and Cloud Run.

## Highlights

- Pub/Sub publishing helpers that encode attributes safely and cap payload size
- CloudEvents tooling for HTTP intake and structured event construction
- Eventarc filters + matcher utilities
- Cloud Run signature helpers for calling private services
- Functions Framework runner utilities for local dev loops

Install via npm/pnpm once published:

```bash
pnpm add @yohs/gcp-utils
```

Bring your own SDKs: `@google-cloud/pubsub` and `cloudevents` remain optional
peer dependencies so you control bundle size.
