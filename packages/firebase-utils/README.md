# @yohs/firebase-utils

Utility helpers shared across Firebase Admin and Google Cloud Platform runtimes.

## Highlights

- Firestore batch + path helpers that stay under API limits
- Token verification cache for Firebase Auth Admin SDK
- Google Cloud Storage helpers for deterministic buckets and signed URLs

Install the package via npm/pnpm once it has been published:

```bash
pnpm add @yohs/firebase-utils
```

Bring your own SDKs – the package only declares optional peer dependencies on
`firebase-admin` and `@google-cloud/storage` so you can decide which parts of the
stack to ship with your application.
