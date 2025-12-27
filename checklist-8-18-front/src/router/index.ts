import { createRouter, createWebHistory, type RouteRecordRaw, type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import DefaultLayout from '@/layouts/default.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', name: 'Home', component: () => import('@/pages/index.vue') },

      // ROTAS DE INSPEÇÃO
      { path: 'inspections/new', name: 'NewInspection', component: () => import('@/pages/inspections/new.vue') },
      { path: 'inspections/:id', name: 'Checklist', component: () => import('@/pages/inspections/id/index.vue') },
      { path: 'inspections/:id/finalize', name: 'Finalize', component: () => import('@/pages/inspections/id/finalize.vue') },
      { path: 'inspections/:id/sealing', name: 'Sealing', component: () => import('@/pages/inspections/id/sealing.vue') },
      { path: 'inspections/:id/conference', name: 'Conference', component: () => import('@/pages/inspections/id/conference.vue') },
      { path: 'inspections/:id/report', name: 'Report', component: () => import('@/pages/inspections/id/report.vue') },
      { path: 'inspections/:id/review', name: 'DocumentalReview', component: () => import('@/pages/inspections/id/review.vue') },
      {
        path: 'gate',
        name: 'GateControl',
        component: () => import('@/pages/gate/index.vue'),
        // Guarda de Rota Específica: Apenas PORTARIA ou ADMIN
        beforeEnter: (_to, _from, next) => {
          const authStore = useAuthStore();
          // Verifica se o usuário tem a role necessária
          const hasAccess = authStore.userRoles.includes('PORTARIA') || authStore.isAdmin;

          if (hasAccess) {
            next();
          } else {
            // Se não tiver acesso, redireciona para Home ou mostra erro (aqui redirecionamos para home por simplicidade)
            alert('Acesso negado: Rota exclusiva para Portaria.');
            next('/');
          }
        }
      },

      // GESTÃO DE USUÁRIOS (ADMIN)
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/pages/users/index.vue'),
        beforeEnter: () => {
          const authStore = useAuthStore();
          return authStore.isAdmin;
        }
      },

      // PERFIL
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/pages/profile/index.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// A "Muralha de Proteção" Global
router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path as string);
  const authStore = useAuthStore();

  if (authRequired && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;