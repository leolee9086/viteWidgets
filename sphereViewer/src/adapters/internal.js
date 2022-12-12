export class 后端适配器{
    获取项目列表(){
        
    }
    async 获取全景图列表(项目名){
        let res = await fetch('widgetApi/projects/getScenesByName',{
            method:"POST",
            body:JSON.stringify({
                name:项目名
            })
        })
        let 全景图列表 = await res.json()
        return 全景图列表
    }
}