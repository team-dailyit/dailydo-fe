import { clientApi } from '@/shared/api';

import { Collections, UserCollection } from '../model/collection.types';

export const getCollections = () =>
  clientApi.get<Collections>('/api/users/collections');

export const getUserCollection = async (): Promise<UserCollection | null> => {
  try {
    return await clientApi.get<UserCollection>(
      '/api/users/me/collections/featured',
    );
  } catch {
    return null;
  }
};

export const postUserCollection = (collectionId: string) => {
  return clientApi.post('/api/users/me/collections/featured', {
    body: JSON.stringify({ collectionId }),
  });
};

export const deleteUserCollection = (collectionId: string) =>
  clientApi.delete(`/api/users/me/collections/featured`, {
    body: JSON.stringify({ collectionId }),
  });
