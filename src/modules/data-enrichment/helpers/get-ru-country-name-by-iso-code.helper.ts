const codes: Record<string, string> = {
  RU: 'Россия',
  KZ: 'Казахстан',
  UA: 'Украина',
  BY: 'Беларусь',
  UZ: 'Узбекистан',
  TJ: 'Таджикистан',
  KG: 'Киргизия',
  TM: 'Туркменистан',
  AM: 'Армения',
  AZ: 'Азербайджан',
  GE: 'Грузия',
  MD: 'Молдова',
  PL: 'Польша',
  LV: 'Латвия',
  LT: 'Литва',
  EE: 'Эстония',
  RS: 'Сербия',
};

export const getRuCountryNameByIsoCode = (countryIso: string) => {
  return codes[countryIso] ?? null;
};
