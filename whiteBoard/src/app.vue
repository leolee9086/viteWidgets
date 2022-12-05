<template>
    <div class="container" @click="(当前激活卡片序号=-1)">
        <template v-for = "(块数据,i) in 块列表">
          <DragableCard :激活="当前激活卡片序号===i" :思源块id="块数据.id" @click="e=>{e.stopPropagation();当前激活卡片序号=i}"></DragableCard>
        </template>
    </div>
</template>
<script setup>
import DragableCard from './components/DragableCard.vue';
import {ref} from 'vue'
import {块列表} from './data/index.js' 
//这里是在控制卡片状态
let 当前激活卡片序号 = ref(null)
//这里是获取数据,已经挪出去了
</script>
<style scoped>
.container {
    width: 100%;
    height: 100%
}
</style>