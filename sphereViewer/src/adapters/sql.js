import { 核心api } from "../../../whiteBoard/src/data"
export class sql全景图适配器{
    获取项目列表(){
        
    }
    async 获取全景图列表(项目名){
        let sql =`select * from assets where name like '全景图-${项目名}-%'`
        let 全景图列表 = await 核心api.sql({stmt:sql})
        全景图列表.forEach(
            item=>{
              item.panorama=item.path
              item.thumbnail =item.path
              let 空间名 = item.name.split('-')[2]
              item.options ={
                caption: 空间名,
          
              }
            }
          )
        return 全景图列表
    }
}