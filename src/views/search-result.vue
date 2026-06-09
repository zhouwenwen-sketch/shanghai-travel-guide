<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { searchHotels } from '@/api/hotels'
import Topfilter from './topfilter.vue'
import type { Hotel, FilterChangePayload, CriteriaTag } from '@/types'

const route = useRoute()
const router = useRouter()

// 分页
const currentPage = ref(1)
const pageSize = ref(6)

const queryKeyword = computed(() => String(route.query.keyword || ''))
const queryDestination = computed(() => String(route.query.destination || ''))
const queryCheckIn = computed(() => String(route.query.checkIn || ''))
const queryCheckOut = computed(() => String(route.query.checkOut || ''))
const queryGuests = computed(() => String(route.query.guests || ''))

const hasCriteria = computed(() => {
  return !!(queryKeyword.value || queryDestination.value || queryCheckIn.value || queryGuests.value)
})

// 筛选条件（数组，支持多选）
const parseArrayParam = (val: unknown): string[] => {
  if (!val) return []
  return String(val).split(',').filter(Boolean)
}

const filters = reactive<{ area: string[]; starLevel: number[]; priceLevel: string[] }>({
  area: parseArrayParam(route.query.area),
  starLevel: parseArrayParam(route.query.starLevel).map(Number),
  priceLevel: parseArrayParam(route.query.priceLevel),
})

const onFilterChange = (f: FilterChangePayload): void => {
  currentPage.value = 1
  filters.area = f.area || []
  filters.starLevel = f.starLevel || []
  filters.priceLevel = f.priceLevel || []
}

const removeFilter = (key: 'area' | 'starLevel' | 'priceLevel'): void => {
  currentPage.value = 1
  if (key === 'area') filters.area = []
  if (key === 'starLevel') filters.starLevel = []
  if (key === 'priceLevel') filters.priceLevel = []
}

const starLabel = (lv: number): string => ({ 5: '五星', 4: '四星', 3: '三星', 2: '二星及以下' }[lv] || '')
const starTagType = (lv: number): 'danger' | 'warning' | 'info' => {
  if (lv === 5) return 'danger'
  if (lv === 4) return 'warning'
  return 'info'
}
const priceLabel = (lv: string): string => {
  const map: Record<string, string> = { 'low-low': '150以下', 'low': '150-300', 'mid': '300-450', 'high': '450-600', 'luxury': '600以上' }
  return map[lv] || ''
}

const activeFilterCount = computed(() => {
  let n = 0
  if (filters.area.length) n++
  if (filters.starLevel.length) n++
  if (filters.priceLevel.length) n++
  return n
})

const rawResults = ref<Hotel[]>([])
const loading = ref(false)

// 前端本地多选过滤 —— 同类目下 OR 逻辑
const filteredResults = computed(() => {
  return rawResults.value.filter(hotel => {
    if (filters.area.length && !filters.area.includes(hotel.area)) return false
    if (filters.starLevel.length && !filters.starLevel.includes(hotel.starLevel)) return false
    if (filters.priceLevel.length && !filters.priceLevel.includes(hotel.priceLevel)) return false
    return true
  })
})

const total = computed(() => filteredResults.value.length)

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredResults.value.slice(start, start + pageSize.value)
})

const fetchResults = async () => {
  loading.value = true
  currentPage.value = 1
  try {
    const kw = [queryKeyword.value, queryDestination.value].filter(Boolean).join(' ')
    rawResults.value = await searchHotels({ keyword: kw || undefined })
  } catch (e: unknown) {
    console.error('搜索失败:', e)
  } finally {
    loading.value = false
  }
}

// 关键词/目的地变化时重新拉取数据；筛选变化时前端自动重算（不用重新请求）
onMounted(fetchResults)

const goDetail = (id: number): void => {
  router.push({ name: 'hotel-detail', params: { id } })
}

const goBack = () => {
  router.back()
}

const criteriaTags = computed<CriteriaTag[]>(() => {
  const tags = []
  if (queryDestination.value) tags.push({ label: '目的地', value: queryDestination.value })
  if (queryKeyword.value) tags.push({ label: '关键词', value: queryKeyword.value })
  if (queryCheckIn.value) tags.push({ label: '入住', value: queryCheckIn.value })
  if (queryCheckOut.value) tags.push({ label: '退房', value: queryCheckOut.value })
  if (queryGuests.value) tags.push({ label: '住客', value: queryGuests.value })
  return tags
})
</script>

