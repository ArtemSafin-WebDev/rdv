# Контракт API для калькулятора аренды 1С

## Назначение

В проекте есть JSON-driven калькулятор. Фронтенд не хардкодит структуру калькулятора, а получает JSON-ответ и полностью пересобирает интерфейс по данным из ответа.

Бэкенд должен возвращать:

- заголовок калькулятора
- список блоков для левой колонки
- список блоков для правой карточки summary

Фронтенд рендерит только то, что пришло в ответе.

## Подключение на фронтенде

Корневой элемент калькулятора подключается через один HTML-атрибут:

```html
<div
  class="rent-calculator"
  data-rent-calculator
  data-rent-calculator-api-url="/api/rent-calculator"
></div>
```

Для локальной разработки можно использовать мок:

```html
<div
  class="rent-calculator"
  data-rent-calculator
  data-rent-calculator-api-url="mock"
></div>
```

Правила:

- если `data-rent-calculator-api-url="mock"`, используется локальный mock API
- если в `data-rent-calculator-api-url` передан реальный URL, фронтенд ходит туда через `fetch`
- если атрибут отсутствует, калькулятор не инициализируется

## Формат запроса

Сейчас фронтенд отправляет GET-запрос с query-параметрами.

Пример:

```http
GET /api/rent-calculator?calculatorType=rent-1c&configuration=trade&users=3&remoteDesktop=1&remoteUsers=5&term=6m
```

### Query-параметры

- `calculatorType`: тип калькулятора, сейчас фронтенд отправляет `rent-1c` или `dedicated-server`
- `configuration`: код конфигурации
- `users`: количество обычных пользователей
- `remoteDesktop`: `0` или `1`
- `remoteUsers`: количество пользователей удаленного рабочего стола
- `term`: код срока подписки

### Что ожидается от бэкенда

Бэкенд должен нормализовать входящие параметры:

- валидировать `configuration`
- ограничивать числовые значения вроде `users` и `remoteUsers`
- валидировать `term`
- нормализовать `remoteDesktop` к булевой семантике

После этого бэкенд должен вернуть нормализованное описание UI.

## Формат ответа

```json
{
  "title": "Стоимость аренды 1С",
  "regions": {
    "form": [],
    "summary": []
  }
}
```

Важно:

- отдельного поля `state` больше нет
- фронтенд берет активные значения прямо из блоков
- порядок блоков в массивах равен порядку отображения на экране

## Разделы ответа

### `regions.form`

Это левая колонка калькулятора.

Поддерживаемые типы блоков:

- `choice-group`
- `counter`
- `toggle`

### `regions.summary`

Это правая карточка summary.

Поддерживаемые типы блоков:

- `feature-list`
- `pricing`
- `cta`

## Контракт блоков

### 1. `choice-group`

Используется для групп чипов. Может представлять либо radio, либо checkbox.

```json
{
  "id": "configuration",
  "type": "choice-group",
  "step": 1,
  "name": "configuration",
  "label": "Выберите конфигурацию 1С",
  "inputType": "radio",
  "options": [
    {
      "value": "trade",
      "label": "1С:Управление торговлей",
      "selected": true
    },
    {
      "value": "business",
      "label": "1С:Управление нашей фирмой",
      "selected": false
    }
  ],
  "badge": null
}
```

Поля:

- `id`: технический id блока
- `type`: всегда `choice-group`
- `step`: номер шага в синем кружке
- `name`: имя form-control
- `label`: заголовок блока
- `inputType`: `radio` или `checkbox`
- `options`: список вариантов
- `options[].value`: value инпута
- `options[].label`: текст варианта
- `options[].selected`: выбран ли вариант
- `badge`: необязательный бейдж справа от группы

Пример `badge`:

```json
{
  "label": "Скидка 5%",
  "tone": "solid"
}
```

Текущее поведение фронтенда:

- для `radio` ожидается один выбранный вариант
- для `checkbox` допускается несколько выбранных вариантов

### 2. `counter`

