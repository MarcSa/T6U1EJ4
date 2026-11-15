import { authGuard } from '@/modules/auth/guards/authGuard';
import type { RouteRecordRaw } from 'vue-router';

export const profilesChildRoutes: RouteRecordRaw[] = [
  {
    path: 'profile',
    name: 'profile',
    component: () => import('@/modules/profiles/pages/ProfilePage.vue'),
    beforeEnter: [authGuard],
  },
];
