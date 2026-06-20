import { Factory } from 'fishery';
import { randBoolean, randSentence, seed } from '@ngneat/falso';

import type { Todo } from '../../api';

/**
 * Deterministic Fishery factory for the `Todo` schema.
 *
 * Values are generated with `@ngneat/falso` under a FIXED seed so that every
 * test run produces the exact same data. The seed is (re)applied on each
 * `build`/`buildList` call via `afterBuild`-free determinism: we reset it in the
 * generator using the sequence number, guaranteeing a 1:1 mapping between the
 * sequence index and the produced field values.
 */
export const todoFactory = Factory.define<Todo>(({ sequence }) => {
  // Re-seed per item using the sequence so the n-th built Todo is always
  // identical regardless of how many were built before it.
  seed(`todo-factory-${sequence}`);

  return {
    id: sequence,
    title: randSentence(),
    done: randBoolean(),
  };
});
