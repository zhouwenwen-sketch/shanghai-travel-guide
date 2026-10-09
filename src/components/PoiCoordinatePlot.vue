<script setup lang="ts">
import { computed } from 'vue'
import type { Poi } from '@/types'

const props = defineProps<{ pois: Poi[]; selectedId?: number }>()
const emit = defineEmits<{ select: [poi: Poi] }>()

const usable = computed(() => props.pois.filter((p) => Number.isFinite(p.longitude) && Number.isFinite(p.latitude)))
const bounds = computed(() => {
  const lngs = usable.value.map((p) => p.longitude)
  const lats = usable.value.map((p) => p.latitude)
  const minLng = Math.min(...lngs, 121.1)
  const maxLng = Math.max(...lngs, 121.9)
  const minLat = Math.min(...lats, 30.9)
  const maxLat = Math.max(...lats, 31.5)
  return { minLng, maxLng, minLat, maxLat }
})
const pointStyle = (poi: Poi) => {
  const { minLng, maxLng, minLat, maxLat } = bounds.value
  const x = 6 + ((poi.longitude - minLng) / Math.max(maxLng - minLng, 0.01)) * 88
  const y = 94 - ((poi.latitude - minLat) / Math.max(maxLat - minLat, 0.01)) * 88
  return { left: `${x}%`, top: `${y}%` }
}
</script>

<template>
  <section class="plot" aria-label="上海地点坐标示意图">
    <div class="plot-head">
      <strong>上海坐标分布示意图</strong>
      <span>仅按经纬度展示相对位置，不是导航底图</span>
    </div>
    <div class="canvas">
      <div class="grid" />
      <button
        v-for="poi in usable"
        :key="poi.id"
        type="button"
        class="marker"
        :class="{ selected: poi.id === selectedId }"
        :style="pointStyle(poi)"
        :title="`${poi.name}（${poi.longitude}, ${poi.latitude}）`"
        @click="emit('select', poi)"
      >
        <span>{{ poi.id === selectedId ? poi.name : '●' }}</span>
      </button>
      <el-empty v-if="!usable.length" description="暂无可展示坐标" :image-size="54" />
    </div>
  </section>
</template>

<style scoped>
.plot{border:1px solid #dcdfe6;border-radius:12px;overflow:hidden;background:#f7fafc}.plot-head{display:flex;justify-content:space-between;gap:16px;padding:12px 16px;background:#fff;border-bottom:1px solid #ebeef5}.plot-head span{font-size:12px;color:#909399}.canvas{height:330px;position:relative;background:linear-gradient(145deg,#eef7ff,#f8fbf2)}.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(64,158,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(64,158,255,.12) 1px,transparent 1px);background-size:10% 10%}.marker{position:absolute;transform:translate(-50%,-50%);border:0;background:#409eff;color:#fff;border-radius:16px;min-width:24px;height:24px;padding:0 7px;cursor:pointer;box-shadow:0 2px 7px rgba(0,0,0,.28);white-space:nowrap;z-index:1}.marker.selected{background:#f56c6c;z-index:2}.marker:hover{transform:translate(-50%,-50%) scale(1.12)}
@media(max-width:640px){.plot-head{flex-direction:column;gap:3px}.canvas{height:260px}}
</style>
