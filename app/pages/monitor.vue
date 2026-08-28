<template>
  <div class="monitor">
    <!-- 顶栏：标题 + 添加流 -->
    <header class="monitor__head">
      <div>
        <h1 class="monitor__title">监控</h1>
        <p class="monitor__sub">HLS 实时视频流接入演示</p>
      </div>
      <el-form class="monitor__add" inline @submit.prevent="addStream">
        <el-input
          v-model="urlInput"
          placeholder="粘贴 HLS(m3u8) 地址"
          style="width: 340px"
          clearable
        />
        <el-button type="primary" :icon="Plus" @click="addStream">添加</el-button>
      </el-form>
    </header>

    <!-- 视频网格：Tailwind 响应式断点，1→2→3 列 -->
    <div v-if="streams.length" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="(s, i) in streams" :key="s.id" class="cam">
        <div class="cam__bar">
          <span class="cam__dot" />
          <span class="cam__name">{{ s.name }}</span>
          <el-button
            class="cam__del"
            link
            type="danger"
            :icon="Delete"
            @click="removeStream(i)"
          />
        </div>
        <HlsPlayer :src="s.url" />
        <div class="cam__url" :title="s.url">{{ s.url }}</div>
      </div>
    </div>

    <el-empty v-else description="还没有视频流，请在上方添加 m3u8 地址" />
  </div>
</template>

<script setup lang="ts">
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Stream {
  id: number
  name: string
  url: string
}

let seq = 0
const urlInput = ref('')

// 默认演示流（公开可用的 HLS 测试源）
const streams = ref<Stream[]>([
  {
    id: ++seq,
    name: '摄像机 01',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  },
])

function addStream() {
  const url = urlInput.value.trim()
  if (!url) {
    ElMessage.warning('请输入 m3u8 地址')
    return
  }
  if (!/\.m3u8(\?.*)?$/i.test(url)) {
    ElMessage.warning('地址看起来不是有效的 m3u8 流')
    return
  }
  streams.value.push({
    id: ++seq,
    name: `摄像机 ${String(streams.value.length + 1).padStart(2, '0')}`,
    url,
  })
  urlInput.value = ''
  ElMessage.success('已添加视频流')
}

function removeStream(index: number) {
  streams.value.splice(index, 1)
}
</script>

<style scoped lang="scss">
.monitor {
  max-width: var(--app-max-width, 1600px);
  margin: 0 auto;
  padding: 1.5rem 1.25rem 2.5rem;
}

.monitor__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.monitor__title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: $text;
}
.monitor__sub {
  margin: 0.25rem 0 0;
  color: $muted;
  font-size: 0.9rem;
}

.monitor__add {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.cam {
  border-radius: 0.9rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}
.cam__bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(15, 23, 42, 0.04);
}
.cam__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: #ef4444;
  box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6);
  animation: cam-pulse 1.6s infinite;
}
@keyframes cam-pulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
  70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
.cam__name {
  flex: 1;
  font-weight: 600;
  color: $text;
}
.cam__url {
  padding: 0.45rem 0.75rem;
  font-size: 0.72rem;
  color: $muted;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
