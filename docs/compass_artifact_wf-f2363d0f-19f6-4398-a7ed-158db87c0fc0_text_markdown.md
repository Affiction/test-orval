# Fishery, фабрики тестових даних та MSW-подібні інструменти: аналіз і рекомендація для Angular 18 + FSD

## TL;DR
- **Фабрики:** Fishery — найкращий вибір для рукотворних, типобезпечних, детермінованих фабрик у вашому стеку; типізуйте її DTO-типами, які генерує Orval, і тримайте у `shared/testing`. Для суто схемо-кермованих даних додайте `zod-fixture` (детермінований seed) поверх Zod-схем Orval.
- **HTTP-мокінг:** MSW залишається правильним «єдиним джерелом правди» і для unit/integration (Jest, `setupServer`), і для dev/e2e (Service Worker); для unit-тестів окремих сервісів нативний `HttpTestingController` Angular простіший і швидший — використовуйте обидва на різних рівнях. Prism (зі specа OpenAPI) — для dev/e2e «без коду».
- **Не дублюйте стан:** `@mswjs/data` перекриває relational-функції Fishery; не тягніть обидва заради зв'язків. Fishery будує об'єкти, які повертають handler'и MSW; `@mswjs/data` потрібен лише там, де треба stateful CRUD-«база» між запитами.

## Key Findings

### Fishery
- Fishery (thoughtbot) — фабрика для побудови JS/TS-обʼєктів, концептуально це порт Ruby-гему factory_bot. Остання версія — **2.4.0, випущена 8 грудня 2025**; репозиторій має **997 зірок на GitHub** (сторінка thoughtbot/fishery, червень 2026: «Star 997»), 17 відкритих issues, єдину runtime-залежність `lodash.mergewith@^4.6.2`. Проєкт підтримується, але розвивається повільно (рідкі релізи, дрібні фікси). За npmjs.com — **886 763 завантаження на тиждень** для fishery@2.4.0.
- Ядро API: `Factory.define`, `build`/`buildList`, `create`/`createList` (асинхронні, через `onCreate`), `sequence`, transient params, associations, хуки `afterBuild`/`afterCreate`, params (deep-merge), `rewindSequence`/reset. Сильна типізація через дженерики `Factory.define<T, TransientParams, ReturnType, Params>`.
- Зв'язки/вкладені фабрики: фабрики можуть імпортувати одна одну (циклічні імпорти працюють, бо звʼязок ледачий); вкладені обʼєкти будуються через `otherFactory.buildList(n)`. Вага мала (одна залежність), tree-shakeable.

### Альтернативні фабрики тестових даних
- **rosie** — натхненна factory_bot, chainable API (`.attr`, `.sequence`, `.option`, `.after`), має успадкування. Версія 2.1.1, остання публікація ~2 роки тому, **267 248 тижневих завантажень і 1 059 зірок на GitHub**. Типізація слабша (TS-типи зовнішні), стиль «registry».
- **factory.ts** — TS-first, `makeFactory`, `each`, `buildList`, `extend`, `combine`, async-фабрики й pipeline; остання версія **1.4.2, опублікована 13 жовтня 2023**.
- **@factory-js/factory (factory-js)** — TS-порт factory_bot з `props`/`vars`/traits, ORM-дружній (плагін Prisma), `build`/`create`.
- **cooky-cutter** — мінімалістичний TS-first (`define`, `extend`, `sequence`, `random`).
- **@jackfranklin/test-data-bot** — `build` + `fields`, `sequence`, `fake`, traits, `perBuild`; написаний TS. Стара назва `test-data-bot` (0.8.0) архівована.
- **interface-forge** — TS, побудована на Faker.js, `Factory`, `batch`, `compose`/`extend`, persistence-адаптери (Prisma/TypeORM/Mongoose), Zod-інтеграція (`ZodFactory`), детермінований seed, fixture-кешування.
- **falso (@ngneat/falso) vs faker.js** — це джерела примітивів даних, не фабрики. Falso tree-shakeable, TS-first, детермінований seed (`seed()`); faker більший, але багатший. Обидва — для значень всередині фабрик.
- **@anatine/zod-mock, zod-fixture, zocker, zod-schema-faker** — генерують моки зі Zod-схем. `@anatine/zod-mock` через faker; **zod-fixture** (автор Tim Deschryver, остання версія 2.5.2 за Socket.dev) — детермінований seed (`createFixture(personSchema, { seed: 11 })`), ідеальний для snapshot-тестів; `zocker` підтримує рекурсію/lazy.

