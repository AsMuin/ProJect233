import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
// 自动导入Icon图标
import IconResolver from "unplugin-icons/resolver";
import Icons from 'unplugin-icons/vite'

export default defineConfig({
    plugins: [
        vue(),
        // 按需引入Element-plus
        AutoImport({
            resolvers: [
                ElementPlusResolver({importStyle: false}), // 组件自动导入
                IconResolver({prefix: "icon"}),]
        }),
        Components({
            resolvers: [ElementPlusResolver(),// 组件自动导入
                IconResolver({
                    //prefix: 'icon',          // 修改Icon组件前缀，不设置则默认为i,禁用则设置为false
                    enabledCollections: ["ep"] // 指定collection，即指定为elementplus图标集ep
                }),
            ]
        }),
        Icons({ scale: 1, defaultClass: "inline-block", autoInstall: true }),
    ],
    server:{
        proxy:{
            '/base':{//获取路径中包含了/base的请求
                target: 'http://localhost:8080',//后台服务所在的源
                changeOrigin: true,//修改源
                rewrite: (path) => path.replace(/^\/base/, '')//base替换为‘ ’

            }
        }
    }
})
