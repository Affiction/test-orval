import { defineConfig } from 'orval';

export default defineConfig({
  todos: {
    input: '../../docs/openapi.json',
    output: {
      mode: 'tags-split',
      target: 'src/shared/api',
      client: 'angular',
      baseUrl: 'http://localhost:3000',
      mock: {
        generators: [
          {
            type: 'msw',
            useExamples: true,
            delay: 200,
          },
        ],
      },
      override: {
        mock: {
          useExamples: true,
          arrayMin: 1,
          arrayMax: 1,
        },
      },
    },
  },
});
