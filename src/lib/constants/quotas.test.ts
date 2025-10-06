import { getPlanQuota, countWords } from './quotas';

describe('quotas', () => {
  it('returns basic plan quota', () => {
    const q = getPlanQuota('basic');
    expect(q).toBeTruthy();
    expect(q?.monthlyUploadLimit).toBeGreaterThan(0);
  });

  it('counts words robustly', () => {
    expect(countWords('hello world')).toBe(2);
    expect(countWords('  multiple   spaces ')).toBe(2);
    expect(countWords('\nnew\nlines\n')).toBe(2);
  });
});
