export interface AirtableCredentials {
  baseId: string;
  apiKey: string;
}

export interface AirtableApiQueryParams {
  fields?: string[];
  filterByFormula?: string;
  offset?: string;
}

export interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

export interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: {
    Name?: string;
  };
}
