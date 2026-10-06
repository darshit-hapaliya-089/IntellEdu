/**
 * Local, offline AI Tutor reply generator.
 *
 * In a live deployment this is where the backend LLM call would sit. The shape
 * is intentionally the same — a question in, a structured study answer out — so
 * swapping in a real API later touches only this file.
 */

interface TopicMatch {
  keywords: string[];
  build: (question: string) => string;
}

const TOPICS: TopicMatch[] = [
  {
    keywords: ['newton', 'force', 'motion', 'velocity', 'speed', 'gravity', 'acceleration'],
    build: (q) => [
      `Great physics question: "${q}"`,
      '',
      'Here is the step-by-step approach:',
      '1. Identify the known quantities and the unknown you need.',
      '2. Choose the right law — for motion, use the equations of motion; for forces, use Newton\u2019s laws.',
      '3. Substitute the values, keeping units consistent (metres, seconds, kilograms).',
      '4. Solve for the unknown and check that the units match.',
      '',
      'Key reminder: velocity is a vector (needs direction) while speed is a scalar.',
    ].join('\n'),
  },
  {
    keywords: ['photosynthesis', 'cell', 'heart', 'digest', 'respiration', 'plant', 'blood'],
    build: (q) => [
      `Nice biology question: "${q}"`,
      '',
      'Think about it in three layers:',
      '1. The STRUCTURE involved (organelle, organ or system).',
      '2. The FUNCTION it performs and why the body/plant needs it.',
      '3. The CONNECTION to other processes (for example, photosynthesis links to respiration).',
      '',
      'Tip: draw a quick labelled diagram — it makes the relationship between parts obvious.',
    ].join('\n'),
  },
  {
    keywords: ['python', 'code', 'function', 'algorithm', 'loop', 'variable', 'array'],
    build: (q) => [
      `Coding doubt noted: "${q}"`,
      '',
      'Break it down like this:',
      '1. Restate the problem in one sentence: what goes in, what comes out?',
      '2. Write the logic in plain words before writing code.',
      '3. Code it in small steps and print intermediate values to check each one.',
      '4. Test with an edge case (empty input, zero, or a single element).',
      '',
      'Remember: a clean function does one thing and has a clear name.',
    ].join('\n'),
  },
  {
    keywords: ['equation', 'solve', 'algebra', 'geometry', 'triangle', 'angle', 'fraction', 'percentage'],
    build: (q) => [
      `Let\u2019s solve this maths problem: "${q}"`,
      '',
      'Method:',
      '1. Write down what is given and what is asked.',
      '2. Choose the formula or identity that connects them.',
      '3. Rearrange to isolate the unknown, then substitute.',
      '4. Verify by plugging your answer back into the original statement.',
      '',
      'Watch out for sign errors — they are the most common slip in algebra.',
    ].join('\n'),
  },
  {
    keywords: ['grammar', 'tense', 'essay', 'synonym', 'antonym', 'preposition', 'paragraph'],
    build: (q) => [
      `English question: "${q}"`,
      '',
      'Here is how to approach it:',
      '1. Identify the grammar rule or the exact word meaning involved.',
      '2. Find the subject and verb first — agreement drives most answers.',
      '3. For writing, plan the structure: introduction, two or three points, conclusion.',
      '',
      'Tip: read the sentence aloud; what is wrong usually becomes obvious.',
    ].join('\n'),
  },
];

const GENERAL_REPLY = (q: string): string =>
  [
    `Good question: "${q}"`,
    '',
    'Here is a reliable study framework for any subject:',
    '1. Clarify exactly what is being asked — restate it in your own words.',
    '2. Recall the key concept or formula at play.',
    '3. Work through the logic step by step, writing each step down.',
    '4. Summarise the answer in one clear sentence.',
    '',
    'Ask a follow-up if you want me to go deeper on any step.',
  ].join('\n');

/** Build a structured tutor reply for the given question. */
export function generateTutorReply(question: string): string {
  const lower = question.toLowerCase();
  const match = TOPICS.find((topic) => topic.keywords.some((word) => lower.includes(word)));
  return match ? match.build(question) : GENERAL_REPLY(question);
}
