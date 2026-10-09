<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getHomeAnalytics, type HomeAnalytics } from '@/api/analytics'

const range = ref<7 | 30>(7)
const data = ref<HomeAnalytics>()
const loading = ref(false)
const error = ref('')
let requestId = 0
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const todayStats = computed(() => data.value?.daily.find((item) => item.date === today()) ?? { pv: 0, uv: 0, sessions: 0 })

async function load(days = range.value) {
  const current = ++requestId
  loading.value = true
  error.value = ''
  const end = today()
  const date = new Date(`${end}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - days + 1)
  const start = date.toISOString().slice(0, 10)
  try {
    const result = await getHomeAnalytics(start, end)
    if (current === requestId) data.value = result
  } catch (cause) {
    if (current === requestId) error.value = cause instanceof Error ? cause.message : '统计数据加载失败'
  } finally {
    if (current === requestId) loading.value = false
  }
}
function selectRange(days: 7 | 30) { range.value = days; void load(days) }
onMounted(() => void load())
</script>

<template>
  <main class="page">
    <header><div><h1>首页访问统计</h1><p>匿名统计首页访问量，按上海时间统计。</p></div>
      <el-radio-group :model-value="range" @change="value => selectRange(value as 7 | 30)"><el-radio-button :value="7">近7天</el-radio-button><el-radio-button :value="30">近30天</el-radio-button></el-radio-group>
    </header>
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false"><el-button text @click="load()">重试</el-button></el-alert>
    <section v-loading="loading" class="cards">
      <el-card v-for="item in [{label:'今日 PV', value:todayStats.pv},{label:'今日 UV', value:todayStats.uv},{label:'今日 Session', value:todayStats.sessions}]" :key="item.label"><div class="label">{{ item.label }}</div><strong>{{ item.value.toLocaleString() }}</strong></el-card>
    </section>
    <section class="trend"><div class="trend-title"><h2>每日趋势</h2><span>近{{ range }}天合计 PV {{ (data?.summary.pv ?? 0).toLocaleString() }} · UV {{ (data?.summary.uv ?? 0).toLocaleString() }} · Session {{ (data?.summary.sessions ?? 0).toLocaleString() }}</span></div>
      <el-table :data="data?.daily ?? []" stripe empty-text="暂无访问数据"><el-table-column prop="date" label="日期" min-width="140"/><el-table-column prop="pv" label="PV"/><el-table-column prop="uv" label="UV"/><el-table-column prop="sessions" label="Session"/></el-table>
    </section>
  </main>
</template>

<style scoped>
.page{max-width:1100px;margin:0 auto;padding:28px 20px 56px}header,.trend-title{display:flex;align-items:center;justify-content:space-between;gap:16px}header{margin-bottom:24px}h1,h2{margin:0}header p{color:#909399;margin:8px 0 0}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.label{color:#606266;margin-bottom:12px}.cards strong{font-size:30px;color:#303133}.trend{margin-top:30px}.trend-title{margin-bottom:14px}.trend-title span{color:#909399}@media(max-width:600px){header,.trend-title{align-items:flex-start;flex-direction:column}.cards{grid-template-columns:1fr}.cards strong{font-size:26px}}
</style>
