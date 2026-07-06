'use client';

import Image from 'next/image';
import { useState } from 'react';

import { CollectionTabId, useGetUserCollection } from '@/entities/collection';
import { RepresentativeCollection } from '@/features/representative-collection';
import { FallbackUI } from '@/shared/ui/fallback-ui';
import { CollectionGrid, CollectionTabs } from '@/widgets/collections';

const DECO_IMAGES = [
  {
    src: '/landing/collections/deco-0.png',
    className: 'top-4 left-[13%] rotate-[7.412deg]',
  },
  {
    src: '/landing/collections/deco-1.png',
    className: 'top-4 right-[6%] rotate-[-10.845deg]',
  },
  {
    src: '/landing/collections/deco-2.png',
    className: 'bottom-4 left-[16%] rotate-[-8.718deg]',
  },
  {
    src: '/landing/collections/deco-3.png',
    className: 'bottom-4 right-[6%] rotate-[10.195deg]',
  },
];

export const CollectionPage = () => {
  const [collectionsTab, setCollectionsTab] = useState<CollectionTabId>('all');

  const {
    data: userCollection,
    isError,
    refetch,
    isPending,
  } = useGetUserCollection();

  if (isError) {
    return <FallbackUI onReset={refetch} />;
  }

  return (
    <div className="flex h-full flex-col items-center justify-center pt-5">
      <div className="relative flex w-full items-center justify-center">
        {DECO_IMAGES.map(({ src, className }) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={60}
            height={60}
            className={`absolute hidden opacity-[0.3] ${className}`}
            sizes="60px"
          />
        ))}
        <RepresentativeCollection
          userCollection={userCollection}
          isPending={isPending}
        />
      </div>
      <div className="mt-13 flex w-full flex-1 flex-col gap-5 rounded-t-4xl bg-white px-4">
        <CollectionTabs
          selectedId={collectionsTab}
          onSelect={setCollectionsTab}
        />

        <CollectionGrid
          userCollectionId={userCollection?.id}
          collectionsTab={collectionsTab}
        />
      </div>
    </div>
  );
};
