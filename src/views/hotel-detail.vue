<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Star, StarFilled, Location, Phone } from '@element-plus/icons-vue'
import { getHotelDetail } from '@/api/hotels'
import { checkFavorite, addFavorite, removeFavorite } from '@/api/favorites'
import { addHistory } from '@/api/history'
import { useUserStore } from '@/stores/user'
import type { Hotel, Room } from '@/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const hotel = ref<Hotel | null>(null)
const isFav = ref(false)
const loading = ref(true)
const activeTab = ref<'rooms' | 'reviews'>('rooms')

const fetchHotel = async () => {
  loading.value = true
  try {
    hotel.value = await getHotelDetail(route.params.id as string)
    // 记录浏览历史
    if (userStore.userId && hotel.value) {
      addHistory(userStore.userId, hotel.value.id).catch(() => {})
    }
    // 检查是否已收藏
    if (userStore.userId && hotel.value) {
      checkFavorite(userStore.userId, hotel.value.id).then(v => { isFav.value = v }).catch(() => {})
    }
  } catch (e: unknown) {
    console.error('加载酒店详情失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchHotel)

const starLabel = (lv: number): string => ({ 5: '五星', 4: '四星', 3: '三星', 2: '二星' }[lv] || '')
const starTagType = (lv: number): 'danger' | 'warning' | 'info' => {
  if (lv === 5) return 'danger'
  if (lv === 4) return 'warning'
  return 'info'
}

const goBack = (): void => {
  router.back()
}

const toggleFav = async (): Promise<void> => {
  if (!hotel.value || !userStore.userId) {
    alert('请先登录')
    router.push('/login')
    return
  }
  try {
    if (isFav.value) {
      await removeFavorite(userStore.userId, hotel.value.id)
      isFav.value = false
    } else {
      await addFavorite(userStore.userId, hotel.value.id)
      isFav.value = true
    }
  } catch (e: unknown) {
    // 已收藏时忽略
    if (e instanceof Error && e.message.includes('已收藏')) isFav.value = true
  }
}

const handleBook = (room: Room): void => {
  alert(`已选择「${room.name}」，￥${room.price}/晚\n\n下单功能开发中...`)
}
</script>

<template>
  <div class="hotel-detail" v-if="hotel" v-loading="loading">
    <!-- 返回按钮 -->
    <div class="detail-back">
      <el-button :icon="ArrowLeft" @click="goBack" text>返回列表</el-button>
    </div>

    <!-- 酒店概览 -->
    <div class="detail-header">
      <div class="detail-header-left">
        <img :src="hotel.img_url" alt="" class="detail-banner" />
      </div>
      <div class="detail-header-right">
        <div class="hotel-title-row">
          <h1>{{ hotel.name }}</h1>
          <img :src="`./images/${hotel.starimg_url}`" alt="" class="star-img" />
          <el-tag :type="starTagType(hotel.starLevel)" size="small" class="star-level-tag">{{ starLabel(hotel.starLevel) }}</el-tag>
          <el-button
            class="fav-btn"
            :icon="isFav ? StarFilled : Star"
            :type="isFav ? 'warning' : 'default'"
            circle
            @click="toggleFav"
          />
        </div>
        <p class="hotel-address">
          <el-icon><Location /></el-icon>
          {{ hotel.transport }}
        </p>
        <p class="hotel-phone">
          <el-icon><Phone /></el-icon>
          {{ hotel.phone }}
        </p>
        <div class="hotel-rating-box">
          <span class="rating-score">{{ hotel.rating }}</span>
          <div class="rating-text">
            <span class="rating-desc">{{ hotel.reviewDesc }}</span>
            <span class="rating-count">{{ hotel.reviewCount }}条点评</span>
          </div>
        </div>
        <p class="hotel-desc">{{ hotel.description }}</p>
        <div class="hotel-tags">
          <el-tag v-for="(t, i) in hotel.tag" :key="i" type="warning" effect="plain">{{ t }}</el-tag>
        </div>
      </div>
    </div>

    <!-- Tab 切换：房型 / 评价 -->
    <div class="detail-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="客房房型" name="rooms">
          <div class="room-list">
            <div class="room-item" v-for="room in hotel.rooms" :key="room.id">
              <div class="room-info">
                <h4>{{ room.name }}</h4>
                <p class="room-spec">{{ room.area }} / {{ room.bed }}</p>
                <p class="room-extra">{{ room.breakfast }} · {{ room.cancel }}</p>
              </div>
              <div class="room-price">
                <span class="price-symbol">￥</span>
                <span class="price-num">{{ room.price }}</span>
                <span class="price-unit">/晚</span>
              </div>
              <el-button type="primary" @click="handleBook(room)">预订</el-button>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="用户评价" name="reviews">
          <div class="review-summary">
            <span class="review-big-score">{{ hotel.rating }}</span>
            <span class="review-desc-text">{{ hotel.reviewDesc }}</span>
            <span class="review-total">共 {{ hotel.reviewCount }} 条真实住客点评</span>
          </div>
          <div class="review-list">
            <div class="review-item" v-for="r in hotel.reviews" :key="r.id">
              <div class="review-user">
                <el-avatar :size="40" :icon="Star" />
                <div class="review-user-info">
                  <span class="review-username">{{ r.user }}</span>
                  <span class="review-date">{{ r.date }}</span>
                </div>
                <div class="review-user-score">{{ r.rating }}</div>
              </div>
              <p class="review-content">{{ r.content }}</p>
              <div v-if="r.reply" class="review-reply">
                <span class="reply-label">商家回复：</span>{{ r.reply }}
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 底部悬浮预订栏 -->
    <div class="detail-footer-bar">
      <div class="footer-price">
        <span class="footer-price-symbol">￥</span>
        <span class="footer-price-num">{{ hotel.price }}</span>
        <span class="footer-price-text">起/晚</span>
      </div>
      <el-button type="primary" size="large" @click="activeTab = 'rooms'">查看可订房型</el-button>
    </div>
  </div>

  <!-- 酒店不存在 -->
  <div class="hotel-not-found" v-else-if="!loading">
    <el-empty description="酒店不存在">
      <el-button type="primary" @click="goBack">返回列表</el-button>
    </el-empty>
  </div>
</template>

<style scoped>
.hotel-detail {
  width: 1200px;
  margin: 0 auto;
  padding: 16px 0 100px;
}

.detail-back {
  margin-bottom: 16px;
}

.detail-header {
  display: flex;
  gap: 32px;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.detail-header-left {
  flex: 0 0 480px;
  height: 320px;
  border-radius: 8px;
  overflow: hidden;
}

.detail-header-left img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-header-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hotel-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hotel-title-row h1 {
  font-size: 26px;
  font-weight: 700;
}

.star-img {
  height: 22px;
  width: auto;
}

.star-level-tag {
  flex-shrink: 0;
}

.fav-btn {
  margin-left: 4px;
  transition: transform 0.25s ease;
}

.fav-btn:hover {
  transform: scale(1.15);
}

.hotel-address,
.hotel-phone {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.hotel-rating-box {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 4px 0;
}

.rating-score {
  background-color: var(--el-color-primary);
  color: #fff;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 22px;
  font-weight: 700;
}

.rating-text {
  display: flex;
  flex-direction: column;
}

.rating-desc {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.rating-count {
  font-size: 12px;
  color: #999;
}

.hotel-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}

.hotel-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-tabs {
  background: #fff;
  border-radius: 8px;
  padding: 8px 24px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.room-item {
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.room-item:last-child {
  border-bottom: none;
}

.room-info {
  flex: 1;
}

.room-info h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.room-spec {
  font-size: 13px;
  color: #666;
  margin-bottom: 2px;
}

.room-extra {
  font-size: 12px;
  color: #67c23a;
}

.room-price {
  text-align: right;
  margin-right: 24px;
}

.price-symbol {
  font-size: 14px;
  color: #f56c6c;
}

.price-num {
  font-size: 24px;
  font-weight: 700;
  color: #f56c6c;
}

.price-unit {
  font-size: 12px;
  color: #999;
}

.review-summary {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 16px 0 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.review-big-score {
  font-size: 36px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.review-desc-text {
  font-size: 16px;
  color: #333;
}

.review-total {
  font-size: 13px;
  color: #999;
  margin-left: auto;
}

.review-item {
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.review-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.review-username {
  font-size: 14px;
  font-weight: 600;
}

.review-date {
  font-size: 12px;
  color: #999;
}

.review-user-score {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.review-content {
  font-size: 14px;
  color: #333;
  line-height: 1.8;
  margin-left: 52px;
}

.review-reply {
  margin-left: 52px;
  margin-top: 10px;
  padding: 10px 14px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.reply-label {
  font-weight: 600;
  color: var(--el-color-primary);
}

.detail-footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 16px 0;
  z-index: 100;
}

.footer-price-symbol {
  font-size: 14px;
  color: #f56c6c;
}

.footer-price-num {
  font-size: 28px;
  font-weight: 700;
  color: #f56c6c;
}

.footer-price-text {
  font-size: 14px;
  color: #666;
  margin-left: 4px;
}

.hotel-not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
</style>
