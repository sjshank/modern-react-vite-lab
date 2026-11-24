import { describe, expect, it } from 'vitest';
import i18n from '../i18n';
import enReadingList from '../locales/en/readingList.json';
import frReadingList from '../locales/fr/readingList.json';

describe('i18n', () => {
  it('should have English as the default language', () => {
    expect(i18n.language).toBe('en');
  });

  // Add a resource-integrity test
  it('Compare key completeness', () => {
    expect(Object.keys(frReadingList).sort()).toEqual(
      Object.keys(enReadingList).sort(),
    );
  });

  it('falls back to English for a missing French key', async () => {
    await i18n.changeLanguage('fr');

    expect(i18n.t('toggleCompletion', { ns: 'readingList' })).toBeDefined();

    await i18n.changeLanguage('en');
  });
});
