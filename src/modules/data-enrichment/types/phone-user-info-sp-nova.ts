export interface UserInfoContentSpNova {
  operator?: string | null;
  country?: string | null;
  region?: string | null;
  district?: string | null;
  city?: string | null;
  // hh:mm:ss
  time?: string | null;
  // in UTC+0200 format
  timezone?: string | null;
}

// https://sp1-nova.ru/api/phones-data/
export type PhoneUserInfoSpNova = Record<string, UserInfoContentSpNova>;

/*
  Successful response example:

  {
    "+79217122691": {
        "operator": "Мегафон",
        "country": "Россия",
        "region": "Калининградская область",
        "district": null,
        "city": null,
        "time": "11:04:16",
        "timezone": "UTC+0200"
    }
  }
*/
