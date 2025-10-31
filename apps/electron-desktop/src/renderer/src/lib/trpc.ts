import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../main/trpc';

export const trpc = createTRPCReact<AppRouter>();
