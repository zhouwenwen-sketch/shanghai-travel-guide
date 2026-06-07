<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRecommendedHotels } from '@/api/hotels'

const router = useRouter()

const recommendlist = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    recommendlist.value = await getRecommendedHotels()
  } catch (e) {
    console.error('加载推荐酒店失败:', e)
  } finally {
    loading.value = false
  }
})

const goDetail = (id) => {
  router.push({ name: 'hotel-detail', params: { id } })
}
</script>

<template>
<div class="recommend-list" v-loading="loading">
    <ul>
        <li v-for="v in recommendlist" :key="v.id">
            <div class="list-left">
                <div class="list-left-img">
                    <img :src="v.img_url" alt="">
                </div>
                <div class="list-left-title">
                    <div class="list-left-tagandtitle">
                        <h4>{{v.name}}</h4>
                        <img :src="`./images/${v.starimg_url}`" alt="">
                        <span class="badge-thumb"></span>
                    </div>
                    <div class="list-left-transport">
                        <p>{{v.transport}}</p>
                    </div>
                    <div class="list-left-tag">
                        <el-tag type="danger" effect="plain" v-for="(k,i) in v.tag" :key="i">{{k}}</el-tag>
                    </div>
                </div>
            </div>
            <div class="list-right">
                <div class="list-right-comment">
                    <div class="list-right-describe">
                        <p>{{v.reviewDesc}}</p>
                        <a href="#">{{ v.reviewCount }}条点评</a>
                    </div>
                    <div class="list-right-score">
                        <p>{{ v.rating }}</p>
                    </div>
                </div>
                <div class="list-right-price">
                    <p>￥{{ v.price }}</p>
                    <el-button type="primary" @click="goDetail(v.id)">查看详情</el-button>
                </div>
            </div>
        </li>
    </ul>
</div>
</template>

<style scoped>

</style>
