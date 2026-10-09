<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cancelBooking, getBookings } from '@/api/bookings'
import type { Booking } from '@/types'

const router = useRouter()
const list = ref<Booking[]>([])
const loading = ref(false)
const error = ref('')
const cancellingId = ref<number | null>(null)
const load = async () => {
  loading.value = true; error.value = ''
  try { list.value = await getBookings() }
  catch (e) { error.value = e instanceof Error ? e.message : '加载预订失败' }
  finally { loading.value = false }
}
const cancel = async (booking: Booking) => {
  if (cancellingId.value !== null) return
  try { await ElMessageBox.confirm('取消后不可恢复，确认取消这条预订记录吗？', '取消预订') }
  catch { return }
  cancellingId.value = booking.id
  try {
    const updated = await cancelBooking(booking.id, booking.version)
    Object.assign(booking, updated); ElMessage.success('预订已取消')
  } catch (e) { ElMessage.error(e instanceof Error ? e.message : '取消失败') }
  finally { cancellingId.value = null }
}
onMounted(load)
</script>
<template>
  <main class="page" v-loading="loading">
    <header><h1>我的预订</h1><el-button @click="router.push('/')">浏览酒店</el-button></header>
    <el-alert v-if="error" :title="error" type="error" show-icon><el-button text @click="load">重试</el-button></el-alert>
    <el-empty v-else-if="!loading && !list.length" description="暂无预订记录"><el-button type="primary" @click="router.push('/')">去选酒店</el-button></el-empty>
    <section v-else class="cards">
      <el-card v-for="item in list" :key="item.id" shadow="hover">
        <div class="booking">
          <img :src="item.hotelImage" alt="" />
          <div class="content"><div class="title"><h3>{{ item.hotelName }}</h3><el-tag :type="item.status === 'CONFIRMED' ? 'success' : 'info'">{{ item.status === 'CONFIRMED' ? '已确认' : '已取消' }}</el-tag></div>
            <p>{{ item.checkIn }} 至 {{ item.checkOut }} · {{ item.guestCount }}人</p><p>联系人：{{ item.contactName }} {{ item.contactPhone }}</p><strong>￥{{ item.totalPrice }}</strong><small>（￥{{ item.nightlyPrice }}/晚）</small>
          </div>
          <div class="actions"><el-button :disabled="cancellingId!==null" @click="router.push(`/hotel/${item.hotelId}`)">酒店详情</el-button><el-button v-if="item.status === 'CONFIRMED'" type="danger" plain :loading="cancellingId===item.id" :disabled="cancellingId!==null" @click="cancel(item)">取消预订</el-button></div>
        </div>
      </el-card>
    </section>
    <el-alert class="notice" title="这里是预订记录演示，不包含真实支付、库存锁定或第三方确认。" type="warning" :closable="false" show-icon />
  </main>
</template>
<style scoped>
.page{max-width:1000px;margin:24px auto;padding:0 16px}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.cards{display:grid;gap:14px}.booking{display:flex;gap:18px;align-items:center}.booking img{width:150px;height:105px;object-fit:cover;border-radius:8px}.content{flex:1}.title{display:flex;align-items:center;gap:10px}.content p{color:#606266;margin:8px 0}.content strong{color:#f56c6c;font-size:20px}.content small{color:#909399}.actions{display:flex;flex-direction:column;gap:8px}.notice{margin-top:20px}@media(max-width:700px){.booking{align-items:stretch;flex-direction:column}.booking img{width:100%;height:180px}.actions{flex-direction:row;flex-wrap:wrap}}
</style>
