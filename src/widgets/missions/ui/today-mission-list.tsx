'use client';

import 'swiper/css';

import Image from 'next/image';
import { useRef, useState } from 'react';
import type { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import {
  MISSION_TOAST_MESSAGES,
  MissionItem,
  useMissionCardState,
  usePostTodayMissions,
} from '@/entities/missions';
import { Card, useCard } from '@/features/card';
import { Button } from '@/shared/ui/button';
import { useToast } from '@/shared/ui/toast';
import { cn } from '@/shared/utils/cn';

import {
  categoryBadgeStyles,
  getMissionSelectionVariant,
  titleStyles,
} from './mission-card.styles';
import { MissionCardFront } from './mission-card-front';

interface TodayMissionBackContentProps {
  mission: MissionItem;
  selected: boolean;
  onSelect: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onSkip: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const TodayMissionBackContent = ({
  mission,
  selected,
  onSelect,
  onSkip,
  onCancel,
}: TodayMissionBackContentProps) => {
  const { isSpecial } = useCard();
  const selectionVariant = getMissionSelectionVariant(selected, isSpecial);

  return (
    <>
      <span
        className={cn(
          'rounded-2xl px-2 py-1 text-xs font-normal',
          categoryBadgeStyles[selectionVariant],
        )}
      >
        {mission.categoryName}
      </span>
      <p
        className={cn(
          'text-center text-xl font-semibold [word-break:auto-phrase]',
          titleStyles[selectionVariant],
        )}
      >
        {mission.title}
      </p>
      <Image
        src={mission.image}
        alt={mission.title}
        width={80}
        height={80}
        className="rounded-full object-cover"
      />
      <div
        className={cn(
          '-mt-3 grid transition-all duration-300',
          selected
            ? 'grid-rows-[1fr] opacity-100'
            : 'pointer-events-none grid-rows-[0fr] opacity-0',
        )}
      >
        <span className="overflow-hidden text-xs font-bold text-gray-600">
          {`${mission.totalCompletedCount}명이 미션에 도전했어요!`}
        </span>
      </div>
      <div className="flex items-center justify-center gap-2">
        {selected ? (
          <Button variant="tertiary" size="md" onClick={onCancel} type="button">
            취소하기
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={onSkip}
              type="button"
            >
              넘기기
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={onSelect}
              type="button"
            >
              선택하기
            </Button>
          </>
        )}
      </div>
    </>
  );
};

interface TodayMissionCardProps {
  mission: MissionItem;
  isActive?: boolean;
  onSelect?: (id: number) => boolean;
  onCancel?: (id: number) => void;
  onSkip?: (id: number) => void;
}

export const TodayMissionCard = ({
  mission,
  isActive = true,
  onSelect,
  onCancel,
  onSkip,
}: TodayMissionCardProps) => {
  const { clicked, click, cancel } = useMissionCardState();

  const handleSelect = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const success = onSelect?.(mission.missionId);
    if (success) click();
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    cancel();
    onCancel?.(mission.missionId);
  };

  const handleSkip = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onSkip?.(mission.missionId);
  };

  return (
    <Card isSpecial={mission.isSpecial} disabled={!isActive}>
      <Card.Front>
        <MissionCardFront />
      </Card.Front>
      <Card.Back selected={clicked}>
        <TodayMissionBackContent
          mission={mission}
          selected={clicked}
          onSelect={handleSelect}
          onCancel={handleCancel}
          onSkip={handleSkip}
        />
      </Card.Back>
    </Card>
  );
};

const applySlideEffects = (swiper: SwiperClass) => {
  swiper.slides.forEach((slide) => {
    const el = slide as HTMLElement & { progress: number };
    const progress = Math.max(-1, Math.min(1, el.progress ?? 0));
    const wrapper = el.querySelector<HTMLElement>('[data-card-wrapper]');
    if (!wrapper) return;
    const absProgress = Math.abs(progress);
    wrapper.style.transform = `rotate(${progress * 6}deg) translateY(${absProgress * 16}px)`;
    wrapper.style.opacity = absProgress > 0 ? '0.5' : '1';
  });
};

