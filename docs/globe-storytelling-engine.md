# Globe Storytelling Engine

The globe at `/globe` doubles as a visual storytelling surface. An LLM (Claude or any tool-use model) can call the `tell_story` MCP tool to load a complete story — a sequence of scenes that combine narration text, country highlights, and animated arcs — onto the globe. The user advances through scenes manually with arrow keys while the globe animates transitions between them.

## How it works

```
Claude (MCP client)
  └─ tell_story({ title, scenes })
       └─ mcp/dist/index.js  (stdio MCP server, launched by Claude Code)
            └─ writeFileSync → public/story/current.json
                 └─ GlobeSceneCanvas.vue  (polls every 3s via setInterval)
                      └─ stores/story.ts  (Pinia store, reactive state)
                           └─ renders arcs, highlights, NarrationOverlay
```

No HTTP server, no WebSockets. The MCP server writes a JSON file; the frontend polls it. This keeps the system fully compatible with static hosting (Cloudflare Pages).

## File map

| File | Role |
|------|------|
| `mcp/index.ts` | MCP server source |
| `mcp/dist/index.js` | Compiled output (committed) |
| `mcp/package.json` | `pnpm build` → `tsc` |
| `.claude/settings.json` | Registers the server with Claude Code |
| `public/story/current.json` | The live story state the globe reads |
| `stores/story.ts` | Pinia store that holds current story + scene index |
| `components/globe/GlobeSceneCanvas.vue` | Polls the JSON, renders arcs/highlights |
| `components/globe/NarrationOverlay.vue` | Displays narration text with crossfade |
| `composables/useCountryCenters.ts` | Computes lat/lon centers from GeoJSON for arc origins |

## `tell_story` input schema

```ts
{
  title?: string          // optional display title
  scenes: Array<{
    narration: string     // text shown on screen (supports line breaks)

    highlights?: Array<{
      iso: string         // ISO 3166-1 alpha-2 country code (e.g. "HT", "FR")
      color: string       // CSS color string (e.g. "#e63946", "rgba(255,0,0,0.5)")
    }>

    arcs?: Array<{
      from: string        // ISO 3166-1 alpha-2 origin country
      to: string          // ISO 3166-1 alpha-2 destination country
      color: string       // CSS color string
    }>
  }>
}
```

All fields except `narration` are optional. A scene with only narration is valid (globe clears previous visuals).

## Keyboard controls

| Key | Action |
|-----|--------|
| → or Space | Next scene |
| ← | Previous scene |

When the last scene is reached, further → presses are ignored (no loop).

## MCP server registration

The server is registered in `.claude/settings.json` (project-level Claude Code config):

```json
{
  "mcpServers": {
    "globe-story": {
      "command": "node",
      "args": ["mcp/dist/index.js"],
      "cwd": "/Users/yazankittaneh/code/Career/blog.yazan.io/wowmedia-demo"
    }
  }
}
```

Claude Code launches this process at session startup over stdio. The tool appears as `mcp__globe_story__tell_story` in the tool list.

### Why the tool may not appear

Claude Code connects to MCP servers **once, at session startup**. If:
- `.claude/settings.json` was added after the session started → **restart Claude Code**
- `mcp/dist/index.js` is missing → run `cd mcp && pnpm build` then restart
- The server crashed on startup → run `echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1"}}}' | node mcp/dist/index.js` to check for errors

To rebuild the server after editing `mcp/index.ts`:

```bash
cd mcp && pnpm build
```

Then restart Claude Code.

## Writing good stories

### Country codes

Use ISO 3166-1 alpha-2 codes. Common ones for historical stories:

| Code | Country |
|------|---------|
| HT | Haiti |
| FR | France |
| GB | United Kingdom |
| ES | Spain |
| US | United States |
| SN | Senegal |
| GN | Guinea |
| BJ | Benin (Dahomey) |
| NG | Nigeria |
| CD | DR Congo |
| VE | Venezuela |
| BR | Brazil |

### Color palette suggestions

- Conflict / colonizer: `#e63946` (red)
- Resistance / freedom: `#2a9d8f` (teal)
- Trade routes: `#f4a261` (amber)
- Neutral / context: `#457b9d` (steel blue)
- Victory: `#2a9d8f` with higher opacity

### Scene rhythm

- Open with geographic context (show the region, no arcs yet)
- Introduce arcs to show movement, trade, or conflict
- Use highlights to mark actors (colonial powers, liberated nations)
- Clear visuals between unrelated phases by using a scene with only narration
- End with the outcome highlighted prominently

## Example: Haitian Revolution (10 scenes)

The story in `public/story/current.json` covers:

1. West African kingdoms before the slave trade (amber highlights on West Africa)
2. The Middle Passage — red arcs from Senegal, Guinea, Benin, Congo, Nigeria → Haiti
3. Saint-Domingue as France's most profitable colony (red Haiti, blue France, arc FR→HT)
4. Bois Caïman 1791 — uprising begins (amber Haiti)
5. Toussaint Louverture repels France, Britain, and Spain (teal Haiti, red arcs from all three)
6. Napoleon's 40,000 troops; Toussaint arrested by treachery (red Haiti, blue France)
7. Toussaint dies in French prison; Dessalines fights on
8. Battle of Vertières — final French defeat (amber Haiti)
9. January 1, 1804 — independence declared (teal Haiti)
10. Haiti inspires freedom movements globally (teal Haiti, teal arcs to Venezuela and Senegal)

## Deployment note

`public/story/current.json` is a static file and gets deployed to Cloudflare Pages with the rest of the build output. Stories created locally via the MCP tool are **not** automatically pushed to production — they only affect whoever is running `pnpm dev` locally. To deploy a story, commit `public/story/current.json` and redeploy.
