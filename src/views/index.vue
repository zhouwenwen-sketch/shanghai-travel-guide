<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FilterChangePayload } from '@/types'
import NavMenu from './navMenu.vue'
import Header from './headerNav.vue'
import Searchlist from './searchlist.vue'
import Topfilter from './topfilter.vue'
import Recommend from './recommend.vue'

const router = useRouter()
type SearchlistExpose = {
  destination: string
  keyword: string
  guests: string
  checkIn: string
  checkOut: string
  validateDates: () => boolean
}

// defineExpose 暴露的 ref 在父组件实例代理上会被自动解包。
const searchlistRef = ref<SearchlistExpose | null>(null)

// 当前筛选状态（同步给 Searchlist 和 Topfilter）
const activeFilters = reactive<FilterChangePayload>({})

// 从 Searchlist 组件读取搜索框当前输入，拼接为 URL query
const buildSearchQuery = (filters: FilterChangePayload): Record<string, string> => {
  const query: Record<string, string> = {}
  const sl = searchlistRef.value
  if (sl) {
    if (sl.destination.trim()) query.destination = sl.destination.trim()
    if (sl.keyword.trim()) query.keyword = sl.keyword.trim()
    if (sl.guests.trim()) query.guests = sl.guests.trim()
    if (sl.checkIn && sl.checkOut && sl.checkOut > sl.checkIn) {
      query.checkIn = sl.checkIn
      query.checkOut = sl.checkOut
    }
  }
  if (filters.area?.length) query.area = filters.area.join(',')
  if (filters.starLevel?.length) query.starLevel = filters.starLevel.join(',')
  if (filters.priceLevel?.length) query.priceLevel = filters.priceLevel.join(',')
  return query
}

// 点击筛选条件 → 携带搜索框内容 + 筛选条件，跳转到搜索页
const onFilterChange = (filters: FilterChangePayload): void => {
  if (searchlistRef.value && !searchlistRef.value.validateDates()) return
  Object.assign(activeFilters, filters)
  router.push({ name: 'search', query: buildSearchQuery(filters) })
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <NavMenu />
      <el-container>
        <el-header>
          <Header />
        </el-header>
        <el-main>
          <Searchlist ref="searchlistRef" :filters="activeFilters" />
          <Topfilter @filter-change="onFilterChange" :active-filters="activeFilters" />
          <Recommend />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<!-- scoped表示只对当前组件生效，不会污染全局 -->
<style scoped> 

</style>
