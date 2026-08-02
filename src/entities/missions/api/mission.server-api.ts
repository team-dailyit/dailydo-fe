import { serverApi } from '@/shared/api/server';

import { Mission } from '../model/mission.types';

export const getTodayMissionsServer = () =>
  serverApi.get<Mission>('/api/missions/new');
