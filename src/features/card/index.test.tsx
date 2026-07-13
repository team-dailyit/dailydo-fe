import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import confetti from 'canvas-confetti';
import { http, HttpResponse } from 'msw';
import { Suspense } from 'react';

import { Mission, MyMission, MyMissionItem } from '@/entities/missions';
import { resetMissionMocks } from '@/mocks/api/mission';
import { server } from '@/mocks/server';
import { BASE_URL } from '@/shared/api';
import {
  MyMissionCard,
  MyMissionList,
  TodayMissionCard,
} from '@/widgets/missions';

jest.mock('../../entities/file/api/file.queries', () => ({
  useFileUpload: () => ({
    mutateAsync: jest.fn().mockResolvedValue('/mock-uploaded-photo.jpg'),
    isPending: false,
  }),
}));

const uploadMockPhoto = async (user: ReturnType<typeof userEvent.setup>) => {
  const fileInput = screen.getByLabelText('사진 첨부', { selector: 'input' });
  const file = new File(['photo'], 'photo.png', { type: 'image/png' });
  await user.upload(fileInput, file);
};

const fetchMissions = async (): Promise<Mission> => {
  const res = await fetch(`${BASE_URL}/api/missions/new`);
  return res.json();
};

const fetchMyMissions = async (): Promise<MyMission> => {
  const res = await fetch(`${BASE_URL}/api/missions`);
  return res.json();
};

let missionData: Mission;
let myMissionData: MyMission;

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
  missionData = await fetchMissions();
  myMissionData = await fetchMyMissions();
});