interface TodayMissionListProps {
  missions: MissionItem[];
  maxSelectableCount: number | undefined;
}

export const TodayMissionList = ({
  missions,
  maxSelectableCount,
}: TodayMissionListProps) => {
  const { mutate: postTodayMissions, isPending } = usePostTodayMissions();
  const { toast } = useToast();
  const swiperRef = useRef<SwiperClass | null>(null);
  const [activeRealIndex, setActiveRealIndex] = useState(0);

  const [selectedMissionIds, setSelectedMissionIds] = useState<number[]>([]);

  const handleSelect = (id: number): boolean => {
    if (maxSelectableCount === undefined) return false;
    if (selectedMissionIds.length >= maxSelectableCount) {
      toast({ type: 'error', message: MISSION_TOAST_MESSAGES.maxSelectError });
      return false;
    }
    setSelectedMissionIds((prev) => [...prev, id]);
    return true;
  };

  const handleCancel = (id: number) => {
    setSelectedMissionIds((prev) => prev.filter((mId) => mId !== id));
  };

  const handleSkip = () => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    const nextIndex =
      swiper.realIndex + 1 >= missions.length ? 0 : swiper.realIndex + 1;
    swiper.slideTo(nextIndex);
  };

  const handleConfirm = () => {
    postTodayMissions(selectedMissionIds);
  };

  const handleSlideChangeStart = (swiper: SwiperClass) => {
    swiper.slides.forEach((slide) => {
      const wrapper = slide.querySelector<HTMLElement>('[data-card-wrapper]');
      if (wrapper)
        wrapper.style.transition = `transform ${swiper.params.speed}ms ease, opacity ${swiper.params.speed}ms ease`;
    });
    applySlideEffects(swiper);
  };

  const handleSlideChangeEnd = (swiper: SwiperClass) => {
    swiper.slides.forEach((slide) => {
      const wrapper = slide.querySelector<HTMLElement>('[data-card-wrapper]');
      if (wrapper) wrapper.style.transition = '';
    });
  };

  const handleTouchStart = (swiper: SwiperClass) => {
    swiper.slides.forEach((slide) => {
      const wrapper = slide.querySelector<HTMLElement>('[data-card-wrapper]');
      if (wrapper) wrapper.style.transition = '';
    });
  };

  return (
    <>
      <div className="w-full overflow-x-clip overflow-y-visible">
        <Swiper
          slidesPerView="auto"
          centeredSlides
          spaceBetween={24}
          loop={false}
          grabCursor
          watchSlidesProgress
          style={{ overflow: 'visible' }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onInit={applySlideEffects}
          onSetTranslate={applySlideEffects}
          onTouchStart={handleTouchStart}
          onSlideChangeTransitionStart={handleSlideChangeStart}
          onSlideChangeTransitionEnd={handleSlideChangeEnd}
          onRealIndexChange={(swiper) => setActiveRealIndex(swiper.realIndex)}
        >
          {missions.map((mission, index) => (
            <SwiperSlide key={mission.missionId} className="!w-[225px]">
              <div data-card-wrapper>
                <TodayMissionCard
                  mission={mission}
                  isActive={index === activeRealIndex}
                  onSelect={handleSelect}
                  onCancel={handleCancel}
                  onSkip={handleSkip}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="flex-2" />
      <div className="mt-auto w-full shrink-0 px-8 pb-9.5">
        <Button
          variant="primary"
          size="lg"
          onClick={handleConfirm}
          disabled={selectedMissionIds.length === 0}
          isLoading={isPending}
          type="button"
        >
          {selectedMissionIds.length === 0
            ? '미션을 선택해주세요'
            : selectedMissionIds.length === maxSelectableCount
              ? '이대로 선택할게요'
              : `${selectedMissionIds.length}개 선택했어요`}
        </Button>
      </div>
    </>
  );
};
