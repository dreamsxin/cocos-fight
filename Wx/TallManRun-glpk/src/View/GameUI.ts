import GameLogic from "../Crl/GameLogic"
import PlayerDataMgr from "../Libs/PlayerDataMgr"
import Utility from "../Mod/Utility"
import FdMgr from "../FanDong/FdMgr"

export default class GameUI extends Laya.Scene {
    constructor() {
        super()
    }
    static Share: GameUI

    gradeNum: Laya.FontClip
    coinNum: Laya.FontClip
    touchBtn: Laya.Image
    playerHp: Laya.ProgressBar
    bossHp: Laya.ProgressBar
    guideAni: Laya.Animation
    tipsNode: Laya.Image

    touchStartPosX: number = 0

    onOpened() {
        GameUI.Share = this
        this.size(Laya.stage.displayWidth, Laya.stage.displayHeight)
        Laya.timer.frameLoop(1, this, this.myUpdate)
        this.gradeNum.value = PlayerDataMgr.getPlayerData().grade.toString()
        this.touchBtn.on(Laya.Event.MOUSE_DOWN, this, this.touchStart)
        this.touchBtn.on(Laya.Event.MOUSE_MOVE, this, this.touchMove)
        this.touchBtn.on(Laya.Event.MOUSE_UP, this, this.touchEnd)
        FdMgr.inGame()
    }
    onClosed() {
        Laya.timer.clearAll(this)
    }

    touchStart(evt: Laya.Event) {
        if (GameLogic.Share.isGameOver) return
        if (GameLogic.Share.isFinish) {
            return
        }
        if (!GameLogic.Share.isStartGame) {
            this.guideAni.visible = false
            GameLogic.Share.gameStart()
        }
        let x = evt.stageX
        GameLogic.Share._playerCrl.touchX = x
    }
    touchMove(evt: Laya.Event) {
        if (GameLogic.Share.isGameOver) return
        if (GameLogic.Share.isFinish) {
            return
        }
        let x = evt.stageX
        GameLogic.Share._playerCrl.touchX = x
    }
    touchEnd(evt: Laya.Event) {
        if (GameLogic.Share.isGameOver) return
        if (GameLogic.Share.isFinish) {
            return
        }
    }

    myUpdate() {
    }
}
