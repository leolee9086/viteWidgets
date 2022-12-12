import { 基础sql适配器 } from "./baseSQL"
import { 获取地址参数 } from ".."
let id = 获取地址参数().id||'20200812220555-lj3enxa'
let 子文档视图适配器 = new 基础sql适配器(
    `select * from blocks where type = 'd' and path like '%${id}%'`
)
export default 子文档视图适配器