<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FilterChangePayload, PriceBand } from '@/types'

interface TabItem {
  id: number
  name: string
  label: string
  list: string[]
}

interface StarPriceItem {
  label: string
  star?: number
  price?: PriceBand
}

interface FilterGroup {
  title: string
  list: string[]
}

const emit = defineEmits<{
  'filter-change': [payload: FilterChangePayload]
}>()

const props = defineProps<{
  activeFilters?: FilterChangePayload
}>()

// 当前激活的筛选条件（数组支持多选）
const activeArea = ref<string[]>(props.activeFilters?.area || [])
const activeStar = ref<number[]>(props.activeFilters?.starLevel || [])
const activePrice = ref<PriceBand[]>(props.activeFilters?.priceLevel || [])

// 从父组件同步后续筛选状态变化
watch(
  () => props.activeFilters,
  (val: FilterChangePayload | undefined) => {
    activeArea.value = val?.area || []
    activeStar.value = val?.starLevel || []
    activePrice.value = val?.priceLevel || []
  },
  { deep: true }
)

const activeName = ref('first')
const onTabKeydown = (event: KeyboardEvent, index: number): void => {
  const count = topfilterlist.length
  const next = event.key === 'ArrowRight' ? (index + 1) % count
    : event.key === 'ArrowLeft' ? (index - 1 + count) % count
    : event.key === 'Home' ? 0
    : event.key === 'End' ? count - 1 : -1
  if (next < 0) return
  event.preventDefault()
  activeName.value = topfilterlist[next].name
  const tabs = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
  tabs?.[next]?.focus()
}


// 工具：数组 toggle（存在则移除，不存在则添加）
const toggleArray = <T>(arr: T[], item: T): T[] => {
  return arr.includes(item) ? arr.filter(v => v !== item) : [...arr, item]
}

// 区域筛选（多选 toggle）
const onAreaClick = (label: string): void => {
  activeArea.value = toggleArray(activeArea.value, label)
  emitChange()
}

// 星级/价格筛选（多选 toggle）
const onStarPriceClick = (item: StarPriceItem): void => {
  if (item.star) {
    activeStar.value = toggleArray(activeStar.value, item.star)
  }
  if (item.price) {
    activePrice.value = toggleArray(activePrice.value, item.price)
  }
  emitChange()
}

const emitChange = (): void => {
  const filters: FilterChangePayload = {}
  if (activeArea.value.length) filters.area = activeArea.value
  if (activeStar.value.length) filters.starLevel = activeStar.value
  if (activePrice.value.length) filters.priceLevel = activePrice.value
  emit('filter-change', filters)
}

// 区域列表
const topfilterlist: TabItem[] = [
  { id: 1, name: 'first', label: '中心城区', list: ['黄浦区', '静安区', '徐汇区', '长宁区', '虹口区', '杨浦区', '普陀区'] },
  { id: 2, name: 'second', label: '浦东及近郊', list: ['浦东新区', '闵行区', '宝山区', '嘉定区', '松江区'] },
  { id: 3, name: 'third', label: '远郊区域', list: ['青浦区', '奉贤区', '金山区', '崇明区'] },
]

// 星级/价格
const pricelist: StarPriceItem[] = [
  { label: '五星(钻级)', star: 5 },
  { label: '四星(钻级)', star: 4 },
  { label: '三星(钻级)', star: 3 },
  { label: '二星(钻级)及以下', star: 2 },
  { label: '150以下', price: 'under150' },
  { label: '150-299', price: '150to299' },
  { label: '300-449', price: '300to449' },
  { label: '450-599', price: '450to599' },
  { label: '600以上', price: '600plus' },
]

