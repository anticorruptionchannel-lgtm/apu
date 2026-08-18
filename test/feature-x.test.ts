import { runFeatureX } from '../src/feature-x';

describe('Feature X', () => {
  test('returns error when missing options', async () => {
    // @ts-ignore allow calling with no args for test
    const res = await runFeatureX(undefined);
    expect(res.success).toBe(false);
  });

  test('placeholder success behavior', async () => {
    const res = await runFeatureX({ foo: 'bar' });
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
  });
});
