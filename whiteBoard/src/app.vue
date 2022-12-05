<template>
    <div class="container" @click="(当前激活卡片序号=-1)">
        <template v-for = "(块数据,i) in 子块列表">
          <DragableCard :激活="当前激活卡片序号===i" :思源块id="块数据.id" @click="e=>{e.stopPropagation();当前激活卡片序号=i}"></DragableCard>
        </template>
    </div>
</template>
<script setup>
import DragableCard from './components/DragableCard.vue';
import {ref,onMounted} from 'vue'
//这里是在控制卡片状态
let 当前激活卡片序号 = ref(null)
//这里是获取数据
function 获取地址参数(){
	let 中间变量 = {}
	new URL(window.location.href).searchParams.forEach(
		(value,key)=>{中间变量[key]=value}
	)
	return 中间变量
} 
let 子块列表 = ref([])
let 获取所有子块id= ()=>{
    let 块id = 获取地址参数().id
    fetch(
        'api/query/sql',{
            method:'POST',
            body:JSON.stringify(
                {
                    stmt:`select * from blocks where path like '%${块id}%' and type='d'`
                }
            )
        }
    ).then(
        data=>{
            return data.json()
        }
    ).then(
        json=>{
            if(json.data){
                子块列表.value= json.data
            }
        }
    )
}
onMounted(()=>{获取所有子块id()})
</script>
<style scoped>
.container {
    width: 100%;
    height: 100%
}
</style>