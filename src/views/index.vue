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
// template ref 获取 Searchlist 组件实例（defineExpose 暴露的 ref 需用 .value 访问）
const searchlistRef = ref<any>(null)

// 当前筛选状态（同步给 Searchlist 和 Topfilter）
const activeFilters = reactive<FilterChangePayload>({})

// 从 Searchlist 组件读取搜索框当前输入，拼接为 URL query
const buildSearchQuery = (filters: FilterChangePayload): Record<string, string> => {
  const query: Record<string, string> = {}
  const sl = searchlistRef.value
  if (sl) {
    if (sl.destination?.value?.trim()) query.destination = sl.destination.value.trim()
    if (sl.keyword?.value?.trim()) query.keyword = sl.keyword.value.trim()
    if (sl.guests?.value?.trim()) query.guests = sl.guests.value.trim()
    if (sl.dateRange?.value) {
      const [s, e] = sl.dateRange.value
      query.checkIn = s.toLocaleDateString('zh-CN')
      query.checkOut = e.toLocaleDateString('zh-CN')
    }
  }
  if (filters.area?.length) query.area = filters.area.join(',')
  if (filters.starLevel?.length) query.starLevel = filters.starLevel.join(',')
  if (filters.priceLevel?.length) query.priceLevel = filters.priceLevel.join(',')
  return query
}

// 点击筛选条件 → 携带搜索框内容 + 筛选条件，跳转到搜索页
const onFilterChange = (filters: FilterChangePayload): void => {
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