Используется для числового счетчика с кнопками `+/-`. Видимое значение хранится в реальном form input и попадает в `FormData` при submit.

```json
{
  "id": "users",
  "type": "counter",
  "step": 2,
  "name": "users",
  "label": "Задайте количество одновременных пользователей",
  "value": 3,
  "min": 1,
  "max": 50,
  "meta": {
    "label": "Пользователь",
    "price": "2 200 ₽/мес."
  }
}
```

Поля:

- `id`
- `type`: всегда `counter`
- `step`: необязательное поле, если его нет, блок рендерится без строки заголовка с номером шага
- `name`: имя form-control
- `label`: заголовок блока
- `value`: текущее числовое значение
- `min`: минимальное значение
- `max`: максимальное значение
- `meta.label`: подпись справа
- `meta.price`: текст цены справа

Важно:

- фронтенд дизейблит кнопку минуса, когда `value <= min`
- фронтенд дизейблит кнопку плюса, когда `value >= max`
- ручной ввод отключен, изменение значения идет только через `+/-`

### 3. `toggle`

Используется для переключателя. Внутри формы рендерится как checkbox.

```json
{
  "id": "remoteDesktop",
  "type": "toggle",
  "step": 3,
  "name": "remoteDesktop",
  "label": "Вам нужен удаленный рабочий стол?",
  "value": true,
  "tooltip": {
    "text": "При включении появляется дополнительный блок с количеством пользователей для удаленного рабочего стола."
  }
}
```

Поля:

- `id`
- `type`: всегда `toggle`
- `step`
- `name`: имя form-control
- `label`: заголовок блока
- `value`: `true` или `false`
- `tooltip.text`: необязательный текст тултипа

Важно:

- если toggle включает дополнительный UI, бэкенд должен вернуть этот дополнительный блок в следующем ответе
- фронтенд сам ничего не раскрывает через CSS или внутреннюю логику

### 4. `feature-list`

Используется в правой карточке для списка выгод тарифа.

```json
{
  "id": "benefits",
  "type": "feature-list",
  "title": "Выгоды тарифа",
  "items": [
    "Автообновление конфигураций",
    "Резервное копирование и контроль доступности"
  ]
}
```

Поля:

- `id`
- `type`: всегда `feature-list`
- `title`
- `items`: массив видимых строк

### 5. `pricing`

Используется в правой карточке для текущей цены, старой цены, бейджа скидки и total.

```json
{
  "id": "pricing",
  "type": "pricing",
  "previousMonthly": "6 900 ₽",
  "currentMonthly": "6 555 ₽",
  "currentMonthlySuffix": "/мес",
  "total": "39 330 ₽",
  "totalSuffix": "за весь период",
  "badge": {
    "label": "Скидка 5%",
    "tone": "outline"
  }
}
```

Поля:

- `id`
- `type`: всегда `pricing`
- `previousMonthly`: необязательная старая цена в месяц, может быть `null` или `""`
- `currentMonthly`: текущая цена в месяц
- `currentMonthlySuffix`: обычно `"/мес"`
- `total`: цена за весь период
- `totalSuffix`: обычно `"за весь период"`
- `badge`: необязательный бейдж рядом с текущей ценой

### 6. `cta`

Используется для кнопки отправки.

```json
{
  "id": "submit",
  "type": "cta",
  "label": "ОТПРАВИТЬ ЗАЯВКУ"
}
```

Поля:

- `id`
- `type`: всегда `cta`
- `label`: текст кнопки

## Правила рендера

Бэкенд полностью управляет:

- набором блоков
- порядком блоков
- всеми текстами
- активными состояниями
- значениями инпутов
- тултипами
- ценами
- скидками
- старыми ценами
- появлением и скрытием дополнительных полей

Фронтенд только рендерит JSON, который пришел от API.

## Текущая бизнес-логика

На данный момент калькулятор работает вокруг таких полей:

- `configuration`
- `users`
- `remoteDesktop`
- `remoteUsers`
- `term`

