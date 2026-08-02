import { http, HttpResponse } from 'msw';

import type { CollectionItem, UserCollection } from '@/entities/collection';
import { BASE_URL } from '@/shared/api';

const mockCollectionItems: CollectionItem[] = [
  {
    collectionId: '1',
    image: '/mocks/images/test_image.png',
    title: '무지개를 손에 넣는 자',
    completed: true,
    type: 'NORMAL',
    description: '무지개를 손에 넣은 사람에게 주어지는 컬렉션이에요.',
    acquisitionRate: 42,
    requirements: [],
  },
  {
    collectionId: '2',
    image: '/mocks/images/test_image.png',
    title: '첫 번째 도전',
    completed: false,
    type: 'NORMAL',
    description: '첫 미션을 완료하면 획득할 수 있어요.',
    acquisitionRate: 78,
    requirements: [],
  },
];

let featuredCollectionId: string | null = null;

export const resetCollectionMocks = () => {
  featuredCollectionId = null;
};

const toUserCollection = (item: CollectionItem): UserCollection => ({
  id: item.collectionId,
  image: item.image,
  description: item.description,
  title: item.title,
  type: item.type,
});

export const handlers = [
  // 전체 컬렉션 목록 조회
  http.get(`${BASE_URL}/api/users/collections`, () => {
    return HttpResponse.json({ collections: mockCollectionItems });
  }),

  // 대표 컬렉션 조회
  http.get(`${BASE_URL}/api/users/me/collections/featured`, () => {
    const item = mockCollectionItems.find(
      (c) => c.collectionId === featuredCollectionId,
    );
    if (!item) return HttpResponse.json(null, { status: 404 });
    return HttpResponse.json(toUserCollection(item));
  }),

  // 대표 컬렉션 설정
  http.post(
    `${BASE_URL}/api/users/me/collections/featured`,
    async ({ request }) => {
      const { collectionId } = (await request.json()) as {
        collectionId: string;
      };
      featuredCollectionId = collectionId;
      return new HttpResponse(null, { status: 204 });
    },
  ),

  // 대표 컬렉션 해제
  http.delete(`${BASE_URL}/api/users/me/collections/featured`, () => {
    featuredCollectionId = null;
    return new HttpResponse(null, { status: 204 });
  }),
];
