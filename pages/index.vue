<script setup lang="ts">
import { cities, getCityConfig } from '~/composables/cityConfig'

const route = useRoute()
const currentCity = computed(() => {
  const cityId = route.query.city as string
  return getCityConfig(cityId)
})

const availableCities = Object.values(cities)
</script>

<template>
  <main class="city-viewer">
    <div class="city-selector">
      <select
        :value="currentCity.id"
        @change="$router.push({ query: { city: ($event.target as HTMLSelectElement).value } })"
      >
        <option
          v-for="city in availableCities"
          :key="city.id"
          :value="city.id"
        >
          {{ city.name }}
        </option>
      </select>
    </div>

    <NuxtLink class="globe-link" to="/globe">
      Explore globe
    </NuxtLink>
    
    <ClientOnly>
      <HeroSceneCanvas :city="currentCity" />
    </ClientOnly>
  </main>
</template>

<style scoped>
.city-viewer {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.city-selector {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100;
}

.city-selector select {
  padding: 8px 16px;
  font-size: 14px;
  background: rgba(10, 10, 15, 0.8);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
}

.city-selector select:hover {
  border-color: rgba(255, 255, 255, 0.4);
}

.globe-link {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 14px;
  color: #fff;
  text-decoration: none;
  background: rgba(10, 10, 15, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
}

.globe-link:hover {
  border-color: rgba(255, 255, 255, 0.4);
}
</style>
