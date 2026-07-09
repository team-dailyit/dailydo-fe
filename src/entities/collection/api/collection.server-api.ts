import { API_ERRORS, ApiError } from '@/shared/api';
import { serverApi } from '@/shared/api/server';

import { Collections, UserCollection } from '../model/collection.types';

export const getCollectionsServer = () =>
  serverApi.get<Collections>('/api/users/collections');

export const getUserCollectionServer =
  async (): Promise<UserCollection | null> => {
    try {
      return await serverApi.get<UserCollection>(
        '/api/users/me/collections/featured',
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.code === API_ERRORS.EMPTY_RESPONSE.code
      ) {
        return null;
      }
      throw error;
    }
  };
