# OpenAPI — критичні топіки

## 1. Структура документу
Базова анатомія `openapi.json` / `openapi.yaml`.
- `openapi` — версія специфікації (3.0.x або 3.1.x)
- `info` — метадані API (назва, версія)
- `paths` — ендпоінти
- `components` — перевикористовувані схеми, параметри, відповіді

https://swagger.io/docs/specification/v3_0/basic-structure/

---

## 2. Paths і Operations
Як описати ендпоінт: метод, параметри, тіло, відповіді.

```yaml
/todos/{id}:
  get:
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
    responses:
      '200':
        description: OK
```

https://swagger.io/docs/specification/v3_0/paths-and-operations/

---

## 3. Data Types і Schema Object
Типи даних: `string`, `integer`, `boolean`, `array`, `object`.
Ключові поля: `type`, `format`, `enum`, `nullable`, `required`, `default`.

```yaml
schema:
  type: object
  required: [id, title]
  properties:
    id:
      type: integer
    title:
      type: string
    done:
      type: boolean
      default: false
```

https://swagger.io/docs/specification/v3_0/data-models/data-types/

---

## 4. $ref і Components (повторне використання)
Головний механізм уникнення дублювання — іменовані схеми в `components/schemas`.
Саме це дає orval нормальні імена типів замість `GetTodos200Item`.

```yaml
components:
  schemas:
    Todo:
      type: object
      properties: ...

paths:
  /todos:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Todo'
```

https://swagger.io/docs/specification/v3_0/using-ref/

---

## 5. Request Body
Як описати тіло POST/PUT/PATCH запиту.

```yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/CreateTodo'
```

https://swagger.io/docs/specification/v3_0/describing-request-body/

---

## 6. Parameters (path, query, header, cookie)
Чотири типи параметрів та їх відмінності.

```yaml
parameters:
  - name: page
    in: query       # або: path, header, cookie
    required: false
    schema:
      type: integer
      default: 1
```

https://swagger.io/docs/specification/v3_0/describing-parameters/

---

## 7. Responses
Як описати відповіді для різних HTTP статусів.

```yaml
responses:
  '200':
    description: Success
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Todo'
  '404':
    description: Not found
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/NotFound'
```

https://swagger.io/docs/specification/v3_0/describing-responses/

---

## 8. oneOf / anyOf / allOf (композиція схем)
Як описати union types і наслідування схем.

```yaml
schema:
  oneOf:
    - $ref: '#/components/schemas/Cat'
    - $ref: '#/components/schemas/Dog'
```

https://swagger.io/docs/specification/v3_0/data-models/oneof-anyof-allof-not/

---

## 9. Authentication (Security Schemes)
Bearer token, API key, OAuth2 — як описати авторизацію.

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer

security:
  - bearerAuth: []
```

https://swagger.io/docs/specification/v3_0/authentication/

---

## 10. OpenAPI 3.0 vs 3.1
3.1 — повна сумісність з JSON Schema, `nullable` замінено на `type: [string, null]`.
Orval підтримує обидві версії. Hono генерує 3.0.

https://www.openapis.org/blog/2021/02/16/migrating-from-openapi-3-0-to-3-1-0
