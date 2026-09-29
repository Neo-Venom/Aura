import type { CrisisResource, Questionnaire, QuestionItem } from '../../types/api';

const week = (id: string, text: string, section: QuestionItem['section'] = 'main'): QuestionItem => ({ id, text, scale: 'frequency_week', section });

export const QUESTIONNAIRE: Questionnaire = {
  instrument_version: 'aura-1.0',
  scales: {
    frequency_week: [
      { value: 0, label: 'Did not apply to me at all', short_label: 'Not at all' },
      { value: 1, label: 'Applied to me to some degree, or some of the time', short_label: 'Some of the time' },
      { value: 2, label: 'Applied to me to a considerable degree, or a good part of the time', short_label: 'A good part of the time' },
      { value: 3, label: 'Applied to me very much, or most of the time', short_label: 'Most of the time' },
    ],
    frequency_2wk: [
      { value: 0, label: 'Not at all', short_label: 'Not at all' },
      { value: 1, label: 'Several days', short_label: 'Several days' },
      { value: 2, label: 'More than half the days', short_label: 'More than half the days' },
      { value: 3, label: 'Nearly every day', short_label: 'Nearly every day' },
    ],
  },
  items: [
    week('sup_brightness', 'I had moments when I felt cheerful, calm or content', 'extra'),
    week('dass_01', 'I found it hard to wind down'),
    week('dass_02', 'I was aware of dryness of my mouth'),
    week('dass_03', "I couldn't seem to experience any positive feeling at all"),
    week('dass_04', 'I experienced breathing difficulty (e.g. excessively rapid breathing, breathlessness in the absence of physical exertion)'),
    week('dass_05', 'I found it difficult to work up the initiative to do things'),
    week('dass_06', 'I tended to over-react to situations'),
    week('dass_07', 'I experienced trembling (e.g. in the hands)'),
    week('dass_08', 'I felt that I was using a lot of nervous energy'),
    week('dass_09', 'I was worried about situations in which I might panic and make a fool of myself'),
    week('dass_10', 'I felt that I had nothing to look forward to'),
    week('dass_11', 'I found myself getting agitated'),
    week('dass_12', 'I found it difficult to relax'),
    week('dass_13', 'I felt down-hearted and blue'),
    week('dass_14', 'I was intolerant of anything that kept me from getting on with what I was doing'),
    week('dass_15', 'I felt I was close to panic'),
    week('dass_16', 'I was unable to become enthusiastic about anything'),
    week('dass_17', "I felt I wasn't worth much as a person"),
    week('dass_18', 'I felt that I was rather touchy'),
    week('dass_19', 'I was aware of the action of my heart in the absence of physical exertion (e.g. sense of heart rate increase, heart missing a beat)'),
    week('dass_20', 'I felt scared without any good reason'),
    week('dass_21', 'I felt that life was meaningless'),
    week('sup_anger', 'I felt angry or resentful about things', 'extra'),
    week('sup_tiredness', 'I felt worn out, even after resting', 'extra'),
    week('sup_grief', 'I felt weighed down by a loss, or by missing someone or something', 'extra'),
    week('sup_sadness', 'I felt sad or teary', 'extra'),
    week('mask_hide', 'I put a lot of effort into hiding how I really feel from other people', 'extra'),
    week('mask_push', 'When something upset me, I pushed the feeling down instead of dealing with it', 'extra'),
    { id: 'safe_01', text: 'Have you had thoughts that you would be better off dead, or of hurting yourself in some way?', scale: 'frequency_2wk', section: 'safety' },
  ],
};

export const SUBSCALES = {
  stress: ['dass_01', 'dass_06', 'dass_08', 'dass_11', 'dass_12', 'dass_14', 'dass_18'],
  anxiety: ['dass_02', 'dass_04', 'dass_07', 'dass_09', 'dass_15', 'dass_19', 'dass_20'],
  low_mood: ['dass_03', 'dass_05', 'dass_10', 'dass_13', 'dass_16', 'dass_17', 'dass_21'],
} as const;

