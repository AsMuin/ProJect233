import {createApp} from 'vue'
// import './style.css'
import './assets/main.scss'
import App from './App.vue'
import router from './router/index.js'
import ElementPlus from 'element-plus'
import {createPinia} from 'pinia'
import {createPersistedState} from "pinia-persistedstate-plugin";
import 'element-plus/dist/index.css'
import locale from 'element-plus/dist/locale/zh-cn.js'
import getUserInfoStore from "./stores/userInfo.js";

const pinia = createPinia();
pinia.use(createPersistedState({initialState: { getUserInfoStore,
        // 在 initialState 中不包含 getMapStore 模块
    },}))
createApp(App).use(pinia).use(router).use(ElementPlus,{locale}).mount('#app')