// 高级筛选
const filterlist: FilterGroup[] = [
  { title: '早餐', list: ['含早餐', '单份早餐', '多份早餐'] },
  { title: '支付方式', list: ['在线付款', '到店付款', '闪住'] },
  { title: '房型', list: ['单床房', '双床房', '多床房', '大床房', '特大床房'] },
  { title: '酒店设施', list: ['免费停车', '室内泳池', '接送服务', '健身房', 'SPA', '允许携带宠物'] },
  { title: '住宿类型', list: ['豪华五星级酒店', '商务型酒店', '经济型酒店', '民宿/客栈', '青年旅舍'] },
  { title: '特色主题', list: ['自然风光', '城市美景', '情侣蜜月', '电竞/游戏', '特色建筑'] },
  { title: '品牌', list: ['全季', '亚朵', '宝格丽', '四季', '柏悦', '维也纳国际'] },
  { title: '评分', list: ['4.5分以上', '4.0分以上', '3.5分以上'] }
]

</script>

<template>
  <div class="topfilter">
    <div>
      <h4>位置区域</h4>
    </div>
    <div class="topfilter-tab">
      <div class="filter-tabs" role="tablist" aria-label="位置区域分类">
        <button
          v-for="(v, index) in topfilterlist"
          :key="v.id"
          type="button"
          role="tab"
          :aria-selected="activeName === v.name"
          :tabindex="activeName === v.name ? 0 : -1"
          :class="['filter-tab', { active: activeName === v.name }]"
          @click="activeName = v.name"
          @keydown="onTabKeydown($event, index)"
        >{{ v.label }}</button>
      </div>
      <div class="filter-options" role="tabpanel">
        <button
          v-for="area in topfilterlist.find(v => v.name === activeName)?.list ?? []"
          :key="area"
          type="button"
          class="filter-option"
          :class="{ selected: activeArea.includes(area) }"
          :aria-pressed="activeArea.includes(area)"
          @click="onAreaClick(area)"
        >{{ area }}</button>
      </div>
    </div>
    <div>
      <h4>星级价格</h4>
    </div>
    <div class="topfilter-price">
      <button
        v-for="(v, i) in pricelist"
        :key="i"
        type="button"
        class="filter-option"
        :class="{ selected: (v.star && activeStar.includes(v.star)) || (v.price && activePrice.includes(v.price)) }"
        :aria-pressed="Boolean((v.star && activeStar.includes(v.star)) || (v.price && activePrice.includes(v.price)))"
        @click="onStarPriceClick(v)"
      >{{ v.label }}</button>
    </div>
    <div>
      <h4>高级筛选</h4>
    </div>
    <div class="topfilter-filter">
      <details v-for="(v, i) in filterlist" :key="i" class="advanced-filter">
        <summary>{{ v.title }}</summary>
        <div class="advanced-options"><span v-for="(option, j) in v.list" :key="j">{{ option }}</span></div>
      </details>
    </div>
  </div>
</template>

<style scoped>
.filter-tabs { display: flex; border-bottom: 1px solid var(--el-border-color); gap: 20px; }
.filter-tab { border: 0; border-bottom: 2px solid transparent; background: transparent; padding: 10px 2px; color: var(--el-text-color-regular); cursor: pointer; font: inherit; }
.filter-tab.active { border-bottom-color: var(--el-color-primary); color: var(--el-color-primary); }
.filter-options { padding-top: 8px; }
.filter-option { margin: 5px; padding: 5px 12px; border: 1px solid var(--el-border-color); border-radius: 4px; background: var(--el-fill-color-light); color: var(--el-text-color-regular); cursor: pointer; font: inherit; font-size: 12px; }
.filter-option:hover, .filter-option.selected { border-color: var(--el-color-primary); color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
.filter-tab:focus-visible, .filter-option:focus-visible, .advanced-filter summary:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 2px; }
.topfilter-filter { display: flex; flex-wrap: wrap; align-items: flex-start; }
.advanced-filter { position: relative; margin: 10px 15px; color: var(--el-text-color-regular); }
.advanced-filter summary { cursor: pointer; list-style: none; }
.advanced-filter summary::after { content: '⌄'; margin-left: 6px; }
.advanced-options { position: absolute; z-index: 10; top: 100%; left: 0; min-width: 140px; padding: 8px 0; border: 1px solid var(--el-border-color); border-radius: 4px; background: var(--el-bg-color-overlay); box-shadow: var(--el-box-shadow-light); }
.advanced-options span { display: block; white-space: nowrap; padding: 6px 14px; font-size: 13px; }
</style>
