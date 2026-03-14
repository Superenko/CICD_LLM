import {
  AirtableApiQueryParams,
  AirtableCredentials,
  AirtableRecord,
  AirtableResponse
} from '@/types/airtable';
import { handleServiceError } from '@/utils/api';

const MODELS_TABLE_NAME = 'index';
const AIRTABLE_API_BASE_URL = 'https://api.airtable.com/v0';

export class AirtableService {
  constructor(private readonly env: Env) {}

  public async getModelsData(): Promise<AirtableResponse['records']> {
    try {
      const airtableCredentials = await this.getAirtableCredentials();

      const modelsData: AirtableResponse['records'] = [];
      const queryParams: AirtableApiQueryParams = {};

      do {
        const response = await this.fetchAirtableRecords(
          airtableCredentials,
          MODELS_TABLE_NAME,
          queryParams
        );

        modelsData.push(...response.records);
        queryParams.offset = response.offset;
      } while (queryParams.offset);

      return modelsData;
    } catch (error) {
      handleServiceError(error, 'Failed to fetch model names from Airtable');
      throw error;
    }
  }

  public async getModelNames(): Promise<string[]> {
    const modelsData = await this.getModelsData();
    return modelsData.map(this.extractModelName);
  }

  public async getAirtableCredentials(): Promise<AirtableCredentials> {
    const baseId = await this.env.ASH_LIST_AIRTABLE_BASE_ID.get();
    const apiKey = await this.env.ASH_LIST_AIRTABLE_KEY.get();

    if (!baseId || !apiKey) {
      throw new Error('Airtable credentials are not configured.');
    }

    return { baseId, apiKey };
  }

  private buildApiUrl(
    baseId: string,
    tableName: string,
    queryParams?: AirtableApiQueryParams
  ): string {
    const { fields, filterByFormula, offset } = queryParams ?? {};
    const searchParams = new URLSearchParams();

    if (fields && Array.isArray(fields)) {
      fields.forEach((field) => searchParams.append('fields[]', field));
    }

    if (filterByFormula) {
      searchParams.set('filterByFormula', filterByFormula);
    }

    if (offset) {
      searchParams.set('offset', offset);
    }

    return `${AIRTABLE_API_BASE_URL}/${baseId}/${tableName}?${searchParams.toString()}`;
  }

  private async fetchAirtableRecords(
    credentials: AirtableCredentials,
    tableName: string,
    queryParams?: AirtableApiQueryParams
  ): Promise<AirtableResponse> {
    const { baseId, apiKey } = credentials;

    const url = this.buildApiUrl(baseId, tableName, queryParams);
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }

    return response.json<AirtableResponse>();
  }

  private extractModelName(record: AirtableRecord): string {
    const { Name } = record.fields;
    if (!Name) return '';
    return Name;
  }
}
