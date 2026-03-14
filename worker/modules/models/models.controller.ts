import { AuthContext } from '@/types/context';
import { handleApiError } from '@/utils/api';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/utils/constants';

import ModelsService from './models.service';

export const handleGetModels = async (ctx: AuthContext) => {
  try {
    const query = ctx.req.query();
    const { page, perPage, name, syncedAfter, syncedBefore } = parseModelsQuery(query);

    const modelsService = new ModelsService(ctx.env);
    const modelsData = await modelsService.getModels({
      page,
      perPage,
      filters: { name, syncedAfter, syncedBefore }
    });

    return ctx.json(modelsData);
  } catch (error) {
    return ctx.json(
      handleApiError(error, 'An unexpected error occurred while fetching models from database'),
      500
    );
  }
};

export const handleSyncModels = async (ctx: AuthContext) => {
  try {
    const modelsService = new ModelsService(ctx.env);
    const syncResult = await modelsService.syncModels();
    return ctx.json(syncResult);
  } catch (error) {
    return ctx.json(handleApiError(error, 'An unexpected error occurred during model sync'), 500);
  }
};

const parseModelsQuery = (query: Record<string, string>) => {
  const { page, per_page, name, synced_after, synced_before } = query;

  return {
    page: Number(page) || DEFAULT_PAGE,
    perPage: Number(per_page) || DEFAULT_PER_PAGE,
    name,
    syncedAfter: Number(synced_after) || undefined,
    syncedBefore: Number(synced_before) || undefined
  };
};
