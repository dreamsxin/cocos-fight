import { _decorator, Component, Node, Label, RichText, Sprite, Animation } from 'cc';
import GameData from '../Crl/GameData';
import { GameLogic } from '../Crl/GameLogic';
import { Player } from '../Crl/Player';
import { UINode } from '../Crl/UINode';
import BundleMgr from '../Mod/BundleMgr';
import { UIType } from '../Mod/Entity';
import PlayerDataMgr from '../Mod/PlayerDataMgr';
import { SoundMgr } from '../Mod/SoundMgr';
const { ccclass, property } = _decorator;

@ccclass('WeaponEnchantUI')
export class WeaponEnchantUI extends Component {

    @property(Node)
    player: Node = null
    @property(Node)
    playerWeapon: Node = null
    @property(Node)
    itemNode: Node = null
    @property(RichText)
    atkStr1: RichText = null
    @property(RichText)
    atkStr2: RichText = null

    hadInit: boolean = false

    onEnable() {
        this.resetPlayerWeapon()
        this.updateItem()
        //this.updateStr()
    }

    resetPlayerWeapon() {
        BundleMgr.setSpriteFrameInBundle(GameData.getWeaponDir(PlayerDataMgr.getPlayerData().weaponId, PlayerDataMgr.getWeaponEnchantType()), this.playerWeapon.getComponent(Sprite))

        let weaponType = GameData.weaponData[PlayerDataMgr.getPlayerData().weaponId].type
        this.player.getComponent(Animation).play('Idle' + (weaponType + 1))
    }

    updateItem() {
        for (let i = 0; i < this.itemNode.children.length; i++) {
            let item = this.itemNode.children[i]

            let num = item.getChildByName('text').getChildByName('num').getComponent(Label)
            let enchantBtn = item.getChildByName('enchantBtn')
            num.string = PlayerDataMgr.getPlayerData().enchantArr[i].toString()

            if (!this.hadInit) {
                enchantBtn.on(Node.EventType.TOUCH_END, () => { this.enchantBtnCB(i) }, this)
            }
        }
        this.hadInit = true
    }

    updateStr() {
        let weaponId = PlayerDataMgr.getPlayerData().weaponId
        let enchantType = PlayerDataMgr.getPlayerData().weaponEnchantTypeArr[weaponId]
        let enchantCount = PlayerDataMgr.getPlayerData().weaponEnchantArr[weaponId]
        if (enchantType == 0) {
            this.atkStr1.string = '<color=#ffffff>???</color>'
            this.atkStr2.string = '<color=#ffffff>???</color>'
        } else {
            switch (enchantType) {
                case 1:
                    this.atkStr1.string = '<color=#ffffff>??????</color><color=#ff9601>' + (enchantCount).toString() + '%</color><color=#ffffff>??????????????????</color>'
                    this.atkStr2.string = '<color=#00ff00>??????</color><color=#ff0000>' + (enchantCount + 1).toString() + '%</color><color=#00ff00>??????????????????</color>'
                    break
                case 2:
                    this.atkStr1.string = '<color=#ffffff>??????</color><color=#ff9601>' + (enchantCount).toString() + '%</color><color=#ffffff>??????????????????</color>'
                    this.atkStr2.string = '<color=#00ff00>??????</color><color=#ff0000>' + (enchantCount + 1).toString() + '%</color><color=#00ff00>??????????????????</color>'
                    break
                case 3:
                    this.atkStr1.string = '<color=#ffffff>??????</color><color=#ff9601>' + (enchantCount).toString() + '%</color><color=#ffffff>??????????????????</color>'
                    this.atkStr2.string = '<color=#00ff00>??????</color><color=#ff0000>' + (enchantCount + 1).toString() + '%</color><color=#00ff00>??????????????????</color>'
                    break
                case 4:
                    this.atkStr1.string = '<color=#ffffff>??????</color><color=#ff9601>' + (enchantCount).toString() + '%</color><color=#ffffff>??????????????????</color>'
                    this.atkStr2.string = '<color=#00ff00>??????</color><color=#ff0000>' + (enchantCount + 1).toString() + '%</color><color=#00ff00>??????????????????</color>'
                    break
            }
        }
    }

    enchantBtnCB(id: number) {
        SoundMgr.Share.PlaySound('click')
        let weaponId = PlayerDataMgr.getPlayerData().weaponId
        if (PlayerDataMgr.getPlayerData().enchantArr[id] <= 0) {
            //????????????
            UINode.Share.showUI(UIType.UI_GOTOSHOP, false, () => {
                UINode.Share.showUI(UIType.UI_WEAPONENCHANT)
            })
            return
        }
        if (PlayerDataMgr.getPlayerData().weaponEnchantTypeArr[weaponId] > 0 && PlayerDataMgr.getPlayerData().weaponEnchantTypeArr[weaponId] != id + 1) {
            GameLogic.Share.createTips('?????????????????????????????????')
            return
        }
        GameLogic.Share.createTips('??????????????????')
        PlayerDataMgr.getPlayerData().enchantArr[id]--
        PlayerDataMgr.getPlayerData().weaponEnchantArr[weaponId]++
        PlayerDataMgr.getPlayerData().weaponEnchantTypeArr[weaponId] = id + 1
        PlayerDataMgr.setPlayerData()
        this.updateItem()
        //this.updateStr()
        this.resetPlayerWeapon()
    }

    closeBtnCB() {
        SoundMgr.Share.PlaySound('click')
        UINode.Share.showUI(UIType.UI_START)
        Player.Share.changeWeapon()
        Player.Share.resetData()
    }

    update(deltaTime: number) {
        this.updateStr()
    }
}

