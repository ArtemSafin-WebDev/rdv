const DEFAULT_QUERY = Object.freeze({
  configuration: "trade",
  users: 3,
  remoteDesktop: false,
  remoteUsers: 5,
  term: "3m",
});

const CONFIGS = Object.freeze({
  trade: {
    value: "trade",
    label: "1С:Управление торговлей",
    monthlyBase: 6900,
    userMonthlyLabel: 2200,
    remoteUserMonthlyLabel: 550,
    benefits: [
      "Автообновление конфигураций",
      "Непрерывное резервное копирование",
      "Хранение копий 3 месяца",
      "5 Гб на диске для каждого пользователя",
      "До 10 информационных баз",
      "Возможность увеличить объем диска и количество баз",
      "Возможность настройки регламентных заданий",
      "Линия консультаций 7 дней в неделю",
      "Информационно-техническое сопровождение",
    ],
  },
  business: {
    value: "business",
    label: "1С:Управление нашей фирмой",
    monthlyBase: 5400,
    userMonthlyLabel: 1800,
    remoteUserMonthlyLabel: 450,
    benefits: [
      "Автообновление конфигураций",
      "Резервное копирование и контроль доступности",
      "Хранение копий 1 месяц",
      "2 Гб на диске для каждого пользователя",
      "До 5 информационных баз",
      "Информационно-техническое сопровождение",
    ],
  },
  complex: {
    value: "complex",
    label: "1С:Комплексная автоматизация",
    monthlyBase: 8200,
    userMonthlyLabel: 2600,
    remoteUserMonthlyLabel: 650,
    benefits: [
      "Автообновление конфигураций",
      "Непрерывное резервное копирование",
      "Хранение копий 6 месяцев",
      "7 Гб на диске для каждого пользователя",
      "До 15 информационных баз",
      "Настройка регламентных заданий и обменов",
      "Выделенная линия консультаций 7 дней в неделю",
      "Информационно-техническое сопровождение",
    ],
  },
  accounting: {
    value: "accounting",
    label: "1С:Бухгалтерия",
    monthlyBase: 4900,
    userMonthlyLabel: 1500,
    remoteUserMonthlyLabel: 400,
    benefits: [
      "Автообновление конфигураций",
      "Резервное копирование",
      "Хранение копий 3 месяца",
      "2 Гб на диске для каждого пользователя",
      "До 3 информационных баз",
      "Информационно-техническое сопровождение",
    ],
  },
});

const TERMS = Object.freeze([
  { value: "3m", label: "3 месяца", months: 3, discountPercent: 0 },
  { value: "6m", label: "6 месяцев", months: 6, discountPercent: 5 },
  { value: "12m", label: "1 год", months: 12, discountPercent: 10 },
  { value: "24m", label: "2 года", months: 24, discountPercent: 15 },
]);

function clamp(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}

function asBoolean(value) {
  return value === true || value === "true" || value === "1" || value === 1;
}

function formatRub(value) {
  return `${new Intl.NumberFormat("ru-RU").format(value).replace(/\u00A0/g, " ")} ₽`;
}

function normalizeQuery(queryInput = {}) {
  const params =
    queryInput instanceof URLSearchParams
      ? queryInput
      : new URLSearchParams(queryInput);

  const configuration = params.get("configuration");
  const term = params.get("term");
  const remoteDesktop = asBoolean(params.get("remoteDesktop"));

  return {
    configuration: Object.prototype.hasOwnProperty.call(CONFIGS, configuration)
      ? configuration
      : DEFAULT_QUERY.configuration,
    users: clamp(params.get("users"), 1, 50, DEFAULT_QUERY.users),
    remoteDesktop,
    remoteUsers: clamp(params.get("remoteUsers"), 1, 50, DEFAULT_QUERY.remoteUsers),
    term: TERMS.some((item) => item.value === term) ? term : DEFAULT_QUERY.term,
  };
}

