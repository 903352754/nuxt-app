<template>
<section>关于{{route}}</section>
</template>
<script setup lang="ts">
const route = useRoute()
definePageMeta({
  middleware:'auth',
})
</script>
<style scoped>

</style>