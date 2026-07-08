import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

import { collectionQueryKeys } from '@/entities/collection';
import {
  getCollectionsServer,
  getUserCollectionServer,
} from '@/entities/collection';
import { getQueryClient } from '@/shared/api';
import { CollectionPage } from '@/views/mycollections/ui/collection-page';

export default async function Page() {
  const queryClient: QueryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: collectionQueryKeys.userCollection,
      queryFn: getUserCollectionServer,
    }),
    queryClient.prefetchQuery({
      queryKey: collectionQueryKeys.collections,
      queryFn: getCollectionsServer,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CollectionPage />
    </HydrationBoundary>
  );
}
