/**
 * 空调控制卡片
 * 使用方式: type: custom:air-conditioner-card
 */
class AirConditionerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = null;
    this._entity = null;
    this._tempEntity = null;
    this._humiEntity = null;
    this._initialRender = false;
  }

  // 配置编辑器（可选，用于 UI 配置）
  static getConfigElement() {
    return null;
  }

  static getStubConfig(hass, entities) {
    const climateEntities = entities.filter((eid) =>
      eid.startsWith("climate.")
    );
    const tempEntities = entities.filter(
      (eid) => eid.startsWith("sensor.") && eid.includes("temperature")
    );
    const humiEntities = entities.filter(
      (eid) => eid.startsWith("sensor.") && eid.includes("humidity")
    );

    return {
      entity: climateEntities[0] || "",
      temp_entity: tempEntities[0] || "",
      humi_entity: humiEntities[0] || "",
      name: "空调",
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("请指定空调实体 (entity)");
    }
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

  get hass() {
    return this._hass;
  }

  get config() {
    return this._config;
  }

  getCardSize() {
    return 5;
  }

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
    if (this._config.temp_entity) {
      this._tempEntity = this._hass.states[this._config.temp_entity];
    }
    if (this._config.humi_entity) {
      this._humiEntity = this._hass.states[this._config.humi_entity];
    }
  }

  _getModeColor(presetMode) {
    const colors = {
      制热: "#FF6B35", // 更深的橙色，提高对比度
      制冷: "#1976D2", // 更深的蓝色，提高对比度
      除湿: "#7B1FA2", // 更深的紫色，提高对比度
      送风: "#00838F", // 更深的青色，提高对比度
    };
    return colors[presetMode] || "#388E3C"; // 更深的绿色
  }

  _getModeGradient(presetMode) {
    const gradients = {
      制热: "linear-gradient(145deg, rgba(247,198,157,1) -30%, rgba(255,255,255,1) 50%)",
      制冷: "linear-gradient(145deg, rgba(100,149,237,1) -30%, rgba(255,255,255,1) 50%)",
      除湿: "linear-gradient(145deg, rgba(132,112,255,1) -30%, rgba(255,255,255,1) 50%)",
      送风: "linear-gradient(145deg, rgba(0,188,212,1) -30%, rgba(255,255,255,1) 50%)",
    };
    return (
      gradients[presetMode] ||
      "linear-gradient(145deg, rgba(76,175,80,1) -30%, rgba(255,255,255,1) 50%)"
    );
  }

  _getStatusText() {
    if (!this._entity) return "未知";
    if (this._entity.state === "off") {
      return `OFF - ${Math.round(
        this._entity.attributes.current_temperature || 0
      )}°`;
    }
    const preset = this._entity.attributes.preset_mode || "AUTO";
    const temp = Math.round(this._entity.attributes.current_temperature || 0);
    return `${preset} - ${temp}°`;
  }

  _handleToggle() {
    this._callService("climate", "toggle", {
      entity_id: this._config.entity,
    });
  }

  _handleSetPresetMode(mode) {
    this._callService("climate", "set_preset_mode", {
      entity_id: this._config.entity,
      preset_mode: mode,
    });
  }

  _handleSetTemperature(delta) {
    const currentTemp = parseFloat(this._entity.attributes.temperature || 0);
    const newTemp = (currentTemp + delta).toFixed(1);
    this._callService("climate", "set_temperature", {
      entity_id: this._config.entity,
      temperature: newTemp,
    });
  }

  _handleSetFanMode(mode) {
    this._callService("climate", "set_fan_mode", {
      entity_id: this._config.entity,
      fan_mode: mode,
    });
  }

  _handleToggleSwitch(switchEntity) {
    this._callService("switch", "toggle", {
      entity_id: switchEntity,
    });
  }

  _callService(domain, service, serviceData) {
    if (this._hass && this._hass.callService) {
      this._hass.callService(domain, service, serviceData);
    }
  }

  _getEntityId() {
    return this._config.entity.split(".")[1];
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
      { mode: "自动风速", icon: "mdi:fan-auto" },
      { mode: "静音风速", icon: "mdi:fan-speed-1" },
      { mode: "一档", icon: "mdi:numeric-1-circle" },
      { mode: "二挡", icon: "mdi:numeric-2-circle" },
      { mode: "三挡", icon: "mdi:numeric-3-circle" },
      { mode: "四档", icon: "mdi:numeric-4-circle" },
      { mode: "五档", icon: "mdi:numeric-5-circle" },
    ];
  }

  _createStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .air-conditioner-card {
        padding: 16px;
        border-radius: var(--ha-card-border-radius, 12px);
        transition: box-shadow 0.3s ease;
        background: var(--ha-card-background, var(--card-background-color, #ffffff)) !important;
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
      }

      /* 未启动状态下确保文字清晰可见 */
      .air-conditioner-card.off .label {
        color: var(--ha-text-primary-color, var(--primary-text-color, rgba(0, 0, 0, 0.87))) !important;
      }

      .air-conditioner-card.off .temp-value,
      .air-conditioner-card.off .target-temp {
        color: var(--ha-text-primary-color, var(--primary-text-color, rgba(0, 0, 0, 0.87))) !important;
      }

      .card-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .title-section {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .icon-wrapper {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .icon-wrapper ha-icon {
        --mdc-icon-size: 56px !important;
        color: var(--mode-color, var(--primary-color)) !important;
        transition: transform 0.3s ease;
      }

      /* 空调开启时，风扇图标旋转动画 */
      .icon-wrapper ha-icon.spinning {
        animation: spin 2s linear infinite !important;
      }

      /* 确保 ha-svg-icon 内部元素也旋转 */
      .icon-wrapper ha-icon.spinning ha-svg-icon {
        animation: spin 2s linear infinite !important;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .title-info {
        display: flex;
        flex-direction: column;
      }

      .label {
        font-size: 20px;
        font-weight: 500;
        color: var(--ha-text-primary-color, var(--primary-text-color, rgba(0, 0, 0, 0.87)));
      }


      .temperature-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
      }

      .current-temp {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .temp-icon {
        width: 40px;
        height: 40px;
        color: var(--ha-text-secondary-color, var(--secondary-text-color, rgba(0, 0, 0, 0.6)));
      }

      .temp-value {
        font-size: 40px;
        font-weight: 300;
        color: var(--ha-text-primary-color, var(--primary-text-color, rgba(0, 0, 0, 0.87)));
      }

      .temp-controls {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .temp-btn {
        min-width: 40px;
        min-height: 40px;
        --mdc-theme-primary: var(--primary-color, rgba(0, 0, 0, 0.6));
        background-color: var(--ha-card-background, var(--card-background-color, rgba(255, 255, 255, 0.9))) !important;
        border: 1px solid var(--ha-divider-color, var(--divider-color, rgba(0, 0, 0, 0.12))) !important;
        border-radius: 8px;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
      }

      .temp-btn ::slotted(*) {
        color: var(--ha-text-secondary-color, var(--secondary-text-color, rgba(0, 0, 0, 0.7))) !important;
      }

      .temp-btn ha-icon {
        color: var(--ha-text-secondary-color, var(--secondary-text-color, rgba(0, 0, 0, 0.7))) !important;
        width: 24px;
        height: 24px;
        margin: 0;
      }

      .temp-btn:hover:not(:disabled) {
        background-color: var(--ha-card-background, var(--card-background-color, rgba(255, 255, 255, 1))) !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      .temp-btn:hover:not(:disabled) ::slotted(*) {
        color: var(--ha-text-primary-color, var(--primary-text-color, rgba(0, 0, 0, 0.87))) !important;
      }

      .temp-btn:hover:not(:disabled) ha-icon {
        color: var(--ha-text-primary-color, var(--primary-text-color, rgba(0, 0, 0, 0.87))) !important;
      }

      .temp-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .target-temp {
        font-size: 32px;
        font-weight: 300;
        color: var(--ha-text-primary-color, var(--primary-text-color, rgba(0, 0, 0, 0.87)));
        min-width: 60px;
        text-align: center;
      }

      .mode-section {
        display: flex;
        flex-wrap: wrap;
      }

      .controls-section {
        display: flex;
        flex-wrap: wrap;
      }

      /* 模式按钮容器：适中间距，整体紧凑 */
      .mode-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      /* 风速按钮容器：适中间距，避免按钮完全挨在一起 */
      .control-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      /* 模式按钮：宽度自适应内容，减少右侧空白 */
      .mode-chip {
        padding: 6px 12px;
        border-radius: 16px;
        --mdc-theme-primary: var(--mode-color, var(--primary-color));
        background-color: var(--ha-card-background, var(--card-background-color, rgba(255, 255, 255, 0.6))) !important;
        color: var(--ha-text-secondary-color, var(--secondary-text-color, rgba(0, 0, 0, 0.6))) !important;
        border: 1px solid var(--ha-divider-color, var(--divider-color, rgba(0, 0, 0, 0.12))) !important;
        transition: all 0.3s ease;
        font-size: 14px;
        white-space: nowrap;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      /* 风速按钮：更小更紧凑的图标按钮 */
      .control-chip {
        min-width: 28px;
        min-height: 28px;
        padding: 2px;
        border-radius: 14px;
        --mdc-theme-primary: var(--mode-color, var(--primary-color));
        background-color: var(--ha-card-background, var(--card-background-color, rgba(255, 255, 255, 0.6))) !important;
        color: var(--ha-text-secondary-color, var(--secondary-text-color, rgba(0, 0, 0, 0.6))) !important;
        border: 1px solid var(--ha-divider-color, var(--divider-color, rgba(0, 0, 0, 0.12))) !important;
        transition: all 0.3s ease;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      .mode-chip ::slotted(*),
      .control-chip ::slotted(*) {
        color: var(--ha-text-secondary-color, var(--secondary-text-color, rgba(0, 0, 0, 0.6))) !important;
      }

      .mode-chip ha-icon {
        --mdc-icon-size: 18px !important;
        color: var(--ha-text-secondary-color, var(--secondary-text-color, rgba(0, 0, 0, 0.6))) !important;
        margin-right: 4px;
      }

      .control-chip ha-icon {
        color: var(--ha-text-secondary-color, var(--secondary-text-color, rgba(0, 0, 0, 0.6))) !important;
      }

      .control-chip ha-icon {
        width: 24px;
        height: 24px;
        margin: 0;
      }

      .mode-chip:hover:not(:disabled),
      .control-chip:hover:not(:disabled) {
        background-color: var(--ha-card-background, var(--card-background-color, rgba(255, 255, 255, 0.9))) !important;
        color: var(--ha-text-primary-color, var(--primary-text-color, rgba(0, 0, 0, 0.87))) !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
        transform: translateY(-1px);
      }

      .mode-chip:hover:not(:disabled) ::slotted(*),
      .control-chip:hover:not(:disabled) ::slotted(*) {
        color: var(--ha-text-primary-color, var(--primary-text-color, rgba(0, 0, 0, 0.87))) !important;
      }

      .mode-chip.active,
      .control-chip.active {
        background-color: var(--mode-color, var(--primary-color)) !important;
        color: white !important;
        border-color: var(--mode-color, var(--primary-color)) !important;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
        filter: brightness(0.9) saturate(1.1);
      }

      .mode-chip.active ::slotted(*),
      .control-chip.active ::slotted(*) {
        color: white !important;
        font-weight: 500;
      }

      .mode-chip.active ha-icon,
      .control-chip.active ha-icon {
        color: white !important;
        filter: none;
      }

      .mode-chip:disabled,
      .control-chip:disabled {
        background-color: var(--disabled-color, rgba(0, 0, 0, 0.05)) !important;
        color: var(--disabled-text-color, rgba(0, 0, 0, 0.38)) !important;
        opacity: 1;
        cursor: not-allowed;
        box-shadow: none;
      }

      .mode-chip:disabled ::slotted(*),
      .control-chip:disabled ::slotted(*) {
        color: var(--disabled-text-color, rgba(0, 0, 0, 0.38)) !important;
      }

      .mode-chip:disabled ha-icon,
      .control-chip:disabled ha-icon {
        color: var(--disabled-text-color, rgba(0, 0, 0, 0.38)) !important;
      }

      .error {
        padding: 16px;
        color: var(--error-color);
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  _render() {
    if (!this.shadowRoot) return;

    // 清除现有内容（保留样式）
    const style = this.shadowRoot.querySelector("style");
    this.shadowRoot.innerHTML = "";
    if (style) {
      this.shadowRoot.appendChild(style);
    } else {
      this._createStyles();
    }

    if (!this._entity) {
      const haCard = document.createElement("ha-card");
      const errorDiv = document.createElement("div");
      errorDiv.className = "error";
      errorDiv.textContent = `实体未找到: ${this._config?.entity || "未知"}`;
      haCard.appendChild(errorDiv);
      this.shadowRoot.appendChild(haCard);
      return;
    }

    const presetMode = this._entity.attributes.preset_mode;
    const isOff = this._entity.state === "off";
    const currentTemp = this._entity.attributes.current_temperature || 0;
    const targetTemp = this._entity.attributes.temperature || 0;
    const fanMode = this._entity.attributes.fan_mode || "";
    const entityId = this._getEntityId();

    const beepSwitch = `switch.${entityId}_beep_opration_enable`;
    const scheduleSwitch = `switch.${entityId}_schedule_enable`;
    const beepState = this._hass.states[beepSwitch]?.state === "off";
    const scheduleState = this._hass.states[scheduleSwitch]?.state === "on";

    // 创建主卡片
    const haCard = document.createElement("ha-card");
    haCard.className = `air-conditioner-card ${isOff ? "off" : presetMode}`;

    const cardContent = document.createElement("div");
    cardContent.className = "card-content";

    // 头部
    const header = document.createElement("div");
    header.className = "header";

    const titleSection = document.createElement("div");
    titleSection.className = "title-section";

    const iconWrapper = document.createElement("div");
    iconWrapper.className = "icon-wrapper";
    const headerIcon = document.createElement("ha-icon");
    headerIcon.setAttribute("icon", "mdi:fan");
    // 设置 CSS 变量控制图标大小
    headerIcon.style.setProperty("--mdc-icon-size", "56px");
    // 空调开启时添加旋转动画
    if (!isOff) {
      headerIcon.classList.add("spinning");
    }
    iconWrapper.appendChild(headerIcon);

    const titleInfo = document.createElement("div");
    titleInfo.className = "title-info";
    const label = document.createElement("div");
    label.className = "label";
    label.textContent = this._config.name || "空调";
    titleInfo.appendChild(label);

    titleSection.appendChild(iconWrapper);
    titleSection.appendChild(titleInfo);

    const toggleWrapper = document.createElement("div");
    toggleWrapper.className = "toggle-wrapper";
    const haSwitch = document.createElement("ha-switch");
    haSwitch.checked = !isOff;
    haSwitch.addEventListener("change", () => this._handleToggle());
    toggleWrapper.appendChild(haSwitch);

    header.appendChild(titleSection);
    header.appendChild(toggleWrapper);

    // 温度控制区域
    const tempSection = document.createElement("div");
    tempSection.className = "temperature-section";

    const currentTempDiv = document.createElement("div");
    currentTempDiv.className = "current-temp";
    const tempIcon = document.createElement("ha-icon");
    tempIcon.setAttribute("icon", "mdi:thermometer");
    tempIcon.className = "temp-icon";
    const tempValue = document.createElement("span");
    tempValue.className = "temp-value";
    tempValue.textContent = `${Math.round(currentTemp)}°`;
    currentTempDiv.appendChild(tempIcon);
    currentTempDiv.appendChild(tempValue);

    const tempControls = document.createElement("div");
    tempControls.className = "temp-controls";
    const minusBtn = document.createElement("mwc-button");
    minusBtn.className = "temp-btn";
    minusBtn.disabled = isOff;
    minusBtn.addEventListener("click", () => this._handleSetTemperature(-0.5));
    const minusIcon = document.createElement("ha-icon");
    minusIcon.setAttribute("icon", "mdi:minus");
    minusBtn.appendChild(minusIcon);

    const targetTempDiv = document.createElement("div");
    targetTempDiv.className = "target-temp";
    targetTempDiv.textContent = `${Math.round(targetTemp)}°`;

    const plusBtn = document.createElement("mwc-button");
    plusBtn.className = "temp-btn";
    plusBtn.disabled = isOff;
    plusBtn.addEventListener("click", () => this._handleSetTemperature(0.5));
    const plusIcon = document.createElement("ha-icon");
    plusIcon.setAttribute("icon", "mdi:plus");
    plusBtn.appendChild(plusIcon);

    tempControls.appendChild(minusBtn);
    tempControls.appendChild(targetTempDiv);
    tempControls.appendChild(plusBtn);

    tempSection.appendChild(currentTempDiv);
    tempSection.appendChild(tempControls);

    // 模式选择
    const modeSection = document.createElement("div");
    modeSection.className = "mode-section";
    const modeChips = document.createElement("div");
    modeChips.className = "mode-chips";

    ["制热", "制冷", "除湿", "送风"].forEach((mode) => {
      const modeBtn = document.createElement("mwc-button");
      modeBtn.className = `mode-chip ${presetMode === mode ? "active" : ""}`;
      modeBtn.disabled = isOff;
      modeBtn.style.setProperty("--mode-color", this._getModeColor(mode));
      modeBtn.addEventListener("click", () => this._handleSetPresetMode(mode));

      const modeIcon = document.createElement("ha-icon");
      modeIcon.setAttribute("icon", this._getModeIcon(mode));
      modeBtn.appendChild(modeIcon);

      const modeSpan = document.createElement("span");
      modeSpan.textContent = mode;
      modeBtn.appendChild(modeSpan);

      modeChips.appendChild(modeBtn);
    });

    modeSection.appendChild(modeChips);

    // 风速控制
    const controlsSection = document.createElement("div");
    controlsSection.className = "controls-section";
    const controlChips = document.createElement("div");
    controlChips.className = "control-chips";

    this._getFanModes().forEach((fan) => {
      const fanBtn = document.createElement("mwc-button");
      fanBtn.className = `control-chip ${fanMode === fan.mode ? "active" : ""}`;
      fanBtn.disabled = isOff;
      fanBtn.addEventListener("click", () => this._handleSetFanMode(fan.mode));

      const fanIcon = document.createElement("ha-icon");
      fanIcon.setAttribute("icon", fan.icon);
      fanBtn.appendChild(fanIcon);

      controlChips.appendChild(fanBtn);
    });

    if (this._hass.states[beepSwitch]) {
      const beepBtn = document.createElement("mwc-button");
      beepBtn.className = `control-chip ${beepState ? "active" : ""}`;
      beepBtn.addEventListener("click", () =>
        this._handleToggleSwitch(beepSwitch)
      );
      const beepIcon = document.createElement("ha-icon");
      beepIcon.setAttribute("icon", "mdi:volume-off");
      beepBtn.appendChild(beepIcon);
      controlChips.appendChild(beepBtn);
    }

    if (this._hass.states[scheduleSwitch]) {
      const scheduleBtn = document.createElement("mwc-button");
      scheduleBtn.className = `control-chip ${scheduleState ? "active" : ""}`;
      scheduleBtn.addEventListener("click", () =>
        this._handleToggleSwitch(scheduleSwitch)
      );
      const scheduleIcon = document.createElement("ha-icon");
      scheduleIcon.setAttribute("icon", "mdi:clock-check");
      scheduleBtn.appendChild(scheduleIcon);
      controlChips.appendChild(scheduleBtn);
    }

    controlsSection.appendChild(controlChips);

    // 组装
    cardContent.appendChild(header);
    cardContent.appendChild(tempSection);
    cardContent.appendChild(modeSection);
    cardContent.appendChild(controlsSection);
    haCard.appendChild(cardContent);
    this.shadowRoot.appendChild(haCard);
  }
}

if (!customElements.get("air-conditioner-card")) {
  customElements.define("air-conditioner-card", AirConditionerCard);

  // 注册到 window.customCards（可选，但有助于 HACS 识别）
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "air-conditioner-card",
    name: "Air Conditioner Card",
    description: "空调控制自定义卡片",
  });
}
