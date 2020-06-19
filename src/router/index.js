import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/coinflip',
    component: () => import('../views/Game.vue')
  },
  {
    path: '/rps',
    component: () => import('../views/Game.vue')
  },
  {
    path: '/ttt',
    component: () => import('../views/Game.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