describe('카드 컴포넌트', () => {
  describe('오늘의 카드 미션 목록', () => {
    test('초기 상태는 뒤집히지 않은 상태다', () => {
      const { container } = render(
        <TodayMissionCard mission={missionData.items[0]} />,
      );
      const inner = container.querySelector('[data-flipped]')!;
      expect(inner).toHaveAttribute('data-flipped', 'false');
    });

    test('카드 클릭 시 data-flipped가 true로 바뀐다', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <TodayMissionCard mission={missionData.items[0]} />,
      );

      await user.click(container.firstChild as HTMLElement);

      const inner = container.querySelector('[data-flipped]')!;
      expect(inner).toHaveAttribute('data-flipped', 'true');
    });

    test('앞면 요소들이 렌더링된다 일반 미션의 경우', () => {
      render(<TodayMissionCard mission={missionData.items[0]} />);

      expect(screen.getByText('오늘의 미션')).toBeInTheDocument();
      expect(screen.getByText('탭해서 확인하기')).toBeInTheDocument();
    });

    test('앞면 요소들이 렌더링된 미션의 경우', () => {
      render(<TodayMissionCard mission={missionData.items[2]} />);

      expect(screen.getByText('스페셜 미션')).toBeInTheDocument();
      expect(screen.getByText('탭해서 확인하기')).toBeInTheDocument();
    });
  });

  describe('카드가 뒤집힌 상태일 경우', () => {
    test('뒤집힌 후 미션 제목과 카테고리가 표시와 선택하기, 넘기기 버튼 표시', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <TodayMissionCard mission={missionData.items[0]} />,
      );

      await user.click(container.firstChild as HTMLElement);

      expect(screen.getByText(missionData.items[0].title)).toBeInTheDocument();
      expect(
        screen.getByText(missionData.items[0].categoryName),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '선택하기' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '넘기기' }),
      ).toBeInTheDocument();
    });

    test('선택하기 클릭 시 도전자 수와 취소하기가 표시된다', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <TodayMissionCard
          mission={missionData.items[0]}
          onSelect={() => true}
        />,
      );

      await user.click(container.firstChild as HTMLElement);
      await user.click(screen.getByRole('button', { name: '선택하기' }));

      expect(
        screen.getByText(
          `${missionData.items[0].totalCompletedCount}명이 미션에 도전했어요!`,
        ),
      ).toBeInTheDocument();
      expect(screen.getByText('취소하기')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: '선택하기' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: '넘기기' }),
      ).not.toBeInTheDocument();
    });

    test('취소하기 클릭 시 선택이 해제되고 선택하기, 넘기기 버튼이 보인다.', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <TodayMissionCard
          mission={missionData.items[0]}
          onSelect={() => true}
        />,
      );

      await user.click(container.firstChild as HTMLElement);
      await user.click(screen.getByRole('button', { name: '선택하기' }));
      expect(screen.getByText('취소하기')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: '취소하기' }));

      expect(
        screen.getByRole('button', { name: '선택하기' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '넘기기' }),
      ).toBeInTheDocument();
    });

    test('넘기기 클릭 시 onSkip 콜백이 mission.missionId와 함께 호출된다', async () => {
      const user = userEvent.setup();
      const onSkip = jest.fn();
      const { container } = render(
        <TodayMissionCard mission={missionData.items[0]} onSkip={onSkip} />,
      );

      await user.click(container.firstChild as HTMLElement);
      await user.click(screen.getByRole('button', { name: '넘기기' }));

      expect(onSkip).toHaveBeenCalledWith(missionData.items[0].missionId);
    });

    test('선택하기 클릭 시 onSelect 콜백이 mission.missionId와 함께 호출된다', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();
      const { container } = render(
        <TodayMissionCard mission={missionData.items[0]} onSelect={onSelect} />,
      );

      await user.click(container.firstChild as HTMLElement);
      await user.click(screen.getByRole('button', { name: '선택하기' }));

      expect(onSelect).toHaveBeenCalledWith(missionData.items[0].missionId);
    });

    test('취소하기 클릭 시 onCancel 콜백이 mission.missionId와 함께 호출된다', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      const { container } = render(
        <TodayMissionCard
          mission={missionData.items[0]}
          onCancel={onCancel}
          onSelect={() => true}
        />,
      );

      await user.click(container.firstChild as HTMLElement);
      await user.click(screen.getByRole('button', { name: '선택하기' }));
      await user.click(screen.getByRole('button', { name: '취소하기' }));

      expect(onCancel).toHaveBeenCalledWith(missionData.items[0].missionId);
    });
  });

  describe('나의 미션 목록', () => {
    let specialMission: MyMissionItem;

    beforeEach(async () => {
      resetMissionMocks();
      await fetch(`${BASE_URL}/api/missions/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionIds: missionData.items.map((item) => item.missionId),
        }),
      });
      myMissionData = await fetchMyMissions();
      specialMission = myMissionData.items[2];
    });

    test('카드가 뒤집힌 상태로 렌더링된다', () => {
      render(<MyMissionCard mission={specialMission} />, {
        wrapper: createWrapper(),
      });

      const button = screen.getByRole('button', { name: '완료하기' });
      expect(button).toBeInTheDocument();
      expect(screen.getByText('히든 미션')).toBeInTheDocument();
    });

    test('일반 미션의 경우 카테고리 이름이 나온다', () => {
      render(<MyMissionCard mission={myMissionData.items[0]} />, {
        wrapper: createWrapper(),
      });
      expect(
        screen.getByText(myMissionData.items[0].categoryName),
      ).toBeInTheDocument();
    });

    test('히든 미션의 경우 카테고리 이름이 나오지 않고 히든 미션으로 나온다', () => {
      render(<MyMissionCard mission={specialMission} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByText('히든 미션')).toBeInTheDocument();
      expect(
        screen.queryByText(specialMission.categoryName),
      ).not.toBeInTheDocument();
    });

    test('완료하기 클릭 시 바텀 시트 나온다', async () => {
      const user = userEvent.setup();
      render(<MyMissionCard mission={specialMission} />, {
        wrapper: createWrapper(),
      });

      await user.click(screen.getByRole('button', { name: '완료하기' }));

      expect(screen.getByText('마이로그 작성')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '취소하기' }),
      ).toBeInTheDocument();
    });

    test('완료하기 클릭 후 취소하기 클릭 시 바텀 시트 닫힌다', async () => {
      const user = userEvent.setup();
      render(<MyMissionCard mission={specialMission} />, {
        wrapper: createWrapper(),
      });

      await user.click(screen.getByRole('button', { name: '완료하기' }));
      await user.click(screen.getByRole('button', { name: '취소하기' }));

      expect(screen.queryByText('마이로그 작성')).not.toBeInTheDocument();
    });

    test('바텀 시트에서 취소하기 클릭 시 시트가 닫힌다', async () => {
      const user = userEvent.setup();
      render(<MyMissionCard mission={specialMission} />, {
        wrapper: createWrapper(),
      });

      await user.click(screen.getByRole('button', { name: '완료하기' }));
      await user.click(screen.getByRole('button', { name: '취소하기' }));

      expect(screen.queryByText('마이로그 작성')).not.toBeInTheDocument();
    });

    test('완료된 미션은 완료하기 버튼이 없다', () => {
      const completedMission = { ...specialMission, completed: true };
      render(<MyMissionCard mission={completedMission} />, {
        wrapper: createWrapper(),
      });

      expect(
        screen.queryByRole('button', { name: '완료하기' }),
      ).not.toBeInTheDocument();
    });

    test('완료된 미션은 카테고리와 제목이 표시된다', () => {
      const completedMission = { ...myMissionData.items[0], completed: true };
      render(<MyMissionCard mission={completedMission} />, {
        wrapper: createWrapper(),
      });
      expect(
        screen.getByText(myMissionData.items[0].categoryName),
      ).toBeInTheDocument();
      expect(
        screen.getByText(myMissionData.items[0].title),
      ).toBeInTheDocument();
    });

    test('완료된 미션은 마이로그 사진이 없으면 대표 이미지로 대체된다', () => {
      const completedMission = {
        ...myMissionData.items[0],
        completed: true,
        mylog: null,
        image: '/fallback-image.jpg',
      };
      render(<MyMissionCard mission={completedMission} />, {
        wrapper: createWrapper(),
      });

      const img = screen.getByRole('img', { name: completedMission.title });
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining(encodeURIComponent('/fallback-image.jpg')),
      );
    });

    test('완료된 미션은 마이로그 사진이 있으면 그 사진을 보여준다', () => {
      const completedMission = {
        ...myMissionData.items[0],
        completed: true,
        mylog: { id: 1, photo: '/mylog-photo.jpg', memo: '메모' },
        image: '/fallback-image.jpg',
      };
      render(<MyMissionCard mission={completedMission} />, {
        wrapper: createWrapper(),
      });

      const img = screen.getByRole('img', { name: completedMission.title });
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining(encodeURIComponent('/mylog-photo.jpg')),
      );
    });

    test('마이로그를 작성하고 완료하기를 누르면 목록의 카드도 완료 상태로 바뀐다', async () => {
      const user = userEvent.setup();
      const targetMission = myMissionData.items[0];

      render(
        <Suspense fallback={null}>
          <MyMissionList />
        </Suspense>,
        { wrapper: createWrapper() },
      );

      const card = (await screen.findByText(targetMission.title)).closest(
        '[role="button"]',
      ) as HTMLElement;

      await user.click(within(card).getByRole('button', { name: '완료하기' }));
      await user.type(
        screen.getByPlaceholderText('최대 100자까지 입력 가능해요.'),
        '오늘 미션 완료!',
      );
      await uploadMockPhoto(user);

      const submitButton = screen
        .getAllByRole('button', { name: '완료하기' })
        .find((button) => !button.closest('[role="button"]')) as HTMLElement;
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('마이로그 작성')).not.toBeInTheDocument();
      });
      expect(
        within(card).queryByRole('button', { name: '완료하기' }),
      ).not.toBeInTheDocument();
      expect(within(card).getByText('오늘 미션 완료!')).toBeInTheDocument();
    });

    test('미션 완료로 컬렉션을 획득하면 컬렉션 안내 바텀시트가 뜨고 컨페티가 실행된다', async () => {
      server.use(
        http.post(`${BASE_URL}/api/missions/:itemId`, () =>
          HttpResponse.json({
            itemId: myMissionData.items[0].itemId,
            completed: true,
            completedAt: new Date().toISOString(),
            myCompletedCount: 1,
            totalCompletedCount: myMissionData.items[0].totalCompletedCount,
            mylog: { id: 1, photo: '/mylog-photo.jpg', memo: '메모' },
            unlockedCollections: [
              {
                collectionId: 'collection-1',
                title: '테스트 컬렉션',
                type: 'NORMAL',
                image: '/collection.jpg',
                description: '테스트 컬렉션 설명',
              },
            ],
          }),
        ),
      );

      const user = userEvent.setup();
      render(<MyMissionCard mission={myMissionData.items[0]} />, {
        wrapper: createWrapper(),
      });

      await user.click(screen.getByRole('button', { name: '완료하기' }));
      await user.type(
        screen.getByPlaceholderText('최대 100자까지 입력 가능해요.'),
        '오늘 미션 완료!',
      );
      await uploadMockPhoto(user);

      const submitButton = screen
        .getAllByRole('button', { name: '완료하기' })
        .find((button) => !button.closest('[role="button"]')) as HTMLElement;
      await user.click(submitButton);

      expect(await screen.findByText('테스트 컬렉션')).toBeInTheDocument();
      await waitFor(() => {
        expect(confetti).toHaveBeenCalled();
      });
    });
  });
});
