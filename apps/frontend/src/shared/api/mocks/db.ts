import { factory, primaryKey } from '@mswjs/data';

/**
 * Auto-incrementing primary key generator for the `todo` model.
 *
 * `@mswjs/data` does not ship a built-in auto-increment helper, so we keep a
 * module-level counter and hand it out via a getter passed to `primaryKey`.
 * The counter must be reset together with `db.todo` (see `resetDb`) otherwise
 * a second test run would start re-issuing already-used ids and trigger a
 * `DuplicatePrimaryKeyError`.
 */
let idCounter = 0;
const autoIncrement = () => ++idCounter;

export const db = factory({
  todo: {
    id: primaryKey(autoIncrement),
    title: String,
    done: Boolean,
  },
});

/**
 * Drop every record from the `todo` model and reset the id counter so the next
 * inserted record starts again from `1`. Call this between tests to guarantee a
 * clean, deterministic database.
 */
export function resetDb(): void {
  db.todo.deleteMany({ where: {} });
  idCounter = 0;
}
