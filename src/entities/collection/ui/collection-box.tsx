'use client';
import Image from 'next/image';
import { useState } from 'react';

import type { Collection } from '@/entities/collection';
import {
  useDeleteUserCollection,
  usePostUserCollection,
} from '@/entities/collection';
import { CollectionBottomSheet } from '@/features/representative-collection';
import { Button } from '@/shared/ui/button/button';
import LockedIcon from '@/shared/ui/icons/collections/locked.svg';
import SpecialCollectionIcon from '@/shared/ui/icons/collections/special_collection.svg';
import { Skeleton, TextSkeleton } from '@/shared/ui/skeleton';
import { useToast } from '@/shared/ui/toast';
import { cn } from '@/shared/utils/cn';

export const CollectionSkeleton = () => {
  return (
    <li>
      <div className="flex h-24 w-full flex-col items-center justify-center gap-1">
        <div className="flex w-20 flex-col items-center justify-center">
          <Skeleton variant="lg" />
        </div>
        <TextSkeleton variant="sm" className="w-14" />
      </div>
    </li>
  );
};

interface CollectionBoxProps extends Collection {
  isRepresentative?: boolean;
  completed?: boolean;
  currentRepresentativeId?: string;
}

export const CollectionBox = ({
  id,
  src,
  title,
  type,
  description,
  requirements,
  isRepresentative = false,
  completed = false,
  acquisitionRate,
  currentRepresentativeId,
}: CollectionBoxProps) => {
  const isSpecial = type === 'SPECIAL';
  const [open, setIsOpen] = useState(false);
  const { mutateAsync: postUserCollection, isPending: isPosting } =
    usePostUserCollection();
  const { mutateAsync: deleteUserCollection, isPending: isDeleting } =
    useDeleteUserCollection();
  const { mutateAsync: deleteForReplace } = useDeleteUserCollection({
    skipOptimisticClear: true,
  });
  const { toast } = useToast();

  const handlePostCollection = async () => {
    try {
      if (currentRepresentativeId && currentRepresentativeId !== String(id)) {
        await deleteForReplace(currentRepresentativeId);
      }
      await postUserCollection(String(id));
      toast({ message: '대표 컬렉션 설정이 완료되었습니다.', type: 'success' });
    } catch {
      toast({ message: '대표 컬렉션 설정이 실패하였습니다.', type: 'error' });
    }
    setIsOpen(false);
  };

  const handleDeleteCollection = async () => {
    try {
      await deleteUserCollection(String(id));
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
      <li id={String(id)} className={cn(!completed && 'opacity-50')}>
        <button
          type="button"
          className={cn(
            'flex h-24 w-full flex-col items-center justify-center rounded-xl',
          )}
          onClick={() => setIsOpen(true)}
        >
          {completed ? (
            <Image src={src} alt="" width={80} height={80} sizes={'80px'} />
          ) : isSpecial ? (
            <SpecialCollectionIcon width={80} height={80} />
          ) : (
            <LockedIcon width={80} />
          )}
          <span className={cn('pt-1 text-xs font-semibold')}>
            {isSpecial && !completed ? '???' : title}
          </span>
        </button>
      </li>

      <CollectionBottomSheet
        open={open}
        onOpenChange={setIsOpen}
        id={id}
        title={title}
        description={description}
        completed={completed}
        src={src}
        type={type}
        requirements={requirements}
        acquisitionRate={acquisitionRate}
        action={
          !completed ? (
            <Button
              variant="tertiary"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              닫기
            </Button>
          ) : isRepresentative ? (
            <Button
              variant="secondary"
              type="button"
              onClick={handleDeleteCollection}
              isLoading={isDeleting}
            >
              대표 컬렉션에서 해제
            </Button>
          ) : (
            <Button
              variant="primary"
              type="button"
              onClick={handlePostCollection}
              isLoading={isPosting}
            >
              대표 컬렉션으로 설정
            </Button>
          )
        }
      />
    </>
  );
};
