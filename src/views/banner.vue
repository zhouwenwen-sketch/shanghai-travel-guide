<script setup lang="ts">
import { ref } from 'vue'

interface BannerItem {
  id: number
  img_url: string
}

const bannerlist = ref<BannerItem[]>([
    {id:1,img_url:'banner-1-optimized.webp'},
    {id:2,img_url:'banner-2-optimized.webp'},
    {id:3,img_url:'banner-3-optimized.webp'}
])
const firstImageReady = ref(false)
const requestedSlides = ref<number[]>([0])
const onSlideChange = (index: number): void => {
  if (!requestedSlides.value.includes(index)) requestedSlides.value.push(index)
}

</script>

<template>
<div class="banner">
    <el-carousel height="620px" :autoplay="firstImageReady" @change="onSlideChange">
      <el-carousel-item v-for="(item, index) in bannerlist" :key="item.id">
        <img
          v-if="requestedSlides.includes(index)"
          :src="`./images/${item.img_url}`"
          :alt="`上海旅游推荐图片 ${index + 1}`"
          :fetchpriority="index === 0 ? 'high' : 'low'"
          @load="index === 0 && (firstImageReady = true)"
        >
      </el-carousel-item>
    </el-carousel>
</div>
</template>

<style scoped> 

</style>
