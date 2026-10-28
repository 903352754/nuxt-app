<template>
  <div class="page-wrap users">
    <PageHeader
      index="01"
      kicker="MODULES / USERS"
      title="用户管理"
      desc="登记、编辑与删除用户信息，数据实时写入 MongoDB。"
    >
      <template #actions>
        <span class="total">
          <span class="tech-label">TOTAL</span>
          <strong class="total__num">{{ total }}</strong>
        </span>
        <el-button type="primary" :icon="Plus" @click="openCreate">添加用户</el-button>
      </template>
    </PageHeader>

    <section class="panel tech-panel">
      <!-- 面板工具条 -->
      <div class="panel__bar">
        <div class="panel__group">
          <span class="tech-label">RECORDS</span>
          <span class="panel__num">{{ users.length }}</span>
          <span class="panel__sep" aria-hidden="true">|</span>
          <span class="tech-label">PAGE {{ currentPage }} / {{ pageCount }}</span>
        </div>

        <el-button
          link
          :icon="Refresh"
          :loading="pending"
          class="panel__refresh"
          @click="refresh()"
        >
          刷新
        </el-button>
      </div>

      <!-- 错误态 -->
      <div v-if="error" class="state">
        <el-icon :size="22" class="state__icon"><WarningFilled /></el-icon>
        <p class="state__title">数据加载失败</p>
        <p class="state__msg">{{ errorMessage }}</p>
        <el-button type="primary" :icon="Refresh" @click="refresh()">重试</el-button>
      </div>

      <!-- 移动端：卡片列表 -->
      <ul v-else-if="isMobile" class="list">
        <li v-for="u in pagedUsers" :key="u.id" class="ucard">
          <div class="ucard__top">
            <span class="ucard__avatar" aria-hidden="true">{{ u.name.slice(0, 1) || '?' }}</span>
            <div class="ucard__id">
              <p class="ucard__name">{{ u.name }}</p>
              <p class="ucard__mail">{{ u.email }}</p>
            </div>
            <span v-if="u.age != null" class="ucard__age">
              {{ u.age }}<small>岁</small>
            </span>
          </div>

          <div v-if="u.hobbies?.length" class="ucard__tags">
            <el-tag v-for="h in u.hobbies" :key="h" size="small" effect="plain">{{ h }}</el-tag>
          </div>
          <p v-else class="ucard__empty">未填写爱好</p>

          <div class="ucard__actions">
            <el-button size="small" :icon="Edit" @click="openEdit(u)">编辑</el-button>
            <el-button size="small" type="danger" plain :icon="Delete" @click="remove(u.id)">
              删除
            </el-button>
          </div>
        </li>

        <li v-if="!pagedUsers.length">
          <el-empty description="暂无用户数据" />
        </li>
      </ul>

      <!-- 桌面 / 平板：表格 -->
      <div v-else class="table-wrap">
        <el-table
          v-loading="pending"
          :data="pagedUsers"
          :empty-text="'暂无用户数据'"
        >
          <el-table-column label="用户" min-width="200">
            <template #default="{ row }">
              <div class="cell-user">
                <span class="cell-user__avatar" aria-hidden="true">
                  {{ row.name.slice(0, 1) || '?' }}
                </span>
                <span class="cell-user__name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="email" label="邮箱" min-width="220" show-overflow-tooltip />

          <el-table-column label="年龄" width="90" align="center">
            <template #default="{ row }">
              <span class="cell-age">{{ row.age ?? '—' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="爱好" min-width="240">
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

          <el-table-column label="操作" width="150" align="right" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" @click="openEdit(row)">编辑</el-button>
              <el-button link type="danger" :icon="Delete" @click="remove(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pager">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          :layout="pagerLayout"
          :size="isMobile ? 'small' : 'default'"
          :pager-count="isMobile ? 5 : 7"
          background
        />
      </div>
    </section>

    <!-- 弹窗表单 -->
    <el-dialog
      v-model="showModal"
      :title="editingId ? '编辑用户' : '新增用户'"
      :width="isMobile ? '92vw' : '480px'"
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
          <el-input v-model="hobbiesText" placeholder="用逗号分隔，如：阅读, 音乐" />
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
import {
  Delete,
  Edit,
  Plus,
  Refresh,
  WarningFilled,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

definePageMeta({
  title: '用户管理',
})

interface User {
  id: string
  name: string
  email: string
  age?: number
  hobbies?: string[]
}

const { isMobile } = useBreakpoint()

const form = reactive({ name: '', email: '', age: 0 })
const hobbiesText = ref('')
const editingId = ref<string | null>(null)
const showModal = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

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
const users = computed(() => data.value ?? [])

// 错误信息（优先取后端返回的 statusMessage）
const errorMessage = computed(() => {
  const e = error.value as any
  if (!e) return ''
  return e.data?.statusMessage || e.statusMessage || e.message || '未知错误'
})

// 出错时提示一次
watch(error, (e) => {
  if (e) ElMessage.error(`加载失败：${errorMessage.value}`)
})

const total = computed(() => users.value.length)
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return users.value.slice(start, start + pageSize.value)
})

// 分页控件：小屏隐藏「每页条数」和「跳页」，避免溢出
const pagerLayout = computed(() =>
  isMobile.value ? 'prev, pager, next' : 'sizes, prev, pager, next, jumper',
)

// 逗号分隔字符串 → 爱好数组
function toHobbies(text: string): string[] {
  return text.split(',').map((s) => s.trim()).filter(Boolean)
}

// 删除/换页大小后，若当前页超出范围则回到最后一页
watch([total, pageSize], () => {
  const maxPage = Math.max(1, Math.ceil(total.value / pageSize.value))
  if (currentPage.value > maxPage) currentPage.value = maxPage
})

function openCreate() {
  editingId.value = null
  form.name = ''
  form.email = ''
  form.age = 0
  hobbiesText.value = ''
  showModal.value = true
  formRef.value?.clearValidate()
}

function openEdit(u: User) {
  editingId.value = u.id
  form.name = u.name
  form.email = u.email
  form.age = u.age ?? 0
  hobbiesText.value = (u.hobbies ?? []).join(', ')
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
.total {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid $line;
  border-radius: $radius-sm;
  background: rgba(8, 15, 26, 0.6);
}

.total__num {
  font-family: $font-mono;
  font-size: 0.95rem;
  color: $primary;
}

/* ---------------- 面板 ---------------- */
.panel {
  overflow: hidden;
}

.panel__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid $line;
  background: rgba(122, 190, 255, 0.035);
}

.panel__group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
}

