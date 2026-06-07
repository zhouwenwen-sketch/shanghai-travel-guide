<script setup lang="ts">
import { ref, watch } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

const emit = defineEmits(['filter-change'])

const props = defineProps({
  activeFilters: {
    type: Object,
    default: () => ({ area: '', starLevel: 0, priceLevel: '' }),
  },
})

// 从父组件同步当前筛选状态
watch(
  () => props.activeFilters,
  (val) => {
    activeArea.value = val.area || ''
    activeStar.value = val.starLevel || 0
    activePrice.value = val.priceLevel || ''
  },
  { deep: true }
)

const activeName = ref('first')

const handleClick = () => {}

// 当前激活的筛选条件
const activeArea = ref('')
const activeStar = ref(0)
const activePrice = ref('')

// 区域列表
const topfilterlist = ref([
  { id: 1, name: 'first', label: '热门筛选', list: ['网红打卡', '老字号', '寺庙祈福', '展览演出', '看展', '城市漫步', '泡汤汗蒸', '赏花', '博物馆探秘', '本地美食', '古镇风情'] },
  { id: 2, name: 'second', label: '机场车站', list: ['虹桥国际机场', '浦东国际机场', '上海虹桥站', '上海站', '上海南站', '上海西站', '松江南站', '上海虹桥长途汽车站', '上海长途客运南站', '地铁2号线沿线', '市域机场线站点'] },
  { id: 3, name: 'third', label: '商业区', list: ['南京东路步行街', '京西路', '陆家嘴', '淮海中路', '家汇', '豫园商城', '人民广场', '中山公园', '静安寺', '新天地', '环球港', '苏河湾万象天地'] },
  { id: 4, name: 'fourth', label: '景点', list: ['外滩', '迪士尼度假区', '豫园', '东方明珠', '田子坊', '上海野生动物园', '上海天文馆', '朱家角古镇', '上海博物馆', '武康路', '静安寺', '顾村公园', '广富林文化遗址', '上海欢乐谷', '枫泾古镇'] }
])

// 星级/价格
const pricelist = ref([
  { label: '五星(钻级)', star: 5 },
  { label: '四星(钻级)', star: 4 },
  { label: '三星(钻级)', star: 3 },
  { label: '二星(钻级)及以下', star: 2 },
  { label: '150以下', price: 'low-low' },
  { label: '150-300', price: 'low' },
  { label: '300-450', price: 'mid' },
  { label: '450-600', price: 'high' },
  { label: '600以上', price: 'luxury' },
])

// 高级筛选
const filterlist = ref([
  { title: '早餐', list: ['含早餐', '单份早餐', '多份早餐'] },
  { title: '支付方式', list: ['在线付款', '到店付款', '闪住'] },
  { title: '房型', list: ['单床房', '双床房', '多床房', '大床房', '特大床房'] },
  { title: '酒店设施', list: ['免费停车', '室内泳池', '接送服务', '健身房', 'SPA', '允许携带宠物'] },
  { title: '住宿类型', list: ['豪华五星级酒店', '商务型酒店', '经济型酒店', '民宿/客栈', '青年旅舍'] },
  { title: '特色主题', list: ['自然风光', '城市美景', '情侣蜜月', '电竞/游戏', '特色建筑'] },
  { title: '品牌', list: ['全季', '亚朵', '宝格丽', '四季', '柏悦', '维也纳国际'] },
  { title: '评分', list: ['4.5分以上', '4.0分以上', '3.5分以上'] }
])

// 区域筛选
const onAreaClick = (label) => {
  if (activeArea.value === label) {
    activeArea.value = ''
  } else {
    activeArea.value = label
  }
  emitChange()
}

// 星级/价格筛选
const onStarPriceClick = (item) => {
  if (item.star) {
    if (activeStar.value === item.star) {
      activeStar.value = 0
    } else {
      activeStar.value = item.star
    }
  }
  if (item.price) {
    if (activePrice.value === item.price) {
      activePrice.value = ''
    } else {
      activePrice.value = item.price
    }
  }
  emitChange()
}

// 高级筛选项点击
const onFilterItemClick = (title, value) => {
  // 高级筛选暂时只做展示，可后续扩展
}

const emitChange = () => {
  const filters = {}
  if (activeArea.value) filters.area = activeArea.value
  if (activeStar.value) filters.starLevel = activeStar.value
  if (activePrice.value) filters.priceLevel = activePrice.value
  emit('filter-change', filters)
}
</script>

<template>
  <div class="topfilter">
    <div>
      <h4>位置区域</h4>
    </div>
    <div class="topfilter-tab">
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane :label="v.label" :name="v.name" v-for="v in topfilterlist" :key="v.id">
          <el-button
            v-for="(k, i) in v.list"
            :key="i"
            size="small"
            :type="activeArea === k ? 'primary' : 'info'"
            plain
            @click="onAreaClick(k)"
          >{{ k }}</el-button>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div>
      <h4>星级价格</h4>
    </div>
    <div class="topfilter-price">
      <el-button
        size="small"
        v-for="(v, i) in pricelist"
        :key="i"
        :type="(v.star && activeStar === v.star) || (v.price && activePrice === v.price) ? 'primary' : 'info'"
        plain
        @click="onStarPriceClick(v)"
      >{{ v.label }}</el-button>
    </div>
    <div>
      <h4>高级筛选</h4>
    </div>
    <div class="topfilter-filter">
      <el-dropdown v-for="(v, i) in filterlist" :key="i">
        <span class="el-dropdown-link">
          {{ v.title }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(k, j) in v.list"
              :key="j"
              @click="onFilterItemClick(v.title, k)"
            >{{ k }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>

</style>
