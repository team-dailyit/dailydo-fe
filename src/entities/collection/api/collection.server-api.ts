import { serverApi } from '@/shared/api/server-fetch-client';

import { Collections, UserCollection } from '../model/collection.types';

export const getCollectionsServer = () =>
  serverApi.get<Collections>('/api/users/collections');

export const getUserCollectionServer = async (): Promise<UserCollection | null> => {
  try {
    return await serverApi.get<UserCollection>(
      '/api/users/me/collections/featured',
    );
  } catch {
    return null;
  }
};
