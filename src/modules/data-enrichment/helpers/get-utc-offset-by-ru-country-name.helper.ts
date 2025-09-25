const offsets: Record<string, number> = {
  Азербайджан: 4,
  Армения: 4,
  Беларусь: 3,
  Казахстан: 5,
  Кыргызстан: 6,
  Молдова: 3,
  Россия: 3,
  Таджикистан: 5,
  Туркменистан: 5,
  Узбекистан: 5,
  Польша: 2,
  Латвия: 3,
  Литва: 3,
  Эстония: 3,
  Сербия: 2,
};

export const getUtcOffsetByRuCountryName = (countryName: string): number | null => {
  return countryName ? (offsets[countryName] ?? null) : null;
};
