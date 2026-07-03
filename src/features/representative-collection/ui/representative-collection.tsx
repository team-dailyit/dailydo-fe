'use client';

import Image from 'next/image';
import { useState } from 'react';

import type { UserCollection } from '@/entities/collection';
import { useDeleteUserCollection } from '@/entities/collection';
import { Button } from '@/shared/ui/button/button';
import QuestionBackIcon from '@/shared/ui/icons/mission/question_back.svg';
import { useToast } from '@/shared/ui/toast';

import { CollectionBottomSheet } from './collection-bottom-sheet';

interface RepresentativeCollectionProps {
  userCollection?: UserCollection | null;
  isPending: boolean;
}

export const RepresentativeCollection = ({
  userCollection,
  isPending,
}: RepresentativeCollectionProps) => {
  const [open, setIsOpen] = useState(false);

  const { mutateAsync: deleteUserCollection, isPending: isDeleting } =
    useDeleteUserCollection();
  const { toast } = useToast();

  const handleDeleteCollection = async () => {
    if (!userCollection) return;
    try {
      await deleteUserCollection(userCollection.id);
      toast({ message: '대표 컬렉션 설정이 해제되었습니다.', type: 'success' });
      setIsOpen(false);
    } catch {
      toast({
        message: '대표 컬렉션 설정 해제에 실패하였습니다.',
        type: 'error',
      });
    }
  };

  return (
    <>
      <button
        className="relative flex flex-col items-center pt-4"
        onClick={() => userCollection && setIsOpen(true)}
        disabled={!userCollection}
        type="button"
      >
        <h4 className="z-10 -mb-2 rounded-xl bg-white px-2 py-1 text-sm font-bold text-green-600 shadow">
          나의 대표 컬렉션
        </h4>
        <div className="relative flex items-center justify-center">
          <div className="absolute h-38 w-38 rounded-full border-[6px] border-green-500" />
          <div className="absolute h-34.5 w-34.5 rounded-full border-[6px] border-green-400" />
          <div className="relative flex h-31.5 w-31.5 items-center justify-center overflow-hidden rounded-full bg-green-100">
            {userCollection ? (
              <Image
                src={userCollection.image}
                alt=""
                width={80}
                height={80}
                className="object-cover"
                sizes="80px"
                priority={true}
              />
            ) : (
              <QuestionBackIcon className="h-10 w-auto" />
            )}
          </div>
        </div>
        {!isPending && (
          <p className="absolute -bottom-4 z-10 rounded-sm bg-green-600 px-2 py-1 text-xs font-semibold whitespace-nowrap text-white">
            {userCollection?.title ?? '대표 컬렉션이 설정되지 않았어요.'}
          </p>
        )}
      </button>

      {userCollection && (
        <CollectionBottomSheet
          open={open}
          onOpenChange={setIsOpen}
          id={userCollection.id}
          src={userCollection.image}
          title={userCollection.title}
          description={userCollection.description}
          type={userCollection.type}
          requirements={[]}
          completed={true}
          action={
            <Button
              variant="secondary"
              type="button"
              onClick={handleDeleteCollection}
              isLoading={isDeleting}
            >
              대표 컬렉션에서 해제
            </Button>
          }
        />
      )}
    </>
  );
};