.panel__num {
  font-family: $font-mono;
  font-size: 0.8rem;
  color: $text;
}

.panel__sep {
  color: rgba(122, 190, 255, 0.2);
}

.table-wrap {
  padding: 4px 6px 0;
}

/* ---------------- 表格单元 ---------------- */
.cell-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cell-user__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 7px;
  font-family: $font-mono;
  font-size: 0.72rem;
  color: $primary;
  background: rgba(34, 211, 238, 0.09);
}

.cell-user__name {
  color: $text;
  font-weight: 500;
}

.cell-age {
  display: inline-block;
  min-width: 34px;
  padding: 1px 8px;
  border: 1px solid $line;
  border-radius: 5px;
  font-family: $font-mono;
  font-size: 0.75rem;
  color: $text-dim;
  background: rgba(122, 190, 255, 0.05);
}

.chip {
  margin: 2px 6px 2px 0;
}

.muted {
  color: $faint;
}

/* ---------------- 移动端卡片列表 ---------------- */
.list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 12px;
  list-style: none;
}

.ucard {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid $line;
  border-radius: $radius;
  background: linear-gradient(160deg, rgba(17, 28, 44, 0.8), rgba(8, 13, 23, 0.85));
}

.ucard__top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ucard__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: 1px solid rgba(34, 211, 238, 0.32);
  border-radius: 9px;
  font-family: $font-mono;
  color: $primary;
  background: rgba(34, 211, 238, 0.1);
}

.ucard__id {
  min-width: 0;
  flex: 1;
}

.ucard__name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: $text;
}

.ucard__mail {
  margin: 2px 0 0;
  font-family: $font-mono;
  font-size: 0.72rem;
  color: $muted;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ucard__age {
  font-family: $font-mono;
  font-size: 0.95rem;
  color: $primary;

  small {
    margin-left: 2px;
    font-size: 0.62rem;
    color: $faint;
  }
}

.ucard__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ucard__empty {
  margin: 0;
  font-size: 0.78rem;
  color: $faint;
}

.ucard__actions {
  display: flex;
  gap: 8px;

  :deep(.el-button) {
    flex: 1;
    margin-left: 0;
  }
}

/* ---------------- 状态 / 分页 ---------------- */
.state {
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: clamp(28px, 6vw, 56px) 20px;
  text-align: center;
}

.state__icon {
  color: $danger;
}

.state__title {
  margin: 6px 0 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: $text;
}

.state__msg {
  margin: 0 0 10px;
  max-width: 46ch;
  font-family: $font-mono;
  font-size: 0.74rem;
  line-height: 1.6;
  color: $muted;
  word-break: break-word;
}

.pager {
  display: flex;
  justify-content: flex-end;
  padding: 14px 16px;
  border-top: 1px solid $line;
}

.form__hint {
  margin-top: 4px;
  font-size: 0.72rem;
  line-height: 1.4;
  color: $faint;
}

@media (max-width: 767px) {
  .total {
    padding: 5px 10px;
  }

  .pager {
    justify-content: center;
    padding: 12px 0;
  }

  .panel__bar {
    padding: 8px 12px;
  }
}
</style>
