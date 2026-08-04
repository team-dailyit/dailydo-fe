import { cache } from 'react';

import { createQueryClient } from './create-query-client';

export const getQueryClient = cache(createQueryClient);
