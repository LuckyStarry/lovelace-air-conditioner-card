/**
 * 空调控制卡片 v2 — 重新设计
 * 设计原则：跟随 HA 主题变量、信息层级清晰、250~520px 响应式
 * 功能：模式四选 / 风速档位 / 温度±0.5 / 电源 / 蜂鸣·预约切换（全保留）
 * 使用方式: type: custom:air-conditioner-card
 */
class AirConditionerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = null;
    this._entity = null;
    this._initialRender = false;
  }

  static getConfigElement() {
    return document.createElement("air-conditioner-card-editor");
  }

  static getStubConfig(hass, entities) {
    const climateEntities = entities.filter((eid) => eid.startsWith("climate."));
    return { entity: climateEntities[0] || "", name: "空调" };
  }

  setConfig(config) {
    if (!config.entity) throw new Error("请指定空调实体 (entity)");
    this._config = config;
    if (this._initialRender) {
      this._updateEntities();
      this._render();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (this._initialRender) {
      this._updateEntities();
      this._render();
    }
  }

  get hass() { return this._hass; }
  get config() { return this._config; }
  getCardSize() { return 4; }

  connectedCallback() {
    if (!this._initialRender) {
      this._createStyles();
      this._updateEntities();
      this._render();
      this._initialRender = true;
    }
  }

  _updateEntities() {
    if (!this._hass || !this._config) return;
    this._entity = this._hass.states[this._config.entity];
  }

  _getModeColor(presetMode) {
    const colors = {
      制热: "#FF6B35",
      制冷: "#1976D2",
      除湿: "#7B1FA2",
      送风: "#00838F",
    };
    return colors[presetMode] || "#388E3C";
  }

  _getModeIcon(mode) {
    const icons = {
      制热: "mdi:fire",
      制冷: "mdi:snowflake",
      除湿: "mdi:water-percent",
      送风: "mdi:fan",
    };
    return icons[mode] || "mdi:fan";
  }

  _getFanModes() {
    return [
      { mode: "自动风速", icon: "mdi:fan-auto", title: "自动风速" },
      { mode: "静音风速", icon: "mdi:weather-night", title: "静音风速" },
      { mode: "一档", icon: "mdi:numeric-1", title: "一档" },
      { mode: "二挡", icon: "mdi:numeric-2", title: "二挡" },
      { mode: "三挡", icon: "mdi:numeric-3", title: "三挡" },
      { mode: "四挡", icon: "mdi:numeric-4", title: "四挡" },
      { mode: "五档", icon: "mdi:numeric-5", title: "五挡" },
    ];
  }

  _getEntityId() {
    return this._config.entity.split(".")[1];
  }

  _handleToggle() {
    this._callService("climate", "toggle", { entity_id: this._config.entity });
  }

  _handleSetPresetMode(mode) {
    this._callService("climate", "set_preset_mode", { entity_id: this._config.entity, preset_mode: mode });
  }

  _handleSetTemperature(delta) {
    const currentTemp = parseFloat(this._entity.attributes.temperature || 0);
    const newTemp = (currentTemp + delta).toFixed(1);
    this._callService("climate", "set_temperature", { entity_id: this._config.entity, temperature: newTemp });
  }

  _handleSetFanMode(mode) {
    this._callService("climate", "set_fan_mode", { entity_id: this._config.entity, fan_mode: mode });
  }

  _handleToggleSwitch(switchEntity) {
    this._callService("switch", "toggle", { entity_id: switchEntity });
  }

  _callService(domain, service, serviceData) {
    if (this._hass && this._hass.callService) {
      this._hass.callService(domain, service, serviceData);
    }
  }

  _createStyles() {
    const style = document.createElement("style");
    style.textContent = `
      :host { display: block; }
      :host { display: block; container-type: inline-size; }
      @container (max-width: 320px) {
        .step-btn {
          width: 30px; height: 30px;
          min-width: 30px; min-height: 30px;
          max-width: 30px; max-height: 30px;
        }
        .step-btn ha-icon { --mdc-icon-size: 17px; }
        .temp-value { font-size: 34px; }
        .temp-value small { font-size: 17px; }
        .temp-display { min-width: 84px; }
      }
      .ac-card {
        display: block;
        padding: 14px 16px;
        min-height: 268px; box-sizing: border-box;
        box-sizing: border-box;
        border-radius: var(--ha-card-border-radius, 12px);
        background: var(--ha-card-background, var(--card-background-color, #fff));
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,.08));
        color: var(--primary-text-color);
        --ac-accent: var(--mode-color, var(--primary-color));
      }
      .ac-card.off { --ac-accent: var(--primary-text-color); }

      /* header */
      .header { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
      .header-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .header-icon {
        width: 36px; height: 36px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        background: color-mix(in srgb, var(--ac-accent) 14%, transparent);
        color: var(--ac-accent);
        flex: none;
      }
      .header-icon ha-icon { --mdc-icon-size: 22px; }
      .header-icon .spinning { animation: ac-spin 2.4s linear infinite; }
      @keyframes ac-spin { to { transform: rotate(360deg); } }
      .header-text { display: flex; flex-direction: column; min-width: 0; }
      .name { font-size: 15px; font-weight: 600; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .subtitle {
        font-size: 12px; line-height: 1.4; margin-top: 1px;
        color: var(--secondary-text-color);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .subtitle .dot { margin: 0 3px; opacity: .6; }
      .subtitle .mode-txt { color: var(--ac-accent); font-weight: 500; }

      /* 设定温度居中区 */
      .temp-zone {
        display: flex; align-items: center; justify-content: center;
        gap: 18px; padding: 14px 0 10px;
      }
      .step-btn {
        width: 36px; height: 36px;
        min-width: 36px; min-height: 36px;
        max-width: 36px; max-height: 36px;
        box-sizing: border-box;
        aspect-ratio: 1;
        border-radius: 9999px;
        border: 1px solid var(--divider-color, rgba(0,0,0,.12));
        background: transparent; color: var(--primary-text-color);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all .18s ease; padding: 0; line-height: 1;
      }
      .step-btn ha-icon { --mdc-icon-size: 20px; pointer-events: none; }
      .step-btn:hover:not(:disabled) {
        background: color-mix(in srgb, var(--ac-accent) 14%, transparent);
        border-color: var(--ac-accent); color: var(--ac-accent);
      }
      .step-btn:disabled { opacity: .35; cursor: not-allowed; }
      .temp-display { display: flex; flex-direction: column; align-items: center; min-width: 96px; }
      .temp-value {
        font-size: 42px; font-weight: 300; line-height: 1.05;
        font-variant-numeric: tabular-nums;
        color: var(--primary-text-color);
        transition: opacity .2s ease;
      }
      .temp-value small { font-size: 20px; font-weight: 400; }
      .temp-label {
        font-size: 11px; color: var(--secondary-text-color);
        letter-spacing: 2px; margin-top: 2px;
      }

      /* 模式 pills */
      .chips-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; }
      .mode-pill {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 5px 12px; border-radius: 17px;
        border: 1px solid var(--divider-color, rgba(0,0,0,.12));
        background: transparent; color: var(--secondary-text-color);
        font-size: 13px; cursor: pointer; transition: all .18s ease; padding-top: 5px; padding-bottom: 5px;
      }
      .mode-pill ha-icon { --mdc-icon-size: 16px; pointer-events: none; }
      .mode-pill:hover:not(:disabled):not(.active) {
        background: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
        color: var(--primary-text-color);
      }
      .mode-pill.active {
        background: var(--mode-color, var(--primary-color));
        border-color: var(--mode-color, var(--primary-color));
        color: #fff; font-weight: 500;
      }
      .mode-pill:disabled, .fan-chip:disabled {
        opacity: .38; cursor: not-allowed;
      }
      .mode-pill:disabled:hover, .fan-chip:disabled:hover { transform: none; }

      /* 风速/功能 圆形 chips */
      .fans-row {
        display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
        margin-top: 10px; padding-top: 10px;
        border-top: 1px solid color-mix(in srgb, var(--divider-color, rgba(0,0,0,.1)) 60%, transparent);
      }
      .fan-chip {
        width: 32px; height: 32px; border-radius: 50%;
        border: 1px solid var(--divider-color, rgba(0,0,0,.12));
        background: transparent; color: var(--secondary-text-color);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all .18s ease; padding: 0;
      }
      .fan-chip ha-icon { --mdc-icon-size: 17px; pointer-events: none; }
      .fan-chip:hover:not(:disabled):not(.active) {
        background: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
        color: var(--primary-text-color);
      }
      .fan-chip.active {
        background: var(--primary-color); border-color: var(--primary-color); color: #fff;
      }
      .fans-row .spacer { flex: 1; }
      .fans-row .sec-toggle {
        width: 32px; height: 32px; border-radius: 50%;
        border: 1px solid var(--divider-color, rgba(0,0,0,.12));
        background: transparent; color: var(--secondary-text-color);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all .18s ease; padding: 0;
      }
      .sec-toggle ha-icon { --mdc-icon-size: 17px; pointer-events: none; }
      .sec-toggle.active { background: var(--primary-color); border-color: var(--primary-color); color: #fff; }
      .sec-toggle:hover:not(:disabled) { transform: translateY(-1px); }
      .sec-toggle:disabled { opacity: .38; cursor: not-allowed; }

      .error { padding: 16px; color: var(--error-color); }
    `;
    this.shadowRoot.appendChild(style);
  }

  _render() {
    if (!this.shadowRoot) return;
    const style = this.shadowRoot.querySelector("style");
    this.shadowRoot.innerHTML = "";
    if (style) this.shadowRoot.appendChild(style);
    else this._createStyles();

    if (!this._entity) {
      const haCard = document.createElement("ha-card");
      haCard.className = "ac-card";
      const err = document.createElement("div");
      err.className = "error";
      err.textContent = `实体未找到: ${this._config?.entity || "未知"}`;
      haCard.appendChild(err);
      this.shadowRoot.appendChild(haCard);
      return;
    }

    const presetMode = this._entity.attributes.preset_mode || "";
    const isOff = this._entity.state === "off";
    const currentTemp = this._entity.attributes.current_temperature;
    const targetTemp = this._entity.attributes.temperature;
    const fanMode = this._entity.attributes.fan_mode || "";
    const entityId = this._getEntityId();

    const beepSwitch = `switch.${entityId}_beep_opration_enable`;
    const scheduleSwitch = `switch.${entityId}_schedule_enable`;
    const beepMuted = this._hass.states[beepSwitch]?.state === "off";
    const scheduleOn = this._hass.states[scheduleSwitch]?.state === "on";

    const accent = isOff ? "" : this._getModeColor(presetMode);

    const haCard = document.createElement("ha-card");
    haCard.className = `ac-card ${isOff ? "off" : ""}`;
    if (accent) haCard.style.setProperty("--mode-color", accent);

    const content = document.createElement("div");
    content.style.display = "flex";
    content.style.flexDirection = "column";

    // ── header：图标 + 名称/状态行 + 开关
    const header = document.createElement("div");
    header.className = "header";
    const info = document.createElement("div");
    info.className = "header-info";
    const iconBox = document.createElement("div");
    iconBox.className = "header-icon";
    const hIcon = document.createElement("ha-icon");
    hIcon.setAttribute("icon", "mdi:fan");
    if (!isOff) hIcon.classList.add("spinning");
    iconBox.appendChild(hIcon);
    const text = document.createElement("div");
    text.className = "header-text";
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = this._config.name || "空调";
    const subtitle = document.createElement("div");
    subtitle.className = "subtitle";
    if (isOff) {
      subtitle.textContent = `已关机${currentTemp != null ? " · 当前 " + Math.round(currentTemp) + "℃" : ""}`;
    } else {
      const fanName = (this._getFanModes().find((f) => f.mode === fanMode) || {}).mode || fanMode || "—";
      subtitle.innerHTML = `<span class="mode-txt">${presetMode || "—"}</span><span class="dot">·</span>当前 ${currentTemp != null ? Math.round(currentTemp) : "—"}℃<span class="dot">·</span>${fanName}`;
    }
    text.appendChild(name);
    text.appendChild(subtitle);
    info.appendChild(iconBox);
    info.appendChild(text);

    const toggle = document.createElement("ha-switch");
    toggle.checked = !isOff;
    toggle.addEventListener("change", () => this._handleToggle());

    header.appendChild(info);
    header.appendChild(toggle);

    // ── 设定温度居中区
    const zone = document.createElement("div");
    zone.className = "temp-zone";
    const minus = document.createElement("button");
    minus.className = "step-btn";
    minus.disabled = isOff;
    minus.innerHTML = '<ha-icon icon="mdi:minus"></ha-icon>';
    minus.addEventListener("click", () => this._handleSetTemperature(-0.5));
    const disp = document.createElement("div");
    disp.className = "temp-display";
    const val = document.createElement("div");
    val.className = "temp-value";
    val.innerHTML = isOff || targetTemp == null ? `<small>—</small>` : `${Math.round(targetTemp)}<small>℃</small>`;
    const lab = document.createElement("div");
    lab.className = "temp-label";
    lab.textContent = "设定温度";
    disp.appendChild(val);
    disp.appendChild(lab);
    const plus = document.createElement("button");
    plus.className = "step-btn";
    plus.disabled = isOff;
    plus.innerHTML = '<ha-icon icon="mdi:plus"></ha-icon>';
    plus.addEventListener("click", () => this._handleSetTemperature(0.5));
    zone.appendChild(minus);
    zone.appendChild(disp);
    zone.appendChild(plus);

    // ── 模式 pills
    const modeRow = document.createElement("div");
    modeRow.className = "chips-row";
    ["制热", "制冷", "除湿", "送风"].forEach((mode) => {
      const b = document.createElement("button");
      b.className = `mode-pill ${presetMode === mode && !isOff ? "active" : ""}`;
      b.disabled = isOff;
      b.innerHTML = `<ha-icon icon="${this._getModeIcon(mode)}"></ha-icon><span>${mode}</span>`;
      b.addEventListener("click", () => this._handleSetPresetMode(mode));
      modeRow.appendChild(b);
    });

    // ── 风速 + 蜂鸣/预约
    const fanRow = document.createElement("div");
    fanRow.className = "fans-row";
    this._getFanModes().forEach((fan) => {
      const b = document.createElement("button");
      b.className = `fan-chip ${fanMode === fan.mode && !isOff ? "active" : ""}`;
      b.title = fan.title;
      b.disabled = isOff;
      b.innerHTML = `<ha-icon icon="${fan.icon}"></ha-icon>`;
      b.addEventListener("click", () => this._handleSetFanMode(fan.mode));
      fanRow.appendChild(b);
    });
    const spacer = document.createElement("div");
    spacer.className = "spacer";
    fanRow.appendChild(spacer);
    if (this._hass.states[beepSwitch]) {
      const b = document.createElement("button");
      b.className = `sec-toggle ${beepMuted ? "active" : ""}`;
      b.title = "静音";
      b.innerHTML = '<ha-icon icon="mdi:volume-off"></ha-icon>';
      b.addEventListener("click", () => this._handleToggleSwitch(beepSwitch));
      fanRow.appendChild(b);
    }
    if (this._hass.states[scheduleSwitch]) {
      const b = document.createElement("button");
      b.className = `sec-toggle ${scheduleOn ? "active" : ""}`;
      b.title = "预约";
      b.innerHTML = '<ha-icon icon="mdi:clock-check"></ha-icon>';
      b.addEventListener("click", () => this._handleToggleSwitch(scheduleSwitch));
      fanRow.appendChild(b);
    }

    content.appendChild(header);
    content.appendChild(zone);
    content.appendChild(modeRow);
    content.appendChild(fanRow);
    haCard.appendChild(content);
    this.shadowRoot.appendChild(haCard);
  }
}

