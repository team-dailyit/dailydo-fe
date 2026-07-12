import { useGetTodayMissions } from '@/entities/missions/api/mission.queries';
import { MissionItem } from '@/entities/missions/model/mission.types';
import MissionHeader from '@/features/mission/mission-header';
import { MyMissionList } from '@/widgets/missions/ui/my-mission-list';
import { TodayMissionList } from '@/widgets/missions/ui/today-mission-list';

export const MyMissionListPage = () => {
  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className="flex-1" />
      <MissionHeader type="mymission" />
      <MyMissionList />
    </div>
  );
};

interface TodayMissionListPageProps {
  missions: MissionItem[];
  maxSelectableCount: number;
}

export const TodayMissionListPage = ({
  missions,
  maxSelectableCount,
}: TodayMissionListPageProps) => {
  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className="flex-1" />

      <MissionHeader maxSelectableCount={maxSelectableCount} />
      <TodayMissionList
        missions={missions}
        maxSelectableCount={maxSelectableCount}
      />
    </div>
  );
};

export const MissionPage = () => {
  const { data } = useGetTodayMissions();

  return data.status === 'CONFIRMED' ? (
    <MyMissionListPage />
  ) : (
    <TodayMissionListPage
      missions={data.items}
      maxSelectableCount={data.maxSelectableCount}
    />
  );
};