### MSW та альтернативи
- **MSW** — перехоплення на мережевому рівні: Service Worker у браузері, патчинг `http`/`https` у Node (`setupServer`). Працює у браузері + Node + Jest; типобезпечний; одне визначення для тестів, dev і Storybook. MSW @2.14.6 має **~18,5 млн тижневих завантажень і 17 942 зірки** (npm trends; Snyk наводить ~15 млн завантажень/тиждень і 17 965 зірок) — це найактивніший інструмент у категорії.
- **Mirage JS** — клієнтський «сервер» з ORM/relational in-memory БД; працює лише в браузер-подібному середовищі (jsdom), не перехоплює серверні fetch у Node. **miragejs 0.1.48, опублікована ~3 роки тому**; після неї лише експериментальний 0.2.0-alpha.0 для інтерсептора mirage-msw.
- **Nock** — Node-only, патч на рівні `http`/`https`, chainable; популярний у legacy, не підтримує нативний fetch Node 18+ без обхідних рішень.
- **Prism (@stoplight/prism)** — повноцінний mock-сервер з OpenAPI (static з examples або dynamic `-d`), валідація запитів; ідеальний для dev/e2e «без коду», написаний на TS.
- **json-server, WireMock, Hoverfly, Polly.JS, vite-plugin-mock, fetch-mock, axios-mock-adapter** — різні моделі (standalone-сервер, JVM-проксі, запис/відтворення, патч fetch/axios).
- **Angular `HttpTestingController` (`provideHttpClientTesting`)** — замінює транспортний backend під HttpClient; код виконується як у проді, але без мережі. Найкращий для unit-тестів сервісів: `expectOne`, `flush`, `verify`.

### Як фабрики поєднуються з MSW + Orval + OpenAPI
- Orval генерує з OpenAPI типи (DTO), Angular HttpClient-сервіси, і опційно MSW-handler'и + faker-моки.
- Fishery типізується DTO-типами Orval: `Factory.define<UserDto>(...)` — повна типобезпека.
- Fishery будує обʼєкти, які handler'и MSW повертають у `HttpResponse.json(...)`.
- `@mswjs/data` дублює relational-функції Fishery (oneOf/manyOf, query-API як SQL); використовуйте його лише коли потрібна stateful in-memory «база» (CRUD між запитами в dev/e2e), а не для одиничних відповідей.

## Details

### 1. Fishery — глибокий аналіз

**Що це.** Fishery — бібліотека для налаштування JavaScript/TypeScript-обʼєктів як тестових даних, «вільно змодельована за Ruby-гемом factory_bot» (її ж створив thoughtbot, що зробив і factory_bot). Фабрика — це просто функція, що повертає ваш обʼєкт; Fishery передає в неї набір аргументів-помічників.

**Ядро API та концепції:**
- `Factory.define<T>(generator)` — визначення фабрики. Генератор отримує `{ sequence, params, transientParams, associations, afterBuild, afterCreate, onCreate }`.
- `build(overrides?, { transient, associations })` — синхронна побудова одного обʼєкта; overrides робиться deep-merge поверх дефолтів.
- `buildList(n, overrides?)` — масив обʼєктів.
- `create(overrides?)` / `createList(n, overrides?)` — повертають Promise; поведінку задає `onCreate` (напр., збереження в БД через axios/ORM). Fishery сам нічого в БД не пише — `onCreate` ви реалізуєте вручну.
- `sequence` — автоінкрементний лічильник для унікальних id; скидається через `factory.rewindSequence()` або при `Factory.define` заново.
- **Transient params** — параметри, що впливають на побудову, але не потрапляють у результат (напр., `name` → розкладається на `firstName`/`lastName`).
- **Associations** — для коротшого створення звʼязків.
- Хуки **`afterBuild`** і **`afterCreate`** (множинні); `onCreate` лише один на фабрику.

