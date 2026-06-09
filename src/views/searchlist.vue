<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import type { FilterChangePayload } from '@/types'

const router = useRouter()

const destination = ref('')
const keyword = ref('')
const guests = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const defaultTime1: [Date, Date] = [
  new Date(2000, 1, 1, 12, 0, 0),
  new Date(2000, 2, 1, 8, 0, 0),
]

const props = defineProps<{
  filters?: FilterChangePayload
}>()

// 暴露内部状态给父组件（index.vue），以便点击筛选时一并携带搜索条件
defineExpose({
  destination,
  keyword,
  guests,
  dateRange,
})

const handleSearch = () => {
  const query: Record<string, string> = {}
  if (destination.value.trim()) query.destination = destination.value.trim()
  if (keyword.value.trim()) query.keyword = keyword.value.trim()
  if (guests.value.trim()) query.guests = guests.value.trim()
  if (dateRange.value) {
    const [s, e] = dateRange.value
    query.checkIn = s.toLocaleDateString('zh-CN')
    query.checkOut = e.toLocaleDateString('zh-CN')
  }
  // 将父组件传递的筛选条件一并带到搜索页（数组用逗号拼接）
  if (props.filters?.area?.length) query.area = props.filters.area.join(',')
  if (props.filters?.starLevel?.length) query.starLevel = props.filters.starLevel.join(',')
  if (props.filters?.priceLevel?.length) query.priceLevel = props.filters.priceLevel.join(',')
  router.push({ name: 'search', query })
}
</script>

<template>
    <div class="searchlist">
        <div class="searchlist-item">
            <div class="search-box">
                <label for="hotels-destination">目的地/酒店名称</label>
                <input type="text" id="hotels-destination" v-model="destination" placeholder="上海">
            </div>
        </div>
        <div class="searchlist-item">
            <div class="search-box">
                <label>入住时间/退房时间</label>
                <el-date-picker
                    v-model="dateRange"
                    type="datetimerange"
                    start-placeholder="Start Date"
                    end-placeholder="End Date"
                    :default-time="defaultTime1"
                />
            </div>
        </div>
        <div class="searchlist-item">
            <div class="search-box">
                <label for="room-guest">房间及住客</label>
                <input type="text" id="room-guest" v-model="guests" placeholder="1间/1位">
            </div>
        </div>
        <div class="searchlist-item">
            <div class="search-box">
                <label for="keyword">关键词（选填）</label>
                <input type="text" id="keyword" v-model="keyword" placeholder="火车、酒店名称或区域">
            </div>
        </div>
        <div class="searchlist-item">
            <el-button type="primary" :icon="Search" @click="handleSearch"></el-button>
        </div>
    </div>

</template>

<style scoped>

</style>
