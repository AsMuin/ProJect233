<script setup>
import "ol/ol.css";
import {Map, Overlay, View} from "ol";
import * as style from "ol/style"
import * as layer from "ol/layer";
import * as source from "ol/source";
import * as interaction from "ol/interaction";
import {onMounted, ref,getCurrentInstance} from "vue"
import {GeoJSON} from "ol/format";
import {click, pointerMove,platformModifierKeyOnly} from "ol/events/condition";
import {Select} from "ol/interaction";
import getMapStore from "/src/stores/map.js";

// const mapStore = getMapStore();
const global_map = getCurrentInstance().appContext.config.globalProperties
let select;
let overlayPopup//函数外定义覆盖层弹窗
const information = ref({});
const map = global_map.map
//添加覆盖层弹窗
function addOverlayPopup() {
  // const addOverlayPopup=()=> {
  // 创建Overlay图层
  overlayPopup = new Overlay({
    element: document.getElementById("overlay"),
    // positioning: "center-center", //一定要加上，否则会有偏移
    autoPan: true,
    offset: [15, -10], // 设置弹出框的偏移量，例如，向右10像素，向上10像素
  });

  //创建select选择器
  select = new Select({
    condition: pointerMove,
  });

  map.addInteraction(select);

  select.on("select", (e) => {  //携带参数（e）进入函数块
    // console.log(e)
    let coordinate = e.mapBrowserEvent.coordinate; //获取点击的要素的坐标
    let featureSelect = e.selected[0]; //选中的feature要素
    if (e.selected.length !== 0) {  //如果选中了要素
      overlayPopup.setPosition(coordinate); //定义overlayPopup的位置
      map.addOverlay(overlayPopup);   //地图添加overlayPopup
    } else { //没有选中要素的话
      overlayPopup.setPosition(undefined); //设定成undefined overlayPopup不会显示出来
    }
    if (featureSelect) {
      information.value = featureSelect.values_; //获取当前要素的所有属性
      //设置选中的样式
      featureSelect.setStyle(
          new style.Style({

              fill: new style.Fill({
                //矢量图层填充颜色，以及透明度
                color: "#c5888f",
              }),
              stroke: new style.Stroke({
                //边界样式
                color: "#bb1e4d",
                width: 3,
              }),

          })
      );
    }
  });
}
// addOverlayPopup()

onMounted(() => { //子组件完成overlay容器渲染后，执行addOverlayPopup()
  addOverlayPopup()
})

</script>

<template>
  <!--  <div id="mapDiv"></div>-->
  <div id="overlay">
    <template v-if="Object.keys(information).length > 1">
      <el-card width:auto >
        <template v-for="(value,key) in information">
          <p  v-if="key!=='geometry'" :key="key" >{{ key +'；'+value }}</p>
        </template>
        <img
            :src=information.img
            style="width: 100%"
            alt=""/>
      </el-card>
    </template>
  </div>
</template>

<style scoped lang="scss">
#mapDiv {
  position: absolute;
  height: 90%;
  width: 90%;
}


</style>
