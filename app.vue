<template>
  <div class="app-shell">
    <NuxtPage />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(2, 71, 254, 0.24), transparent 24%),
    radial-gradient(circle at 85% 12%, rgba(102, 129, 255, 0.12), transparent 18%),
    linear-gradient(180deg, #0f1014 0%, #090a0d 100%);
}
</style>
