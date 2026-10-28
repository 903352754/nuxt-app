<template>
  <div class="page-wrap monitor">
    <PageHeader
      index="02"
      kicker="MODULES / MONITOR"
      title="监控"
      desc="HLS（m3u8）实时视频流接入，支持多路信号源同屏查看。"
    >
      <template #actions>
        <span class="total">
          <span class="tech-label">SIGNALS</span>
          <strong class="total__num">{{ streams.length }}</strong>
        </span>

        <div class="add">
          <el-input
            v-model="urlInput"
            placeholder="粘贴 HLS(m3u8) 地址"
            clearable
            class="add__input"
            @keyup.enter="addStream"
          />
          <el-button type="primary" :icon="Plus" @click="addStream">添加</el-button>
        </div>
      </template>
    </PageHeader>

    <!-- 视频网格 -->
    <div v-if="streams.length" class="grid">
      <article v-for="s in streams" :key="s.id" class="cam tech-panel">
        <header class="cam__bar">
          <span class="cam__live">
            <span class="cam__dot" aria-hidden="true" />
            LIVE
          </span>
          <span class="cam__name">{{ s.name }}</span>
          <span class="cam__id">#{{ String(s.id).padStart(2, '0') }}</span>
          <el-button
            class="cam__del"
            link
            type="danger"
            :icon="Delete"
            aria-label="移除该视频流"
            @click="removeStream(streams.indexOf(s))"
          />
        </header>

        <HlsPlayer :src="s.url" />

        <footer class="cam__foot" :title="s.url">
          <span class="tech-label">SRC</span>
          <span class="cam__url">{{ s.url }}</span>
        </footer>
      </article>
    </div>

    <!-- 空态 -->
    <section v-else class="empty tech-panel tech-corners">
      <el-empty description="还没有视频流，请在上方添加 m3u8 地址" />
      <p class="empty__hint">
        <span class="tech-label">EXAMPLE</span>
        <code>https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8</code>
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

definePageMeta({
  title: '监控',
})

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
  if (index >= 0) streams.value.splice(index, 1)
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

/* 地址输入 + 添加 */
.add {
  display: flex;
  gap: 8px;
  align-items: center;
}

.add__input {
  width: clamp(200px, 26vw, 340px);
}

/* ---------------- 网格 ---------------- */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr));
  gap: clamp(12px, 1.6vw, 20px);
}

/* ---------------- 单个画面 ---------------- */
.cam {
  overflow: hidden;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    border-color: rgba(34, 211, 238, 0.28);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 18px 40px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(34, 211, 238, 0.08);
  }
}

.cam__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-bottom: 1px solid $line;
  background: rgba(122, 190, 255, 0.04);
}

.cam__live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 7px;
  border: 1px solid rgba(248, 113, 113, 0.35);
  border-radius: 4px;
  font-family: $font-mono;
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  color: #fca5a5;
  background: rgba(248, 113, 113, 0.08);
}

.cam__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #f87171;
  box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.6);
  animation: cam-pulse 1.8s infinite;
}

@keyframes cam-pulse {
  0% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.55); }
  70% { box-shadow: 0 0 0 6px rgba(248, 113, 113, 0); }
  100% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0); }
}

.cam__name {
  flex: 1;
  min-width: 0;
  font-size: 0.88rem;
  font-weight: 600;
  color: $text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cam__id {
  font-family: $font-mono;
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  color: $faint;
}

.cam__foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid $line;
}

.cam__url {
  flex: 1;
  min-width: 0;
  font-family: $font-mono;
  font-size: 0.68rem;
  color: $muted;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------------- 空态 ---------------- */
.empty {
  display: grid;
  justify-items: center;
  gap: 4px;
  padding: clamp(20px, 4vw, 40px);
}

.empty__hint {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0 0 10px;
  font-size: 0.74rem;
  color: $faint;

  code {
    font-family: $font-mono;
    font-size: 0.7rem;
    padding: 2px 7px;
    border: 1px solid $line;
    border-radius: 5px;
    background: rgba(8, 15, 26, 0.7);
    color: $muted;
    word-break: break-all;
  }
}

/* ---------------- 断点 ---------------- */
@media (max-width: 767px) {
  .add {
    width: 100%;
  }

  .add__input {
    flex: 1;
    width: auto;
    min-width: 0;
  }

  .grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
