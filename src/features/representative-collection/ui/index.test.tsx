import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { CollectionItem, Collections } from '@/entities/collection';
import { server } from '@/mocks/server';
import { BASE_URL } from '@/shared/api';
import { CollectionPage } from '@/views/mycollections';

const makeCollectionItem = (
  overrides: Partial<CollectionItem>,
): CollectionItem => ({
  collectionId: '1',
  image: '/mocks/images/test_image.png',
  title: '테스트 컬렉션',
  completed: false,
  type: 'NORMAL',
  description: '',
  acquisitionRate: 50,
  requirements: [],
  ...overrides,
});

const makeSpecialCollectionItem = (
  overrides: Partial<CollectionItem> = {},
): CollectionItem =>
  makeCollectionItem({
    collectionId: '2',
    title: '히든 컬렉션',
    image: '/mocks/images/test_image.png',
    completed: false,

    type: 'SPECIAL',
    description: '',
    acquisitionRate: 50,
    requirements: [],
    ...overrides,
  });

const fetchCollectionList = async (): Promise<Collections> => {
  const res = await fetch(`${BASE_URL}/api/users/collections`);
  return res.json();
};

let collectionData: Collections;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

beforeEach(async () => {
  collectionData = await fetchCollectionList();
});

describe('컬렉션 페이지 테스트', () => {
  describe('대표 컬렉션 컴포넌트 테스트', () => {
    test('대표 컬렉션 컴포넌트가 렌더링 되는지 확인', () => {
      render(<CollectionPage />, { wrapper: createWrapper() });
      expect(screen.getByText('나의 대표 컬렉션')).toBeInTheDocument();
      expect(screen.getByText('전체보기')).toBeInTheDocument();
      expect(screen.getByText('획득한 컬렉션')).toBeInTheDocument();
      expect(screen.getByText('미획득한 컬렉션')).toBeInTheDocument();
    });
    test('대표 컬렉션이 설정되지 않았을때 확인하기', async () => {
      render(<CollectionPage />, { wrapper: createWrapper() });

      const fallbackLabel =
        await screen.findByText('대표 컬렉션이 설정되지 않았어요.');

      const representativeButton = fallbackLabel.closest(
        'button',
      ) as HTMLElement;
      expect(representativeButton.querySelector('img')).not.toBeInTheDocument();
    });
    test('대표 컬렉션이 설정되었을때 확인하기', async () => {});
  });
  describe('컬렉션 목록 조회 테스트', () => {
    test('컬렉션 목록이 정상적으로 조회되는지 확인', async () => {
      render(<CollectionPage />, { wrapper: createWrapper() });

      for (const collection of collectionData.collections) {
        expect(await screen.findByText(collection.title)).toBeInTheDocument();
      }
    });
    test.each([
      {
        tabLabel: '전체보기',
        collections: [] as CollectionItem[],
        expectedMessage: '컬렉션이 없어요.',
      },
      {
        tabLabel: '획득한 컬렉션',
        collections: [makeCollectionItem({ completed: false })],
        expectedMessage: '아직 획득한 컬렉션이 없어요.',
      },
      {
        tabLabel: '미획득한 컬렉션',
        collections: [makeCollectionItem({ completed: true })],
        expectedMessage: '모든 컬렉션을 획득 했어요.',
      },
    ])(
      '$tabLabel 탭에 컬렉션이 없으면 "$expectedMessage"가 보인다',
      async ({ tabLabel, collections, expectedMessage }) => {
        server.use(
          http.get(`${BASE_URL}/api/users/collections`, () =>
            HttpResponse.json({ collections }),
          ),
        );

        const user = userEvent.setup();
        render(<CollectionPage />, { wrapper: createWrapper() });

        if (tabLabel !== '전체보기') {
          await user.click(
            await screen.findByRole('button', { name: tabLabel }),
          );
        }

        expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
      },
    );
    test('컬렉션 목록 중 히든 컬렉션인지 확인하기(title이 ???인지 따로 확인해야 하나)', async () => {
      server.use(
        http.get(`${BASE_URL}/api/users/collections`, () =>
          HttpResponse.json({
            collections: [makeSpecialCollectionItem({ completed: false })],
          }),
        ),
      );

      collectionData = await fetchCollectionList();
      render(<CollectionPage />, { wrapper: createWrapper() });

      expect(await screen.findByText('???')).toBeInTheDocument();
      expect(
        screen.queryByText(collectionData.collections[0].title),
      ).not.toBeInTheDocument();
    });
  });
  describe('대표 컬렉션 설정', () => {
    test('대표 컬렉션 설정이 정상적으로 되는지 확인', async () => {});
    test('대표 컬렉션 해제 후 정상적으로 해제 되었는지 확인', async () => {});
    test('대표 컬렉션 에러 fallbackui 정상 나오는지 확인', async () => {});
  });
});
