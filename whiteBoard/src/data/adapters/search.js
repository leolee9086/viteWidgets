import { 基础块适配器 } from "./baseBlock";
import {核心api,获取地址参数} from '..'
import 'http://127.0.0.1:6806/stage/protyle/js/lute/lute.min.js'
let lute =Lute.New() 
lute.SetTextMark(true)
lute.SetProtyleWYSIWYG(true)
lute.SetBlockRef(true)
lute.SetFileAnnotationRef(true)
lute.SetKramdownIAL(true)
lute.SetTag(true)
lute.SetSuperBlock(true)
lute.SetImgPathAllowSpace(true)
lute.SetGitConflict(true)
lute.SetMark(true)
lute.SetSup(true)
lute.SetSub(true)
lute.SetInlineMathAllowDigitAfterOpenMarker(true)
lute.SetFootnotes(false)
lute.SetToC(false)
lute.SetIndentCodeBlock(false)
lute.SetParagraphBeginningSpace(true)
lute.SetAutoSpace(false)
lute.SetHeadingID(false)
lute.SetSetext(false)
lute.SetYamlFrontMatter(false)
lute.SetLinkRef(false)
lute.SetCodeSyntaxHighlight(false)
lute.SetSanitize(true)
let 白板id = 获取地址参数().id
export class 搜索适配器 extends  基础块适配器{
    constructor(关键词){
        super()
        if(!关键词,关键词=获取地址参数().search)
        this.关键词 = 关键词
    }
    获取卡片列表=async()=>{
        return (await 核心api.fullTextSearchBlock(
            {query:this.关键词}
        )).blocks
    }
    获取卡片内容数据=async(卡片id)=>{
        let data = await 核心api.getDoc(
            {
                id:卡片id,
                mode:0,
                size:102400
            }
        )
        return {html:lute.Md2HTML(lute.BlockDOM2StdMd(data.content))}
    }
    获取卡片几何数据= async (卡片id) => {
        let 原始数据 = await 核心api.sql(
            {
                stmt: `select * from attributes where  name = 'custom-whiteBoardData-${白板id}' and block_id='${卡片id}'`
            }
        )
        if (原始数据 && 原始数据[0]) {
            let json数据 = JSON.parse(原始数据[0].value)
            let 关键词匹配结果= json数据.find(
                item => { return item.mode === '搜索视图'&&item.search===this.关键词 }
            )
            if(关键词匹配结果){
                return 关键词匹配结果
            }
            else {
                return json数据.find(
                    item =>{return item.mode==='搜索视图'}
                )
            }
        }
    }
    保存卡片几何数据=async (卡片id,显示数据)=>{
        let 原始数据 = await 核心api.sql(
            {
                stmt: `select * from attributes where  name = 'custom-whiteBoardData-${白板id}' and block_id='${卡片id}'`
            }
        )
        let json数据
        if (原始数据 && 原始数据[0]) {
            json数据 = JSON.parse(原始数据[0].value)
            let 旧数据= json数据.find(
                item => { return  item.mode === '搜索视图'&&item.search===this.关键词 }
            )
            if(旧数据){
                旧数据.data = 显示数据
            }
            else json数据.push({
                mode:'搜索视图',
                search:this.关键词,
                data:显示数据
            })
        }
        else json数据=[{mode:'搜索视图',search:this.关键词,data:显示数据}]
        let obj = {}
        obj.id =卡片id
        obj.attrs ={}
        obj.attrs[`custom-whiteBoardData-${白板id}`]=JSON.stringify(json数据)
        await 核心api.setBlockAttrs(obj)
    }
}