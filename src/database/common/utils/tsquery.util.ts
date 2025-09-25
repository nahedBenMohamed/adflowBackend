export const buildSearchParams = (input: string): string => {
  if (!input) return undefined;

  const phoneRegex = /(?:\+?\d[\d\s().-]{4,}\d)/g;

  // Extract and normalize phone numbers
  const phoneNumbers = Array.from(input.matchAll(phoneRegex), (match) => match[0].replace(/\D/g, ''));

  // Remove phones from text
  const cleanedInput = input.replace(phoneRegex, ' ');

  // Split into tokens
  const tokens = cleanedInput
    .trim()
    .replace(/[:&`'!()*]+/g, '') // safely remove tsquery special symbols
    .split(/\s+/)
    .map(
      (token) =>
        /^[\w@.]+$/.test(token)
          ? token.toLowerCase() // keep as-is if safe (email/domain/etc.)
          : token.toLowerCase().replace(/^[^\p{L}\p{N}@]+|[^\p{L}\p{N}@]+$/gu, ''), // trim edges
    )
    .filter((token) => token.length >= 3); // remove short words

  const allTerms = [...tokens, ...phoneNumbers, ...phoneNumbers.map((n) => '+' + n)];

  return allTerms.map((t) => `${t}:*`).join(' | ');
};
