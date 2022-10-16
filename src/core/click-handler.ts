import { fireEvent } from 'custom-card-helpers';
import { HueDialog } from '../hue-dialog/dialog';
import { HueLikeLightCardConfig } from '../types/config';
import { ClickAction } from '../types/types';
import { LightController } from './light-controller';

class ActionParameters {
    constructor(entity: string | undefined = undefined) {
        this.entity = entity;
    }

    readonly entity?: string;
}

export class ClickHandler {
    private _config: HueLikeLightCardConfig;
    private _ctrl: LightController;
    private _el: HTMLElement | Window;

    constructor(config: HueLikeLightCardConfig, ctrl: LightController, element: HTMLElement | Window) {
        this._config = config;
        this._ctrl = ctrl;
        this._el = element;
    }

    public handleClick() : void {
        const isOn = this._ctrl.isOn();
        let action = isOn ? this._config.onClick : this._config.offClick;

        // resolve the default action
        if (action == ClickAction.Default) {
            if (isOn) {
                action = this.resolveDefaultWhenOn();
            } else {
                action = this.resolveDefaultWhenOff();
            }
        }

        // executed resolved or config action
        this.executeClickAction(action, new ActionParameters(this._config.getEntities()[0]));
    }

    private resolveDefaultWhenOn() : ClickAction {
        if (this._ctrl.count == 1) {
            return ClickAction.MoreInfo;
        } else if (this._ctrl.count > 1) {
            return ClickAction.HueScreen;
        }

        return ClickAction.TurnOff;
    }

    private resolveDefaultWhenOff() : ClickAction {
        if (this._ctrl.count == 1) {
            return ClickAction.MoreInfo;
        } else if (this._ctrl.count > 1) {
            return ClickAction.HueScreen;
        }

        return ClickAction.TurnOn;
    }

    private executeClickAction(action: ClickAction, parameters: ActionParameters) {
        switch (action) {
            case ClickAction.NoAction:
                break;
            case ClickAction.TurnOn:
                this._ctrl.turnOn();
                break;
            case ClickAction.TurnOff:
                this._ctrl.turnOff();
                break;
            case ClickAction.MoreInfo:
                fireEvent(this._el, 'hass-more-info', { entityId: parameters.entity });
                break;
            case ClickAction.Scene:
                // TODO: add scenes to config + add scene selector
                throw new Error('NotImplementedException');
            case ClickAction.HueScreen:
                const dialog = new HueDialog(this._config, this._ctrl);
                dialog.show();
                break;

            case ClickAction.Default:
                throw new Error('Cannot execute Default action');
            default:
                throw new Error(`Cannot executed unwknow action ${action}.`);
        }
    }
}