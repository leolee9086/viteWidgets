import { 获取地址参数, 核心api } from "./index.js";

let { id, mode } = 获取地址参数()
if (!mode) {
    mode = "子文档视图"
}
if (!id) {
    id = '20200812220555-lj3enxa'
}
let 白板id = id
let 适配器列表 = {
    子文档视图: {
        获取卡片列表: async () => {
            return await 核心api.sql(
                {
                    stmt: `select * from blocks where path like '%${id}%' and type='d'`
                }
            )
        },
        获取卡片内容数据: async (卡片id) => {
            return await 核心api.exportPreview(
                { id: 卡片id }
            )
        },
        获取卡片几何数据: async (卡片id) => {
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
        },
        保存卡片几何数据: async (卡片id, 显示数据) => {
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
}
let 当前数据适配器 = 适配器列表[mode]
export default 当前数据适配器