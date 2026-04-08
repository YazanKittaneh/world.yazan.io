# Cinematic Scene Renderers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an extensible scene-rendering system so story scenes can use either the globe renderer or dedicated cinematic local renderers like a Strait of Hormuz scene.

**Architecture:** Introduce explicit scene renderer metadata in `types/story.ts`, move renderer selection to a page-level switch, keep narration/navigation in shared components, and create a dedicated `HormuzSceneCanvas.vue` for the first cinematic local scene. Remove the current title-based overlay hack from the globe renderer.

**Tech Stack:** Nuxt 3, Vue 3, Pinia, Three.js, three-globe

---

### Task 1: Extend story scene metadata

**Files:**
- Modify: `types/story.ts`

**Steps:**
1. Add `sceneId?: string` for stable scene identity.
2. Add `renderMode?: 'globe' | 'local'`.
3. Add `rendererKey?: string` for future local scene registry keys.
4. Add optional `rendererProps?: Record<string, unknown>` escape hatch.

### Task 2: Add page-level renderer switching

**Files:**
- Create: `components/globe/StorySceneRenderer.vue`
- Modify: `pages/globe.vue`

**Steps:**
1. Create a wrapper component that reads `currentScene` from the story store.
2. Render `GlobeSceneCanvas` for default/globe scenes.
3. Render `HormuzSceneCanvas` for `renderMode === 'local' && rendererKey === 'hormuz-cinematic'`.
4. Update `pages/globe.vue` to mount the wrapper instead of directly mounting `GlobeSceneCanvas`.

### Task 3: Build the first dedicated cinematic local scene

**Files:**
- Create: `components/globe/HormuzSceneCanvas.vue`

**Steps:**
1. Create a standalone Three.js scene component modeled after existing canvas patterns.
2. Add a cinematic environment: dark sea, warm horizon/fog, coast silhouettes.
3. Add ships, shipping lane cues, missile batteries/radar cues.
4. Add animation loop for water/ship motion and light atmosphere.
5. Keep the component self-contained and disposable on unmount.

### Task 4: Remove title-based special rendering from globe renderer

**Files:**
- Modify: `components/globe/GlobeSceneCanvas.vue`

**Steps:**
1. Remove the hardcoded `manageCustomOverlay` path for `The Chokepoint`.
2. Keep globe rendering focused on globe scenes only.
3. Preserve camera, markers, arcs, and highlight behavior for non-local scenes.

### Task 5: Move scene 4 onto the new render system

**Files:**
- Modify: `public/story/current.json`

**Steps:**
1. Give scene 4 a stable `sceneId`.
2. Set `renderMode: 'local'`.
3. Set `rendererKey: 'hormuz-cinematic'`.
4. Trim globe-specific fields if they are no longer needed for that scene.

### Task 6: Verify

**Files:**
- Verify build only

**Steps:**
1. Run `pnpm build`.
2. Fix any regressions.
3. Confirm the scene system still supports narration/navigation shared across renderers.
