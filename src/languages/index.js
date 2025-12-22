import { VoerkaI18nScope } from "@voerkai18n/runtime"
import storage  from "./storage"
import { component } from "./component"
import settings from "./settings.json"
import defaultMessages from "./messages/zh-CN.js"  
import enMessages from "./messages/en-US.js"

const messages = { 
    'zh-CN'    : defaultMessages,
    'en-US'    : enMessages,
}

export const i18nScope = new VoerkaI18nScope({
    id: "colima-desktop__0_1_0",                        // 当前作用域的id
    storage,                                            // 语言配置存储器
    messages,                                           // 语言包
    component,                                          // 翻译组件
    ...settings
})


// 绑定 this 上下文，避免解构导出时丢失上下文
export const t = i18nScope.t.bind(i18nScope)
export const $t = i18nScope.$t?.bind(i18nScope)
export const change = i18nScope.change.bind(i18nScope)
export const Translate = i18nScope.Translate

