
import { _decorator, Component, Node, ProgressBar, Animation } from 'cc';
import { WECHAT } from 'cc/env';
import FdAd from './FdAd';
import FdMgr from './FdMgr';
const { ccclass, property } = _decorator;

@ccclass('Box1')
export class Box1 extends Component {

    @property(Node)
    box: Node = null
    @property(ProgressBar)
    pBar: ProgressBar = null

    hadShowBanner: boolean = false
    onShowCB: Function = null
    ccb: Function = null
    progressValue: number = 0;

    onDisable() {
        if (WECHAT) {
            window['qq'].offShow(this.onShowCB)
        }
        this.unscheduleAllCallbacks()
        FdAd.hideBannerAd();
        this.ccb && this.ccb()
    }

    showUI(ccb?: Function) {
        this.node.active = true
        this.pBar.progress = 0
        this.progressValue = 0
        this.hadShowBanner = false
        this.ccb = ccb
        this.onShowCB = () => {
            this.node.active = false
        }
        if (WECHAT) {
            window['qq'].onShow(this.onShowCB)
        }
        FdAd.hideBannerAd();
    }

    clickBtnCB() {
        this.progressValue += FdMgr.wuchuProgressStepAdd;
        this.box.getComponent(Animation).play()
        if (this.progressValue >= FdMgr.wuchuProgressValue && !this.hadShowBanner) { //触发误触
            this.hadShowBanner = true
            FdAd.showBannerAd();
            FdMgr.randTouchProgress(); //更新目标值
            this.scheduleOnce(() => {
                this.node.active = false
            }, 2)
        }
    }

    update(deltaTime: number) {
        if (this.progressValue > FdMgr.wuchuProgressFrameSub) {
            this.progressValue -= FdMgr.wuchuProgressFrameSub;
        }
        this.pBar.progress = this.progressValue;
    }
}