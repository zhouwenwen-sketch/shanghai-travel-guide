<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { searchHotelsPaged } from '@/api/hotels'
import { getPois } from '@/api/pois'
import Topfilter from './topfilter.vue'
import type { HotelListItem, FilterChangePayload, CriteriaTag, HotelSort, PageResponse, Poi, PoiType, PriceBand } from '@/types'
import { LatestRequest } from '@/utils/latest-request'
import { normalizeSearchListParam } from '@/utils/hotel-search'

const route = useRoute()
const router = useRouter()

// 分页
const currentPage = ref(1)
const sizes = [6, 12, 24] as const
const sorts: HotelSort[] = ['idAsc','priceAsc','priceDesc','ratingDesc']
const bands: PriceBand[] = ['under150','150to299','300to449','450to599','600plus']
const pageSize = ref<6 | 12 | 24>(sizes.includes(Number(route.query.size) as 6|12|24) ? Number(route.query.size) as 6 | 12 | 24 : 6)
const sort = ref<HotelSort>(sorts.includes(String(route.query.sort) as HotelSort) ? String(route.query.sort) as HotelSort : 'idAsc')
const routePage=Number(route.query.page);currentPage.value=Number.isSafeInteger(routePage)&&routePage>=1&&routePage<=10001?routePage:1

const queryKeyword = computed(() => String(route.query.keyword || ''))
const queryDestination = computed(() => String(route.query.destination || ''))
const queryCheckIn = computed(() => String(route.query.checkIn || ''))
const queryCheckOut = computed(() => String(route.query.checkOut || ''))
const queryGuests = computed(() => String(route.query.guests || ''))

const hasCriteria = computed(() => {
  return !!(queryKeyword.value || queryDestination.value || queryCheckIn.value || queryGuests.value)
})

// 筛选条件（数组，支持多选）
const filters = reactive<{ area: string[]; starLevel: number[]; priceLevel: PriceBand[] }>({
  area: normalizeSearchListParam(route.query.area),
  starLevel: normalizeSearchListParam(route.query.starLevel, 4).map(Number).filter(value=>[2,3,4,5].includes(value)),
  priceLevel: normalizeSearchListParam(route.query.priceLevel, 5).filter((value):value is PriceBand=>bands.includes(value as PriceBand)),
})

const onFilterChange = (f: FilterChangePayload): void => {
  currentPage.value = 1
  filters.area = f.area || []
  filters.starLevel = f.starLevel || []
  filters.priceLevel = f.priceLevel || []
  updateUrl()
}

const removeFilter = (key: 'area' | 'starLevel' | 'priceLevel', value: string | number): void => {
  currentPage.value = 1
  if (key === 'area') filters.area = filters.area.filter(item => item !== value)
  if (key === 'starLevel') filters.starLevel = filters.starLevel.filter(item => item !== value)
  if (key === 'priceLevel') filters.priceLevel = filters.priceLevel.filter(item => item !== value)
  updateUrl()
}

const starLabel = (lv: number): string => ({ 5: '五星', 4: '四星', 3: '三星', 2: '二星及以下' }[lv] || '')
const starTagType = (lv: number): 'danger' | 'warning' | 'info' => {
  if (lv === 5) return 'danger'
  if (lv === 4) return 'warning'
  return 'info'
}
const priceLabel = (lv: PriceBand): string => {
  const map: Record<PriceBand, string> = { under150: '150以下', '150to299': '150-299', '300to449': '300-449', '450to599': '450-599', '600plus': '600以上' }
  return map[lv] || ''
}

const activeFilterCount = computed(() => {
  let n = 0
  if (filters.area.length) n++
  if (filters.starLevel.length) n++
  if (filters.priceLevel.length) n++
  return n
})

const hotelPage = ref<PageResponse<HotelListItem>>({ items: [], page: 0, size: pageSize.value, totalElements: 0, totalPages: 0 })
const poiResults = ref<Poi[]>([])
const poiError = ref('')
const poiLoading = ref(false)
const loading = ref(false)
const error = ref('')

