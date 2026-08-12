export interface BrandConfig {
  channelName?: string;
  contactEmail?: string;
  endingCTA?: string;
}

export const DEFAULT_CHANNEL_NAME = 'ACC PK';
export const DEFAULT_CONTACT_EMAIL = 'anticorruptionchannel@gmail.com';
export const DEFAULT_MISSION = `Kickbacks, bribes and nepotism at the expense of public is a common practice in the developing countries. Pakistan can not be excluded. Anti corruption channel (ACC PK) is committed to provide you inside facts above corrupt mafias. 'Evidence based reporting' is our motto. The purpose of establishing this channel is to deal with the wrongdoers, expose their evil designs and stop them from their wrongdoings at all levels. Subscribe the Anti corruption channel and receive all the updates and be part of the team fighting for a corruption free Pakistan.`;

export function buildOfficialContactBlock({
  channelName = DEFAULT_CHANNEL_NAME,
  contactEmail = DEFAULT_CONTACT_EMAIL,
  endingCTA = '🔔 Stand up against corruption! Subscribe to ACC PK for daily exposures. Share this video to create a transparent Pakistan!',
}: BrandConfig = {}): string {
  const normalizedChannelName = channelName || DEFAULT_CHANNEL_NAME;
  const normalizedEmail = contactEmail || DEFAULT_CONTACT_EMAIL;
  const normalizedCta = endingCTA || '🔔 Stand up against corruption! Subscribe to ACC PK for daily exposures. Share this video to create a transparent Pakistan!';

  return `--------------------------------------------------
ANTI-CORRUPTION CHANNEL PAKISTAN (${normalizedChannelName.toUpperCase()})
"DETERMINE TO BRING PROSPERITY"
"CRUSH CORRUPTION" • Evidence Based Reporting

👤 Founder & C.E.O: Rashid Hameed
🏢 Address: 148 D Faisal Town, Lahore, Pakistan
📞 Contact / Mobile: +92 315 433 8690
☎️ Landline: +92 42 3522 1515
📧 Official Email: ${normalizedEmail}
📣 CTA: ${normalizedCta}
--------------------------------------------------`;
}

export function buildFullDescription({
  description = '',
  officialMission = DEFAULT_MISSION,
  officialContact = '',
  channelName,
  contactEmail,
  endingCTA,
}: {
  description?: string;
  officialMission?: string;
  officialContact?: string;
  channelName?: string;
  contactEmail?: string;
  endingCTA?: string;
} = {}) {
  const normalizedOfficialContact = officialContact || buildOfficialContactBlock({ channelName, contactEmail, endingCTA });
  return [description.trim(), officialMission.trim(), normalizedOfficialContact.trim()].filter(Boolean).join('\n\n').trim();
}

export function buildSocialMediaPost({
  title,
  script,
  hashtags,
  officialMission = DEFAULT_MISSION,
  officialContact = '',
  channelName,
  contactEmail,
  endingCTA,
}: {
  title: string;
  script: string;
  hashtags?: string[] | string;
  officialMission?: string;
  officialContact?: string;
  channelName?: string;
  contactEmail?: string;
  endingCTA?: string;
}) {
  const contactBlock = officialContact || buildOfficialContactBlock({ channelName, contactEmail, endingCTA });
  const normalizedHashtags = Array.isArray(hashtags) ? hashtags.join(' ') : String(hashtags || '');

  return `🔴 EXCLUSIVE REPORT: ${title}

${script}

--------------------------------------------------
📜 OUR MOTTO & MISSION STATEMENT:
${officialMission}

${contactBlock}

${normalizedHashtags}`.trim();
}
