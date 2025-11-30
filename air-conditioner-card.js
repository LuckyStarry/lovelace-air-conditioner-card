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
    this._initialRender = false;
  }

  // 配置编辑器（可选，用于 UI 配置）
  static getConfigElement() {
    return document.createElement("air-conditioner-card-editor");
  }

  static getStubConfig(hass, entities) {
    const climateEntities = entities.filter((eid) =>
      eid.startsWith("climate.")
    );

    return {
      entity: climateEntities[0] || "",
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
      )}℃`;
    }
    const preset = this._entity.attributes.preset_mode || "AUTO";
    const temp = Math.round(this._entity.attributes.current_temperature || 0);
    return `${preset} - ${temp}℃`;
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
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .current-temp-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .temp-label {
        font-size: 12px;
        font-weight: 400;
        color: var(--ha-text-secondary-color, var(--secondary-text-color, rgba(0, 0, 0, 0.6)));
        line-height: 1;
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
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
      }

      .target-temp-wrapper {
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
        cursor: pointer !important;
      }

      .temp-btn,
      .temp-btn * {
        cursor: pointer !important;
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
        cursor: pointer !important;
      }

      .mode-chip,
      .mode-chip * {
        cursor: pointer !important;
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
        cursor: pointer !important;
      }

      .control-chip,
      .control-chip * {
        cursor: pointer !important;
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

    // 添加"当前温度"标签
    const tempLabel = document.createElement("div");
    tempLabel.className = "temp-label";
    tempLabel.textContent = "当前温度";
    currentTempDiv.appendChild(tempLabel);

    // 温度值和图标容器
    const tempWrapper = document.createElement("div");
    tempWrapper.className = "current-temp-wrapper";
    const tempIcon = document.createElement("ha-icon");
    tempIcon.setAttribute("icon", "mdi:thermometer");
    tempIcon.className = "temp-icon";
    const tempValue = document.createElement("span");
    tempValue.className = "temp-value";
    tempValue.textContent = `${Math.round(currentTemp)}℃`;
    tempWrapper.appendChild(tempIcon);
    tempWrapper.appendChild(tempValue);
    currentTempDiv.appendChild(tempWrapper);

    const tempControls = document.createElement("div");
    tempControls.className = "temp-controls";

    // 添加"设定温度"标签
    const targetTempLabel = document.createElement("div");
    targetTempLabel.className = "temp-label";
    targetTempLabel.textContent = "设定温度";
    tempControls.appendChild(targetTempLabel);

    // 温度控制按钮和目标温度容器
    const targetTempWrapper = document.createElement("div");
    targetTempWrapper.className = "target-temp-wrapper";

    const minusBtn = document.createElement("mwc-button");
    minusBtn.className = "temp-btn";
    minusBtn.style.cursor = "pointer";
    minusBtn.disabled = isOff;
    minusBtn.addEventListener("click", () => this._handleSetTemperature(-0.5));
    const minusIcon = document.createElement("ha-icon");
    minusIcon.setAttribute("icon", "mdi:minus");
    minusBtn.appendChild(minusIcon);

    const targetTempDiv = document.createElement("div");
    targetTempDiv.className = "target-temp";
    targetTempDiv.textContent = `${Math.round(targetTemp)}℃`;

    const plusBtn = document.createElement("mwc-button");
    plusBtn.className = "temp-btn";
    plusBtn.style.cursor = "pointer";
    plusBtn.disabled = isOff;
    plusBtn.addEventListener("click", () => this._handleSetTemperature(0.5));
    const plusIcon = document.createElement("ha-icon");
    plusIcon.setAttribute("icon", "mdi:plus");
    plusBtn.appendChild(plusIcon);

    targetTempWrapper.appendChild(minusBtn);
    targetTempWrapper.appendChild(targetTempDiv);
    targetTempWrapper.appendChild(plusBtn);
    tempControls.appendChild(targetTempWrapper);

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
      modeBtn.style.cursor = "pointer";
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
      fanBtn.style.cursor = "pointer";
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
      beepBtn.style.cursor = "pointer";
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
      scheduleBtn.style.cursor = "pointer";
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

/**
 * 配置编辑器
 */
class AirConditionerCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._hasRendered = false;
  }

  setConfig(config) {
    console.log("[AirConditionerCardEditor] setConfig called", {
      config,
      isConnected: this.isConnected,
      hasHass: !!this._hass,
      hasShadowRoot: !!this.shadowRoot,
    });
    this._config = config || {};
    // 如果已经连接到 DOM 且已经渲染过，不重复渲染
    if (this.isConnected) {
      // 只有在还没有渲染过时才渲染
      if (!this._hasRendered) {
        console.log(
          "[AirConditionerCardEditor] Calling _render from setConfig"
        );
        this._render();
      } else {
        console.log(
          "[AirConditionerCardEditor] Already rendered, updating values"
        );
        // 如果已经渲染，更新现有元素的值
        this._updateValues();
      }
    }
  }

  get config() {
    return this._config;
  }

  set hass(hass) {
    console.log("[AirConditionerCardEditor] set hass called", {
      hasHass: !!hass,
      isConnected: this.isConnected,
      hasShadowRoot: !!this.shadowRoot,
      hasConfig: !!this._config,
    });
    this._hass = hass;
    // 如果已经连接到 DOM，渲染或更新
    if (this.isConnected) {
      // 如果已经渲染，更新所有值（包括 hass 和配置值）
      if (this._hasRendered) {
        this._updateValues();
      } else if (this._config) {
        // 如果还没有渲染，但有 config，现在渲染
        console.log("[AirConditionerCardEditor] Calling _render from set hass");
        this._render();
      }
    }
  }

  get hass() {
    return this._hass;
  }

  async connectedCallback() {
    console.log("[AirConditionerCardEditor] connectedCallback called", {
      hasConfig: !!this._config,
      hasHass: !!this._hass,
      hasRendered: this._hasRendered,
    });

    // 参考 Mushroom 的实现：确保 Home Assistant 组件已加载
    // 这可能会帮助 ha-entity-picker 等组件正确初始化
    try {
      if (window.loadCardHelpers) {
        const helpers = await window.loadCardHelpers();
        if (helpers && helpers.loadHaComponents) {
          await helpers.loadHaComponents();
          console.log("[AirConditionerCardEditor] HaComponents loaded");
        }
      }
    } catch (e) {
      console.warn("[AirConditionerCardEditor] Failed to load HaComponents", e);
      // 继续执行，不阻塞渲染
    }

    // 如果已经渲染过，不再重复渲染（避免重复创建 picker）
    if (this._hasRendered) {
      console.log("[AirConditionerCardEditor] Already rendered, skipping");
      return;
    }

    // 如果 config 和 hass 都已设置，立即渲染
    if (this._config && this._hass) {
      console.log(
        "[AirConditionerCardEditor] Calling _render from connectedCallback (both config and hass)"
      );
      this._render();
    } else if (this._config) {
      // 如果只有 config，也渲染（hass 会在之后设置）
      console.log(
        "[AirConditionerCardEditor] Calling _render from connectedCallback (config only)"
      );
      this._render();
    }
  }

  async _render() {
    console.log("[AirConditionerCardEditor] _render called", {
      hasShadowRoot: !!this.shadowRoot,
      hasConfig: !!this._config,
      hasHass: !!this._hass,
      hasRendered: this._hasRendered,
    });
    // 不使用 shadow DOM，直接操作元素
    // ha-entity-picker 可能需要访问外部上下文
    this._hasRendered = true;

    const style = document.createElement("style");
    style.textContent = `
      .editor {
        padding: 16px;
      }
      .editor-row {
        margin-bottom: 16px;
      }
      .editor-label {
        display: block;
        margin-bottom: 8px;
        color: var(--primary-text-color, var(--ha-text-primary-color, #000000));
        font-weight: 500;
      }
      .editor-help {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        color: var(--ha-text-secondary-color, rgba(0, 0, 0, 0.6));
      }
      
      ha-textfield {
        --mdc-theme-primary: var(--primary-color, #03a9f4);
        --mdc-text-field-label-ink-color: var(--primary-text-color, var(--ha-text-primary-color, #000000));
        --mdc-text-field-ink-color: var(--primary-text-color, var(--ha-text-primary-color, #000000));
      }
      
      ha-entity-picker {
        display: block !important;
        width: 100% !important;
        min-height: 56px !important;
      }
    `;

    const editor = document.createElement("div");
    editor.className = "editor";

    // 卡片名称
    const nameRow = document.createElement("div");
    nameRow.className = "editor-row";
    const nameLabel = document.createElement("label");
    nameLabel.className = "editor-label";
    nameLabel.textContent = "卡片名称";
    const nameInput = document.createElement("ha-textfield");
    nameInput.label = "名称";
    nameInput.value = (this._config && this._config.name) || "";
    nameInput.style.setProperty("--mdc-theme-primary", "var(--primary-color)");
    nameInput.addEventListener("input", (ev) => {
      if (!this._config) {
        this._config = {};
      }
      this._config.name = ev.target.value;
      this._fireConfigChanged();
    });
    const nameHelp = document.createElement("div");
    nameHelp.className = "editor-help";
    nameHelp.textContent = "显示在卡片上的名称（可选）";
    nameRow.appendChild(nameLabel);
    nameRow.appendChild(nameInput);
    nameRow.appendChild(nameHelp);

    // 空调实体
    const entityRow = document.createElement("div");
    entityRow.className = "editor-row";
    const entityLabel = document.createElement("label");
    entityLabel.className = "editor-label";
    entityLabel.textContent = "空调实体 *";

    // 使用 ha-form 组件（参考 Mushroom 的实现方式）
    // ha-form 会自动处理内部的 ha-entity-picker 初始化
    const entityForm = document.createElement("ha-form");

    // 定义 schema
    const schema = [
      {
        name: "entity",
        required: true,
        selector: {
          entity: {
            domain: ["climate"],
          },
        },
      },
    ];

    // 设置 ha-form 的属性
    entityForm.hass = this._hass;
    entityForm.data = {
      entity: (this._config && this._config.entity) || "",
    };
    entityForm.schema = schema;
    entityForm.computeLabel = (schema) => {
      if (schema.name === "entity") {
        return "空调实体 *";
      }
      return schema.name;
    };

    // 监听值变更
    entityForm.addEventListener("value-changed", (ev) => {
      console.log(
        "[AirConditionerCardEditor] Entity form value changed",
        ev.detail.value
      );
      if (!this._config) {
        this._config = {};
      }
      if (ev.detail.value && ev.detail.value.entity) {
        this._config.entity = ev.detail.value.entity;
        this._fireConfigChanged();
      }
    });

    const entityHelp = document.createElement("div");
    entityHelp.className = "editor-help";
    entityHelp.textContent = "选择要控制的空调实体";
    entityRow.appendChild(entityLabel);
    entityRow.appendChild(entityForm);
    entityRow.appendChild(entityHelp);

    editor.appendChild(nameRow);
    editor.appendChild(entityRow);

    // ha-form 的属性已在上面设置
    console.log("[AirConditionerCardEditor] Entity form created", {
      hasHass: !!entityForm.hass,
      hasData: !!entityForm.data,
      hasSchema: !!entityForm.schema,
    });

    // 不使用 shadow DOM，直接操作元素
    // ha-entity-picker 可能需要访问外部上下文
    this.innerHTML = "";
    // 添加样式（使用 <style> 标签）
    const styleElement = document.createElement("style");
    styleElement.textContent = style.textContent;
    this.appendChild(styleElement);
    this.appendChild(editor);

    // ha-form 会自动处理内部组件的初始化，不需要额外的设置
    // 但需要确保 hass 在添加到 DOM 后更新
    requestAnimationFrame(() => {
      if (entityForm.hass !== this._hass && this._hass) {
        entityForm.hass = this._hass;
      }
    });
  }

  // 已废弃：不再使用 ha-entity-picker，改用 ha-form
  // _setupEntityPicker() 方法已删除

  _updateValues() {
    // 更新已渲染元素的值
    console.log("[AirConditionerCardEditor] _updateValues called", {
      hasConfig: !!this._config,
      configName: this._config?.name,
      configEntity: this._config?.entity,
      hasHass: !!this._hass,
    });

    const nameInput = this.querySelector("ha-textfield");
    if (nameInput) {
      const newValue = (this._config && this._config.name) || "";
      nameInput.value = newValue;
      console.log("[AirConditionerCardEditor] Updated name input", {
        oldValue: nameInput.value,
        newValue: newValue,
      });
    } else {
      console.warn("[AirConditionerCardEditor] Name input not found");
    }

    const form = this.querySelector("ha-form");
    if (form) {
      // 更新 ha-form 的 hass 和 data
      if (this._hass && form.hass !== this._hass) {
        form.hass = this._hass;
      }
      const newEntityValue = (this._config && this._config.entity) || "";
      if (form.data && form.data.entity !== newEntityValue) {
        form.data = {
          entity: newEntityValue,
        };
      }
      console.log("[AirConditionerCardEditor] Updated form", {
        hasHass: !!form.hass,
        data: form.data,
        expectedEntity: newEntityValue,
      });
    } else {
      console.warn(
        "[AirConditionerCardEditor] Form not found in _updateValues"
      );
    }
  }

  _fireConfigChanged() {
    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

// 先注册配置编辑器
if (!customElements.get("air-conditioner-card-editor")) {
  customElements.define(
    "air-conditioner-card-editor",
    AirConditionerCardEditor
  );
}

// 再注册主卡片
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