const hotelRequests = new LatestRequest()
let poiRequestId = 0
const fetchHotels = async () => {
  const request = hotelRequests.begin()
  loading.value = true
  error.value = ''
  try {
    const kw = [queryKeyword.value, queryDestination.value].filter(Boolean).join(' ')
    const result = await searchHotelsPaged({ keyword: kw || undefined, areas: filters.area, starLevels: filters.starLevel, priceBands: filters.priceLevel, page: currentPage.value - 1, size: pageSize.value, sort: sort.value }, request.signal)
    if (!hotelRequests.isCurrent(request.id)) return
    hotelPage.value = result
    if (result.totalPages && currentPage.value > result.totalPages) { currentPage.value = result.totalPages; updateUrl(); void fetchHotels() }
  } catch (e: unknown) {
    if (request.signal.aborted || !hotelRequests.isCurrent(request.id)) return
    error.value = e instanceof Error ? e.message : '搜索失败'
  } finally {
    if (hotelRequests.isCurrent(request.id)) loading.value = false
  }
}

const fetchPois = async () => {
  const requestId = ++poiRequestId
  poiLoading.value = true
  poiError.value = ''
  try {
    const kw = [queryKeyword.value, queryDestination.value].filter(Boolean).join(' ')
    const result = await getPois({ keyword: kw || undefined, page: 0, size: 6 })
    if (requestId === poiRequestId) poiResults.value = result.items
  } catch (e) {
    if (requestId === poiRequestId) {
      poiResults.value = []
      poiError.value = e instanceof Error ? e.message : '地点加载失败'
    }
  } finally {
    if (requestId === poiRequestId) poiLoading.value = false
  }
}

function updateUrl(): void { void router.replace({ query: { ...route.query, area: filters.area.length ? filters.area.join(',') : undefined, starLevel: filters.starLevel.length ? filters.starLevel.join(',') : undefined, priceLevel: filters.priceLevel.length ? filters.priceLevel.join(',') : undefined, page: currentPage.value > 1 ? String(currentPage.value) : undefined, size: pageSize.value !== 6 ? String(pageSize.value) : undefined, sort: sort.value !== 'idAsc' ? sort.value : undefined } }) }
const changePage=(page:number)=>{currentPage.value=page;updateUrl()}
const changeSize=(size:number)=>{pageSize.value=size as 6|12|24;currentPage.value=1;updateUrl()}
const changeSort=(value:HotelSort)=>{sort.value=value;currentPage.value=1;updateUrl()}

onMounted(()=>{void fetchHotels();void fetchPois()})
watch(()=>route.fullPath,()=>{
  const nextPage=Number(route.query.page);currentPage.value=Number.isSafeInteger(nextPage)&&nextPage>=1&&nextPage<=10001?nextPage:1
  const nextSize=Number(route.query.size);pageSize.value=sizes.includes(nextSize as 6|12|24)?nextSize as 6|12|24:6
  const nextSort=String(route.query.sort||'idAsc') as HotelSort;sort.value=sorts.includes(nextSort)?nextSort:'idAsc'
  filters.area=normalizeSearchListParam(route.query.area,10)
  filters.starLevel=normalizeSearchListParam(route.query.starLevel,4).map(Number).filter(value=>[2,3,4,5].includes(value))
  filters.priceLevel=normalizeSearchListParam(route.query.priceLevel,5).filter((value):value is PriceBand=>bands.includes(value as PriceBand))
  void fetchHotels()
},{flush:'pre'})
watch([queryKeyword, queryDestination], () => { void fetchPois() })

