<script setup>
import { ref } from 'vue'
let recommendlist = ref([
    {id:1,name:'上海和平饭店',img_url:'1.jpg',transport:'外滩地区·外滩街道南京东路20号',starimg_url:'star5.png',tag:['SPA','室内游泳池','西餐厅','接机','行李寄存','礼宾服务','VIP通道'],rating: 4.8, reviewCount: 3089, reviewDesc: '很好', price:2099 },
    {id:2,name:'上海凯宾斯基大酒店',img_url:'2.jpg',transport:'浦东陆家嘴金融贸易区·陆家嘴环路1288号',starimg_url:'star4.png',tag:['健身房','早餐','儿童泳池','会议室','免费停车场','接机','行李寄存'],rating: 4.5, reviewCount: 1790, reviewDesc: '好', price:1388},
    {id:3,name:'上海外滩南京东路亚朵酒店',img_url:'3.jpg',transport:'外滩地区·福州路105-1号',starimg_url:'star5.png',tag:['叫醒服务','网红打卡','免费停车场','无障碍客房','会议室','接机','行李寄存'],rating: 4.7, reviewCount: 1467, reviewDesc: '很好', price:899},
    {id:3,name:'上海艾迪逊酒店',img_url:'4.jpg',transport:'外滩地区·南京东路199号',starimg_url:'star5.png',tag:['咖啡厅','泳池','行李寄存','代客泊车','SPA','无障碍客房'],rating: 4.9, reviewCount: 2456, reviewDesc: '好', price:2899}
])

</script>

<template>
<div class="recommend-list">
    <ul>
        <li v-for="v in recommendlist" :key="v.id">
            <div class="list-left">
                <div class="list-left-img">
                    <img :src="`/images/${v.img_url}`" alt="">
                </div>
                <div class="list-left-title">
                    <div class="list-left-tagandtitle">
                        <h4>{{v.name}}</h4>
                        <img :src="`/images/${v.starimg_url}`" alt="">
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
                    <el-button type="primary">查看详情</el-button>
                </div>
            </div>
        </li>
    </ul>
</div>
</template>

<style scoped> 

</style>
