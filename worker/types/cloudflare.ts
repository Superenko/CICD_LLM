import { Pagination } from '@shared/types/misc';

export type CloudflareErrorParams = {
  message: string;
  code: number;
};

export interface CloudflareResponse<T> {
  result: T[];
  result_info?: Pagination;
}
