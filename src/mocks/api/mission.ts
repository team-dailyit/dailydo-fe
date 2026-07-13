import { http, HttpResponse } from 'msw';

import { MissionItem, MyMissionItem } from '@/entities/missions';
import { BASE_URL } from '@/shared/api';

const mockMissionItems: MissionItem[] = [
  {
    missionId: 1,
    title: '구름 사진 찍기',
    description: '오늘 하늘을 올려다보고 구름 사진을 찍어보세요.',
    categoryId: 2,
    categoryName: '자연/힐링',
    image: '',
    totalCompletedCount: 23,
    isSpecial: false,
  },
  {
    missionId: 2,
    title: '공원에서 맨발 걷기',
    description: '잔디밭에서 맨발로 5분만 걸어보세요.',
    categoryId: 2,
    categoryName: '자연/힐링',
    image: '',
    totalCompletedCount: 15,
    isSpecial: false,
  },
  {
    missionId: 3,
    title: '별 보러 옥상 가기',
    description: '밤하늘의 별을 10분간 감상해보세요.',
    categoryId: 2,
    categoryName: '우주/자연',
    image: '',
    totalCompletedCount: 5,
    isSpecial: true,
  },
  {
    missionId: 4,
    title: '오늘 점심 직접 요리하기',
    description: '간단한 요리라도 직접 만들어 먹어보세요.',
    categoryId: 3,
    categoryName: '생활/습관',
    image: '',
    totalCompletedCount: 42,
    isSpecial: false,
  },
  {
    missionId: 5,
    title: '하루 물 2L 마시기',
    description: '오늘 하루 물 2리터를 마셔보세요.',
    categoryId: 3,
    categoryName: '생활/습관',
    image: '',
    totalCompletedCount: 67,
    isSpecial: false,
  },
  {
    missionId: 6,
    title: '모르는 사람에게 먼저 인사하기',
    description: '오늘 낯선 사람에게 먼저 밝게 인사해보세요.',
    categoryId: 1,
    categoryName: '사회/관계',
    image: '',
    totalCompletedCount: 8,
    isSpecial: true,
  },
  {
    missionId: 7,
    title: '30분 독서하기',
    description: '좋아하는 책을 30분 이상 읽어보세요.',
    categoryId: 4,
    categoryName: '자기계발',
    image: '',
    totalCompletedCount: 31,
    isSpecial: false,
  },
];

let confirmedMissionIds: number[] = [];

const toMyMissionItem = (item: MissionItem): MyMissionItem => ({
  ...item,
  itemId: item.missionId,
  myCompletedCount: 0,
  completed: false,
  completedAt: '',
  mylog: null,
  unlockedCollections: [],
});

export const handlers = [
  // 오늘의 미션 목록 조회
  http.get(`${BASE_URL}/api/missions/new`, () => {
    return HttpResponse.json({
      status: confirmedMissionIds.length > 0 ? 'CONFIRMED' : 'ARRIVED',
      isGuest: false,
      missionDate: new Date().toISOString().split('T')[0],
      minSelectableCount: 1,
      maxSelectableCount: 5,
      items: mockMissionItems,
    });
  }),

  // 오늘의 미션 선택 확정
  http.post(`${BASE_URL}/api/missions/new`, async ({ request }) => {
    const body = (await request.json()) as { missionIds: number[] };
    confirmedMissionIds = body.missionIds ?? [];
    return HttpResponse.json(null, { status: 204 });
  }),

  // 내 미션 목록 조회
  http.get(`${BASE_URL}/api/missions`, () => {
    const items = mockMissionItems
      .filter((m) => confirmedMissionIds.includes(m.missionId))
      .map(toMyMissionItem);
    return HttpResponse.json({
      isGuest: false,
      items,
    });
  }),

  // 미션 완료 처리
  http.post(`${BASE_URL}/api/missions/:itemId`, async ({ params, request }) => {
    const itemId = Number(params.itemId);
    const source = mockMissionItems.find((m) => m.missionId === itemId);
    const { mylog } = (await request.json()) as {
      mylog: { photo: string; memo: string };
    };

    return HttpResponse.json({
      ...(source ?? {}),
      itemId,
      myCompletedCount: 1,
      completed: true,
      completedAt: new Date().toISOString(),
      mylog: { id: itemId, photo: mylog.photo, memo: mylog.memo },
      unlockedCollections: [],
    });
  }),
];
