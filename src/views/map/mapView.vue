<script setup>
import {onMounted,ref,onBeforeMount,getCurrentInstance} from "vue";
import {Feature, Map, Overlay, View} from "ol";
import * as style from "ol/style"
import * as layer from "ol/layer";
import * as source from "ol/source";
import {XYZ} from "ol/source";
import {fromLonLat} from "ol/proj";
import {getGeometries_Parent, getGeometriesByCode} from "/src/util/createAreas.js";
import {MultiPolygon, Polygon} from "ol/geom";
import informationPopup from '/src/components/map/informationPopup.vue'
import {platformModifierKeyOnly, pointerMove} from "ol/events/condition";
import {Select} from "ol/interaction";
import getMapStore from   "/src/stores/map.js"



// const mapStore = getMapStore()
const global_map = getCurrentInstance().appContext.config.globalProperties
let map;  //定义地图
const vecLayer = new layer.Tile({  //矢量瓦片地图
  source: new XYZ({
    url: 'https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=97b849df49f1623dfd159e47d4dc6747',
    wrapX: false
  })
})
const cvaLayer = new layer.Tile({  //矢量注记
  source: new XYZ({
    url: 'https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=97b849df49f1623dfd159e47d4dc6747',
    wrapX: false
  })
});
let areaLayer_Parent;
let areaLayer;
const createMap = () => {
  map = new Map({
    layers: [vecLayer, cvaLayer],
    // target: 'mapDiv',
    view: new View({
      center: fromLonLat([112, 24]),
      zoom: 5,
    })
  })
  // mapStore.setMap(map) //将map对象传入mapStore进行保存
  global_map.map=map;
}

//根据请求得到的数据添加到一个新的图层并显示，同时地图视点根据添加的数据移动
const getAreas = async (adCode) => {  //添加子级区域
  let areasSource = new source.Vector()  //定义地区数据源
  let features = await getGeometriesByCode(adCode); //获取地区数据(数组)
  if (features) {
    features.forEach((feature) => { //遍历features数组中的feature生成polygonFeature
      let polygonData;
      let polygonFeature;
      if (feature.geometry.type === 'MultiPolygon') {
        // console.log(feature.geometry.coordinates)
        polygonData = new MultiPolygon(feature.geometry.coordinates).transform(  //根据点坐标数组生成面数据
            "EPSG:4326",
            "EPSG:3857"
        );
        polygonFeature = new Feature({geometry: polygonData})   //根据面数据生成Feature
        polygonFeature.setProperties({"name": feature.properties.name, "adCode": feature.properties.adcode}) //设置属性
        // 判断geometry的类型，如果是Polygon，则直接转换coordinates
      } else if (feature.geometry.type === 'Polygon') {
        // console.log(feature.geometry.coordinates)
        polygonData = new Polygon(feature.geometry.coordinates).transform(  //根据点坐标数组生成面数据
            "EPSG:4326",
            "EPSG:3857"
        );
        polygonFeature = new Feature({geometry: polygonData}) //根据面数据生成Feature
        polygonFeature.setProperties({"name": feature.properties.name, "adCode": feature.properties.adcode})  //设置属性
      }
      polygonFeature.setStyle(
          new style.Style({
            fill: new style.Fill({color: "#4e98f444"}), //区域填充颜色
            stroke: new style.Stroke({
              width: 2, //线的宽度
              color: [71, 137, 227, 1], //线的颜色
            }),
          })
      )// 设置区域要素的样式
      areasSource.addFeature(polygonFeature)
    }) //forEach循环遍历结束
    areaLayer = new layer.Vector({
      source: areasSource
    }); //把areaFeature要素添加到矢量图层areaLayer中
    map.addLayer(areaLayer); //把图层添加到map
  }
}

const area_Parent = async (adCode) => { //添加父级区域
  let geometry = await getGeometries_Parent(adCode);//通过接口请求gis数据
  let areaFeature = new Feature({geometry: geometry});//创建Feature要素，把数据添加到要素中
  areaFeature.setStyle(
      new style.Style({
        fill: new style.Fill({color: "#4e98f444"}), //区域填充颜色
        stroke: new style.Stroke({
          width: 3, //线的宽度
          color: 'rgba(222,20,20,0.89)', //线的颜色
        }),
      })
  );// 设置区域要素的样式
  areaLayer_Parent = new layer.Vector({
    source: new source.Vector({
      features: [areaFeature],
    }),
  }); //把areaFeature要素添加到矢量图层areaLayer中
  map.addLayer(areaLayer_Parent); //把图层添加到map
  map
      .getView()
      .fit(geometry, {duration: 1500, padding: [100, 100, 100, 100]}); //设置把区域移动到可视屏幕中心，duration是多少毫秒，padding是距离屏幕上下左右的大小
  nowCode = adCode; //用更新区域的adCode更新nowCode
}

