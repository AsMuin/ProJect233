import {defineStore} from "pinia";
import {ref} from "vue";

export const getMapStore = defineStore('map', () => {
 const map = ref()      //持久化有bug暂时不用token持久化

const  setMap = (newMap) => {
    map.value = newMap
}
const removeMap = () => {
    map.value= null;
}

return {map,setMap,removeMap}

},
    // {persist:false},
);

export default getMapStore;
