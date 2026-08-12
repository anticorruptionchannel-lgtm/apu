import { describe, expect, it } from 'vitest';
import { buildOfficialContactBlock, buildSocialMediaPost } from './brand';
import { getPresetSelection } from './presetSelection';

describe('brand helpers', () => {
  it('uses the configured contact email and CTA in the official contact block', () => {
    const text = buildOfficialContactBlock({
      channelName: 'ACC PK',
      contactEmail: 'custom@example.com',
      endingCTA: 'Subscribe now for truth and accountability.',
    });

    expect(text).toContain('custom@example.com');
    expect(text).toContain('Subscribe now for truth and accountability.');
  });

  it('builds a social post that reflects the configured brand details', () => {
    const text = buildSocialMediaPost({
      title: 'Custom investigative report',
      script: 'The story uncovered a major public funding gap.',
      hashtags: ['#CustomHash', '#Transparency'],
      officialMission: 'Mission statement here.',
      officialContact: buildOfficialContactBlock({
        channelName: 'ACC PK',
        contactEmail: 'custom@example.com',
        endingCTA: 'Subscribe now for truth and accountability.',
      }),
    });

    expect(text).toContain('Custom investigative report');
    expect(text).toContain('custom@example.com');
    expect(text).toContain('Subscribe now for truth and accountability.');
  });

  it('applies the default narration language when a preset is selected', () => {
    const preset = {
      id: 'land_encroachment',
      category: 'Housing & Land',
      title: 'Illegal Housing Scheme Land Encroachment',
      prompt: 'Expose illegal land grabbing in green belts.',
      suggestedStyle: 'dramatic',
      previewImage: 'https://example.com/preview.jpg',
    } as const;

    expect(getPresetSelection(preset, 'english')).toEqual({
      userPrompt: 'Expose illegal land grabbing in green belts.',
      selectedStyle: 'dramatic',
      selectedLanguage: 'english',
    });
  });
});
