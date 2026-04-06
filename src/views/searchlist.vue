<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
</script>

<template>
    <div class="searchlist">
        <div class="searchlist-item">
            <div class="search-box">
                <!-- lable和input实现绑定 -->
                <label for="hotels-destination">目的地/酒店名称</label>
                <input type="text" id="hotels-destination" placeholder="上海">
            </div>
        </div>
        <div class="searchlist-item">
            <div class="search-box">
                <label>入住时间/退房时间</label>
                <el-date-picker
                    v-model="value1"
                    type="datetimerange"
                    start-placeholder="Start Date"
                    end-placeholder="End Date"
                    :default-time="defaultTime1"
                />
            </div>
        </div>
        <div class="searchlist-item">
            <div class="search-box">
                <label for="room-guest">房间及住客</label>
                <input type="text" id="room-guest" placeholder="1间/1位">
            </div>
        </div>
        <div class="searchlist-item">
            <div class="search-box">
                <label for="keyword">关键词（选填）</label>
                <input type="text" id="keyword" placeholder="火车、酒店名称或区域">
            </div>
        </div>
        <div class="searchlist-item">
            <el-button type="primary" :icon="Search"></el-button>
        </div>
    </div>

</template>

<style scoped> 

</style>
