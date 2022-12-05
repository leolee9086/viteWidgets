<template>
    <div ref="卡片框架元素" class="card_frame" @click="e => { emits('click', e) }">
        <div class="card_body">
            <div class="card_content" v-bind:innerHTML="卡片内容.html"></div>
        </div>
    </div>
    <Moveable className="moveable" v-if="激活" :target="卡片框架元素" :draggable="true" :scalable="true" :resizable="true"
        :rotatable="true" :keepRatio="false" @drag="onDrag" @scale="onScale" @rotate="onRotate" @resize="onResize">
    </Moveable>
</template>
<script setup>
import Moveable from 'vue3-moveable';
import { defineProps } from 'vue';
import { reactive, ref, onMounted, onActivated } from 'vue'
import { 当前适配器 } from '../data/index.js'
let emits = defineEmits(['click'])
//这里来获取数据
let { 思源块id, 激活 } = defineProps(['思源块id', '激活'])
let 卡片内容 = ref({})
const 卡片框架元素 = ref(null)
onMounted(async () => {
    卡片内容.value = await 当前适配器.获取卡片内容数据(思源块id)
    let 几何数据 = await 当前适配器.获取卡片几何数据(思源块id)
    console.log(几何数据)
    if (几何数据) {
        卡片框架元素.value.style.width = 几何数据.data.width
        卡片框架元素.value.style.height = 几何数据.data.height
        卡片框架元素.value.style.transform = 几何数据.data.transform
    }
})

//这里来保存数据
let 保存数据 = () => {
    if (卡片框架元素.value) {
        当前适配器.保存卡片几何数据(思源块id,
            {
                width: 卡片框架元素.value.style.width,
                height: 卡片框架元素.value.style.height,
                transform: 卡片框架元素.value.style.transform
            }
        )
    }

}


//这里定义了卡片的外观属性
const 卡片尺寸 = reactive({
    边框宽度: 1,
    内边距: 15,
    宽度: 120,
    高度: 160,
})

//这里的都是事件回调
function onDrag(e) {
    卡片框架元素.value.style.transform = e.transform;

    保存数据()
}
function onScale(e) {
    卡片框架元素.value.style.transform = e.drag.transform;

    保存数据()
}
function onRotate(e) {
    卡片框架元素.value.style.transform = e.drag.transform;
    保存数据()
}
function onResize(e) {
    卡片框架元素.value.style.width = `${e.width}px`;
    卡片框架元素.value.style.height = `${e.height}px`;
    卡片框架元素.value.style.transform = e.drag.transform;
    保存数据()
}

</script>
<style scoped>
.card_frame {
    font-size: large;
    position: absolute;
    box-sizing: border-box;
    width: v-bind('(卡片尺寸.高度+"px")');
    height: v-bind('(卡片尺寸.高度+"px")');
    margin: 0%;
    padding: 5px;
}

.card_body {
    border:v-bind('`${卡片尺寸.边框宽度}px solid grey`');
    border-radius: 15px;
    width:v-bind('`calc(100% - ${2*(卡片尺寸.边框宽度+卡片尺寸.内边距)}px)`');
    height:v-bind('`calc(100% - ${2*(卡片尺寸.边框宽度+卡片尺寸.内边距)}px)`');
    padding:v-bind('`${卡片尺寸.内边距}px`');
    background-color: white;
}

.card_content {
    max-height: 100%;
    max-width: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
}
</style>