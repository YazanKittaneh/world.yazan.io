<template>
  <main class="globe-viewer">
    <div class="globe-chrome">
      <NuxtLink class="globe-back-link" to="/">Back to city</NuxtLink>

      <div class="globe-copy">
        <p class="globe-eyebrow">Editorial globe</p>
        <h1>Country polygons on a textured Earth.</h1>
      </div>
    </div>

    <ClientOnly>
      <GlobeSceneCanvas />
    </ClientOnly>
  </main>
</template>

<style scoped>
.globe-viewer {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.globe-chrome {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
}

.globe-back-link,
.globe-copy {
  pointer-events: auto;
}

.globe-back-link {
  position: fixed;
  top: 20px;
  left: 20px;
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  letter-spacing: 0.02em;
  background: rgba(10, 10, 15, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  backdrop-filter: blur(10px);
}

.globe-back-link:hover {
  border-color: rgba(255, 255, 255, 0.4);
}

.globe-copy {
  position: fixed;
  left: 20px;
  bottom: 20px;
  max-width: 320px;
  padding: 16px 18px;
  color: #fff;
  background: rgba(10, 10, 15, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  backdrop-filter: blur(12px);
}

.globe-eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
}

.globe-copy h1 {
  margin: 0;
  font-size: clamp(1.25rem, 2vw, 1.8rem);
  line-height: 1.2;
  font-weight: 500;
}

@media (max-width: 640px) {
  .globe-copy {
    right: 20px;
    max-width: none;
  }
}
</style>
