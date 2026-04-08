function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getTransitionName(name) {
  return `rent-calculator-${String(name)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")}`;
}

export class RentCalculator {
  constructor(root, api) {
    this.root = root;
    this.api = api;
    this.response = null;
    this.isLoading = false;
    this.requestId = 0;

    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  canUseViewTransitions() {
    return Boolean(
      typeof document.startViewTransition === "function" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  renderWithOptionalTransition() {
    if (!this.canUseViewTransitions() || !this.response) {
      this.render();
      return;
    }

    document.startViewTransition(() => {
      this.render();
    });
  }

  init() {
    this.root.addEventListener("click", this.handleClick);
    this.root.addEventListener("change", this.handleChange);
    this.root.addEventListener("input", this.handleInput);
    this.root.addEventListener("submit", this.handleSubmit);
    this.requestState();
  }

  getForm() {
    return this.root.querySelector("[data-rent-calculator-form]");
  }

  getCurrentBlock(name) {
    return (
      this.response?.regions?.form?.find((block) => block.name === name) || null
    );
  }

  getRequestStateFromForm() {
    const form = this.getForm();
    const nextState = {};

    if (!form || !this.response?.regions?.form) {
      return nextState;
    }

    const formData = new FormData(form);

    this.response.regions.form.forEach((block) => {
      if (block.type === "choice-group") {
        nextState[block.name] =
          block.inputType === "checkbox"
            ? formData.getAll(block.name)
            : formData.get(block.name) || "";
        return;
      }

      if (block.type === "counter") {
        nextState[block.name] = Number(formData.get(block.name) || block.min || 0);
        return;
      }

      if (block.type === "toggle") {
        nextState[block.name] = formData.has(block.name);
      }
    });

    return nextState;
  }

  getCounterValue(name) {
    const input = this.root.querySelector(
      `[data-counter-input][name="${CSS.escape(name)}"]`
    );
    const rawValue = input ? input.value.replace(/[^\d]/g, "") : "";
    const parsedValue = Number(rawValue);

    if (Number.isFinite(parsedValue) && rawValue !== "") {
      return parsedValue;
    }

    return Number(this.getCurrentBlock(name)?.value || 0);
  }

  async requestState(partialState = {}) {
    const nextState = {
      ...this.getRequestStateFromForm(),
      ...partialState,
    };

    this.isLoading = true;
    this.render();

    const requestId = ++this.requestId;
    const response = await this.api.fetchState(nextState);

    if (requestId !== this.requestId) {
      return;
    }

    this.response = response;
    this.isLoading = false;
    this.renderWithOptionalTransition();
  }

  handleClick(event) {
    const counterTrigger = event.target.closest("[data-counter-trigger]");

    if (counterTrigger && !this.isLoading) {
      const { counterName, counterDelta, counterMin, counterMax } =
        counterTrigger.dataset;
      const currentValue = this.getCounterValue(counterName);
      const nextValue = Math.min(
        Math.max(currentValue + Number(counterDelta), Number(counterMin)),
        Number(counterMax)
      );

      if (nextValue === currentValue) {
        return;
      }

      this.requestState({ [counterName]: nextValue });
      return;
    }
  }

  handleChange(event) {
    const counterInput = event.target.closest("[data-counter-input]");

    if (counterInput && !this.isLoading) {
      const { name, counterMin, counterMax } = counterInput.dataset;
      const cleanedValue = counterInput.value.replace(/[^\d]/g, "");
      const parsedValue =
        cleanedValue === "" ? Number(counterMin) : Number(cleanedValue);
      const nextValue = Math.min(
        Math.max(parsedValue, Number(counterMin)),
        Number(counterMax)
      );

      counterInput.value = String(nextValue);

      this.requestState({ [name]: nextValue });
      return;
    }

    const toggleInput = event.target.closest("[data-toggle-input]");

    if (toggleInput && !this.isLoading) {
      const { name } = toggleInput.dataset;

      this.requestState({ [name]: toggleInput.checked });
      return;
    }

    const choiceInput = event.target.closest("[data-calculator-choice]");

    if (!choiceInput || this.isLoading) {
      return;
    }

    const { name, value, inputType } = choiceInput.dataset;

    if (!name || !value) {
      return;
    }

    if (inputType === "checkbox") {
      this.requestState();
      return;
    }

    this.requestState();
  }

  handleInput(event) {
    const counterInput = event.target.closest("[data-counter-input]");

    if (!counterInput) {
      return;
    }

    counterInput.value = counterInput.value.replace(/[^\d]/g, "");
  }

  handleSubmit(event) {
    const form = event.target.closest("[data-rent-calculator-form]");

    if (!form) {
      return;
    }

    event.preventDefault();

    const formData = new FormData(form);

    this.root.dispatchEvent(
      new CustomEvent("rent-calculator:submit", {
        bubbles: true,
        detail: {
          formData,
        },
      })
    );

    window.console.info("rent-calculator submit", {
      formData: Object.fromEntries(formData.entries()),
    });
  }

  render() {
    if (!this.response) {
      this.root.innerHTML = `
        <div class="rent-calculator__shell is-loading">
        </div>
      `;
      return;
    }

    this.root.innerHTML = `
      <form class="rent-calculator__shell${this.isLoading ? " is-loading" : ""}" data-rent-calculator-form novalidate>
        <div class="rent-calculator__layout">
          <div class="rent-calculator__main">
            <h2 class="rent-calculator__title">${escapeHtml(
              this.response.title
            )}</h2>
            <div class="rent-calculator__blocks">
              ${this.response.regions.form
                .map((block) => this.renderFormBlock(block))
                .join("")}
            </div>
          </div>
          <aside class="rent-calculator__aside">
            <div class="rent-calculator__summary-card">
              ${this.response.regions.summary
                .map((block) => this.renderSummaryBlock(block))
                .join("")}
            </div>
          </aside>
        </div>
      </form>
    `;
  }

  renderFormBlock(block) {
    if (block.type === "choice-group") {
      return `
        <section
          class="rent-calculator__block"
          style="view-transition-name: ${getTransitionName(`form-${block.id}`)};"
        >
          ${this.renderBlockHeader(block)}
          <div class="rent-calculator__choice-layout">
            <div class="rent-calculator__chip-row">
              ${block.options
                .map(
                  (option) => `
                    <label class="rent-calculator__chip${option.selected ? " is-active" : ""}">
                      <input
                        class="rent-calculator__chip-input"
                        type="${escapeHtml(block.inputType || "radio")}"
                        name="${escapeHtml(block.name)}"
                        value="${escapeHtml(option.value)}"
                        data-calculator-choice
                        data-name="${escapeHtml(block.name)}"
                        data-value="${escapeHtml(option.value)}"
                        data-input-type="${escapeHtml(block.inputType || "radio")}"
                        ${option.selected ? "checked" : ""}
                      >
                      <span class="rent-calculator__chip-text">${escapeHtml(option.label)}</span>
                    </label>
                  `
                )
                .join("")}
            </div>
            ${
              block.badge
                ? `<div class="rent-calculator__discount-row">
                    <span class="rent-calculator__discount rent-calculator__discount--solid">${escapeHtml(
                      block.badge.label
                    )}</span>
                  </div>`
                : ""
            }
          </div>
        </section>
      `;
    }

    if (block.type === "counter") {
      const isMin = Number(block.value) <= Number(block.min);
      const isMax = Number(block.value) >= Number(block.max);

      return `
        <section
          class="rent-calculator__block${block.step ? "" : " rent-calculator__block--nested"}"
          style="view-transition-name: ${getTransitionName(`form-${block.id}`)};"
        >
          ${block.step ? this.renderBlockHeader(block) : ""}
          <div class="rent-calculator__counter-row">
            <div class="rent-calculator__counter-layout">
              <div class="rent-calculator__counter">
                <button
                  class="rent-calculator__counter-button"
                  type="button"
                  aria-label="Уменьшить значение"
                  data-counter-trigger
                  data-counter-name="${escapeHtml(block.name)}"
                  data-counter-delta="-1"
                  data-counter-min="${block.min}"
                  data-counter-max="${block.max}"
                  ${isMin ? "disabled" : ""}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" aria-hidden="true">
                    <path d="M3.09961 12.1002C2.76842 12.1 2.5 11.8309 2.5 11.4996C2.50021 11.1686 2.76855 10.9002 3.09961 10.9L19.9004 10.9C20.2315 10.9002 20.4998 11.1686 20.5 11.4996C20.5 11.8309 20.2316 12.1 19.9004 12.1002L3.09961 12.1002Z"/>
                  </svg>
                </button>
                <input
                  class="rent-calculator__counter-value"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  name="${escapeHtml(block.name)}"
                  value="${escapeHtml(block.value)}"
                  aria-label="${escapeHtml(block.label || block.meta.label)}"
                  readonly
                  aria-readonly="true"
                  tabindex="-1"
                  data-counter-input
                  data-name="${escapeHtml(block.name)}"
                  data-counter-min="${block.min}"
                  data-counter-max="${block.max}"
                >
                <button
                  class="rent-calculator__counter-button"
                  type="button"
                  aria-label="Увеличить значение"
                  data-counter-trigger
                  data-counter-name="${escapeHtml(block.name)}"
                  data-counter-delta="1"
                  data-counter-min="${block.min}"
                  data-counter-max="${block.max}"
                  ${isMax ? "disabled" : ""}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" aria-hidden="true">
                    <path d="M11.5 2.5C11.8311 2.5002 12.1004 2.76854 12.1006 3.09961V10.9004H19.9004C20.2315 10.9006 20.4998 11.1689 20.5 11.5C20.4998 11.8311 20.2315 12.1004 19.9004 12.1006H12.1006V19.9004C12.1004 20.2315 11.8311 20.4998 11.5 20.5C11.1689 20.4998 10.9006 20.2315 10.9004 19.9004V12.1006H3.09961C2.76854 12.1004 2.5002 11.8311 2.5 11.5C2.50021 11.1689 2.76855 10.9006 3.09961 10.9004H10.9004V3.09961C10.9006 2.76855 11.1689 2.50021 11.5 2.5Z"/>
                  </svg>
                </button>
              </div>
              <div class="rent-calculator__counter-meta">
                <div class="rent-calculator__counter-label">${escapeHtml(
                  block.meta.label
                )}</div>
                <div class="rent-calculator__counter-price">${escapeHtml(
                  block.meta.price
                )}</div>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    if (block.type === "toggle") {
      return `
        <section
          class="rent-calculator__block"
          style="view-transition-name: ${getTransitionName(`form-${block.id}`)};"
        >
          <div class="rent-calculator__toggle-layout">
            <div class="rent-calculator__toggle-main">
              <span class="rent-calculator__step">${block.step}</span>
              <span class="rent-calculator__label">${escapeHtml(
                block.label
              )}</span>
            </div>
            <div class="rent-calculator__toggle-controls">
              ${
                block.tooltip?.text
                  ? `
                    <span class="rent-calculator__hint">
                      <button
                        class="rent-calculator__hint-button"
                        type="button"
                        aria-label="Пояснение"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
                          <circle cx="14" cy="14" r="14"/>
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M13.8281 11.8379C14.444 11.8379 16.7022 12.2485 15.6758 15.5332C14.6495 18.8172 14.1932 20.5394 14.8545 20.8711C15.265 21.0763 16.9074 20.4611 16.9082 20.8711C16.9082 21.0764 16.2922 22.103 13.2129 22.5137C10.134 22.9242 10.7745 19.1275 10.9541 18.4082C11.1594 17.587 13.0605 14.7929 12.1856 13.4805C11.9115 13.0703 10.432 13.6855 10.1328 13.6855C9.83703 13.6852 10.1267 12.8954 10.1328 12.8789C10.5433 12.0578 13.2116 11.838 13.8281 11.8379ZM15.0606 6.5C16.1943 6.50011 17.1133 7.32729 17.1133 8.34766C17.1133 9.36806 16.1943 10.1952 15.0606 10.1953C13.9267 10.1953 13.0069 9.36813 13.0069 8.34766C13.0069 7.32722 13.9267 6.5 15.0606 6.5Z"/>
                        </svg>
                      </button>
                      <span class="rent-calculator__hint-popover" role="tooltip">
                        ${escapeHtml(block.tooltip.text)}
                      </span>
                    </span>
                  `
                  : ""
              }
              <label class="rent-calculator__switch${block.value ? " is-active" : ""}">
                <input
                  class="rent-calculator__switch-input"
                  type="checkbox"
                  name="${escapeHtml(block.name)}"
                  value="1"
                  data-toggle-input
                  data-name="${escapeHtml(block.name)}"
                  ${block.value ? "checked" : ""}
                >
                <span class="rent-calculator__switch-thumb"></span>
              </label>
            </div>
          </div>
        </section>
      `;
    }

    return "";
  }

  renderSummaryBlock(block) {
    if (block.type === "feature-list") {
      return `
        <section
          class="rent-calculator__summary-group"
          style="view-transition-name: ${getTransitionName(`summary-${block.id}`)};"
        >
          <h3 class="rent-calculator__summary-title">${escapeHtml(
            block.title
          )}</h3>
          <ul class="rent-calculator__benefits">
            ${block.items
              .map(
                (item) => `
                  <li class="rent-calculator__benefit">
                    <span class="rent-calculator__benefit-mark"></span>
                    <span>${escapeHtml(item)}</span>
                  </li>
                `
              )
              .join("")}
          </ul>
        </section>
      `;
    }

    if (block.type === "pricing") {
      return `
        <section
          class="rent-calculator__summary-group rent-calculator__summary-group--pricing"
          style="view-transition-name: ${getTransitionName(`summary-${block.id}`)};"
        >
          ${
            block.previousMonthly
              ? `<div
                  class="rent-calculator__old-price"
                  style="view-transition-name: ${getTransitionName("pricing-old")};"
                >${escapeHtml(
                  block.previousMonthly
                )}</div>`
              : ""
          }
          <div class="rent-calculator__price-row">
            <div class="rent-calculator__price-current">
              <span
                class="rent-calculator__price-value"
                style="view-transition-name: ${getTransitionName("pricing-current")};"
              >${escapeHtml(
                block.currentMonthly
              )}</span>
              <span class="rent-calculator__price-suffix">${escapeHtml(
                block.currentMonthlySuffix
              )}</span>
            </div>
            ${
              block.badge
                ? `<span
                    class="rent-calculator__discount rent-calculator__discount--outline"
                    style="view-transition-name: ${getTransitionName("pricing-badge")};"
                  >${escapeHtml(
                    block.badge.label
                  )}</span>`
                : ""
            }
          </div>
          <div
            class="rent-calculator__total"
            style="view-transition-name: ${getTransitionName("pricing-total")};"
          >
            <strong>${escapeHtml(block.total)}</strong> ${escapeHtml(block.totalSuffix)}
          </div>
        </section>
      `;
    }

    if (block.type === "cta") {
      return `
        <button
          class="rent-calculator__submit"
          type="submit"
          data-calculator-submit
          style="view-transition-name: ${getTransitionName(`summary-${block.id}`)};"
        >
          ${escapeHtml(block.label)}
        </button>
      `;
    }

    return "";
  }

  renderBlockHeader(block) {
    return `
      <div class="rent-calculator__header">
        <div class="rent-calculator__header-main">
          <span class="rent-calculator__step">${block.step}</span>
          <span class="rent-calculator__label">${escapeHtml(block.label)}</span>
        </div>
      </div>
    `;
  }
}
