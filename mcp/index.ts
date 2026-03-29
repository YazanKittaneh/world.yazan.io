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
          narration: {
            type: 'string',
            description: 'Text shown on screen for this scene'
          },
          arcs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: { type: 'string', description: 'ISO 3166-1 alpha-2 code' },
                to: { type: 'string', description: 'ISO 3166-1 alpha-2 code' },
                color: { type: 'string', description: 'CSS color string' }
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
        'Load a visual story onto the globe. Each scene shows narration text alongside globe effects (arcs between countries, highlighted countries). The user advances manually with arrow keys.',
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
      narration: string
      arcs?: Array<{ from: string; to: string; color: string }>
      highlights?: Array<{ iso: string; color: string }>
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