Примеры поведения:

- если `remoteDesktop = true`, бэкенд должен вернуть дополнительный блок `counter` для `remoteUsers`
- если выбран срок со скидкой, бэкенд должен вернуть:
  - `badge` в блоке `choice-group` для срока
  - `previousMonthly` в блоке `pricing`
  - `badge` в блоке `pricing`

## Поведение submit

Калькулятор рендерится как настоящая HTML-форма.

При submit:

- фронтенд создает `FormData` из текущей DOM-формы
- фронтенд диспатчит custom event с:
  - `formData`

Из-за этого отдельный объект `state` в API не нужен.

## Пример полного ответа

```json
{
  "title": "Стоимость аренды 1С",
  "regions": {
    "form": [
      {
        "id": "configuration",
        "type": "choice-group",
        "step": 1,
        "name": "configuration",
        "label": "Выберите конфигурацию 1С",
        "inputType": "radio",
        "options": [
          { "value": "trade", "label": "1С:Управление торговлей", "selected": true },
          { "value": "business", "label": "1С:Управление нашей фирмой", "selected": false },
          { "value": "complex", "label": "1С:Комплексная автоматизация", "selected": false },
          { "value": "accounting", "label": "1С:Бухгалтерия", "selected": false }
        ]
      },
      {
        "id": "users",
        "type": "counter",
        "step": 2,
        "name": "users",
        "label": "Задайте количество одновременных пользователей",
        "value": 3,
        "min": 1,
        "max": 50,
        "meta": {
          "label": "Пользователь",
          "price": "2 200 ₽/мес."
        }
      },
      {
        "id": "remoteDesktop",
        "type": "toggle",
        "step": 3,
        "name": "remoteDesktop",
        "label": "Вам нужен удаленный рабочий стол?",
        "value": true,
        "tooltip": {
          "text": "При включении появляется дополнительный блок с количеством пользователей для удаленного рабочего стола."
        }
      },
      {
        "id": "remoteUsers",
        "type": "counter",
        "name": "remoteUsers",
        "value": 5,
        "min": 1,
        "max": 50,
        "meta": {
          "label": "Пользователь",
          "price": "550 ₽/мес."
        }
      },
      {
        "id": "term",
        "type": "choice-group",
        "step": 4,
        "name": "term",
        "label": "Выберите срок подписки",
        "inputType": "radio",
        "options": [
          { "value": "3m", "label": "3 месяца", "selected": false },
          { "value": "6m", "label": "6 месяцев", "selected": true },
          { "value": "12m", "label": "1 год", "selected": false },
          { "value": "24m", "label": "2 года", "selected": false }
        ],
        "badge": {
          "label": "Скидка 5%",
          "tone": "solid"
        }
      }
    ],
    "summary": [
      {
        "id": "benefits",
        "type": "feature-list",
        "title": "Выгоды тарифа",
        "items": [
          "Автообновление конфигураций",
          "Непрерывное резервное копирование",
          "Хранение копий 3 месяца",
          "Работа через удаленный рабочий стол",
          "5 Гб на диске для каждого пользователя"
        ]
      },
      {
        "id": "pricing",
        "type": "pricing",
        "previousMonthly": "6 900 ₽",
        "currentMonthly": "6 555 ₽",
        "currentMonthlySuffix": "/мес",
        "total": "39 330 ₽",
        "totalSuffix": "за весь период",
        "badge": {
          "label": "Скидка 5%",
          "tone": "outline"
        }
      },
      {
        "id": "submit",
        "type": "cta",
        "label": "ОТПРАВИТЬ ЗАЯВКУ"
      }
    ]
  }
}
```

## Короткая версия для бэкендера

Нужно возвращать декларативное описание UI:

- `title`
- `regions.form`
- `regions.summary`

Каждый блок уже должен содержать:

- активные состояния
- текущие значения
- видимые тексты
- цены
- скидки
- текст тултипа
- порядок отображения

Фронтенд отрисует ответ как есть.
