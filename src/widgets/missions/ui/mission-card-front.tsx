'use client';

import { useCard } from '@/features/card';
import QuestionBackIcon from '@/shared/ui/icons/mission/question_back.svg';
import SpecialBackIcon from '@/shared/ui/icons/mission/special_back.svg';
import { cn } from '@/shared/utils/cn';

export const MissionCardFront = () => {
  const { isSpecial } = useCard();
  return (
    <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4">
      {isSpecial ? (
        <div className="bg-special - flex h-20 w-20 items-center justify-center rounded-full">
          <SpecialBackIcon className="h-20 w-20 animate-pulse" />
        </div>
      ) : (
        <div className="--shadow-card flex h-20 w-20 items-center justify-center rounded-full bg-green-300">
          <QuestionBackIcon className="h-7.5 w-auto animate-pulse" />
        </div>
      )}
      <div className="--shadow-card rounded-3xl bg-green-100 px-3 py-1">
        <span
          className={cn(
            'text-xl font-semibold',
            isSpecial ? 'text-special-text-color' : 'text-green-500',
          )}
        >
          {isSpecial ? '스페셜 미션' : '오늘의 미션'}
        </span>
      </div>
      <span className="animate-pulse text-sm text-white">탭해서 확인하기</span>
    </div>
  );
};
