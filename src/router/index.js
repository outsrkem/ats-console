import { createRouter, createWebHashHistory } from 'vue-router'
const Layout = () => import('../views/layout/index.vue')
const Home = () => import('../views/home/index.vue')
const Setting = () => import('../views/setting/index.vue')

const routes = [
    {
        path: '/',
        component: Layout,
        meta: { title: 'ATS' },
        children: [
            { meta: { title: 'ATS' }, path: '/', name: 'home', component: Home },
            { meta: { title: 'ATS' }, path: '/setting', name: 'setting', component: Setting },
        ]
      }
]

const router = createRouter({
    history: createWebHashHistory('/ats/'),
    base: '/ats/',
    routes,
})

router.beforeEach((to, from, next) => {
    if (to.meta && to.meta.title) {
        document.title = to.meta.title;
    }
    next();
});

export default router
