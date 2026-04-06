<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginForm = ref({
  username: '',
  password: ''
})

// 登录：由 Pinia 统一管理状态，并同步 localStorage（刷新不丢）
const handleLogin = () => {
  const { ok, message } = userStore.login(
    loginForm.value.username,
    loginForm.value.password
  )
  if (ok) {
    router.push('/')
  } else {
    alert(message)
  }
}

const goToRegister = () => {
  alert('注册功能开发中...')
}
</script>

<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">用户登录</h2>
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%">登录</el-button>
        </el-form-item>
        <el-form-item>
          <el-link type="info" @click="goToRegister" style="float: right">还没有账号？去注册</el-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%,  100%);
}
.login-card {
  width: 400px;
  border-radius: 8px;
}
.login-title {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}
</style>