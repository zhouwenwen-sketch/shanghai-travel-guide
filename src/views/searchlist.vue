<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import type { FilterChangePayload } from '@/types'
import { validateSearchDates } from '@/utils/search-dates'

const router = useRouter()

const destination = ref('')
const keyword = ref('')
const guests = ref('')
const checkIn = ref('')
const checkOut = ref('')
const dateError = ref('')
const validateDates = (): boolean => {
  if (!checkIn.value && !checkOut.value) {
    dateError.value = ''
    return true
  }
  if (!validateSearchDates(checkIn.value, checkOut.value)) {
    dateError.value = '请选择完整日期，且退房日期须晚于入住日期'
    return false
  }
  dateError.value = ''
  return true
}

const props = defineProps<{
  filters?: FilterChangePayload
}>()

// 暴露内部状态给父组件（index.vue），以便点击筛选时一并携带搜索条件
defineExpose({
  destination,
  keyword,
  guests,
  checkIn,
  checkOut,
  validateDates,
})

const handleSearch = () => {
  if (!validateDates()) return
  const query: Record<string, string> = {}
  if (destination.value.trim()) query.destination = destination.value.trim()
  if (keyword.value.trim()) query.keyword = keyword.value.trim()
  if (guests.value.trim()) query.guests = guests.value.trim()
  if (checkIn.value && checkOut.value) {
    query.checkIn = checkIn.value
    query.checkOut = checkOut.value
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
                <label for="check-in">入住日期 / 退房日期</label>
                <div class="date-inputs">
                    <input id="check-in" v-model="checkIn" type="date" aria-label="入住日期" @input="dateError = ''">
                    <span>至</span>
                    <input v-model="checkOut" type="date" aria-label="退房日期" :min="checkIn || undefined" @input="dateError = ''">
                </div>
                <span v-if="dateError" class="date-error" role="alert">{{ dateError }}</span>
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
.date-inputs { display: flex; align-items: center; gap: 4px; }
.date-inputs input { min-width: 0; width: 130px; padding: 6px 2px; font: inherit; }
.date-error { display: block; color: var(--el-color-danger); font-size: 12px; }
</style>
