'use client';

import { MyMission } from '@/entities/missions';
import CheckCircle from '@/shared/ui/icons/mypage/check_circle.svg';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { TextSkeleton } from '@/shared/ui/skeleton';

import { sectionLabelClass } from './mypage.styles';

export const MissionStatusSectionSkeleton = () => (
  <section className="flex flex-col gap-2">
    <h4 className={sectionLabelClass}>오늘의 완료율</h4>
    <div className="rounded-2xl bg-white px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <CheckCircle width={24} aria-hidden="true" />
        <ProgressBar value={0} />
        <TextSkeleton variant="sm" className="w-6 shrink-0" />
      </div>
    </div>
  </section>
);

interface Props {
  myMissions: MyMission;
}

export const MissionStatusSection = ({ myMissions }: Props) => {
  const totalCount = myMissions.items.length;
  const completedCount = myMissions.items.filter(
    (item) => item.completed,
  ).length;

  return (
    <section className="flex flex-col gap-2">
      <h4 className={sectionLabelClass}>오늘의 완료율</h4>
      <div className="rounded-2xl bg-white px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <CheckCircle width={24} aria-hidden="true" />
          <ProgressBar
            value={totalCount === 0 ? 0 : completedCount / totalCount}
          />
          <div className="flex min-w-6 shrink-0 text-center text-sm font-semibold text-gray-600">
            <span className="text-green-500">{completedCount}</span>/
            {totalCount}
          </div>
        </div>
      </div>
    </section>
  );
};