/**
 * 配置编辑器（保持原实现不变）
 */
class AirConditionerCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._hasRendered = false;
  }

  setConfig(config) {
    this._config = config || {};
    if (this.isConnected) {
      if (!this._hasRendered) this._render();
      else this._updateValues();
    }
  }

  get config() { return this._config; }

  set hass(hass) {
    this._hass = hass;
    if (this.isConnected) {
      if (this._hasRendered) this._updateValues();
      else if (this._config) this._render();
    }
  }

  get hass() { return this._hass; }

  async connectedCallback() {
    try {
      if (window.loadCardHelpers) {
        const helpers = await window.loadCardHelpers();
        if (helpers && helpers.loadHaComponents) await helpers.loadHaComponents();
      }
    } catch (e) { /* continue */ }
    if (this._hasRendered) return;
    if (this._config && this._hass) this._render();
    else if (this._config) this._render();
  }

  async _render() {
    this._hasRendered = true;
    const style = document.createElement("style");
    style.textContent = `
      .editor { padding: 16px; }
      .editor-row { margin-bottom: 16px; }
      ha-textfield {
        --mdc-theme-primary: var(--primary-color, #03a9f4);
        --mdc-text-field-label-ink-color: var(--primary-text-color, var(--ha-text-primary-color, #000));
        --mdc-text-field-ink-color: var(--primary-text-color, var(--ha-text-primary-color, #000));
      }
      ha-entity-picker { display: block !important; width: 100% !important; min-height: 56px !important; }
    `;
    const editor = document.createElement("div");
    editor.className = "editor";

    const entityRow = document.createElement("div");
    entityRow.className = "editor-row";
    const entityForm = document.createElement("ha-form");
    entityForm.hass = this._hass;
    entityForm.data = { entity: (this._config && this._config.entity) || "" };
    entityForm.schema = [{ name: "entity", required: true, selector: { entity: { domain: ["climate"] } } }];
    entityForm.computeLabel = (schema) => (schema.name === "entity" ? "空调实体 *" : schema.name);
    entityForm.addEventListener("value-changed", (ev) => {
      if (!this._config) this._config = {};
      if (ev.detail.value && ev.detail.value.entity) {
        this._config.entity = ev.detail.value.entity;
        this._fireConfigChanged();
      }
    });
    entityRow.appendChild(entityForm);

    const nameRow = document.createElement("div");
    nameRow.className = "editor-row";
    const nameInput = document.createElement("ha-textfield");
    nameInput.label = "卡片名称";
    nameInput.value = (this._config && this._config.name) || "";
    nameInput.addEventListener("input", (ev) => {
      if (!this._config) this._config = {};
      this._config.name = ev.target.value;
      this._fireConfigChanged();
    });
    nameRow.appendChild(nameInput);

    editor.appendChild(entityRow);
    editor.appendChild(nameRow);

    this.innerHTML = "";
    const styleElement = document.createElement("style");
    styleElement.textContent = style.textContent;
    this.appendChild(styleElement);
    this.appendChild(editor);
    requestAnimationFrame(() => {
      if (entityForm.hass !== this._hass && this._hass) entityForm.hass = this._hass;
    });
  }

  _updateValues() {
    const nameInput = this.querySelector("ha-textfield");
    if (nameInput) nameInput.value = (this._config && this._config.name) || "";
    const form = this.querySelector("ha-form");
    if (form) {
      if (this._hass && form.hass !== this._hass) form.hass = this._hass;
      const newEntityValue = (this._config && this._config.entity) || "";
      if (form.data && form.data.entity !== newEntityValue) form.data = { entity: newEntityValue };
    }
  }

  _fireConfigChanged() {
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
  }
}

if (!customElements.get("air-conditioner-card-editor")) {
  customElements.define("air-conditioner-card-editor", AirConditionerCardEditor);
}
if (!customElements.get("air-conditioner-card")) {
  customElements.define("air-conditioner-card", AirConditionerCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "air-conditioner-card",
    name: "Air Conditioner Card",
    description: "空调控制自定义卡片 v2",
  });
}
