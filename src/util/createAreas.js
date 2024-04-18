import {MultiPolygon, Polygon} from 'ol/geom';
import axios from "axios";
import {Feature} from "ol";

export const getGeometriesByCode = async (code) => {

    try {
        let url = `https://geo.datav.aliyun.com/areas_v3/bound/${code}_full.json`
        let result = await axios.get(url);
        if (result.status == 200) { //获取数据成功的反馈
            let features=[] ;
            result.data.features.forEach((feature)=>{
                features.push(feature)
            });
            return features //

        } else {
            console.error('获取数据失败', result.status);
        }
    } catch (error) {
        console.error('获取数据失败', error);
    }
    return null
}
export const getGeometries_Parent = async (code) => {
    try {
        let url = `https://geo.datav.aliyun.com/areas_v3/bound/${code}.json`
        let result = await axios.get(url);
        if (result.status == 200) { //获取数据成功的反馈
            // 判断geometry的类型，如果是MultiPolygon，则将coordinates转换为Polygon数组
            if (result.data.features[0].geometry.type == 'MultiPolygon') {
                // console.log(result.data.features[0].geometry.coordinates)
                return new MultiPolygon(result.data.features[0].geometry.coordinates).transform(
                    "EPSG:4326",
                    "EPSG:3857"
                );
                // 判断geometry的类型，如果是Polygon，则直接转换coordinates
            } else if (result.data.features[0].geometry.type == 'Polygon') {
                // console.log(result.data.features[0].geometry.coordinates)
                return new Polygon(result.data.features[0].geometry.coordinates).transform(
                    "EPSG:4326",
                    "EPSG:3857"
                );
            }
        } else {
            console.error('获取数据失败', result.status);
        }
    } catch (error) {
        console.error('获取数据失败', error);
    }
    return null
}
