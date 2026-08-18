# Feature X — Usage

Install / import and use:

```ts
import { runFeatureX } from 'your-package';

const result = await runFeatureX({ foo: 'value' });
if (!result.success) {
  console.error('Feature X failed:', result.error);
} else {
  console.log('Feature X result:', result.data);
}
```

See the spec at docs/specs/feature-x.md for requirements and acceptance criteria.
