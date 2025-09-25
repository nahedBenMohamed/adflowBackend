interface Result {
  dataSource?: string | null;
  abcDefCode?: number | null;
  rangeStart?: number | null;
  rangeEnd?: number | null;
  providerName?: string | null;
  region?: {
    // in seconds
    timezoneOffset?: number | null;
    countryIso?: string | null;
    id?: number | null;
    name?: string | null;
    codes?: {
      iso?: string | null;
      fias?: string | null;
      fips?: string | null;
      kladr?: string | null;
    };
    localityType?: {
      code?: string | null;
      localizedNamesShort?: {
        en?: string | null;
        kz?: string | null;
        ru?: string | null;
      };
      localizedNames?: {
        en?: string | null;
        kz?: string | null;
        ru?: string | null;
      };
    };
    timezone?: string | null;
    countryId?: number | null;
    externalIds?: {
      fias?: string | null;
      fias_gar?: string | null;
      geonames?: string | null;
    };
    localizedNames?: {
      en?: string | null;
      ru?: string | null;
    };
  };
  phoneParts?: {
    countryCode?: string | null;
    code?: string | null;
    number?: string | null;
  };
}

// https://geohelper.info/ru/doc/api/#get/api/v1/phone-data
export interface PhoneUserInfoGeohelper {
  success?: boolean | null;
  language?: string | null;
  result?: Result | null;
}

/*
  Successful response example:

  {
    "success": true,
    "language": "ru",
    "result": {
        "dataSource": "rossvyaz",
        "abcDefCode": 0,
        "rangeStart": 79217100000,
        "rangeEnd": 79217129999,
        "providerName": "ПАО \"МегаФон\"",
        "region": {
            "timezoneOffset": 7200,
            "countryIso": "RU",
            "id": 30,
            "name": "Калининградская",
            "codes": {
                "iso": "RU-KGD",
                "fias": "39",
                "fips": "23",
                "kladr": "3900000000000"
            },
            "localityType": {
                "code": "region-oblast",
                "localizedNamesShort": {
                    "en": "obl.",
                    "kz": "обл.",
                    "ru": "обл."
                },
                "localizedNames": {
                    "en": "oblast",
                    "kz": "облысы",
                    "ru": "область"
                }
            },
            "timezone": "Europe/Kaliningrad",
            "countryId": 189,
            "externalIds": {
                "fias": "90c7181e-724f-41b3-b6c6-bd3ec7ae3f30",
                "fias_gar": "634779",
                "geonames": "554230"
            },
            "localizedNames": {
                "en": "Kaliningradskaya",
                "ru": "Калининградская"
            }
        },
        "phoneParts": {
            "countryCode": "7",
            "code": "921",
            "number": "7122691"
        }
    }
  }
*/
