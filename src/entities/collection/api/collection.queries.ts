import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { collectionQueryKeys } from '../model/collection.constants';
import {
  deleteUserCollection,
  getCollections,
  getUserCollection,
  postUserCollection,
} from './collection.api';

export const useGetCollections = () =>
  useQuery({
    queryKey: collectionQueryKeys.collections,
    queryFn: getCollections,
  });

export const useGetUserCollection = () =>
  useQuery({
    queryKey: collectionQueryKeys.userCollection,
    queryFn: getUserCollection,
  });

export const usePostUserCollection = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (collectionId: string) => postUserCollection(collectionId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: collectionQueryKeys.userCollection,
        }),
        queryClient.invalidateQueries({
          queryKey: collectionQueryKeys.collections,
        }),
      ]);
      options?.onSuccess?.();
    },
  });
};

export const useDeleteUserCollection = (options?: {
  skipOptimisticClear?: boolean;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (collectionId: string) => deleteUserCollection(collectionId),
    onSettled: async () => {
      const invalidations = [
        queryClient.invalidateQueries({
          queryKey: collectionQueryKeys.collections,
        }),
      ];
      if (!options?.skipOptimisticClear) {
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: collectionQueryKeys.userCollection,
          }),
        );
      }
      await Promise.all(invalidations);
    },
  });
};