<template>
  <div class="search-result">
    <div class="result-back">
      <el-button :icon="ArrowLeft" @click="goBack" text>返回首页</el-button>
    </div>

    <div class="result-header">
      <div class="result-title-row">
        <h2>
          <template v-if="hasCriteria">
            <span v-if="queryDestination">「{{ queryDestination }}」</span>
            <span v-if="queryKeyword">「{{ queryKeyword }}」</span>
          </template>
          <template v-else>全部酒店</template>
        </h2>
        <span class="result-count">共 {{ filteredResults.length }} 家</span>
      </div>
      <div class="result-criteria" v-if="criteriaTags.length">
        <el-tag v-for="(t, i) in criteriaTags" :key="'c' + i" type="info" size="small">{{ t.label }}：{{ t.value }}</el-tag>
      </div>
    </div>

    <div class="result-filter-bar">
      <Topfilter @filter-change="onFilterChange" :active-filters="filters" />
    </div>

    <div class="active-filters" v-if="activeFilterCount">
      <span class="filter-hint">已选筛选：</span>
      <el-tag v-for="a in filters.area" :key="'a-'+a" closable size="small" type="primary" @close="removeFilter('area')">{{ a }}</el-tag>
      <el-tag v-for="s in filters.starLevel" :key="'s-'+s" closable size="small" type="primary" @close="removeFilter('starLevel')">{{ starLabel(s) }}</el-tag>
      <el-tag v-for="p in filters.priceLevel" :key="'p-'+p" closable size="small" type="primary" @close="removeFilter('priceLevel')">{{ priceLabel(p) }}</el-tag>
    </div>

    <div v-loading="loading" class="result-loading-wrap">
      <template v-if="filteredResults.length">
        <div class="result-list">
          <div class="result-item" v-for="hotel in paginatedResults" :key="hotel.id">
            <div class="item-left">
              <div class="item-img" @click="goDetail(hotel.id)">
                <img :src="hotel.img_url" alt="" />
              </div>
              <div class="item-info">
                <div class="item-title-row" @click="goDetail(hotel.id)">
                  <h3>{{ hotel.name }}</h3>
                  <img :src="`./images/${hotel.starimg_url}`" alt="" class="star-img" />
                  <el-tag :type="starTagType(hotel.starLevel)" size="small" class="star-level-tag">{{ starLabel(hotel.starLevel) }}</el-tag>
                  <span class="item-recommend" v-if="hotel.recommended">推荐</span>
                </div>
                <p class="item-address">{{ hotel.transport }}</p>
                <div class="item-tags">
                  <el-tag v-for="(t, i) in hotel.tag.slice(0, 5)" :key="i" type="warning" effect="plain" size="small">{{ t }}</el-tag>
                </div>
              </div>
            </div>
            <div class="item-right">
              <div class="item-comment">
                <span class="comment-desc">{{ hotel.reviewDesc }}</span>
                <span class="comment-score">{{ hotel.rating }}</span>
              </div>
              <div class="item-price">
                <span class="price-label">￥</span>
                <span class="price-value">{{ hotel.price }}</span>
                <span class="price-unit">起/晚</span>
              </div>
              <el-button type="primary" size="small" @click="goDetail(hotel.id)">查看详情</el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="result-pagination" v-if="filteredResults.length > pageSize">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[6, 12, 24]"
            layout="total, sizes, prev, pager, next, jumper"
            background
          />
        </div>
      </template>

      <div class="result-empty" v-else>
      <el-empty description="未找到匹配的酒店">
        <template #extra>
          <p class="empty-tip">试试调整筛选条件或搜索关键词</p>
          <el-button type="primary" @click="goBack">返回首页</el-button>
        </template>
      </el-empty>
    </div>
  </div>
</div>
</template>

<style scoped>
.search-result {
  width: 1200px;
  margin: 0 auto;
  padding: 16px 0 40px;
}

.result-back {
  margin-bottom: 12px;
}

.result-header {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.result-title-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 10px;
}

.result-title-row h2 {
  font-size: 22px;
  font-weight: 700;
}

.result-count {
  font-size: 14px;
  color: #999;
}

.result-criteria {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.result-filter-bar {
  background: #fff;
  border-radius: 8px;
  padding: 8px 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.filter-hint {
  font-size: 13px;
  color: #666;
}

.result-list {
  background: #fff;
  border-radius: 8px;
  padding: 8px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.result-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.result-item:last-child {
  border-bottom: none;
}

.item-left {
  flex: 1;
  display: flex;
  gap: 16px;
}

.item-img {
  flex: 0 0 200px;
  height: 140px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  background: #f5f5f5;
}

.item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.item-img:hover img {
  transform: scale(1.05);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.item-title-row:hover h3 {
  color: var(--el-color-primary);
}

.item-title-row h3 {
  font-size: 18px;
  font-weight: 600;
  transition: color 0.2s;
}

.star-img {
  height: 18px;
  width: auto;
}

.star-level-tag {
  font-size: 11px;
  margin-left: 2px;
}

.item-recommend {
  font-size: 11px;
  background: #f56c6c;
  color: #fff;
  padding: 1px 6px;
  border-radius: 3px;
}

.item-address {
  font-size: 13px;
  color: #999;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  padding-left: 24px;
  border-left: 1px solid #f0f0f0;
  min-width: 140px;
}

.item-comment {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-desc {
  font-size: 13px;
  color: var(--el-color-primary);
}

.comment-score {
  background: var(--el-color-primary);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 700;
}

.item-price {
  display: flex;
  align-items: baseline;
}

.price-label {
  font-size: 12px;
  color: #f56c6c;
}

.price-value {
  font-size: 22px;
  font-weight: 700;
  color: #f56c6c;
}

.price-unit {
  font-size: 12px;
  color: #999;
}

.result-loading-wrap {
  min-height: 200px;
}

.result-empty {
  background: #fff;
  border-radius: 8px;
  padding: 60px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.empty-tip {
  color: #999;
  font-size: 14px;
  margin-bottom: 12px;
}

.result-pagination {
  display: flex;
  justify-content: center;
  padding: 24px 0 8px;
}
</style>
