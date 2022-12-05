import  {ref} from 'vue'
import  核心api from 'http://127.0.0.1:6806/snippets/noobApi/util/kernelApi.js'
import 当前适配器 from './adapter'
export  function 获取地址参数(){
	let 中间变量 = {}
	new URL(window.location.href).searchParams.forEach(
		(value,key)=>{中间变量[key]=value}
	)
	return 中间变量
} 
let 块列表 = await 当前适配器.获取卡片列表()
export {块列表 as 块列表}
export {核心api as 核心api}
export {当前适配器  as 当前适配器}