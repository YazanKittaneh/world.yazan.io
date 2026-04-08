import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STORY_PATH = resolve(__dirname, '../../public/story/current.json')

const TELL_STORY_SCHEMA = {
  type: 'object' as const,
  properties: {
    title: { type: 'string' },
    scenes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sceneId: {
            type: 'string',
            description: 'Stable identifier for this scene'
          },
          narration: {
            type: 'string',
            description: 'Text shown on screen for this scene'
          },
          sceneTitle: {
            type: 'string',
            description: 'Optional heading shown above narration'
          },
          renderMode: {
            type: 'string',
            enum: ['globe', 'local'],
            description: 'Whether this scene should use the globe renderer or a dedicated local renderer'
          },
          rendererKey: {
            type: 'string',
            description: 'Renderer identifier for local scenes (for example, hormuz-cinematic)'
          },
          rendererProps: {
            type: 'object',
            description: 'Optional renderer-specific configuration payload'
          },
          duration: {
            type: 'number',
            description: 'Milliseconds before auto-advancing to the next scene'
          },
          arcs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: { type: 'string', description: 'ISO 3166-1 alpha-2 code' },
                to: { type: 'string', description: 'ISO 3166-1 alpha-2 code' },
                color: { type: 'string', description: 'CSS color string' },
                thickness: { type: 'number', description: 'Line width multiplier (0.1 to 5.0, default: 1.0)' },
                speed: { type: 'number', description: 'Animation duration in milliseconds (default: 2000)' },
                label: { type: 'string', description: 'Label shown on hover or in legend' },
                waypoints: { type: 'array', items: { type: 'string' }, description: 'Additional ISO codes for multi-hop routes' },
                directional: { type: 'boolean', description: 'Show arrowhead indicating direction (default: false)' },
                style: { type: 'string', enum: ['dashed', 'solid', 'dotted'], description: 'Line style (default: dashed)' }
              },
              required: ['from', 'to', 'color']
            }
          },
          highlights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                iso: { type: 'string', description: 'ISO 3166-1 alpha-2 code' },
                color: { type: 'string', description: 'CSS color string' }
              },
              required: ['iso', 'color']
            }
          },
          markers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                lat: { type: 'number', description: 'Latitude in degrees' },
                lng: { type: 'number', description: 'Longitude in degrees' },
                label: { type: 'string', description: 'Label shown for the marker' },
                color: { type: 'string', description: 'CSS color string' }
              },
              required: ['lat', 'lng', 'label', 'color']
            }
          },
          camera: {
            type: 'object',
            properties: {
              lat: { type: 'number', description: 'Latitude in degrees' },
              lng: { type: 'number', description: 'Longitude in degrees' },
              distance: { type: 'number', description: 'Camera distance from scene center' }
            },
            required: ['lat', 'lng']
          }
        },
        required: ['narration']
      }
    }
  },
  required: ['scenes']
}

const server = new Server(
  { name: 'globe-story', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'tell_story',
      description:
        'Load a visual story into the story viewer. Scenes can use the globe renderer or dedicated local cinematic renderers, alongside narration, highlights, arcs, markers, and camera overrides. The user advances manually with arrow keys (left/right) or by swiping on the narration card on mobile.',
      inputSchema: TELL_STORY_SCHEMA
    }
  ]
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'tell_story') {
    throw new Error(`Unknown tool: ${request.params.name}`)
  }

  const story = request.params.arguments as {
    title?: string
    scenes: Array<{
      sceneId?: string
      narration: string
      sceneTitle?: string
      renderMode?: 'globe' | 'local'
      rendererKey?: string
      rendererProps?: Record<string, unknown>
      duration?: number
      arcs?: Array<{ from: string; to: string; color: string }>
      highlights?: Array<{ iso: string; color: string }>
      markers?: Array<{ lat: number; lng: number; label: string; color: string }>
      camera?: { lat: number; lng: number; distance?: number }
    }>
  }

  writeFileSync(STORY_PATH, JSON.stringify(story, null, 2), 'utf8')

  return {
    content: [
      {
        type: 'text',
        text: `Story loaded: ${story.scenes.length} scene(s)${story.title ? ` — "${story.title}"` : ''}. The globe will pick it up within 3 seconds.`
      }
    ]
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
