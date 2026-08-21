<script setup lang="ts">
import { NConfigProvider, darkTheme } from 'naive-ui'
</script>

<template>
  <NConfigProvider :theme="darkTheme">
    <RouterView />
  </NConfigProvider>
</template>
