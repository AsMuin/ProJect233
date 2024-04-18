import {createRouter, createWebHistory} from 'vue-router'
//导入组件
import Layout from "../views/Layout.vue";
import Login from "../views/Login.vue";
import ArticleCategory from "../views/article/ArticleCategory.vue";
import ArticleManage from "../views/article/ArticleManage.vue";
import UserInfo from "../views/user/UserInfo.vue";
import UserAvatar from "../views/user/UserAvatar.vue";
import UserResetPassword from "../views/user/UserResetPassword.vue";
import mapView from "../views/map/mapView.vue";
//定义路由关系
const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/layout',
        component: Layout,
        children: [
            {
                path: '/article/category', component:ArticleCategory
            },
            {
                path: '/article/manage', component:ArticleManage
            },
            {
                path: '/user/info', component:UserInfo
            },
            {
                path: '/user/avatar', component:UserAvatar
            },
            {
                path: '/user/resetPassword', component:UserResetPassword
            },
            {
                path: '/map', component:mapView
            },
        ]
    },
    ]
//创建路由器
        const router = createRouter({
            history: createWebHistory(),
            routes: routes
        })

        export default router
