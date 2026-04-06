<script setup>
import { ref } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
const avtiveName = ref('first')
// 定义数组对象
let topfilterlist = ref([
  {id:1,name:'first',label:'热门筛选',list:['网红打卡','老字号','寺庙祈福','展览演出','看展','城市漫步','泡汤汗蒸','赏花','博物馆探秘','本地美食','古镇风情',]},
  {id:2,name:'second',label:'机场车站',list:['虹桥国际机场','浦东国际机场','上海虹桥站','上海站','上海南站','上海西站','松江南站','上海虹桥长途汽车站','上海长途客运南站','地铁2号线沿线','市域机场线站点']},
  {id:3,name:'third',label:'商业区',list:['南京东路步行街','京西路','陆家嘴','淮海中路','家汇','豫园商城','人民广场','中山公园','静安寺','新天地','环球港','苏河湾万象天地']},
  {id:4,name:'fourth',label:'景点',list:['外滩','迪士尼度假区','豫园','东方明珠','田子坊','上海野生动物园','上海天文馆','朱家角古镇','上海博物馆','武康路','静安寺','顾村公园','广富林文化遗址','上海欢乐谷','枫泾古镇']}
])
//定义数组
let pricelist = ref(['五星(钻级)','四星(钻级)','三星(钻级)','二星(钻级)及以下','1500以下','150-300','300-450','450-600','600以上'])
let filterlist = ref([
  {title:'早餐',list:['含早餐','单份早餐','多份早餐']},
  {title:'支付方式',list:['在线付款','到店付款','闪住']},
  {title:'房型',list:['单床房','双床房','多床房','大床房','特大床房']},
  {title:'酒店设施',list:['免费停车','室内泳池','接送服务','健身房','SPA','允许携带宠物']},
  {title:'住宿类型',list:['豪华五星级酒店','商务型酒店','经济型酒店','民宿/客栈','青年旅舍']},
  {title:'特色主题',list:['自然风光','城市美景','情侣蜜月','电竞/游戏','特色建筑']},
  {title:'品牌',list:['全季 ','亚朵','宝格丽','四季','柏悦','维也纳国际']},
  {title:'评分',list:['4.5分以上','4.0分以上','3.5分以上']}
])
</script>

<template>
  <div class="topfilter">
    <div>
      <h4>位置区域</h4>
    </div>
    <div class="topfilter-tab">
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane :label="v.label" :name="v.name" v-for="v in topfilterlist" :key="v.id">
          <el-button v-for="(k,i) in v.list" :key="i" size="small" type="info" plain>{{ k }}</el-button>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div>
      <h4>星级价格</h4>
    </div>
      <div class="topfilter-price">
      <el-button size="small" type="info" plain v-for="(v,i) in pricelist" :key="i">{{ v }}</el-button>
    </div>
    <div>
      <h4>高级筛选</h4>
    </div>
    <div class="topfilter-filter">
      <el-dropdown v-for="(v,i) in filterlist" :key="i">
        <span class="el-dropdown-link">
          {{ v.title }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="(k,i) in v.list" :key="i">{{ k }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
   </div>
</template>
   
<style scoped> 

</style>
