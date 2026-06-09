<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { User, Clock, Delete, ArrowLeft } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getFavorites, removeFavorite } from '@/api/favorites'
import { getHistory, clearHistory } from '@/api/history'
import type { Hotel, BrowseHistory } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const { displayName, userId } = storeToRefs(userStore)

const activeTab = ref('info')
const favoriteHotels = ref<Hotel[]>([])
const historyList = ref<BrowseHistory[]>([])
const loading = ref(false)

const loadFavorites = async () => {
  if (!userId.value) return
  loading.value = true
  try {
    // favorites 返回的数据包含 hotel 对象
    const list = await getFavorites(userId.value)
    favoriteHotels.value = list.map(f => f.hotel).filter((h): h is Hotel => h != null)
  } catch (e: unknown) {
    console.error('加载收藏失败:', e)
  } finally {
    loading.value = false
  }
}

const loadHistory = async () => {
  if (!userId.value) return
  loading.value = true
  try {
    historyList.value = await getHistory(userId.value)
  } catch (e: unknown) {
    console.error('加载历史失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFavorites()
  loadHistory()
})

// 切换 Tab 时刷新数据
watch(activeTab, (tab) => {
  if (tab === 'favorites') loadFavorites()
  if (tab === 'history') loadHistory()
})

const formatTime = (ts: number): string => {
  const d = new Date(ts)
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const goDetail = (id: number): void => {
  router.push({ name: 'hotel-detail', params: { id } })
}

const goBack = () => {
  router.back()
}

const handleClearHistory = async () => {
  if (!userId.value) return
  try {
    await clearHistory(userId.value)
    historyList.value = []
  } catch (e: unknown) {
    console.error('清空历史失败:', e)
  }
}

const handleRemoveFavorite = async (hotelId: number): Promise<void> => {
  if (!userId.value) return
  try {
    await removeFavorite(userId.value, hotelId)
    favoriteHotels.value = favoriteHotels.value.filter(h => h.id !== hotelId)
  } catch (e: unknown) {
    console.error('取消收藏失败:', e)
  }
}
</script>

<template>
  <div class="user-center">
    <div class="uc-back">
      <el-button :icon="ArrowLeft" @click="goBack" text>返回</el-button>
    </div>

    <div class="uc-layout">
      <!-- 左侧个人信息卡片 -->
      <div class="uc-sidebar">
        <div class="uc-profile-card">
          <el-avatar :size="72" :icon="User" />
          <h2>{{ displayName }}</h2>
          <p class="uc-role">普通用户</p>
          <div class="uc-stats">
            <div class="stat-item" @click="activeTab = 'favorites'">
              <span class="stat-num">{{ favoriteHotels.length }}</span>
              <span class="stat-label">收藏</span>
            </div>
            <div class="stat-item" @click="activeTab = 'history'">
              <span class="stat-num">{{ historyList.length }}</span>
              <span class="stat-label">浏览</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="uc-main" v-loading="loading">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="个人信息" name="info">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户名">{{ displayName }}</el-descriptions-item>
              <el-descriptions-item label="会员等级">普通会员</el-descriptions-item>
              <el-descriptions-item label="注册时间">2026-05-01</el-descriptions-item>
              <el-descriptions-item label="收藏数量">{{ favoriteHotels.length }} 家酒店</el-descriptions-item>
              <el-descriptions-item label="浏览记录">{{ historyList.length }} 条</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <el-tab-pane label="我的收藏" name="favorites">
            <div v-if="favoriteHotels.length" class="uc-hotel-list">
              <div class="uc-hotel-item" v-for="hotel in favoriteHotels" :key="hotel.id">
                <div class="uc-hotel-left" @click="goDetail(hotel.id)">
                  <div class="uc-hotel-img">
                    <img :src="hotel.img_url" alt="" />
                  </div>
                  <div class="uc-hotel-info">
                    <h3>{{ hotel.name }}</h3>
                    <p class="uc-hotel-addr">{{ hotel.transport }}</p>
                    <div class="uc-hotel-tags">
                      <el-tag v-for="(t, i) in hotel.tag.slice(0, 3)" :key="i" size="small" type="warning" effect="plain">{{ t }}</el-tag>
                    </div>
                  </div>
                </div>
                <div class="uc-hotel-right">
                  <span class="uc-price">￥{{ hotel.price }}<small>/晚</small></span>
                  <span class="uc-rating">{{ hotel.rating }}分</span>
                  <el-button type="danger" size="small" :icon="Delete" text @click.stop="handleRemoveFavorite(hotel.id)">取消收藏</el-button>
                </div>
              </div>
            </div>
            <el-empty v-else description="还没有收藏酒店">
              <el-button type="primary" @click="router.push('/')">去逛逛</el-button>
            </el-empty>
          </el-tab-pane>

          <el-tab-pane label="浏览记录" name="history">
            <div class="uc-history-header" v-if="historyList.length">
              <span>共 {{ historyList.length }} 条记录</span>
              <el-button type="danger" size="small" text @click="handleClearHistory">清空记录</el-button>
            </div>
            <div v-if="historyList.length" class="uc-hotel-list">
              <div class="uc-hotel-item" v-for="h in historyList" :key="h.hotelId">
                <div class="uc-hotel-left" @click="h.hotel && goDetail(h.hotel.id)">
                  <div class="uc-hotel-img">
                    <img :src="h.hotel?.img_url" alt="" />
                  </div>
                  <div class="uc-hotel-info">
                    <h3>{{ h.hotel?.name }}</h3>
                    <p class="uc-hotel-time">
                      <el-icon><Clock /></el-icon>
                      {{ h.timestamp ? formatTime(h.timestamp) : '' }}
                    </p>
                  </div>
                </div>
                <div class="uc-hotel-right">
                  <span class="uc-price" v-if="h.hotel">￥{{ h.hotel.price }}<small>/晚</small></span>
                  <span class="uc-rating" v-if="h.hotel">{{ h.hotel.rating }}分</span>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无浏览记录">
              <el-button type="primary" @click="router.push('/')">去逛逛</el-button>
            </el-empty>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-center {
  width: 1200px;
  margin: 0 auto;
  padding: 16px 0;
}

.uc-back {
  margin-bottom: 16px;
}

.uc-layout {
  display: flex;
  gap: 24px;
}

.uc-sidebar {
  flex: 0 0 260px;
}

.uc-profile-card {
  background: #fff;
  border-radius: 8px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.uc-profile-card h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 12px 0 4px;
}

.uc-role {
  font-size: 13px;
  color: #999;
  margin-bottom: 20px;
}

.uc-stats {
  display: flex;
  justify-content: center;
  gap: 36px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: color 0.2s;
}

.stat-item:hover {
  color: var(--el-color-primary);
}

.stat-num {
  font-size: 22px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.uc-main {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 16px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  min-height: 400px;
}

.uc-hotel-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.uc-hotel-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.uc-hotel-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.uc-hotel-left {
  flex: 1;
  display: flex;
  gap: 14px;
  cursor: pointer;
}

.uc-hotel-img {
  flex: 0 0 120px;
  height: 90px;
  border-radius: 6px;
  overflow: hidden;
}

.uc-hotel-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.uc-hotel-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.uc-hotel-info h3 {
  font-size: 16px;
  font-weight: 600;
}

.uc-hotel-addr {
  font-size: 13px;
  color: #999;
}

.uc-hotel-time {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

.uc-hotel-tags {
  display: flex;
  gap: 6px;
}

.uc-hotel-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  min-width: 120px;
}

.uc-price {
  font-size: 18px;
  font-weight: 700;
  color: #f56c6c;
}

.uc-price small {
  font-size: 12px;
  font-weight: 400;
  color: #999;
}

.uc-rating {
  font-size: 13px;
  color: var(--el-color-primary);
  font-weight: 600;
}

.uc-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: #999;
}
</style>
