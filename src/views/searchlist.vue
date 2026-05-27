<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()

const destination = ref('')
const keyword = ref('')
const guests = ref('')
const dateRange = ref([])
const defaultTime1 = [
  new Date(2000, 1, 1, 12, 0, 0),
  new Date(2000, 2, 1, 8, 0, 0),
]

const handleSearch = () => {
  const query = {}
  if (destination.value.trim()) query.destination = destination.value.trim()
  if (keyword.value.trim()) query.keyword = keyword.value.trim()
  if (guests.value.trim()) query.guests = guests.value.trim()
  if (dateRange.value?.length === 2) {
    const [s, e] = dateRange.value
    query.checkIn = s.toLocaleDateString('zh-CN')
    query.checkOut = e.toLocaleDateString('zh-CN')
  }
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
