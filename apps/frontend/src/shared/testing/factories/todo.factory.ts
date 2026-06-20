import { Factory } from 'fishery';
import { randBoolean, randProductName, seed } from '@ngneat/falso';

import type { CreateTodo, Todo, UpdateTodo } from '../../api';

/**
 * Deterministic seed so every generated value is reproducible across runs.
 * Re-applied lazily by each factory's `onCreate`-free build pipeline below.
 */
const FIXED_SEED = 'orval-msw-v4';

/**
 * Fishery factory for the {@link Todo} DTO (typed straight from the orval schema).
 * Uses `@ngneat/falso` with a fixed seed for deterministic, hand-controlled data.
 *
 * Reset the falso seed before a deterministic block via {@link resetFactorySeed}.
 */
export const todoFactory = Factory.define<Todo>(({ sequence }) => ({
  id: sequence,
  title: randProductName(),
  done: randBoolean(),
}));

/**
 * Fishery factory for the {@link CreateTodo} request DTO.
 */
export const createTodoFactory = Factory.define<CreateTodo>(() => ({
  title: randProductName(),
}));

/**
 * Fishery factory for the {@link UpdateTodo} request DTO.
 */
export const updateTodoFactory = Factory.define<UpdateTodo>(() => ({
  done: randBoolean(),
}));

/**
 * Re-seed falso and reset every factory's sequence counter so a test block
 * produces the exact same data on every run (max-control determinism).
 */
export function resetFactorySeed(): void {
  seed(FIXED_SEED);
  todoFactory.rewindSequence();
  createTodoFactory.rewindSequence();
  updateTodoFactory.rewindSequence();
}

// Apply the fixed seed at module load so the very first import is deterministic.
seed(FIXED_SEED);
