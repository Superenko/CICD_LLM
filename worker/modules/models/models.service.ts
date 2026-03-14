import type { GetModelsOptions, Model, ModelsData } from '@shared/types/models';

import { SyncResult } from '@shared/types/misc';

import { AirtableService } from '@/services/airtable.service';
import { CloudflareService } from '@/services/cloudflare.service';
import { handleServiceError } from '@/utils/api';

import ModelsRepository from './models.repository';

class ModelsService {
  private readonly repository: ModelsRepository;
  private readonly cloudflareService: CloudflareService;
  private readonly airtableService: AirtableService;

  constructor(env: Env) {
    this.repository = new ModelsRepository(env);
    this.cloudflareService = new CloudflareService(env);
    this.airtableService = new AirtableService(env);
  }

  public async getModels(options?: GetModelsOptions): Promise<ModelsData> {
    try {
      return this.repository.findMany(options);
    } catch (error) {
      handleServiceError(error, 'An unexpected error occurred while fetching models from database');
      throw error;
    }
  }

  public async syncModels(): Promise<SyncResult> {
    try {
      const availableModelNames = await this.getAvailableModelNames();

      const { upsertedCount } = await this.repository.bulkUpsert(availableModelNames);
      const { deletedCount } = await this.deleteMissingModels(availableModelNames);

      console.log('🔄 Models synchronization completed', {
        upsertedCount,
        deletedCount
      });

      return { upsertedCount, deletedCount };
    } catch (error) {
      handleServiceError(error, 'An unexpected error occurred while syncing models from Airtable');
      throw error;
    }
  }

  private async getAvailableModelNames(): Promise<string[]> {
    try {
      const [modelPagesProjects, airtableModelNames] = await Promise.all([
        this.cloudflareService.getModelPagesProjects(),
        this.airtableService.getModelNames()
      ]);

      const deployedModelNames = modelPagesProjects
        ?.map((project) => project?.name)
        .filter((name): name is string => Boolean(name));

      const availableModelNames = airtableModelNames.filter(
        (model) => !deployedModelNames?.includes(model)
      );

      return availableModelNames;
    } catch (error) {
      handleServiceError(
        error,
        'An unexpected error occurred while fetching available model names'
      );
      return [];
    }
  }

  private async deleteMissingModels(
    remoteModels: Model['name'][]
  ): Promise<{ deletedCount: number }> {
    const validModelNames = this.getValidModelNames(remoteModels);
    const namesToDelete = await this.findModelsToDelete(validModelNames);

    if (!namesToDelete.length) return { deletedCount: 0 };

    return this.repository.bulkDelete(namesToDelete);
  }

  private getValidModelNames(modelNames: Model['name'][]): Set<string> {
    return new Set(modelNames.filter((name): name is string => Boolean(name)));
  }

  private async findModelsToDelete(validModelNames: Set<string>): Promise<string[]> {
    const existingModels = await this.repository.findAll();
    return existingModels
      .map((m) => m.name)
      .filter((name): name is string => Boolean(name) && !validModelNames.has(name));
  }
}

export default ModelsService;
