import { cookies } from 'next/headers';

import { BASE_URL } from './base-url.constant';
import { parseResponseStrict } from './fetch-helpers';

export const serverApi = {
  get: async <T>(endpoint: string): Promise<T> => {
    const cookieHeader = (await cookies()).toString();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
    });
    return parseResponseStrict<T>(res);
  },
};
