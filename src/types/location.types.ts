export interface CountryDTO {
  countryId: number;
  name: string;
  iso2Code: string;
  iso3Code: string;
  phoneCode?: string | null;
}

export interface StateDTO {
  stateId: number;
  name: string;
  lgdCode?: string | null;
  stateOrUt?: string | null;
  countryId: number;
}

export interface DistrictDTO {
  districtId: number;
  name: string;
  lgdCode?: string | null;
  stateId: number;
}
