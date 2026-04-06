<script setup>
import { ref } from 'vue'//引入ref
import NavMenu from './navMenu.vue' //导入左侧导航栏
import Header from './headerNav.vue' //导入头部
import Searchlist from './searchlist.vue' //导入搜索框
import Topfilter from './topfilter.vue' //导入顶部筛选
import Recommend from './recommend.vue' //导入顶部筛选
</script>

<template>
  <div class="common-layout">
    <el-container>
      <!-- 左侧导航栏 -->
      <NavMenu />
      <el-container>
        <el-header>
          <!-- 头部 -->
          <Header />
        </el-header>
        <el-main>
          <Searchlist />
          <Topfilter />
          <Recommend />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<!-- scoped表示只对当前组件生效，不会污染全局 -->
<style scoped> 

</style>
