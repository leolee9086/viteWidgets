import { 核心api,获取地址参数 } from ".."
import {基础块适配器} from './baseBlock'
let 白板id = 获取地址参数().id
let mode = 获取地址参数().mode

if (!白板id) {
    白板id = '20200812220555-lj3enxa'
}
if (!mode) {
    mode = "子文档视图"
}
export class 基础sql适配器 extends 基础块适配器{
    constructor(sql){
        super()
        this.sql =sql
    }
    获取卡片列表=async () => {
        let 卡片列表 =  await 核心api.sql(
            {
                stmt: this.sql
            }
        )
        this.卡片列表 = 卡片列表
        return 卡片列表
    }
}