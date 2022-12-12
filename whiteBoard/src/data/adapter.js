import { 获取地址参数, 核心api } from "./index.js";
import 子文档视图适配器 from './adapters/childDoc.js'
import { 搜索适配器 } from "./adapters/search.js";
import { 超链接适配器 } from "./adapters/hyperLinks.js";
let {  id,mode,search } = 获取地址参数()
if (!mode) {
    mode = "子文档视图"
}
if(!id){
    id = '20200812220555-lj3enxa'
}



let 适配器列表 = {
    子文档视图:子文档视图适配器,
    搜索视图:new 搜索适配器(search),
    超链接列表视图:new 超链接适配器()
}
let 当前数据适配器 = 适配器列表[mode]
export default 当前数据适配器