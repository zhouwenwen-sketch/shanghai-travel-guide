<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createItinerary, deleteItinerary, getItineraries } from '@/api/itineraries'
import type { Itinerary, ItineraryPayload } from '@/types'
const router = useRouter(); const list = ref<Itinerary[]>([]); const loading = ref(false); const error = ref(''); const dialog = ref(false)
const createSubmitting = ref(false); const deleteSubmittingId = ref<number | null>(null)
const form = reactive<ItineraryPayload>({ title:'', startDate:'', endDate:'' })
const load=async()=>{loading.value=true;error.value='';try{list.value=await getItineraries()}catch(e){error.value=e instanceof Error?e.message:'加载行程失败'}finally{loading.value=false}}
const create=async()=>{if(createSubmitting.value)return;createSubmitting.value=true;try{const item=await createItinerary(form);dialog.value=false;ElMessage.success('行程已创建');router.push(`/itineraries/${item.id}`)}catch(e){ElMessage.error(e instanceof Error?e.message:'创建失败')}finally{createSubmitting.value=false}}
const remove=async(item:Itinerary)=>{if(deleteSubmittingId.value!==null)return;try{await ElMessageBox.confirm(`确认删除“${item.title}”及其全部项目吗？`,'删除行程')}catch{return}deleteSubmittingId.value=item.id;try{await deleteItinerary(item.id,item.version);list.value=list.value.filter(v=>v.id!==item.id)}catch(e){ElMessage.error(e instanceof Error?e.message:'删除失败')}finally{deleteSubmittingId.value=null}}
onMounted(load)
</script>
<template><main class="page" v-loading="loading"><header><div><h1>我的行程</h1><p>手动编排行程，未来 Agent 生成的结构化结果也会复用同一份数据契约。</p></div><el-button type="primary" @click="dialog=true">新建行程</el-button></header>
<el-alert v-if="error" :title="error" type="error" show-icon><el-button text @click="load">重试</el-button></el-alert>
<el-empty v-else-if="!loading&&!list.length" description="暂无行程"><el-button type="primary" @click="dialog=true">创建第一个行程</el-button></el-empty>
<section v-else class="grid"><el-card v-for="item in list" :key="item.id" shadow="hover"><h3>{{item.title}}</h3><p>{{item.startDate}} 至 {{item.endDate}}</p><div><el-button type="primary" plain :disabled="deleteSubmittingId!==null" @click="router.push(`/itineraries/${item.id}`)">编辑项目</el-button><el-button type="danger" text :loading="deleteSubmittingId===item.id" :disabled="deleteSubmittingId!==null" @click="remove(item)">删除</el-button></div></el-card></section>
<el-dialog v-model="dialog" title="新建行程" width="min(500px, 92vw)"><el-form label-position="top"><el-form-item label="标题" required><el-input v-model="form.title" maxlength="100" /></el-form-item><el-form-item label="日期" required><el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD"/><span class="to">至</span><el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD"/></el-form-item></el-form><template #footer><el-button :disabled="createSubmitting" @click="dialog=false">取消</el-button><el-button type="primary" :loading="createSubmitting" :disabled="createSubmitting" @click="create">创建</el-button></template></el-dialog></main></template>
<style scoped>.page{max-width:1000px;margin:24px auto;padding:0 16px}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}header p{color:#909399;margin-top:6px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.grid p{color:#606266;margin:12px 0 18px}.to{margin:0 10px}@media(max-width:650px){header{align-items:flex-start;gap:16px}.grid{grid-template-columns:1fr}.to{display:block;margin:8px 0}}</style>
