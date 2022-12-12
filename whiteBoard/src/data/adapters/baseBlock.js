import { 核心api,获取地址参数 } from ".."
let 白板id = 获取地址参数().id
let mode = 获取地址参数().mode

if (!白板id) {
    白板id = '20200812220555-lj3enxa'
}
if (!mode) {
    mode = "子文档视图"
}

export class 基础块适配器{
    获取卡片内容数据=async (卡片id) => {
        return await 核心api.exportPreview(
            { id: 卡片id }
        )
    }
    获取卡片几何数据= async (卡片id) => {
        let 原始数据 = await 核心api.sql(
            {
                stmt: `select * from attributes where  name = 'custom-whiteBoardData-${白板id}' and block_id='${卡片id}'`
            }
        )
        if (原始数据 && 原始数据[0]) {
            let json数据 = JSON.parse(原始数据[0].value)
            return json数据.find(
                item => { return item.mode === mode }
            )
        }
    }
    保存卡片几何数据= async (卡片id, 显示数据) => {
        let 原始数据 = await 核心api.sql(
            {
                stmt: `select * from attributes where  name = 'custom-whiteBoardData-${白板id}' and block_id='${卡片id}'`
            }
        )
        if (原始数据 && 原始数据[0]) {
            let json数据 = JSON.parse(原始数据[0].value)
            json数据.find(
                item => { return  item.mode === mode }
            ).data = 显示数据
            let obj = {}
            obj.id =卡片id
            obj.attrs ={}
            obj.attrs[`custom-whiteBoardData-${白板id}`]=JSON.stringify(json数据)
            await 核心api.setBlockAttrs(obj)
        } else {
            let obj = {}
            obj.id =卡片id
            obj.attrs ={}
            obj.attrs[`custom-whiteBoardData-${白板id}`]=JSON.stringify([{
                mode: mode,
                data: 显示数据
            }])
            await 核心api.setBlockAttrs(obj)
        }
    }
}