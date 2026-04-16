const DEFAULT_QUERY = Object.freeze({
  calculatorType: "rent-1c",
  configuration: "trade",
  users: 3,
  remoteDesktop: false,
  remoteUsers: 5,
  term: "3m",
  serverTier: "standard",
  cpuCores: 4,
  ramGb: 16,
  backup: true,
});

const CALCULATOR_TYPES = Object.freeze(["rent-1c", "dedicated-server"]);

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

const SERVER_TIERS = Object.freeze({
  standard: {
    value: "standard",
    label: "Стандарт",
    monthlyBase: 7200,
    cpuMonthlyLabel: 900,
    ramMonthlyLabel: 350,
    backupMonthlyLabel: 1800,
    benefits: [
      "Выделенные ресурсы без соседей",
      "SSD-хранилище в отказоустойчивом контуре",
      "Мониторинг доступности 24/7",
      "Базовая защита от сетевых атак",
      "Помощь с первичной настройкой",
    ],
  },
  performance: {
    value: "performance",
    label: "Производительный",
    monthlyBase: 12400,
    cpuMonthlyLabel: 1200,
    ramMonthlyLabel: 450,
    backupMonthlyLabel: 2400,
    benefits: [
      "Повышенная частота процессоров",
      "NVMe-хранилище для высоких нагрузок",
      "Мониторинг доступности 24/7",
      "Приоритетная реакция инженеров",
      "Помощь с переносом сервисов",
    ],
  },
  enterprise: {
    value: "enterprise",
    label: "Enterprise",
    monthlyBase: 18900,
    cpuMonthlyLabel: 1500,
    ramMonthlyLabel: 600,
    backupMonthlyLabel: 3200,
    benefits: [
      "Ресурсы под критичные бизнес-системы",
      "NVMe-хранилище и расширенный мониторинг",
      "Отдельный контур администрирования",
      "Приоритетная реакция инженеров",
      "Регулярные отчеты по инфраструктуре",
    ],
  },
});

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

  const calculatorType = params.get("calculatorType");
  const configuration = params.get("configuration");
  const term = params.get("term");
  const remoteDesktop = asBoolean(params.get("remoteDesktop"));
  const serverTier = params.get("serverTier");
  const backup = params.has("backup")
    ? asBoolean(params.get("backup"))
    : DEFAULT_QUERY.backup;

  return {
    calculatorType: CALCULATOR_TYPES.includes(calculatorType)
      ? calculatorType
      : DEFAULT_QUERY.calculatorType,
    configuration: Object.prototype.hasOwnProperty.call(CONFIGS, configuration)
      ? configuration
      : DEFAULT_QUERY.configuration,
    users: clamp(params.get("users"), 1, 50, DEFAULT_QUERY.users),
    remoteDesktop,
    remoteUsers: clamp(params.get("remoteUsers"), 1, 50, DEFAULT_QUERY.remoteUsers),
    term: TERMS.some((item) => item.value === term) ? term : DEFAULT_QUERY.term,
    serverTier: Object.prototype.hasOwnProperty.call(SERVER_TIERS, serverTier)
      ? serverTier
      : DEFAULT_QUERY.serverTier,
    cpuCores: clamp(params.get("cpuCores"), 2, 32, DEFAULT_QUERY.cpuCores),
    ramGb: clamp(params.get("ramGb"), 4, 128, DEFAULT_QUERY.ramGb),
    backup,
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
  if (query.calculatorType === "dedicated-server") {
    return buildDedicatedServerResponse(query);
  }

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

function buildDedicatedServerResponse(query) {
  const tier = SERVER_TIERS[query.serverTier];
  const term = TERMS.find((item) => item.value === query.term) || TERMS[0];
  const monthlyBeforeDiscount =
    tier.monthlyBase +
    query.cpuCores * tier.cpuMonthlyLabel +
    query.ramGb * tier.ramMonthlyLabel +
    (query.backup ? tier.backupMonthlyLabel : 0);
  const discountedMonthly = Math.round(
    monthlyBeforeDiscount * (1 - term.discountPercent / 100)
  );

  return {
    title: "Стоимость выделенного сервера",
    regions: {
      form: [
        buildChoiceBlock({
          id: "serverTier",
          step: 1,
          name: "serverTier",
          label: "Выберите класс сервера",
          options: Object.values(SERVER_TIERS),
          inputType: "radio",
          selectedValue: query.serverTier,
        }),
        buildCounterBlock({
          id: "cpuCores",
          step: 2,
          label: "Задайте количество процессорных ядер",
          name: "cpuCores",
          value: query.cpuCores,
          min: 2,
          max: 32,
          metaLabel: "vCPU",
          priceLabel: `${formatRub(tier.cpuMonthlyLabel)}/мес.`,
        }),
        buildCounterBlock({
          id: "ramGb",
          step: 3,
          label: "Задайте объем оперативной памяти",
          name: "ramGb",
          value: query.ramGb,
          min: 4,
          max: 128,
          metaLabel: "ГБ RAM",
          priceLabel: `${formatRub(tier.ramMonthlyLabel)}/мес.`,
        }),
        {
          id: "backup",
          type: "toggle",
          step: 4,
          name: "backup",
          label: "Добавить резервное копирование?",
          value: query.backup,
          tooltip: {
            text: "Ежедневные копии помогают быстро восстановить данные при сбое или ошибке в настройках.",
          },
        },
        buildChoiceBlock({
          id: "term",
          step: 5,
          name: "term",
          label: "Выберите срок аренды",
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
        }),
      ],
      summary: [
        {
          id: "benefits",
          type: "feature-list",
          title: "Что входит",
          items: query.backup
            ? [...tier.benefits, "Ежедневное резервное копирование"]
            : tier.benefits,
        },
        {
          id: "pricing",
          type: "pricing",
          previousMonthly:
            term.discountPercent > 0 ? formatRub(monthlyBeforeDiscount) : "",
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
