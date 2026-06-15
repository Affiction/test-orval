import { defineConfig } from 'orval'

export default defineConfig({
  todos: {
    input: 'http://localhost:3000/openapi.json',
    output: {
      mode: 'tags-split',
      target: 'src/shared/api',
      client: 'angular',
      baseUrl: 'http://localhost:3000',
    },
  },
})