//select选择要素退出有bug，排除!! 使用map.click代替
// const selectGetCode = () => {
//   select = new Select({
//     condition: click,
//   })
//   map.addInteraction(select);
//   select.on("select", async (e) => {
//     if(e) {
//       beforeCode.push(nowCode); //选择事件发生时更新beforeCode
//       console.log(e.target.getFeatures())
//       let adCode = await e.target.getFeatures().array_[0].values_.adCode
//       let name = await e.target.getFeatures().array_[0].values_.name
//       // console.log(name);
//       // console.log(adCode);
//       nowCode = adCode; //准备更新地图时更新nowCode
//
//       console.log("select"+beforeCode);
//       updateAreas(adCode)
//     }
//   })
// }
let nowCode = 100000;
let beforeCode = [];
const mapClick = () => {
  map.on('click', function (event) {
    // 获取点击的像素位置
    const pixel = map.getEventPixel(event.originalEvent);
    // 检查点击位置是否与任何要素相交
    const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
      return feature;
    });
    if (feature) { //如果存在要素
      beforeCode.push(nowCode); //选择到要素时将上一次添加区域的adCode（nowCode）加入beforeCode
      console.log("更新前push了nowCode" + beforeCode[beforeCode.length - 1])
      let adCode = feature.values_.adCode
      let name = feature.values_.name
      console.log(adCode)
      console.log(name)
      // nowCode = adCode; //准备更新地图时更新nowCode
      updateAreas(adCode) //更新区域
      console.log(`获取adCode；${adCode}更新后BD；` + beforeCode + "  nowCode现在为；" + nowCode)
      //adCode为当前选择的区域的adCode, (用adCode更新区域)
      //nowCode为现在看到的区域adCode  (上一次选择的区域的adCode也就是beforeCode的最后一个元素)
      //beforeCode为之前选择的区域的adCode数组
    }

    if (!feature) { // 如果没有与任何要素相交，则执行您想要的操作
      if (beforeCode[beforeCode.length - 1] != null) {
        updateAreas(beforeCode[beforeCode.length - 1])//返回上一级区域
        console.log("更新地图后准备删除BC" + beforeCode[beforeCode.length - 1])
        // if (beforeCode.length > 1) {
        beforeCode.pop()
        // }
        console.log("删除后" + beforeCode)
      }
    }
  });
}
const updateAreas = (adCode) => {   //更新区域
  map.removeLayer(areaLayer_Parent)
  map.removeLayer(areaLayer)
  area_Parent(adCode)
  getAreas(adCode)
}


// const information = ref({});
// let select;
// let overlayPopup//函数外定义覆盖层弹窗
// //添加覆盖层弹窗
// function addOverlayPopup() {
//   // const addOverlayPopup=()=> {
//   // 创建Overlay图层
//   overlayPopup = new Overlay({
//     element: document.getElementById("overlay"),
//     // positioning: "center-center", //一定要加上，否则会有偏移
//     autoPan: true,
//     offset: [15, -10], // 设置弹出框的偏移量，例如，向右10像素，向上10像素
//   });
//
//   //创建select选择器
//   select = new Select({
//     condition: pointerMove,
//   });
//
//   map.addInteraction(select);
//
//   select.on("select", (e) => {  //携带参数（e）进入函数块
//     // console.log(e)
//     let coordinate = e.mapBrowserEvent.coordinate; //获取点击的要素的坐标
//     let featureSelect = e.selected[0]; //选中的feature要素
//     if (e.selected.length !== 0) {  //如果选中了要素
//       overlayPopup.setPosition(coordinate); //定义overlayPopup的位置
//       map.addOverlay(overlayPopup);   //地图添加overlayPopup
//     } else { //没有选中要素的话
//       overlayPopup.setPosition(undefined); //设定成undefined overlayPopup不会显示出来
//     }
//     if (featureSelect) {
//       information.value = featureSelect.values_; //获取当前要素的所有属性
//       //设置选中的样式
//       featureSelect.setStyle(
//           new style.Style({
//             image: new style.Circle({
//               radius: 10,
//               fill: new style.Fill({
//                 //矢量图层填充颜色，以及透明度
//                 color: "#",
//               }),
//               stroke: new style.Stroke({
//                 //边界样式
//                 color: "red",
//                 width: 3,
//               }),
//             }),
//           })
//       );
//     }
//   });
// }

onMounted(() => {
  map.setTarget("mapDiv") //当容器mapDiv渲染完后再指定map的容器
//   createMap()
//   area_Parent(nowCode)
//   getAreas(nowCode)
//   // selectGetCode()
//   // addOverlayPopup()
//   mapClick()
// // mapStore.setMap(map)
})
onBeforeMount(() => { //在加载子组件前执行父组件的函数
  createMap()
  area_Parent(nowCode)
  getAreas(nowCode)
  // selectGetCode()
  // addOverlayPopup()
  mapClick()
// mapStore.setMap(map)
})
</script>

<template>
  <div id="mapDiv"/>
  <informationPopup/>
<!--  <div id="overlay">-->
<!--    <template v-if="Object.keys(information).length > 1">-->
<!--    <el-card width:auto >-->
<!--      <template v-for="(value,key) in information">-->
<!--      <p  v-if="key!=='geometry'" :key="key" >{{ key +'；'+value }}</p>-->
<!--      </template>-->
<!--      <img-->
<!--          :src=information.img-->
<!--          style="width: 100%"-->
<!--          alt=""/>-->
<!--    </el-card>-->
<!--    </template>-->
<!--  </div>-->
</template>

<style scoped lang="scss">
#mapDiv {
  position: absolute;
  height: 90%;
  width: 90%;
}
</style>
