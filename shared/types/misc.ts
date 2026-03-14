export interface Pagination {
  page?: number;
  per_page?: number;
  count?: number;
  total_count?: number;
  total_pages?: number;
}

export interface SyncResult {
  upsertedCount: number;
  deletedCount: number;
}
