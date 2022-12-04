<template>
    <div class="container" @click="卡片被激活 = false">
        <div ref="卡片框架元素" class="card_frame" @click="e => { e.stopPropagation(); 卡片被激活 = true }">
            <div class="card_body">
                <div class="card_content" v-bind:innerHTML="卡片内容.html"></div>
            </div>
        </div>
        <Moveable className="moveable" v-if="卡片被激活" :target="卡片框架元素" :draggable="true" :scalable="true"
            :resizable="true" :rotatable="true" :keepRatio="false" @drag="onDrag" @scale="onScale" @rotate="onRotate"
            @resize="onResize">
        </Moveable>
    </div>
</template>
<script setup>
import Moveable from "vue3-moveable";
import { reactive, ref, onMounted } from 'vue'
const 卡片框架元素 = ref(null)
const 卡片被激活 = ref(false)

const 卡片尺寸 = reactive({
    边框宽度: 1,
    内边距: 15,
    宽度: 300,
    高度: 400,
})
let 卡片内容 = ref({})
fetch('/api/export/preview', {
    method: 'POST',
    body: JSON.stringify(
        {
            id: '20221204091100-tf8z0um'
        }
    )
}).then(
    data => {
        return data.json()
    }
).then(
    json => {
        if (json.data) {
            卡片内容.value = json.data
            console.log(卡片内容)
        }
    }
)

//这里的都是事件回调
function onDrag(e) {
    卡片框架元素.value.style.transform = e.transform;
}
function onScale(e) {
    卡片框架元素.value.style.transform = e.drag.transform;
}
function onRotate(e) {
    卡片框架元素.value.style.transform = e.drag.transform;
}
function onResize(e) {
    卡片框架元素.value.style.width = `${e.width}px`;
    卡片框架元素.value.style.height = `${e.height}px`;
    卡片框架元素.value.style.transform = e.drag.transform;
}
</script>
<style scoped>
.container {
    width: 100%;
    height: 100%
}

.card_frame {
    font-size: large;
    box-sizing: border-box;
    width: v-bind('卡片尺寸.高度+"px"');
    height: v-bind('卡片尺寸.高度+"px"');
    margin: 0%;
    padding: 5px;
    transform: translate(603px, 270px);

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

::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

::-webkit-scrollbar-corner {
    background-color: rgba(0, 0, 0, 0);
}

::-webkit-scrollbar-thumb {
    box-sizing: content-box;
    border: 4px solid rgba(0, 0, 0, 0);
    border-radius: 5px;
    box-shadow: inset 0 0 5px 5px gray;
}
</style>