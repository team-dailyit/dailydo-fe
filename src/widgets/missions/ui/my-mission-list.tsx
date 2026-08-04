'use client';

import confetti from 'canvas-confetti';
import Image from 'next/image';
import { useRef, useState } from 'react';
import type { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import {
  MISSION_TOAST_MESSAGES,
  MyMissionItem,
  UnlockedCollection,
  useGetMyMissions,
  usePostCompleteMission,
} from '@/entities/missions';
import { Card } from '@/features/card';
import { MyLogBottomSheet } from '@/features/mylogs';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button/button';
import { useToast } from '@/shared/ui/toast';
import { cn } from '@/shared/utils/cn';

interface UnlockedCollectionsBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: UnlockedCollection[];
}

const UnlockedCollectionsBottomSheet = ({
  open,
  onOpenChange,
  collections,
}: UnlockedCollectionsBottomSheetProps) => (
  <BottomSheet.Root open={open} onOpenChange={onOpenChange}>
    <BottomSheet.Content>
      <BottomSheet.Header>
        <BottomSheet.Title>새 컬렉션을 획득했어요!</BottomSheet.Title>
      </BottomSheet.Header>
      <BottomSheet.Body className="flex flex-col gap-4 pb-2">
        {collections.map((collection) => (
          <div
            key={collection.collectionId}
            className="flex flex-col items-center gap-2 text-center"
          >
            <Image
              src={collection.image}
              alt={collection.title}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
            <div className="flex flex-col gap-1">
              <span className="text-base font-semibold text-gray-900">
                {collection.title}
              </span>
              <span className="text-sm text-gray-500">
                {collection.description}
              </span>
            </div>
          </div>
        ))}
      </BottomSheet.Body>
      <BottomSheet.Footer>
        <BottomSheet.Close asChild>
          <Button variant="primary" type="button" className="w-full">
            확인
          </Button>
        </BottomSheet.Close>
      </BottomSheet.Footer>
    </BottomSheet.Content>
  </BottomSheet.Root>
);

interface MyMissionBackContentProps {
  mission: MyMissionItem;
  onCompleteClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const MyMissionBackContent = ({
  mission,
  onCompleteClick,
}: MyMissionBackContentProps) => {
  return (
    <>
      <span
        className={cn(
          'rounded-2xl px-2 py-1 text-xs font-normal',
          mission?.completed ? 'bg-white' : 'bg-gray-100',
          mission?.completed
            ? mission.isSpecial
              ? 'text-special-text-color'
              : 'text-green-600'
            : 'text-gray-600',
        )}
      >
        {mission.isSpecial ? '히든 미션' : mission.categoryName}
      </span>
      <p
        className={cn(
          'text-center text-xl font-semibold break-keep',
          mission?.completed ? 'text-white' : 'text-gray-800',
        )}
      >
        {mission.title}
      </p>
      <Image
        src={
          mission.completed
            ? (mission.mylog?.photo ?? mission.image)
            : mission.image
        }
        alt={mission.title}
        width={147}
        height={147}
        className={cn(
          'rounded-lg object-cover transition-all duration-500 ease-out',
          mission?.completed ? 'aspect-4/3 w-36.75' : 'h-20 w-20',
        )}
      />
      {mission?.completed && (
        <span className="animate-slide-up w-full overflow-hidden text-center text-xs font-normal text-ellipsis whitespace-nowrap text-white">
          {mission?.mylog?.memo}
        </span>
      )}
      {!mission?.completed && (
        <Button
          variant="primary"
          size="md"
          onClick={onCompleteClick}
          type="button"
        >
          완료하기
        </Button>
      )}
    </>
  );
};

export const MyMissionCard = ({ mission }: { mission: MyMissionItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUnlockedOpen, setIsUnlockedOpen] = useState(false);
  const [unlockedCollections, setUnlockedCollections] = useState<
    UnlockedCollection[]
  >([]);
  const { toast } = useToast();
  const { mutate, isPending } = usePostCompleteMission({
    onError: (message) => {
      toast({ type: 'error', message });
      setIsOpen(true);
    },
  });

  const handleCompleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleSubmit = (
    photo: string | null,
    memo: string,
    localPreview?: string,
  ) => {
    mutate(
      {
        itemId: mission.itemId,
        mylog: { photo: photo ?? '', memo },
        localPreview,
      },
      {
        onSuccess: (data) => {
          toast({
            message: `${MISSION_TOAST_MESSAGES.completeSuccess}`,
            type: 'success',
          });
          setIsOpen(false);
          if (
            data?.unlockedCollections &&
            data.unlockedCollections.length > 0
          ) {
            setUnlockedCollections(data.unlockedCollections);
            setIsUnlockedOpen(true);
            setTimeout(() => {
              confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
                zIndex: 9999,
              });
            }, 100);
          }
        },
      },
    );
  };

  return (
    <>
      <Card
        isSpecial={mission.isSpecial}
        defaultFlipped
        isCompleted={mission.completed}
      >
        <Card.Back>
          <MyMissionBackContent
            mission={mission}
            onCompleteClick={handleCompleteClick}
          />
        </Card.Back>
      </Card>
      <MyLogBottomSheet
        open={isOpen}
        setOpen={setIsOpen}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
      <UnlockedCollectionsBottomSheet
        open={isUnlockedOpen}
        onOpenChange={setIsUnlockedOpen}
        collections={unlockedCollections}
      />
    </>
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

export const MyMissionList = () => {
  const { data } = useGetMyMissions();
  const swiperRef = useRef<SwiperClass | null>(null);

  const missions = data.items;

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
        >
          {missions.map((mission) => (
            <SwiperSlide key={mission.itemId} className="w-56.25!">
              <div data-card-wrapper>
                <MyMissionCard mission={mission} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="flex-2" />
    </>
  );
};
