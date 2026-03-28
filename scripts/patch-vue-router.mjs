// Patches vue-router to guard against null component instances in devtools setup.
// Without this, RouterView throws "null is not an object (evaluating 'instance.__vrv_devtools = info')"
// on initial render in dev mode.  Fixed upstream in a future vue-router release.
import { readFileSync, writeFileSync } from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const files = ['dist/vue-router.mjs', 'dist/vue-router.cjs']
const needle = 'instance.__vrv_devtools = info;'
const patched = 'if (instance) instance.__vrv_devtools = info;'

let patched_count = 0
for (const f of files) {
  const path = require.resolve('vue-router/' + f)
  const src = readFileSync(path, 'utf8')
  if (src.includes(needle) && !src.includes(patched)) {
    writeFileSync(path, src.replace(needle, patched))
    console.log('Patched', f)
    patched_count++
  }
}
if (patched_count === 0) console.log('vue-router already patched or not found')