**Приклад типізації DTO Orval:**
```ts
// shared/testing/factories/user.factory.ts
import { Factory } from 'fishery';
import type { UserDto, PostDto } from 'shared/api/openapi/model';
import { postFactory } from './post.factory';

export const userFactory = Factory.define<UserDto>(({ sequence }) => ({
  id: sequence,
  name: 'Rosa',
  email: 'rosa@example.com',
  posts: postFactory.buildList(2),
}));

const user = userFactory.build({ name: 'Susan' });
user.foo; // type error: Property 'foo' does not exist on type 'UserDto'
```

**Якість TS-підтримки.** Висока: аргументи `build` типобезпечні (`Partial<T>` через `DeepPartial`), результат типізований. Для класів-інстансів `DeepPartial` можна перевизначити четвертим дженериком (тип Params).

**Зв'язки/вкладені фабрики.** Фабрики імпортують одна одну без проблем — циклічні імпорти резолвляться, бо фабрики використовують одна одну лише в момент `build`. Іноді TS треба явна анотація типу при циклічних посиланнях (`const postFactory: Factory<Post> = ...`).

**Async.** Через `create`/`onCreate`, що повертає Promise; build-тип і create-тип можуть відрізнятися (третій дженерик).

**Maintenance/метрики.** Остання версія 2.4.0 (8 грудня 2025). 997 зірок на GitHub, 17 відкритих issues, єдина runtime-залежність `lodash.mergewith`, ~886 763 завантаження на тиждень. Пакет легкий і tree-shakeable.

**Обмеження.** Fishery не має вбудованого relational-стану/query-движка (на відміну від `@mswjs/data`); зв'язки треба будувати вручну. Немає вбудованого генератора фейкових значень — комбінується з faker/falso. `onCreate` потребує ручної реалізації персистенції.

**vs factory_bot.** Концептуально близькі: define/build/create, sequences, traits, transient attributes, associations, callbacks. Основна відмінність — Fishery typesafe і не має магії «глобального реєстру» Ruby; traits у Fishery робляться через окремі фабрики/`params` (немає окремого `trait` DSL як у factory_bot).

### 2. Альтернативні фабрики — порівняння

| Бібліотека | Концепт | TS | Зв'язки | Sequences | Traits | Статус | OpenAPI/Zod fit |
|---|---|---|---|---|---|---|---|
| **Fishery** | define→build/create | Відмінна | вручну, ледача | так | через params/окремі фабрики | активний (2.4.0, груд. 2025) | відмінний з типами Orval |
| **rosie** | chainable attr/sequence | слабша | через `Factory.build` у attr | так | inheritance/`extend` | стабільний (2.1.1, ~2 р. тому) | посередній |
| **factory.ts** | makeFactory/each | відмінна | derivation/pipeline | так | extend/combine | повільний (1.4.2, жовт. 2023) | добрий з типами |
| **@factory-js/factory** | props/vars | відмінна | через ORM | так | traits | активний | добрий (ORM-орієнт.) |
| **cooky-cutter** | define/extend | відмінна | вкладені фабрики | так | extend | низька активність | посередній |
| **@jackfranklin/test-data-bot** | build/fields | добра | вручну | так | traits | помірно активний | посередній |
| **interface-forge** | Factory на Faker | відмінна | compose/extend | counter | через override | активний | відмінний (ZodFactory) |
| **@anatine/zod-mock** | схема→мок (faker) | через Zod | через схему | ні | ні | активний | відмінний для Zod |
| **zod-fixture** | схема→fixture | через Zod | через схему | seed | через generators | активний (2.5.2) | відмінний (детермінізм) |