const goDetail = (id: number): void => {
  router.push({ name: 'hotel-detail', params: { id } })
}
const typeLabel = (type: PoiType): string => ({ ATTRACTION: '景点', RESTAURANT: '美食', BUSINESS_DISTRICT: '商圈' }[type])

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
        <span class="result-count">共 {{ hotelPage.totalElements }} 家</span>
      </div>
      <div class="result-criteria" v-if="criteriaTags.length">
        <el-tag v-for="(t, i) in criteriaTags" :key="'c' + i" type="info" size="small">{{ t.label }}：{{ t.value }}</el-tag>
      </div>
    </div>

    <div class="result-filter-bar">
      <Topfilter @filter-change="onFilterChange" :active-filters="filters" />
    </div>

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="search-error">
      <el-button text @click="fetchHotels">重试</el-button>
    </el-alert>

    <section class="poi-results">
      <div class="section-heading"><h2>景点 · 美食 · 商圈</h2><span>共 {{ poiResults.length }} 个相关地点</span></div>
      <el-alert v-if="poiError" :title="poiError" type="warning" :closable="false"><el-button text @click="fetchPois">重试地点搜索</el-button></el-alert>
      <div v-loading="poiLoading" class="poi-loading-wrap">
      <div v-if="poiResults.length" class="poi-grid">
        <article v-for="poi in poiResults" :key="poi.id" class="poi-card" @click="router.push(`/pois/${poi.id}`)">
          <img :src="poi.imageUrl || '/images/banner-2.jpg'" :alt="poi.name" />
          <div><el-tag size="small">{{ typeLabel(poi.type) }}</el-tag><h3>{{ poi.name }}</h3><p>{{ poi.area }} · {{ poi.address }}</p></div>
        </article>
      </div>
      <el-empty v-else-if="!poiLoading && !poiError" description="没有找到相关地点" :image-size="64" />
      </div>
      <el-button v-if="poiResults.length" text type="primary" @click="router.push({path:'/pois',query:{keyword:queryKeyword||queryDestination}})">查看更多地点 →</el-button>
    </section>

    <div class="active-filters" v-if="activeFilterCount">
      <span class="filter-hint">已选筛选：</span>
      <el-tag v-for="a in filters.area" :key="'a-'+a" closable size="small" type="primary" @close="removeFilter('area', a)">{{ a }}</el-tag>
      <el-tag v-for="s in filters.starLevel" :key="'s-'+s" closable size="small" type="primary" @close="removeFilter('starLevel', s)">{{ starLabel(s) }}</el-tag>
      <el-tag v-for="p in filters.priceLevel" :key="'p-'+p" closable size="small" type="primary" @close="removeFilter('priceLevel', p)">{{ priceLabel(p) }}</el-tag>
    </div>
    <div class="result-sort"><span>排序：</span><el-select :model-value="sort" style="width:150px" @change="changeSort"><el-option label="默认排序" value="idAsc"/><el-option label="价格从低到高" value="priceAsc"/><el-option label="价格从高到低" value="priceDesc"/><el-option label="评分从高到低" value="ratingDesc"/></el-select></div>

    <div v-loading="loading" class="result-loading-wrap">
      <template v-if="hotelPage.items.length">
        <div class="result-list">
          <div class="result-item" v-for="hotel in hotelPage.items" :key="hotel.id">
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
        <div class="result-pagination" v-if="hotelPage.totalElements > pageSize">
          <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="hotelPage.totalElements"
            :page-sizes="[6, 12, 24]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @current-change="changePage"
            @size-change="changeSize"
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

.result-sort {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #606266;
  font-size: 14px;
}

.poi-loading-wrap {
  min-height: 96px;
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
.search-error{margin-bottom:12px}.poi-results{background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.06)}.section-heading{display:flex;align-items:baseline;gap:12px;margin-bottom:14px}.section-heading h2{font-size:20px}.section-heading span{font-size:13px;color:#909399}.poi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:10px}.poi-card{display:flex;gap:12px;border:1px solid #ebeef5;border-radius:8px;padding:8px;cursor:pointer}.poi-card:hover{border-color:#409eff}.poi-card img{width:110px;height:86px;border-radius:6px;object-fit:cover}.poi-card h3{font-size:15px;margin:7px 0}.poi-card p{font-size:12px;color:#909399;margin:0}@media(max-width:900px){.poi-grid{grid-template-columns:1fr}.search-result{width:auto;padding:12px}.poi-card img{width:100px}}

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
