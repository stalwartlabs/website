<template>
  <div class="section-divider">
    <span class="num">{{ String(num).padStart(2, "0") }}</span>
    <div>
      <h1 class="title">{{ title }}</h1>
      <p v-if="sub" class="sub">{{ sub }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  num: number | string;
  title: string;
  sub?: string;
}>();
</script>
