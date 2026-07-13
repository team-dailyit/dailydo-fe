'use client';

import { useState } from 'react';

import { useGetMyMissionsQuery } from '@/entities/missions';
import { useGetMe, usePatchMe } from '@/entities/user';
import { Button } from '@/shared/ui/button';
import { FallbackUI } from '@/shared/ui/fallback-ui';
import { useToast } from '@/shared/ui/toast';
import {
  CategorySection,
  CategorySectionSkeleton,
  CollectionSection,
  CollectionSectionSkeleton,
  MissionStatusSection,
  MissionStatusSectionSkeleton,
  MyStatusSection,
  MyStatusSectionSkeleton,
  ProfileBottomSheet,
  ProfileEditFormValues,
  ProfileSection,
  ProfileSectionSkeleton,
} from '@/widgets/mypage';

const MypageSkeleton = () => (
  <>
    <ProfileSectionSkeleton />
    <div className="flex flex-col gap-6">
      <MissionStatusSectionSkeleton />
      <MyStatusSectionSkeleton />
      <CollectionSectionSkeleton />
      <CategorySectionSkeleton />
    </div>
  </>
);

export const Mypage = () => {
  const { data: user, isPending, isError, refetch } = useGetMe();
  const {
    data: myMissions,
    isPending: isMissionsPending,
    isError: isMissionsError,
    refetch: refetchMissions,
  } = useGetMyMissionsQuery();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { mutate: updateProfile, isPending: isPatchPending } = usePatchMe();
  const { toast } = useToast();

  const handleProfileSubmit = (
    values: ProfileEditFormValues,
    profileImageUrl: string | null | undefined,
  ) => {
    updateProfile(
      {
        name: values.name,
        description: values.description,
        ...(profileImageUrl !== undefined && { profileImage: profileImageUrl }),
      },
      {
        onSuccess: () => {
          toast({ type: 'success', message: '내 정보 수정을 완료했어요.' });
          setIsEditOpen(false);
        },
        onError: () => {
          toast({
            type: 'error',
            message: '내 정보 수정에 실패했어요. 다시 시도해주세요.',
          });
        },
      },
    );
  };

  const handleEditOpen = () => {
    if (isPending) return;
    setIsEditOpen(true);
  };

  return (
    <div className="h-full w-full pt-20">
      <div className="relative h-full w-full bg-green-100">
        {isError || isMissionsError ? (
          <FallbackUI
            onReset={() => {
              refetch();
              refetchMissions();
            }}
          />
        ) : (
          <>
            <div className="ml-auto flex w-fit gap-1 px-5 pt-4">
              <Button variant="secondary" size="sm" onClick={handleEditOpen}>
                프로필 수정
              </Button>
            </div>
            {user && (
              <ProfileBottomSheet
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                defaultValues={{
                  name: user.name,
                  description: user.description,
                  profileImage: user.profileImage,
                }}
                onSubmit={handleProfileSubmit}
                isLoading={isPatchPending}
              />
            )}

            <div className="flex flex-col gap-5 p-5">
              {isPending || !user || isMissionsPending || !myMissions ? (
                <MypageSkeleton />
              ) : (
                <>
                  <ProfileSection
                    profileImage={user.profileImage}
                    name={user.name}
                    email={user.email}
                    description={user.description}
                  />
                  <div className="flex flex-col gap-6">
                    <MissionStatusSection myMissions={myMissions} />
                    <MyStatusSection
                      footprint={user.footprint}
                      createdAt={user.createdAt}
                    />
                    <CollectionSection />
                    <CategorySection
                      categories={user.categories.data.filter(
                        (category) => category.name !== '스페셜',
                      )}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
