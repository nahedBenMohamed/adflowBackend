// https://fincalculator.ru/telefon/region-po-nomeru
export class PhoneUserInfoFincalculator {
  phone?: string | null;
  country?: string | null;
  region?: string | null;
  subRegion?: string | null;
  locality?: string | null;
  operator?: string | null;
  // utc offset in hours
  timeZone?: number | null;
}

/*
  Successful response example:

  {
    "phone": "+7 (921) 712-26-91",
    "country": "Россия",
    "region": "Калининградская область",
    "subRegion": "",
    "locality": "",
    "operator": "МегаФон",
    "timeZone": 2
  }
*/
