'use client';

import { useGetMyMissions, useGetTodayMissions } from '@/entities/missions';

export const MissionBadge = () => {
  const { data: todayMissions } = useGetTodayMissions();
  const { data: myMissions } = useGetMyMissions();

  const missionStatus =
    todayMissions?.status === 'ARRIVED'
      ? 'N'
      : myMissions?.items.filter((item) => !item.completed).length;

  return (
    <span className="h-4 rounded-full bg-green-500 px-1.75 text-xs font-semibold text-white">
      {missionStatus}
    </span>
  );
};
