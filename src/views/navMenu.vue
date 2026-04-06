<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'

// 初始值：true 表示折叠（菜单窄），false 表示展开（菜单宽）
const isCollapse = ref(true)

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

// 引入第三方图标
let asidelist = ref([
  { id: 1, title: '酒店', icon: 'icon-jiudian' },
  { id: 2, title: '旅游', icon: 'icon-lvyou' },
  { id: 3, title: '景点', icon: 'icon-jingdian' },
  { id: 4, title: '机票', icon: 'icon-jipiao' },
  { id: 5, title: '火车票', icon: 'icon-huochepiao' },
  { id: 6, title: '汽车票', icon: 'icon-qichepiao' },
  { id: 7, title: '船票', icon: 'icon-chuanpiao1' },
  { id: 8, title: '门票', icon: 'icon-menpiao1' },
])

const handleOpen = () => {}
const handleClose = () => {}
</script>

<template>
  <el-aside width="200px" class="aside">
    <div class="aside-list">
      <el-menu
        default-active="2"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        @open="handleOpen"
        @close="handleClose"
      >
        <div class="aside-toolbar">
          <!-- 折叠/展开切换按钮 -->
          <el-radio-group v-model="isCollapse" class="collapse-group">
            <!-- 折叠时显示三条杠（点击展开） -->
            <el-radio-button :value="false" v-show="isCollapse">|||</el-radio-button>
            <!-- 展开时显示三条杠（点击折叠） -->
            <el-radio-button :value="true" v-show="!isCollapse">|||</el-radio-button>
          </el-radio-group>

          <!-- 主题切换按钮：只在菜单展开时显示 -->
          <el-tooltip
            v-if="!isCollapse"
            :content="isDark ? '切换为浅色模式' : '切换为深色模式'"
            placement="right"
          >
            <el-button
              class="theme-toggle-btn"
              :icon="isDark ? Sunny : Moon"
              circle
              size="small"
              @click="themeStore.toggle()"
            />
          </el-tooltip>
        </div>

        <el-menu-item v-for="v in asidelist" :key="v.id" :index="String(v.id)">
          <i class="iconfont" :class="v.icon"></i>
          <template #title>{{ v.title }}</template>
        </el-menu-item>
      </el-menu>
    </div>
  </el-aside>
</template>

<style scoped>
.aside-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
  margin-bottom: 16px;
  padding: 4px 8px 0;
  min-height: 36px;
}

.collapse-group {
  flex: 1;
  min-width: 0;
}

.theme-toggle-btn {
  flex-shrink: 0;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.theme-toggle-btn:hover {
  transform: scale(1.06);
}
</style>