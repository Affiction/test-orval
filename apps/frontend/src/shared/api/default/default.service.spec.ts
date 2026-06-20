import { provideHttpClient, withFetch } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';

import type { Todo } from '../todoAPI.schemas';
import { DefaultService } from './default.service';

describe('DefaultService (MSW + orval faker mocks)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      // CRITICAL: withFetch() so MSW can intercept under node/jsdom.
      providers: [provideHttpClient(withFetch())],
    });
  });

  it('getTodos() returns a faker-generated array of Todo shapes', async () => {
    const service = TestBed.inject(DefaultService);

    const todos = await firstValueFrom(service.getTodos());

    expect(Array.isArray(todos)).toBe(true);
    expect(todos.length).toBeGreaterThan(0);

    for (const todo of todos as Todo[]) {
      expect(typeof todo.id).toBe('number');
      expect(typeof todo.title).toBe('string');
      expect(typeof todo.done).toBe('boolean');
    }
  });

  it('getTodosId() returns a single faker-generated Todo shape', async () => {
    const service = TestBed.inject(DefaultService);

    const todo = await firstValueFrom(service.getTodosId('1'));

    expect(typeof todo.id).toBe('number');
    expect(typeof todo.title).toBe('string');
    expect(typeof todo.done).toBe('boolean');
  });
});
