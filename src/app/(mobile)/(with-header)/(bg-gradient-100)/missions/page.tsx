import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { Suspense } from 'react';

import { missionQueryKeys } from '@/entities/missions/model/mission.constants';
import { getTodayMissionsServer } from '@/entities/missions/server';
import { getQueryClient } from '@/shared/api/server';
import { Loader } from '@/shared/ui/loader';
import { MissionPage } from '@/views/mission';

const fallback = (
  <div className="flex h-full w-full items-center justify-center">
    <Loader color="primary" size="lg" />
  </div>
);

export default async function Page() {
  const queryClient: QueryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: missionQueryKeys.todayMissions,
    queryFn: getTodayMissionsServer,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={fallback}>
        <MissionPage />
      </Suspense>
    </HydrationBoundary>
  );
}