// Upper bound (inclusive) of low / mild / moderate after x2; anything above is high.
export const DASS_BANDS: Record<keyof typeof SUBSCALES, [number, number, number]> = {
  stress: [14, 18, 25],
  anxiety: [7, 9, 14],
  low_mood: [9, 13, 20],
};

const r = (o: Omit<CrisisResource, 'id'>): CrisisResource => ({ id: `${o.country_code}-${o.name}`.toLowerCase().replace(/\W+/g, '-'), ...o });

// NOTE: verify every number before launch.
export const RESOURCES: CrisisResource[] = [
  r({ country_code: 'US', name: '988 Suicide & Crisis Lifeline', description: 'Free, confidential support from trained counselors. Call or text.', phone: '988', sms: '988', url: 'https://988lifeline.org', hours: '24/7', is_emergency: false }),
  r({ country_code: 'US', name: 'Emergency services', description: 'If you are in immediate danger.', phone: '911', sms: null, url: null, hours: '24/7', is_emergency: true }),
  r({ country_code: 'IN', name: 'Tele-MANAS', description: 'Free mental health support in many languages. Also reachable on 1-800-891-4416.', phone: '14416', sms: null, url: 'https://telemanas.mohfw.gov.in', hours: '24/7', is_emergency: false }),
  r({ country_code: 'IN', name: 'Emergency services', description: 'If you are in immediate danger.', phone: '112', sms: null, url: null, hours: '24/7', is_emergency: true }),
  r({ country_code: 'UK', name: 'Samaritans', description: 'A safe place to talk, whatever you are going through.', phone: '116 123', sms: null, url: 'https://www.samaritans.org', hours: '24/7', is_emergency: false }),
  r({ country_code: 'UK', name: 'Emergency services', description: 'If you are in immediate danger.', phone: '999', sms: null, url: null, hours: '24/7', is_emergency: true }),
  r({ country_code: 'CA', name: '9-8-8 Suicide Crisis Helpline', description: 'Trained responders, in English and French. Call or text.', phone: '988', sms: '988', url: 'https://988.ca', hours: '24/7', is_emergency: false }),
  r({ country_code: 'CA', name: 'Emergency services', description: 'If you are in immediate danger.', phone: '911', sms: null, url: null, hours: '24/7', is_emergency: true }),
  r({ country_code: 'AU', name: 'Lifeline', description: 'Crisis support and suicide prevention.', phone: '13 11 14', sms: null, url: 'https://www.lifeline.org.au', hours: '24/7', is_emergency: false }),
  r({ country_code: 'AU', name: 'Emergency services', description: 'If you are in immediate danger.', phone: '000', sms: null, url: null, hours: '24/7', is_emergency: true }),
  r({ country_code: 'INTL', name: 'Find a Helpline', description: 'A directory of free, confidential helplines in many countries.', phone: null, sms: null, url: 'https://findahelpline.com', hours: 'Varies by service', is_emergency: false }),
];

export const REPLIES: string[] = [
  "Thank you for telling me. That sounds like a lot to hold at once. What feels heaviest right now?",
  "I'm really glad you reached out. There's no rush here, so take whatever time you need. What's been on your mind most today?",
  "That makes a lot of sense. Anyone in your place might feel the same. Would it help to talk it through a little more?",
  "It sounds like you've been carrying this for a while. You don't have to figure it all out tonight. What would feel like a small kindness to yourself right now?",
  "I hear you. Feelings like this can be exhausting, and it's okay to name them. How is your body feeling as you share this?",
  "That's a really honest thing to say, and it matters. I'm here and listening. What happened just before you started feeling this way?",
  "Some days just ask more of us than others. You're allowed to rest, even if nothing is fixed yet. What usually helps you feel a little steadier?",
  "It sounds like part of you wants to keep going and part of you is tired. Both can be true. Which one needs attention first?",
  "Thank you for trusting me with that. You're not too much, and this isn't too much to talk about. Tell me more whenever you're ready.",
  "I'm sorry it's been so hard lately. You're doing more than you give yourself credit for. What's one thing that went even slightly okay today?",
  "That sounds frustrating, and it's fair to feel that way. Let's slow it down together. Which part keeps coming back to you?",
  "It's okay to not have the words yet. We can simply sit with it for a moment. Would you like to try naming the feeling together?",
];
