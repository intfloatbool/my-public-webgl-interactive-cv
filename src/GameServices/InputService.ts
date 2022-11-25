export enum EInputEventType
{
    NONE = "NONE",
    FORWARD_KEY_CLICK = "FORWARD_KEY",
    BACKWARD_KEY_CLICK = "BACKWARD_KEY",
    LEFT_KEY_CLICK = "LEFT_KEY",
    RIGHT_KEY_CLICK = "RIGHT_KEY",
    SPACE_KEY_CLICK = "SPACE_KEY"
}
export class InputService  {
    public OnDownEvTarget: EventTarget;
    public OnUpEvTarget: EventTarget;
    private _keyMaps: Map<EInputEventType, boolean>;
    private _isTouchHold: boolean = false;
    private _touchYDir: number = 0;
    constructor() {

        this.OnDownEvTarget = new EventTarget();
        this.OnUpEvTarget = new EventTarget();

        this._keyMaps = new Map();
        window.onkeydown = this.handleOnWindowKeyDown.bind(this);
        window.onkeyup = this.handleOnWindowKeyUp.bind(this);
        window.ontouchmove = this.handleOnTouchMove.bind(this);
        window.ontouchstart = this.handleOnTouchStart.bind(this);
        window.ontouchend = this.handleOnTouchEnd.bind(this);
    }

    handleOnTouchStart(evt: TouchEvent) {
       //console.log("Touch start!" + evt); 
       this._isTouchHold = true;
    }

    handleOnTouchEnd(evt: TouchEvent) {
        //console.log("Touch end!" + evt); 
        this._isTouchHold = false;
        this._touchYDir = 0;
    }

    handleOnTouchMove(evt: TouchEvent) {
        evt.preventDefault();
        
        const touches = evt.changedTouches;
        let lastTouchY = 0;
        for(let i = 0; i < touches.length; i++) {
            const touch = touches.item(i);
            if(touch)  {
                //console.log("Touch! INfo: client Y: " + touch.clientY);

                if(touch.clientY > lastTouchY) {
                    this._touchYDir = 1;
                } else {
                    this._touchYDir = -1;
                }

                lastTouchY = touch.clientY;
            }
            
        }
        
    }

    GetTouchDirectionY() {
        return this._touchYDir;
    }

    GetIsTouchHold() : boolean {
        return this._isTouchHold;
    }

    getIsDown(key: EInputEventType) : boolean
    {
        return this._keyMaps.get(key) ?? false;
    }

    handleOnWindowKeyUp(ev: KeyboardEvent ) {
        const inputType = this.getInputEventTypeByKey(ev.key);
        this.OnUpEvTarget.dispatchEvent(new Event(inputType));
        this._keyMaps.set(inputType, false);
    }

    handleOnWindowKeyDown(ev: KeyboardEvent ) {
        if(ev.repeat) return;
        const inputType = this.getInputEventTypeByKey(ev.key);
        this.OnDownEvTarget.dispatchEvent(new Event(inputType));
        this._keyMaps.set(inputType, true);
    }

    getInputEventTypeByKey(key: string) : EInputEventType
    {
        let inputEvType: EInputEventType = EInputEventType.NONE;

        if(key === "w")
        {
            inputEvType = EInputEventType.FORWARD_KEY_CLICK;
        }
        else if(key === "a")
        {
            inputEvType = EInputEventType.LEFT_KEY_CLICK;           
        }
        else if(key === "s")
        {
            inputEvType = EInputEventType.BACKWARD_KEY_CLICK;
        }
        else if(key === "d")
        {
            inputEvType = EInputEventType.RIGHT_KEY_CLICK;
        }
        else if(key === "ArrowUp")
        {
            inputEvType = EInputEventType.FORWARD_KEY_CLICK;
        }
        else if(key === "ArrowLeft")
        {
            inputEvType = EInputEventType.LEFT_KEY_CLICK;
        }
        else if(key === "ArrowDown")
        {
            inputEvType = EInputEventType.BACKWARD_KEY_CLICK;
        }
        else if(key === "ArrowRight")
        {
            inputEvType = EInputEventType.RIGHT_KEY_CLICK;
        }
        else if(key === " ")
        {
            inputEvType = EInputEventType.SPACE_KEY_CLICK;
        }
        else if(key === "ц")
        {
            inputEvType = EInputEventType.FORWARD_KEY_CLICK;
        }
        else if(key === "ф")
        {
            inputEvType = EInputEventType.LEFT_KEY_CLICK;           
        }
        else if(key === "ы")
        {
            inputEvType = EInputEventType.BACKWARD_KEY_CLICK;
        }
        else if(key === "в")
        {
            inputEvType = EInputEventType.RIGHT_KEY_CLICK;
        }

        return inputEvType;
    }
}