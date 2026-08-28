<template>
  <div class="page">
    <!-- 顶栏 -->
    <header class="page__head">
      <div>
        <h1 class="page__title">用户管理</h1>
        <p class="page__sub">登记、编辑、删除用户信息</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">添加用户</el-button>
    </header>

    <!-- 用户表格 -->
    <el-card shadow="never" class="card">
      <el-table
        v-loading="pending"
        :data="pagedUsers"
        stripe
        style="width: 100%"
        :max-height="tableMaxHeight"
        :empty-text="error ? '加载失败' : '暂无用户'"
      >
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="age" label="年龄" width="80" align="center" />
        <el-table-column label="爱好" min-width="220">
          <template #default="{ row }">
            <template v-if="row.hobbies?.length">
              <el-tag
                v-for="h in row.hobbies"
                :key="h"
                type="info"
                effect="plain"
                class="chip"
              >
                {{ h }}
              </el-tag>
            </template>
            <span v-else class="muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" :icon="Delete" @click="remove(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pager">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>

    <!-- 弹窗表单 -->
    <el-dialog
      v-model="showModal"
      :title="editingId ? '编辑用户' : '新增用户'"
      width="480px"
      :close-on-click-modal="false"
      align-center
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="submit"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" type="email" placeholder="name@example.com" />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="form.age" :min="0" :max="150" controls-position="right" />
        </el-form-item>
        <el-form-item label="爱好">
          <el-input
            v-model="hobbiesText"
            placeholder="用逗号分隔，如：阅读, 音乐"
          />
          <div class="form__hint">多个爱好用英文逗号隔开</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeModal">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">
          {{ editingId ? '保存' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface User {
  id: string
  name: string
  email: string
  age: number
  hobbies: string[]
}

const form = reactive({ name: '', email: '', age: 0 })
const hobbiesText = ref('')
const editingId = ref<string | null>(null)
const showModal = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)
const tableMaxHeight = ref(400)

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
}

// 获取用户列表
const { data, pending, error, refresh } = await useFetch<User[]>('/api/users')
// data 是 Ref<User[] | null>，转成 ComputedRef，让模板里 users 直接用
const users = computed(() => data.value ?? [])
// 出错时提示一次
watch(error, (e) => {
  if (e) ElMessage.error(`加载失败：${e.statusMessage || e.message}`)
})

// 总条数
const total = computed(() => users.value.length)
// 当前页数据（前端分页）
const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return users.value.slice(start, start + pageSize.value)
})

// 逗号分隔字符串 → 爱好数组
function toHobbies(text: string): string[] {
  return text.split(',').map(s => s.trim()).filter(Boolean)
}

// 动态计算表格最大高度：视口高度 - 顶部偏移 - 底部 20px padding
// 顶部偏移 ≈ 页面 padding-top + 标题块 + 分页栏 + 间距
const TOP_OFFSET = 200
function updateTableHeight() {
  const h = window.innerHeight - TOP_OFFSET - 20
  tableMaxHeight.value = Math.max(240, h)
}
onMounted(() => {
  updateTableHeight()
  window.addEventListener('resize', updateTableHeight)
})
onBeforeUnmount(() => window.removeEventListener('resize', updateTableHeight))

// 删除/换页大小后，若当前页超出范围则回到最后一页
watch([total, pageSize], () => {
  const maxPage = Math.max(1, Math.ceil(total.value / pageSize.value))
  if (currentPage.value > maxPage) currentPage.value = maxPage
})

// 打开新增弹窗
function openCreate() {
  editingId.value = null
  form.name = ''
  form.email = ''
  form.age = 0
  hobbiesText.value = ''
  showModal.value = true
  formRef.value?.clearValidate()
}

// 打开编辑弹窗：把用户数据填回表单
function openEdit(u: User) {
  editingId.value = u.id
  form.name = u.name
  form.email = u.email
  form.age = u.age
  hobbiesText.value = u.hobbies.join(', ')
  showModal.value = true
  formRef.value?.clearValidate()
}

function closeModal() {
  showModal.value = false
}

// 提交：editingId 有值则 PUT 更新，否则 POST 新增
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    const payload = {
      name: form.name,
      email: form.email,
      age: Number(form.age) || 0,
      hobbies: toHobbies(hobbiesText.value),
    }
    try {
      if (editingId.value) {
        await $fetch(`/api/users/${editingId.value}`, { method: 'PUT', body: payload })
        ElMessage.success('更新成功')
      } else {
        await $fetch('/api/users', { method: 'POST', body: payload })
        ElMessage.success('添加成功')
      }
      showModal.value = false
      await refresh()
    } catch (e: any) {
      ElMessage.error(e?.data?.statusMessage || e?.message || '提交失败')
    } finally {
      saving.value = false
    }
  })
}

// 删除用户
async function remove(id: string) {
  try {
    await ElMessageBox.confirm('确认删除该用户？此操作不可撤销。', '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return // 用户点了取消
  }
  try {
    await $fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (editingId.value === id) showModal.value = false
    ElMessage.success('删除成功')
    await refresh()
  } catch (e: any) {
    ElMessage.error(e?.data?.statusMessage || e?.message || '删除失败')
  }
}
</script>

<style scoped lang="scss">
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
}

.page__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.page__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}
.page__sub {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.card {
  border-radius: 12px;
}

/* 分页栏 */
.pager {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 4px;
}

/* 爱好标签间距 */
.chip {
  margin: 2px 6px 2px 0;
}
.muted {
  color: var(--el-text-color-placeholder);
}
.form__hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  line-height: 1.4;
  margin-top: 4px;
}
</style>
