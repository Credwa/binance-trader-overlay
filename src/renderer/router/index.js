import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: require('@/components/Login').default
    },
    {
      path: '/main',
      name: 'main-menu',
      component: require('@/components/Main').default
    },
    {
      path: '/trade',
      name: 'trade',
      component: require('@/components/Trade').default
    },
    {
      path: '/orders',
      name: 'orders',
      component: require('@/components/Order').default
    },
    {
      path: '/active-eliot-orders',
      name: 'active-eliot-orders',
      component: require('@/components/Active-Eliot-Orders').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
});
