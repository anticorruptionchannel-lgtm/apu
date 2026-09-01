// Official ACC PK channel details. These same strings were previously written out by
// hand in server.ts, MetadataSection.tsx and ContactCardBuilder.tsx; the video outro card
// reads them from here so the end card can't drift out of sync with the description and
// the downloadable contact card.

export const CHANNEL_CONTACT = {
  ceo: 'Rashid Hameed',
  address: '148 D Faisal Town, Lahore, Pakistan',
  mobile: '+92 315 433 8690',
  landline: '+92 42 3522 1515',
  email: 'anticorruptionchannel@gmail.com',
  tagline: 'DETERMINE TO BRING PROSPERITY',
  motto: 'EVIDENCE BASED REPORTING',
} as const;

export const DEFAULT_ENDING_CTA =
  'Stand up against corruption! Subscribe to ACC PK for daily exposures. Share this video to create a transparent Pakistan!';

// How long the end card holds on screen, in seconds. The UI offers 1-4.
export const DEFAULT_OUTRO_SECS = 4;
export const OUTRO_SECS_OPTIONS = [1, 2, 3, 4] as const;
export type OutroSecs = (typeof OUTRO_SECS_OPTIONS)[number];
