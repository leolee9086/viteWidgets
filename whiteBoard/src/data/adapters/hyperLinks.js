import { 基础sql适配器 } from "./baseSQL"
import { 获取地址参数 } from ".."
let id = 获取地址参数().id||'20200812220555-lj3enxa'
let sql = `select * from spans where root_id ='${id}' and type like '%textmark%a%'`
export  class 超链接适配器 extends 基础sql适配器{
        constructor(){ 
           super(sql)
        }
        获取卡片内容数据=async (卡片id) => {
            let 卡片数据 = this.卡片列表.find(
                item=>{return item.id === 卡片id}
            ) 
            let 链接 = 卡片数据.markdown.replace(`[${卡片数据.content}]`,'')
            console.log(链接)

            链接 = 链接.substring(1,链接.length-1)
            return {html:`<div>${链接}</div><iframe src='${链接}' style="width:100%;height:calc(100% - 35px);"></iframe>`}
        }
}