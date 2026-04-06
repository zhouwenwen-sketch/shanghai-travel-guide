<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'  //导入router
import { Search,Avatar,ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
// 解构保持响应式，模板才能随登录状态更新
const { isLoggedIn, displayName } = storeToRefs(userStore)

const input3 = ref('')

let Myorder = ref([
    { id: 1, title: '酒店订单' },
    { id: 2, title: '火车票订单' },
    { id: 3, title: '飞机票订单' },
    { id: 4, title: '旅游订单' },
    { id: 5, title: '全部订单' }
])
// 跳转到登录页
const goToLogin = () => {
  router.push('/login')
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
<div>
    <div class="headerNav"> 
        <div class="header-logo">
            <img src="@/assets/images/logo.png" alt="">
        </div>
        <div class="header-search">
            <el-input
                v-model="input3"
                placeholder="请输入内容"
                class="input-with-select"
                >
                <template #append>
                    <el-button :icon="Search" />
                </template>
            </el-input>
        </div>
        <div class="header-right">
            <template v-if="!isLoggedIn">
              <el-link :icon="Avatar" @click="goToLogin">请登录</el-link>
            </template>
            <template v-else>
              <span class="user-welcome">你好，{{ displayName }}</span>
              <el-link type="danger" @click="handleLogout">退出</el-link>
            </template>
            <el-link target="_blank">注册</el-link>
            <el-link>
                <el-dropdown>
                    <span class="el-dropdown-link">
                    我的订单
                    <el-icon class="el-icon--right">
                        <arrow-down />
                    </el-icon>
                    </span>
                    <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item v-for="v in Myorder" :key="v.id">{{v.title}}</el-dropdown-item>
                    </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-link>
        </div>
    </div>
</div>
</template>

<style scoped>
.user-welcome {
  margin-right: 12px;
  font-size: 14px;
  color: #606266;
}
</style>
