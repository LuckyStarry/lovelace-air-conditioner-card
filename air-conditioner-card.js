import { LitElement, html, css } from "lit";
import { property, state } from "lit/decorators.js";

/**
 * 空调控制卡片
 * 使用方式: type: custom:air-conditioner-card
 */
class AirConditionerCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _entity: { type: Object, state: true },
      _tempEntity: { type: Object, state: true },
      _humiEntity: { type: Object, state: true },
    };
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
    this.config = config;
  }

  getCardSize() {
    return 5;
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateEntities();
  }

  _updateEntities() {
    if (!this.hass || !this.config) return;

    this._entity = this.hass.states[this.config.entity];
    if (this.config.temp_entity) {
      this._tempEntity = this.hass.states[this.config.temp_entity];
    }
    if (this.config.humi_entity) {
      this._humiEntity = this.hass.states[this.config.humi_entity];
    }
  }

  updated(changedProperties) {
    if (changedProperties.has("hass") || changedProperties.has("config")) {
      this._updateEntities();
    }
  }

  _getModeColor(presetMode) {
    const colors = {
      制热: "#f7c69d",
      制冷: "#1E90FF",
      除湿: "#9370DB",
      送风: "#00BCD4",
    };
    return colors[presetMode] || "#4CAF50";
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
      entity_id: this.config.entity,
    });
  }

  _handleSetPresetMode(mode) {
    this._callService("climate", "set_preset_mode", {
      entity_id: this.config.entity,
      preset_mode: mode,
    });
  }

  _handleSetTemperature(delta) {
    const currentTemp = parseFloat(this._entity.attributes.temperature || 0);
    const newTemp = (currentTemp + delta).toFixed(1);
    this._callService("climate", "set_temperature", {
      entity_id: this.config.entity,
      temperature: newTemp,
    });
  }

  _handleSetFanMode(mode) {
    this._callService("climate", "set_fan_mode", {
      entity_id: this.config.entity,
      fan_mode: mode,
    });
  }

  _handleToggleSwitch(switchEntity) {
    this._callService("switch", "toggle", {
      entity_id: switchEntity,
    });
  }

  _callService(domain, service, serviceData) {
    this.hass.callService(domain, service, serviceData);
  }

  _getEntityId() {
    // 从完整实体ID中提取ID部分（去掉 domain.）
    return this.config.entity.split(".")[1];
  }

  render() {
    if (!this._entity) {
      return html`
        <ha-card>
          <div class="error">实体未找到: ${this.config.entity}</div>
        </ha-card>
      `;
    }

    const presetMode = this._entity.attributes.preset_mode;
    const isOff = this._entity.state === "off";
    const currentTemp = this._entity.attributes.current_temperature || 0;
    const targetTemp = this._entity.attributes.temperature || 0;
    const fanMode = this._entity.attributes.fan_mode || "";
    const entityId = this._getEntityId();

    const beepSwitch = `switch.${entityId}_beep_opration_enable`;
    const scheduleSwitch = `switch.${entityId}_schedule_enable`;
    const beepState = this.hass.states[beepSwitch]?.state === "off";
    const scheduleState = this.hass.states[scheduleSwitch]?.state === "on";

    return html`
      <ha-card class="air-conditioner-card ${isOff ? "off" : presetMode}">
        <div class="card-content">
          <!-- 头部 -->
          <div class="header">
            <div class="title-section">
              <div class="icon-wrapper">
                <ha-icon icon="mdi:fan"></ha-icon>
              </div>
              <div class="title-info">
                <div class="label">${this.config.name || "空调"}</div>
                <div class="status">${this._getStatusText()}</div>
              </div>
            </div>
            <div class="toggle-wrapper">
              <ha-switch
                .checked=${!isOff}
                @change=${this._handleToggle}
              ></ha-switch>
            </div>
          </div>

          <!-- 温度控制区域 -->
          <div class="temperature-section">
            <div class="current-temp">
              <ha-icon icon="mdi:thermometer" class="temp-icon"></ha-icon>
              <span class="temp-value">${Math.round(currentTemp)}°</span>
            </div>
            <div class="temp-controls">
              <mwc-button
                class="temp-btn"
                @click=${() => this._handleSetTemperature(-0.5)}
                ?disabled=${isOff}
              >
                <ha-icon icon="mdi:minus"></ha-icon>
              </mwc-button>
              <div class="target-temp">${Math.round(targetTemp)}°</div>
              <mwc-button
                class="temp-btn"
                @click=${() => this._handleSetTemperature(0.5)}
                ?disabled=${isOff}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
              </mwc-button>
            </div>
          </div>

          <!-- 模式选择 -->
          <div class="mode-section">
            <div class="mode-chips">
              ${["制热", "制冷", "除湿", "送风"].map(
                (mode) => html`
                  <mwc-button
                    class="mode-chip ${presetMode === mode ? "active" : ""}"
                    @click=${() => this._handleSetPresetMode(mode)}
                    ?disabled=${isOff}
                    style="--mode-color: ${this._getModeColor(mode)}"
                  >
                    <ha-icon icon=${this._getModeIcon(mode)}></ha-icon>
                    <span>${mode}</span>
                  </mwc-button>
                `
              )}
            </div>
          </div>

          <!-- 风速控制 -->
          <div class="controls-section">
            <div class="control-chips">
              ${this._getFanModes().map(
                (fan) => html`
                  <mwc-button
                    class="control-chip ${fanMode === fan.mode ? "active" : ""}"
                    @click=${() => this._handleSetFanMode(fan.mode)}
                    ?disabled=${isOff}
                  >
                    <ha-icon icon=${fan.icon}></ha-icon>
                  </mwc-button>
                `
              )}
              ${this.hass.states[beepSwitch]
                ? html`
                    <mwc-button
                      class="control-chip ${beepState ? "active" : ""}"
                      @click=${() => this._handleToggleSwitch(beepSwitch)}
                    >
                      <ha-icon icon="mdi:volume-off"></ha-icon>
                    </mwc-button>
                  `
                : ""}
              ${this.hass.states[scheduleSwitch]
                ? html`
                    <mwc-button
                      class="control-chip ${scheduleState ? "active" : ""}"
                      @click=${() => this._handleToggleSwitch(scheduleSwitch)}
                    >
                      <ha-icon icon="mdi:clock-check"></ha-icon>
                    </mwc-button>
                  `
                : ""}
            </div>
          </div>

          <!-- 图表 - 使用内嵌的 mini-graph-card -->
          ${this.config.show_graph !== false &&
          (this._tempEntity || this._humiEntity)
            ? html`
                <div class="graph-section">
                  <div class="graph-placeholder">
                    <p>图表功能需要 mini-graph-card 支持</p>
                    <p>温度: ${this._tempEntity?.state || "N/A"}</p>
                    <p>湿度: ${this._humiEntity?.state || "N/A"}</p>
                  </div>
                </div>
              `
            : ""}
        </div>
      </ha-card>
    `;
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

  static get styles() {
    return css`
      .air-conditioner-card {
        padding: 25px;
        border-radius: 12px;
        transition: background 0.3s ease;
      }

      .air-conditioner-card.制热 {
        background: linear-gradient(
          145deg,
          rgba(247, 198, 157, 1) -30%,
          rgba(255, 255, 255, 1) 50%
        );
      }

      .air-conditioner-card.制冷 {
        background: linear-gradient(
          145deg,
          rgba(100, 149, 237, 1) -30%,
          rgba(255, 255, 255, 1) 50%
        );
      }

      .air-conditioner-card.除湿 {
        background: linear-gradient(
          145deg,
          rgba(132, 112, 255, 1) -30%,
          rgba(255, 255, 255, 1) 50%
        );
      }

      .air-conditioner-card.送风 {
        background: linear-gradient(
          145deg,
          rgba(0, 188, 212, 1) -30%,
          rgba(255, 255, 255, 1) 50%
        );
      }

      .air-conditioner-card.off {
        background: var(--card-background-color, #fff);
      }

      .card-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .title-section {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .icon-wrapper ha-icon {
        width: 64px;
        height: 64px;
        color: var(--mode-color, var(--primary-color));
      }

      .title-info {
        display: flex;
        flex-direction: column;
      }

      .label {
        font-size: 26px;
        font-weight: 300;
        color: rgba(0, 0, 0, 0.85);
      }

      .status {
        font-size: 14px;
        font-weight: 400;
        text-transform: uppercase;
        color: rgba(0, 0, 0, 0.85);
        margin-top: 6px;
      }

      .temperature-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
      }

      .current-temp {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .temp-icon {
        width: 40px;
        height: 40px;
        color: rgba(0, 0, 0, 0.6);
      }

      .temp-value {
        font-size: 40px;
        font-weight: 300;
        color: rgba(0, 0, 0, 0.85);
      }

      .temp-controls {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .temp-btn {
        min-width: 40px;
        --mdc-theme-primary: rgba(0, 0, 0, 0.85);
      }

      .target-temp {
        font-size: 32px;
        font-weight: 300;
        color: rgba(0, 0, 0, 0.85);
        min-width: 60px;
        text-align: center;
      }

      .mode-section,
      .controls-section {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .mode-chip,
      .control-chip {
        min-width: 60px;
        padding: 8px 12px;
        border-radius: 20px;
        --mdc-theme-primary: var(--mode-color, var(--primary-color));
      }

      .mode-chip.active,
      .control-chip.active {
        background-color: var(--mode-color, var(--primary-color));
        color: white;
      }

      .control-chip {
        min-width: 44px;
        min-height: 44px;
        padding: 8px;
      }

      .graph-section {
        margin-top: 12px;
      }

      .error {
        padding: 16px;
        color: var(--error-color);
      }
    `;
  }
}

customElements.define("air-conditioner-card", AirConditionerCard);

// 注册到 window.customCards（可选，但有助于 HACS 识别）
window.customCards = window.customCards || [];
window.customCards.push({
  type: "air-conditioner-card",
  name: "Air Conditioner Card",
  description: "空调控制自定义卡片",
});
