import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { CollectionItem, Collections } from '@/entities/collection';
import * as collectionQueries from '@/entities/collection/api/collection.queries';
import { resetCollectionMocks } from '@/mocks/api/collection';
import { server } from '@/mocks/server';
import { BASE_URL } from '@/shared/api';
import { CollectionPage } from '@/views/mycollections';

jest.mock('../../../entities/collection/api/collection.queries', () => ({
  ...jest.requireActual('../../../entities/collection/api/collection.queries'),
  useGetUserCollection: jest.fn(),
}));

const mockedUseGetUserCollection =
  collectionQueries.useGetUserCollection as jest.MockedFunction<
    typeof collectionQueries.useGetUserCollection
  >;
const actualUseGetUserCollection = (
  jest.requireActual(
    '../../../entities/collection/api/collection.queries',
  ) as typeof collectionQueries
).useGetUserCollection;

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

// 대표 컬렉션 버튼 안에는 컬렉션 제목이 그리드에도 중복으로 나올 수 있어
// 항상 이 버튼으로 스코프를 좁혀서 확인한다.
const getRepresentativeButton = () =>
  screen
    .getByRole('heading', { name: '나의 대표 컬렉션' })
    .closest('button') as HTMLElement;

beforeEach(async () => {
  resetCollectionMocks();
  mockedUseGetUserCollection.mockImplementation(actualUseGetUserCollection);
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
    test('대표 컬렉션이 설정되었을때 확인하기', async () => {
      server.use(
        http.get(`${BASE_URL}/api/users/me/collections/featured`, () =>
          HttpResponse.json({
            id: collectionData.collections[0].collectionId,
            image: collectionData.collections[0].image,
            title: collectionData.collections[0].title,
          }),
        ),
      );
      render(<CollectionPage />, { wrapper: createWrapper() });

      const titleLabel = await screen.findByText(
        collectionData.collections[0].title,
      );
      const representativeButton = titleLabel.closest('button') as HTMLElement;
      const image = representativeButton.querySelector('img');

      expect(image).toHaveAttribute(
        'src',
        expect.stringContaining(
          encodeURIComponent(collectionData.collections[0].image),
        ),
      );
    });
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
    test('완료된 컬렉션을 클릭해 대표 컬렉션으로 설정할 수 있다', async () => {
      const targetCollection = collectionData.collections.find(
        (collection) => collection.completed,
      )!;

      const user = userEvent.setup();
      render(<CollectionPage />, { wrapper: createWrapper() });

      await user.click(
        await screen.findByRole('button', { name: targetCollection.title }),
      );
      await user.click(
        await screen.findByRole('button', { name: '대표 컬렉션으로 설정' }),
      );

      await waitFor(() => {
        expect(
          within(getRepresentativeButton()).getByText(targetCollection.title),
        ).toBeInTheDocument();
      });
    });

    test('대표 컬렉션을 다른 완료된 컬렉션으로 교체할 수 있다', async () => {
      const secondCompleted = {
        ...collectionData.collections[1],
        completed: true,
      };
      server.use(
        http.get(`${BASE_URL}/api/users/collections`, () =>
          HttpResponse.json({
            collections: [collectionData.collections[0], secondCompleted],
          }),
        ),
      );

      await fetch(`${BASE_URL}/api/users/me/collections/featured`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId: collectionData.collections[0].collectionId,
        }),
      });

      const user = userEvent.setup();
      render(<CollectionPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(
          within(getRepresentativeButton()).getByText(
            collectionData.collections[0].title,
          ),
        ).toBeInTheDocument();
      });

      await user.click(
        await screen.findByRole('button', { name: secondCompleted.title }),
      );
      await user.click(
        await screen.findByRole('button', { name: '대표 컬렉션으로 설정' }),
      );

      await waitFor(() => {
        expect(
          within(getRepresentativeButton()).getByText(secondCompleted.title),
        ).toBeInTheDocument();
      });
    });
    test('대표 컬렉션 해제 후 정상적으로 해제 되었는지 확인', async () => {
      await fetch(`${BASE_URL}/api/users/me/collections/featured`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId: collectionData.collections[0].collectionId,
        }),
      });

      const user = userEvent.setup();
      render(<CollectionPage />, { wrapper: createWrapper() });

      const representativeButton = (
        await screen.findByText(collectionData.collections[0].title)
      ).closest('button') as HTMLElement;
      await user.click(representativeButton);

      await user.click(
        await screen.findByRole('button', { name: '대표 컬렉션에서 해제' }),
      );

      expect(
        await screen.findByText('대표 컬렉션이 설정되지 않았어요.'),
      ).toBeInTheDocument();
    });
    test('대표 컬렉션 에러 fallbackui 정상 나오는지 확인', async () => {
      // getUserCollection이 내부에서 모든 에러를 catch해 null로 바꾸기 때문에
      // MSW 응답만으로는 isError를 true로 만들 수 없어 훅 자체를 오버라이드한다.
      const refetch = jest.fn();
      mockedUseGetUserCollection.mockReturnValue({
        data: undefined,
        isError: true,
        isPending: false,
        refetch,
      } as unknown as ReturnType<
        typeof collectionQueries.useGetUserCollection
      >);

      const user = userEvent.setup();
      render(<CollectionPage />, { wrapper: createWrapper() });

      expect(
        await screen.findByText(/페이지를 불러오는 중 문제가 생겼어요/),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '다시시도' }));
      expect(refetch).toHaveBeenCalledTimes(1);
    });
  });
});
