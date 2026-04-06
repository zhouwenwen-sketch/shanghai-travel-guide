<script setup>
import { ref } from 'vue'
import Banner from './banner.vue'
import Recommendlist from './recommend-list.vue'

</script>

<template>
<div class="recommend">
    <div class="recommend-left">
        <Recommendlist />
    </div>
    <div class="recommend-right">
        <Banner />
    </div>
</div>
</template>

<style scoped> 

</style>
