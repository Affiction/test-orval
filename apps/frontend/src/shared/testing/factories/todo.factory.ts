import { Factory } from 'fishery';
import { randBoolean, randTodo, seed } from '@ngneat/falso';

import type { Todo } from '../../api/todoAPI.schemas';
import { db } from '../../api/mocks/db';

/**
 * Deterministic seed so the generated todo titles are identical on every run.
 * falso's global RNG is seeded once when this module is first imported.
 */
seed('orval-msw-v5');

/**
 * Fishery factory producing fully-typed `Todo` objects with falso-generated
 * data. The `id` is intentionally a placeholder: when records are inserted via
 * `db.todo.create` the real id comes from the @mswjs/data auto-increment getter,
 * so we only rely on `title`/`done` from the factory.
 */
export const todoFactory = Factory.define<Todo>(({ sequence }) => ({
  id: sequence,
  title: randTodo().title,
  done: randBoolean(),
}));

/**
 * Seed the in-memory database with a deterministic set of todos.
 *
 * Only `title`/`done` are forwarded to `db.todo.create`; the primary key is
 * assigned by the model's auto-increment getter. Returns the created records.
 */
export function seedDb(count = 3) {
  const todos = todoFactory.buildList(count);
  return todos.map((todo) => db.todo.create({ title: todo.title, done: todo.done }));
}
