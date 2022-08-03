import { _decorator, Component, Node, EventKeyboard, input, Input, KeyCode, EventTouch, UITransform, v3, ProgressBar, Button } from 'cc';
import { PREVIEW } from 'cc/env';
import PlayerDataMgr from '../Mod/PlayerDataMgr';
import GameData from './GameData';
import { Player } from './Player';
const { ccclass, property } = _decorator;

@ccclass('JoyStick')
export class JoyStick extends Component {

    StickNode: Node = null
    AtkBtn: Node = null
    Skill1Btn: Node = null
    Skill2Btn: Node = null
    FlashBtn: Node = null
    AwakenBtn: Node = null

    skill1Light: Node = null
    skill2Light: Node = null
    awakenLight: Node = null

    onLoad() {
        this.StickNode = this.node.getChildByName('Stick')
        this.AtkBtn = this.node.getChildByName('BtnNode').getChildByName('atkBtn')
        this.Skill1Btn = this.node.getChildByName('BtnNode').getChildByName('skill1Btn')
        this.Skill2Btn = this.node.getChildByName('BtnNode').getChildByName('skill2Btn')
        this.FlashBtn = this.node.getChildByName('BtnNode').getChildByName('flashBtn')
        this.AwakenBtn = this.node.getChildByName('BtnNode').getChildByName('awakenBtn')
        this.skill1Light = this.Skill1Btn.getChildByName('light')
        this.skill2Light = this.Skill2Btn.getChildByName('light')
        this.awakenLight = this.AwakenBtn.getChildByName('light')
    }

    start() {
        // [3]
        if (PREVIEW) {
            input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
            input.on(Input.EventType.KEY_UP, this.onKeyUp, this)
        }

        this.AtkBtn.on(Node.EventType.TOUCH_START, this.attackCB, this)
        this.Skill1Btn.on(Node.EventType.TOUCH_START, this.skill1CB, this)
        this.Skill2Btn.on(Node.EventType.TOUCH_START, this.skill2CB, this)
        this.FlashBtn.on(Node.EventType.TOUCH_START, this.flashCB, this)
        this.AwakenBtn.on(Node.EventType.TOUCH_START, this.awakenCB, this)

        this.StickNode.on(Node.EventType.TOUCH_START, this.stickTouchMove, this)
        this.StickNode.on(Node.EventType.TOUCH_MOVE, this.stickTouchMove, this)
        this.StickNode.on(Node.EventType.TOUCH_END, this.stickTouchEnd, this)
        this.StickNode.on(Node.EventType.TOUCH_CANCEL, this.stickTouchEnd, this)
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.moveCB(-1)
                break
            case KeyCode.KEY_D:
                this.moveCB(1)
                break
            case KeyCode.KEY_J:
                this.attackCB()
                break
            case KeyCode.KEY_K:
                this.flashCB()
                break
            case KeyCode.KEY_U:
                this.skill1CB()
                break
            case KeyCode.KEY_I:
                this.skill2CB()
                break
            case KeyCode.KEY_L:
                this.awakenCB()
                break
        }
    }
    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.resetMoveCB()
                break
            case KeyCode.KEY_D:
                this.resetMoveCB()
                break
        }
    }

    stickTouchMove(evt: EventTouch) {
        let pos = evt.getUILocation()
        let p = v3(pos.x, pos.y, 0)
        this.StickNode.getComponent(UITransform).convertToNodeSpaceAR(p, p)
        p.y = 0
        if (p.x < -80) p.x = -80
        if (p.x > 80) p.x = 80
        this.StickNode.getChildByName('pic').position = p
        this.moveCB(p.x > 0 ? 1 : -1)
    }
    stickTouchEnd(evt: EventTouch) {
        this.StickNode.getChildByName('pic').position = v3(0, 0, 0)
        this.resetMoveCB()
    }

    moveCB(dirX: number) {
        Player.Share.setMoveDir(dirX)
    }
    resetMoveCB() {
        Player.Share.setMoveDir(0)
        Player.Share.resetMove()
    }

    attackCB() {
        Player.Share.attack()
    }

    flashCB() {
        Player.Share.flash()
    }

    skill1CB() {
        if (Player.Share.isSkill1Cooling) return
        Player.Share.skill1()
    }

    skill2CB() {
        if (Player.Share.isSkill2Cooling) return
        Player.Share.skill2()
    }

    awakenCB() {
        if (Player.Share.awakenNum < 100) return
        Player.Share.awaken()
    }

    update(deltaTime: number) {
        this.AwakenBtn.children[0].active = Player.Share.awakenNum < 100

        this.skill1Light.active = Player.Share.isSkill1CoolDone
        this.skill2Light.active = Player.Share.isSkill2CoolDone
        this.awakenLight.active = Player.Share.awakenNum >= 100
        // this.Skill1Btn.getComponent(Button).interactable = !Player.Share.isSkill1Cooling
        // this.Skill2Btn.getComponent(Button).interactable = !Player.Share.isSkill2Cooling
        this.Skill1Btn.getComponentInChildren(ProgressBar).progress = Player.Share.skill1CoolTime / GameData.skillCoolTime[PlayerDataMgr.getPlayerData().weaponId][0]
        this.Skill2Btn.getComponentInChildren(ProgressBar).progress = Player.Share.skill2CoolTime / GameData.skillCoolTime[PlayerDataMgr.getPlayerData().weaponId][1]
    }
}