function buildChoiceBlock({
  id,
  step,
  name,
  label,
  options,
  selectedValue,
  inputType = "radio",
  badge = null,
}) {
  const selectedValues = Array.isArray(selectedValue)
    ? selectedValue
    : [selectedValue];

  return {
    id,
    type: "choice-group",
    step,
    name,
    label,
    inputType,
    badge,
    options: options.map((option) => ({
      value: option.value,
      label: option.label,
      selected: selectedValues.includes(option.value),
    })),
  };
}

function buildCounterBlock({
  id,
  step = null,
  label = "",
  name,
  value,
  min = 1,
  max = 50,
  metaLabel,
  priceLabel,
}) {
  return {
    id,
    type: "counter",
    step,
    label,
    name,
    value,
    min,
    max,
    meta: {
      label: metaLabel,
      price: priceLabel,
    },
  };
}

function buildBenefits(config, remoteDesktop) {
  if (!remoteDesktop) {
    return config.benefits;
  }

  return [
    ...config.benefits.slice(0, 3),
    "Работа через удаленный рабочий стол",
    ...config.benefits.slice(3),
  ];
}

function buildResponse(query) {
  const config = CONFIGS[query.configuration];
  const term = TERMS.find((item) => item.value === query.term) || TERMS[0];
  const discountedMonthly = Math.round(
    config.monthlyBase * (1 - term.discountPercent / 100)
  );
  const formBlocks = [
    buildChoiceBlock({
      id: "configuration",
      step: 1,
      name: "configuration",
      label: "Выберите конфигурацию 1С",
      options: Object.values(CONFIGS),
      inputType: "radio",
      selectedValue: query.configuration,
    }),
    buildCounterBlock({
      id: "users",
      step: 2,
      label: "Задайте количество одновременных пользователей",
      name: "users",
      value: query.users,
      metaLabel: "Пользователь",
      priceLabel: `${formatRub(config.userMonthlyLabel)}/мес.`,
    }),
    {
      id: "remoteDesktop",
      type: "toggle",
      step: 3,
      name: "remoteDesktop",
      label: "Вам нужен удаленный рабочий стол?",
      value: query.remoteDesktop,
      tooltip: {
        text: "При включении появляется дополнительный блок с количеством пользователей для удаленного рабочего стола.",
      },
    },
  ];

  if (query.remoteDesktop) {
    formBlocks.push(
      buildCounterBlock({
        id: "remoteUsers",
        name: "remoteUsers",
        value: query.remoteUsers,
        metaLabel: "Пользователь",
        priceLabel: `${formatRub(config.remoteUserMonthlyLabel)}/мес.`,
      })
    );
  }

  formBlocks.push(
    buildChoiceBlock({
      id: "term",
      step: 4,
      name: "term",
      label: "Выберите срок подписки",
      options: TERMS,
      inputType: "radio",
      selectedValue: query.term,
      badge:
        term.discountPercent > 0
          ? {
              label: `Скидка ${term.discountPercent}%`,
              tone: "solid",
            }
          : null,
    })
  );

  return {
    title: "Стоимость аренды 1С",
    regions: {
      form: formBlocks,
      summary: [
        {
          id: "benefits",
          type: "feature-list",
          title: "Выгоды тарифа",
          items: buildBenefits(config, query.remoteDesktop),
        },
        {
          id: "pricing",
          type: "pricing",
          previousMonthly:
            term.discountPercent > 0 ? formatRub(config.monthlyBase) : "",
          currentMonthly: formatRub(discountedMonthly),
          currentMonthlySuffix: "/мес",
          total: formatRub(discountedMonthly * term.months),
          totalSuffix: "за весь период",
          badge:
            term.discountPercent > 0
              ? {
                  label: `Скидка ${term.discountPercent}%`,
                  tone: "outline",
                }
              : null,
        },
        {
          id: "submit",
          type: "cta",
          label: "ОТПРАВИТЬ ЗАЯВКУ",
        },
      ],
    },
  };
}

export class RentCalculatorMockApi {
  async fetchState(queryInput = {}) {
    const normalizedQuery = normalizeQuery(queryInput);
    const response = buildResponse(normalizedQuery);

    return new Promise((resolve) => {
      window.setTimeout(() => resolve(response), 260);
    });
  }
}