**Висновок по фабриках:** Для рукотворних, читабельних, контрольованих фабрик з найкращою типобезпекою — **Fishery** або **factory.ts** (але factory.ts не оновлювалася з жовтня 2023). Для повністю схемо-кермованих даних — **zod-fixture** (детермінований) чи **@anatine/zod-mock** (більш realistic через faker). interface-forge — гібрид (Faker + Zod + фабрики), але тягне Faker як залежність.

### 3. MSW та альтернативи — порівняння

| Інструмент | Перехоплення | Browser | Node/Jest | OpenAPI | TS | Статус |
|---|---|---|---|---|---|---|
| **MSW** | мережа (SW + патч http) | так | так | через @mswjs/source, openapi-msw, Orval | відмінна | дуже активний (~18,5 млн dl/тижд., ~17,9k зірок) |
| **Mirage JS** | XHR/Pretender у браузер-середовищі | так | лише jsdom | ні | помірна | сповільнений (0.1.48, ~3 р. тому) |
| **Nock** | http/https Node | ні | так | ні | помірна | стабільний |
| **Prism** | standalone HTTP-сервер | через URL | через URL | нативний | TS | активний |
| **json-server** | standalone сервер | через URL | через URL | ні | — | активний |
| **WireMock** | standalone/JVM-проксі | через URL | через URL | так | через captain | активний |
| **fetch-mock / axios-mock-adapter** | патч fetch/axios | так | так | ні | помірна | активний |
| **HttpTestingController** | заміна Angular backend | — | так (TestBed) | ні (типи з Orval) | нативна | частина Angular |

**Модель перехоплення MSW vs HttpTestingController:**
- `HttpTestingController` НЕ мокає HttpClient — замінює транспортний backend під ним; ваш код проходить весь шлях HttpClient (params, interceptors, серіалізація), але без мережі. Ви робите `expectOne(url)`, `req.flush(data)`, `verify()`. Це найшвидший і найпростіший спосіб для unit-тестів сервісів; недолік — мок прив'язаний до Angular і не перевикористовується в dev/e2e/Storybook.
- MSW перехоплює на мережевому рівні — застосунок робить «справжні» запити, які видно в Network tab. Одні й ті ж handler'и працюють у unit/integration (Node, `setupServer`), у dev (Service Worker) і e2e. Це дає realistic-тести і перевикористання, але потребує налаштування jsdom/Jest.

**Важлива практична засторога (MSW + Angular 18 fetch-backend у Jest/jsdom):** Angular 18 за замовчуванням використовує fetch-backend (`provideHttpClient(withFetch())`). У jsdom/Jest MSW v2 натикається на відомі проблеми, бо `jest-environment-jsdom` підміняє Node-глобали полілами (помилки `Request is not defined`, `TextEncoder is not defined`, `Cannot find module 'msw/node'`). Рішення з офіційного FAQ і міграційного гайду MSW: використати `jest-fixed-jsdom` як `testEnvironment` і додати `testEnvironmentOptions.customExportConditions: ['']`. MSW рекомендує Vitest як середовище без цих проблем. Для абсолютних URL у Node потрібен `location.href`/base URL.

### 4. Як фабрики поєднуються з MSW + Orval + OpenAPI

Workflow:
1. OpenAPI spec → **Orval** генерує: DTO-типи (`shared/api/openapi/model`), Angular HttpClient-сервіси, опційно Zod-схеми та MSW-handler'и з faker-моками.
2. **Fishery**-фабрики типізуються DTO-типами Orval — повний type-safety, ваші тестові дані гарантовано валідні щодо контракту.
3. MSW-handler'и повертають обʼєкти, побудовані Fishery: `http.get('/users', () => HttpResponse.json(userFactory.buildList(3)))`.
4. **`@mswjs/data`** дублює relational-можливості Fishery: `primaryKey`, `oneOf`, `manyOf`, query-API «як SQL» (`findFirst`, `findMany`, `where`), CRUD. Це stateful in-memory «база». Перетин із Fishery — обидва вміють зв'язки; не варто тягнути обидва заради них.

