import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';

import { collectionQueryKeys } from '@/entities/collection';
import { mylogsQueryKeys } from '@/entities/mylogs';
import { ApiError } from '@/shared/api';

import {
  MISSION_TOAST_MESSAGES,
  missionQueryKeys,
} from '../model/mission.constants';
import { Mission, MyLogRequest, type MyMission } from '../model/mission.types';
import {
  getMyMissions,
  getTodayMissions,
  postCompleteMission,
  postTodayMissions,
} from './mission.api';
export const useGetTodayMissions = () =>
  useSuspenseQuery({
    queryKey: missionQueryKeys.todayMissions,
    queryFn: getTodayMissions,
    gcTime: 0,
    staleTime: 1000 * 60 * 5,
  });

export const useGetMyMissions = () =>
  useSuspenseQuery({
    queryKey: missionQueryKeys.myMissions,
    queryFn: getMyMissions,
  });

// TODO: 임시로 사용, 추후 삭제
export const useGetMyMissionsQuery = () =>
  useQuery({
    queryKey: missionQueryKeys.myMissions,
    queryFn: getMyMissions,
  });

export const usePostTodayMissions = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (missionId: number[]) => postTodayMissions(missionId),
    onSuccess: async () => {
      queryClient.setQueryData(
        missionQueryKeys.todayMissions,
        (prev: Mission | undefined) =>
          prev ? { ...prev, status: 'CONFIRMED' as const } : prev,
      );
      await queryClient.invalidateQueries({
        queryKey: missionQueryKeys.myMissions,
      });
      options?.onSuccess?.();
    },
  });
};

export const usePostCompleteMission = (options?: {
  onError?: (message: string) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      mylog,
    }: {
      itemId: number;
      mylog: MyLogRequest;
      localPreview?: string;
    }) => postCompleteMission(itemId, mylog),
    onMutate: async ({ itemId, mylog, localPreview }) => {
      await queryClient.cancelQueries({
        queryKey: missionQueryKeys.myMissions,
      });
      const previousData = queryClient.getQueryData(
        missionQueryKeys.myMissions,
      );
      queryClient.setQueryData(
        missionQueryKeys.myMissions,
        (prev: MyMission | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((item) =>
              item.itemId === itemId
                ? {
                    ...item,
                    completed: true,
                    mylog: {
                      id: 0,
                      photo: localPreview ?? mylog.photo,
                      memo: mylog.memo,
                    },
                  }
                : item,
            ),
          };
        },
      );
      return { previousData };
    },
    onSuccess: async (data) => {
      if (data) {
        queryClient.setQueryData(
          missionQueryKeys.myMissions,
          (prev: MyMission | undefined) => {
            if (!prev) return prev;
            return {
              ...prev,
              items: prev.items.map((item) =>
                item.itemId === data.itemId ? { ...item, ...data } : item,
              ),
            };
          },
        );
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: mylogsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: mylogsQueryKeys.records() }),
        queryClient.invalidateQueries({
          queryKey: collectionQueryKeys.userCollection,
        }),
        queryClient.invalidateQueries({
          queryKey: collectionQueryKeys.collections,
        }),
      ]);
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          missionQueryKeys.myMissions,
          context.previousData,
        );
      }
      const hasMyLog = Boolean(variables.mylog.photo || variables.mylog.memo);
      if (error instanceof ApiError) {
        const message = hasMyLog
          ? `${MISSION_TOAST_MESSAGES.mylogError}`
          : `${MISSION_TOAST_MESSAGES.completeError}`;
        options?.onError?.(message);
      }
    },
  });
};
