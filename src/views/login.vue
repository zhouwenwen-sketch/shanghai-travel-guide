<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const isLogin = ref(true)
const loginForm = ref({ username: '', password: '' })
const submitting = ref(false)

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isLogin.value) {
      await userStore.login(loginForm.value.username, loginForm.value.password)//等待登录完成
    } else {
      await userStore.register(loginForm.value.username, loginForm.value.password)//等待注册完成
    }
    router.push('/')//成功后才跳转
  } catch (e) {
    alert(e.message)//捕获错误并提示
  } finally {
    submitting.value = false// 无论成功失败都关闭 loading
  }
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
}
</script>

<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">{{ isLogin ? '用户登录' : '用户注册' }}</h2>
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting" style="width: 100%">
            {{ isLogin ? '登录' : '注册' }}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-link type="info" @click="toggleMode" style="float: right">
            {{ isLogin ? '还没有账号？去注册' : '已有账号？去登录' }}
          </el-link>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