**Коли що:**
- Одинична відповідь у тесті/Storybook → Fishery (build) → MSW handler.
- Stateful CRUD у dev/e2e (створив → прочитав той самий запис) → `@mswjs/data` (його `toHandlers()` генерує REST/GraphQL handler'и автоматично).
- Чисто схемо-кермовані детерміновані дані → zod-fixture поверх Zod-схем Orval.

```ts
// shared/api/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { userFactory } from 'shared/testing/factories';

export const handlers = [
  http.get('/api/users', () => HttpResponse.json(userFactory.buildList(5))),
  http.get('/api/users/:id', ({ params }) =>
    HttpResponse.json(userFactory.build({ id: Number(params.id) }))),
];
```

## Recommendations

**Етап 1 — базовий стек (зараз):**
- **Фабрики:** Прийняти **Fishery**, типізуючи фабрики DTO-типами Orval. Розмістити у `shared/testing/factories` (FSD: shared — це і layer, і slice; усе всередині може імпортувати одне одного). Значення генерувати через **falso (@ngneat/falso)** з фіксованим `seed()` для детермінізму (tree-shakeable, TS-first; не тягнути faker у бандл застосунку).
- **Unit-тести сервісів (Orval-генеровані HttpClient-сервіси):** Нативний **`HttpTestingController`** (`provideHttpClientTesting`) — найшвидший, без налаштувань jsdom. Дані — з Fishery.
- **Integration/component-тести (ATL + ng-mocks + Jest):** **MSW** через `setupServer`, handler'и у `shared/api/mocks`, дані — з Fishery. Налаштувати `jest-fixed-jsdom` + `customExportConditions: ['']` (обовʼязково через fetch-backend Angular 18).

**Етап 2 — dev/e2e:**
- **MSW** Service Worker для розробки без бекенда (ті самі handler'и).
- Якщо потрібна повноцінна stateful-«база» для dev/демо/e2e з CRUD — додати **`@mswjs/data`**, схеми моделей якого можна вивести з тих самих DTO/Zod.
- Альтернатива/доповнення «без коду» прямо зі specа — **Prism** (`prism mock openapi.yaml -d`) для e2e або контрактного фітбеку; запускати в CI як окремий процес.

**Чого уникати:**
- Не тягнути одночасно Fishery і `@mswjs/data` заради зв'язків — це дублювання. `@mswjs/data` лише для stateful-сценаріїв.
- Не використовувати Mirage JS у новому Angular+Jest-проєкті: він не перехоплює запити в Node-середовищі та сповільнився у розвитку (0.1.48 ~3 роки тому).
- Не покладатися на faker-моки Orval як «продакшн-дані»: вони хороші для швидкого старту, але детермінізм краще дає Fishery+seed або zod-fixture.

**Пороги для зміни рішення:**
- Якщо jsdom/Jest-налаштування MSW стає болем → мігрувати на **Vitest** (MSW офіційно рекомендує; немає проблем з Node-глобалами).
- Якщо ручні фабрики розростаються і дублюють схему → зсув у бік **zod-fixture** (схемо-кермовано, детерміновано).
- Якщо потрібен stateful CRUD у dev → ввести `@mswjs/data`.

## Caveats
- **Bundlephobia-метрики Fishery** (точні KB min/gzip) не вдалося підтвердити з citable-джерела (сторінка JS-рендериться, API заблоковано для ботів). Відомо: одна runtime-залежність `lodash.mergewith`, отже пакет легкий, але точну цифру наведено як неперевірену.
- **Тижневі завантаження** змінюються в часі; npmjs.com на момент дослідження наводить 886 763 для fishery@2.4.0, тоді як снапшоти npmtrends/CodeSandbox показували нижчі значення (~715k–782k) — це характерно для різних кешів.
- Деякі огляди порівнянь (PkgPulse тощо) містять прогнози/оцінки на 2026 — їх подано як думки, не факти.
- Засторога MSW+Angular fetch-backend задокументована на рівні MSW/jsdom/Jest, не Angular-специфічно; жодне джерело не описує саме «Angular 18 + withFetch + MSW v2» поіменно — висновок транзитивний.
- Mirage анонсував type-safe rework, але це майбутня робота, не наявний стабільний реліз.