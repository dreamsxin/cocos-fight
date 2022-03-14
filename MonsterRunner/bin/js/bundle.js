(function () {
    'use strict';

    class PlayerData {
        constructor() {
            this.grade = 1;
            this.skinArr = [1, 0, 0];
            this.skinId = 0;
        }
    }
    class PlayerDataMgr {
        static getPlayerData() {
            if (!localStorage.getItem('playerData')) {
                this._playerData = new PlayerData();
                localStorage.setItem('playerData', JSON.stringify(this._playerData));
            }
            else {
                if (this._playerData == null) {
                    this._playerData = JSON.parse(localStorage.getItem('playerData'));
                }
            }
            return this._playerData;
        }
        static setPlayerData() {
            localStorage.setItem('playerData', JSON.stringify(this._playerData));
        }
    }
    PlayerDataMgr._playerData = null;

    class WxApi {
        static LoginWx(cb) {
            if (!Laya.Browser.onWeiXin)
                return;
            let launchData = Laya.Browser.window.wx.getLaunchOptionsSync();
            Laya.Browser.window.wx.login({
                success(res) {
                    if (res.code) {
                        console.log('res.code:', res.code);
                        if (cb) {
                            cb(res.code, launchData.query);
                        }
                    }
                }
            });
        }
        static GetLaunchParam(fun) {
            if (Laya.Browser.onWeiXin) {
                this.OnShowFun = fun;
                fun(this.GetLaunchPassVar());
                Laya.Browser.window.wx.onShow((para) => {
                    if (this.OnShowFun != null) {
                        this.OnShowFun(para);
                    }
                    console.log("wx on show");
                });
            }
        }
        static GetLaunchPassVar() {
            if (Laya.Browser.onWeiXin) {
                return Laya.Browser.window.wx.getLaunchOptionsSync();
            }
            else {
                return null;
            }
        }
        static WxOnHide(fun) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.onHide(fun);
            }
        }
        static WxOffHide(fun) {
            if (fun && Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.offHide(fun);
            }
        }
        static WxOnShow(fun) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.onShow(fun);
            }
        }
        static WxOffShow(fun) {
            if (fun && Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.offShow(fun);
            }
        }
        static httpRequest(url, params, type = 'get', completeHandler) {
            var xhr = new Laya.HttpRequest();
            xhr.http.timeout = 5000;
            xhr.once(Laya.Event.COMPLETE, this, completeHandler);
            xhr.once(Laya.Event.ERROR, this, this.httpRequest, [url, params, type, completeHandler]);
            if (type == "get") {
                xhr.send(url + '?' + params, "", type, "text");
            }
            else if (type == "post") {
                xhr.send(url, JSON.stringify(params), type, "text");
            }
        }
        static DoVibrate(isShort = true) {
            if (Laya.Browser.onWeiXin && this.isVibrate) {
                if (isShort) {
                    Laya.Browser.window.wx.vibrateShort();
                }
                else {
                    Laya.Browser.window.wx.vibrateLong();
                }
            }
        }
        static OpenAlert(msg, dur = 2000, icon = false) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.showToast({
                    title: msg,
                    duration: dur,
                    mask: false,
                    icon: icon ? 'success' : 'none',
                });
            }
        }
        static preViewImage(url) {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.previewImage({
                    current: url,
                    urls: [url]
                });
            }
        }
    }
    WxApi.UnityPath = 'LayaScene_SampleScene/Conventional/';
    WxApi.version = '';
    WxApi.isVibrate = true;
    WxApi.isMusic = true;
    WxApi.OnShowFun = null;

    class CameraCrl extends Laya.Script {
        constructor() {
            super();
        }
        onAwake() {
            this.myOwner = this.owner;
        }
        onDisable() {
        }
        onUpdate() {
        }
    }

    class SoundMgr {
        constructor() {
            this.effectArr = [];
        }
        static get instance() {
            if (!this._instance) {
                this._instance = new SoundMgr();
            }
            return this._instance;
        }
        initLoading(fun) {
            var resUrl = [
                { url: 'res/Sounds/Click.mp3', type: Laya.Loader.SOUND },
                { url: 'res/Sounds/Get.mp3', type: Laya.Loader.SOUND },
                { url: 'res/Sounds/Hurt.mp3', type: Laya.Loader.SOUND },
                { url: 'res/Sounds/Win.mp3', type: Laya.Loader.SOUND },
                { url: 'res/Sounds/Lose.mp3', type: Laya.Loader.SOUND }
            ];
            Laya.loader.load(resUrl, Laya.Handler.create(this, fun));
            Laya.SoundManager.setMusicVolume(1);
            Laya.SoundManager.setSoundVolume(1);
        }
        playMusic(str, loops = 0, cb) {
            Laya.SoundManager.playMusic('res/Sounds/' + str, loops, new Laya.Handler(this, cb));
        }
        stopMusic() {
            Laya.SoundManager.stopMusic();
        }
        playSoundEffect(str, loops = 1, cb, soundClass, startTime) {
            return Laya.SoundManager.playSound('res/Sounds/' + str, loops, new Laya.Handler(this, cb), soundClass, startTime);
        }
        stopSound(str) {
            Laya.SoundManager.stopSound('res/Sounds/' + str);
        }
    }

    class Utility {
        static calcDistance(a, b) {
            return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        }
        static getWorldDis(a, b) {
            let pA = a.transform.position.clone();
            let pB = b.transform.position.clone();
            return Laya.Vector3.distance(pA, pB);
        }
        static getDirectionAToB(A, B, normalize = true) {
            let pA = A.transform.position.clone();
            let pB = B.transform.position.clone();
            let dir = new Laya.Vector3(0, 0, 0);
            Laya.Vector3.subtract(pB, pA, dir);
            if (normalize)
                Laya.Vector3.normalize(dir, dir);
            return dir;
        }
        static fixPosY(y, designHeight = 1334) {
            return y * Laya.stage.displayHeight / designHeight;
        }
        static findNodeByName(rootNode, name) {
            let targetNode = null;
            let funC = (node) => {
                for (let i = 0; i < node.numChildren; i++) {
                    if (node.getChildAt(i).name == name) {
                        targetNode = node.getChildAt(i);
                        return;
                    }
                    else {
                        funC(node.getChildAt(i));
                    }
                }
            };
            funC(rootNode);
            return targetNode;
        }
        static TmoveTo(node, duration, des, cb, ease) {
            if (!node.transform)
                return;
            let t = new Laya.Tween();
            var posOld = node.transform.position;
            t.to(node.transform.position, {
                x: des.x,
                y: des.y,
                z: des.z,
                update: new Laya.Handler(this, () => {
                    if (!node.transform)
                        return;
                    node.transform.position = posOld;
                })
            }, duration, ease, Laya.Handler.create(this, () => {
                cb && cb();
            }));
        }
        static TmoveToYZ(node, duration, des, cb, ease) {
            if (!node.transform)
                return;
            let t = new Laya.Tween();
            var posOld = node.transform.position;
            t.to(node.transform.position, {
                y: des.y,
                z: des.z,
                update: new Laya.Handler(this, () => {
                    if (node.transform)
                        node.transform.position = posOld;
                })
            }, duration, null, Laya.Handler.create(this, () => {
                cb && cb();
            }));
            return t;
        }
        static TmoveToX(node, duration, des, cb, ease) {
            if (!node.transform)
                return;
            let t = new Laya.Tween();
            var posOld = node.transform.localPosition;
            t.to(node.transform.localPosition, {
                x: des.x,
                update: new Laya.Handler(this, () => {
                    if (node.transform)
                        node.transform.localPosition = posOld;
                })
            }, duration, null, Laya.Handler.create(this, () => {
                cb && cb();
            }));
        }
        static TmoveToY(node, duration, des, cb, ease) {
            if (!node.transform)
                return;
            let t = new Laya.Tween();
            var posOld = node.transform.localPosition;
            t.to(node.transform.localPosition, {
                y: des.y,
                update: new Laya.Handler(this, () => {
                    if (node.transform)
                        node.transform.localPosition = posOld;
                })
            }, duration, ease, Laya.Handler.create(this, () => {
                cb && cb();
            }));
        }
        static TmoveToWorld(node, duration, des, cb, ease) {
            if (!node.transform)
                return;
            let t = new Laya.Tween();
            var posOld = node.transform.position;
            t.to(node.transform.position, {
                y: des.y,
                update: new Laya.Handler(this, () => {
                    if (node.transform)
                        node.transform.position = posOld;
                })
            }, duration, null, Laya.Handler.create(this, () => {
                cb && cb();
            }));
        }
        static RotateWithPoint(node, dir, angle) {
            let desPos = new Laya.Vector3();
            let p = node.transform.localPosition.clone();
            angle = angle * Math.PI / 180;
            desPos.x = p.x * Math.cos(angle) + (dir.y * p.z - dir.z * p.y) * Math.sin(angle) +
                dir.x * (dir.x * p.x + dir.y * p.y + dir.z * p.z) * (1 - Math.cos(angle));
            desPos.y = p.y * Math.cos(angle) + (dir.x * p.z - dir.z * p.x) * Math.sin(angle) +
                dir.y * (dir.x * p.x + dir.y * p.y + dir.z * p.z) * (1 - Math.cos(angle));
            desPos.z = p.z * Math.cos(angle) + (dir.x * p.y - dir.y * p.x) * Math.sin(angle) +
                dir.z * (dir.x * p.x + dir.y * p.y + dir.z * p.z) * (1 - Math.cos(angle));
            return desPos;
        }
        static RotateTo(node, duration, des, cb) {
            var rotationOld = node.transform.rotationEuler;
            Laya.Tween.to(node.transform.rotationEuler, {
                x: des.x,
                y: des.y,
                z: des.z,
                update: new Laya.Handler(this, function () {
                    if (node)
                        node.transform.rotationEuler = rotationOld;
                })
            }, duration, Laya.Ease.cubicOut, Laya.Handler.create(this, function () {
                cb && cb();
            }));
        }
        static tMove2D(node, x, y, t, cb) {
            Laya.Tween.to(node, { x: x, y: y }, t, null, new Laya.Handler(this, () => {
                if (cb)
                    cb();
            }));
        }
        static scaleTo2D(node, s, t, cb) {
            Laya.Tween.to(node, { scaleX: s, scaleY: s }, t, null, new Laya.Handler(this, () => {
                if (cb)
                    cb();
            }));
        }
        static alphaTo2D(node, s, t, cb) {
            Laya.Tween.to(node, { alpha: s }, t, null, new Laya.Handler(this, () => {
                if (cb)
                    cb();
            }));
        }
        static updateNumber(baseNum, times, label, labelOrFont = true, inclease, cb) {
            let timesNum = baseNum * times;
            let dt = Math.floor((timesNum - baseNum) / 60);
            dt = dt <= 0 ? 1 : dt;
            let func = () => {
                if (inclease) {
                    baseNum += dt;
                    if (baseNum >= timesNum) {
                        baseNum = timesNum;
                        cb && cb();
                        Laya.timer.clear(this, func);
                    }
                    if (labelOrFont)
                        label.text = baseNum.toString();
                    else
                        label.value = baseNum.toString();
                }
                else {
                    timesNum -= dt;
                    if (timesNum <= baseNum) {
                        timesNum = baseNum;
                        cb && cb();
                        Laya.timer.clear(this, func);
                    }
                    if (labelOrFont)
                        label.text = timesNum.toString();
                    else
                        label.value = timesNum.toString();
                }
            };
            Laya.timer.frameLoop(1, this, func);
        }
        static loadJson(str, complete) {
            Laya.loader.load(str, Laya.Handler.create(this, complete), null, Laya.Loader.JSON);
        }
        static objectShake(target, shakeTime = 1, shakeAmount = 0.7) {
            var shake = shakeTime;
            var decreaseFactor = 1;
            var originalPos = target.transform.localPosition.clone();
            Laya.timer.frameLoop(1, this, updateShake);
            function randomPos() {
                var x = Math.random() > 0.5 ? Math.random() : -(Math.random());
                var y = Math.random() > 0.5 ? Math.random() : -(Math.random());
                return new Laya.Vector3(x, y, 0);
            }
            function updateShake() {
                if (shake > 0) {
                    var pos = new Laya.Vector3();
                    Laya.Vector3.scale(randomPos(), shakeAmount, pos);
                    Laya.Vector3.add(originalPos, pos, pos);
                    target.transform.localPosition = pos;
                    shake -= 0.02 * decreaseFactor;
                }
                else {
                    shake = 0;
                    target.transform.localPosition = originalPos;
                    Laya.timer.clear(this, updateShake);
                }
            }
        }
        static getRandomItemInArr(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }
        static shuffleArr(arr) {
            let i = arr.length;
            while (i) {
                let j = Math.floor(Math.random() * i--);
                [arr[j], arr[i]] = [arr[i], arr[j]];
            }
            return arr;
        }
        static GetRandom(mix, max, isInt = true) {
            let w = max - mix;
            let r1 = Math.random() * (w + 1);
            r1 += mix;
            return isInt ? Math.floor(r1) : r1;
        }
        static coinCollectAnim(startPos, endPos, parent, amount = 10, callBack) {
            let am = amount;
            for (var i = 0; i < amount; i++) {
                let coin = Laya.Pool.getItemByClass("coin", Laya.Image);
                coin.skin = "startUI/zy_zs_1.png";
                coin.x = startPos.x;
                coin.y = startPos.y;
                parent.addChild(coin);
                let time = 300 + Math.random() * 100 - 50;
                Laya.Tween.to(coin, { x: coin.x + Math.random() * 250 - 125, y: coin.y + Math.random() * 250 - 125 }, time);
                Laya.timer.once(time + 50, this, function () {
                    Laya.Tween.to(coin, { x: endPos.x, y: endPos.y }, 400, null, new Laya.Handler(this, function () {
                        parent.removeChild(coin);
                        Laya.Pool.recover("coin", coin);
                        am--;
                        if (am == 0 && callBack)
                            callBack();
                    }));
                });
            }
        }
        static scaleLoop(node, rate, t) {
            var tw = Laya.Tween.to(node, { scaleX: rate, scaleY: rate }, t, null, new Laya.Handler(this, () => {
                Laya.Tween.to(node, { scaleX: 1, scaleY: 1 }, t, null, new Laya.Handler(this, () => {
                    this.scaleLoop(node, rate, t);
                }));
            }));
        }
        static rotateLoop(node, rate, t) {
            var tw = Laya.Tween.to(node, { rotation: rate }, t, null, new Laya.Handler(this, () => {
                Laya.Tween.to(node, { rotation: -rate }, 2 * t, null, new Laya.Handler(this, () => {
                    Laya.Tween.to(node, { rotation: 0 }, t, null, new Laya.Handler(this, () => {
                        this.rotateLoop(node, rate, t);
                    }));
                }));
            }));
        }
        static visibleDelay(node, duration) {
            node.visible = false;
            Laya.timer.once(duration, this, () => { node.visible = true; });
        }
        static pointInPolygon(point, vs) {
            var x = point.x, y = point.y;
            var inside = false;
            for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                var xi = vs[i].x, yi = vs[i].y;
                var xj = vs[j].x, yj = vs[j].y;
                var intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect)
                    inside = !inside;
            }
            return inside;
        }
        static getSprite3DResByUrl(url, parent, worldPosStays = false) {
            let res = Laya.loader.getRes(WxApi.UnityPath + url);
            return Laya.Sprite3D.instantiate(res, parent, worldPosStays, new Laya.Vector3(0, 0, 0));
        }
        static getRandomItemInArrWithoutSelf(self, arr, count = 1) {
            let temp = [].concat(arr);
            temp.splice(temp.indexOf(self), 1);
            temp = this.shuffleArr(temp);
            return temp.slice(0, count);
        }
        static getBoundBox(node, fix = false) {
            let coll = node.getComponent(Laya.PhysicsCollider);
            let shape = coll.colliderShape;
            let pos = node.transform.position.clone();
            pos.x += shape.localOffset.x;
            pos.y += shape.localOffset.y;
            pos.z += shape.localOffset.z;
            let parent = node.parent;
            let sz = 1;
            if (parent && parent.transform && fix) {
                sz = parent.transform.localScaleZ;
            }
            let min = new Laya.Vector3(pos.x - shape.sizeX / 2, pos.y - shape.sizeY / 2, pos.z - shape.sizeZ / 2);
            let max = new Laya.Vector3(pos.x + shape.sizeX / 2, pos.y + shape.sizeY / 2, pos.z + (shape.sizeZ * sz / 2) / 2);
            return new Laya.BoundBox(min, max);
        }
        static getBoundBoxWithMinMax(min, max) {
            return new Laya.BoundBox(min, max);
        }
        static addClickEvent(btn, caller, callBack, param, isScale) {
            btn.offAllCaller(caller);
            if (btn instanceof Laya.Button && !isScale) {
                let callback = (event) => {
                    if (callBack)
                        callBack.call(caller, event);
                };
                btn.on(Laya.Event.CLICK, caller, callback, [param]);
            }
            else {
                let scaleTime = 60;
                let wRatio = 1;
                let scaleX = btn.scaleX * wRatio;
                let scaleY = btn.scaleY * wRatio;
                let size = 0.9 * wRatio;
                let isPressed = false;
                let cbDown = (event) => {
                    isPressed = true;
                    SoundMgr.instance.playSoundEffect('Click.mp3');
                    Laya.Tween.to(btn, { scaleX: size, scaleY: size }, scaleTime);
                };
                btn.on(Laya.Event.MOUSE_DOWN, caller, cbDown, [param]);
                let cbUp = (event) => {
                    if (isPressed == false)
                        return;
                    isPressed = false;
                    Laya.Tween.to(btn, { scaleX: scaleX, scaleY: scaleY }, scaleTime, null, new Laya.Handler(caller, () => {
                        if (callBack)
                            callBack.call(caller, event);
                    }));
                };
                btn.on(Laya.Event.MOUSE_UP, caller, cbUp, [param]);
                let cbOut = (event) => {
                    Laya.Tween.to(btn, { scaleX: scaleX, scaleY: scaleY }, scaleTime);
                };
                btn.on(Laya.Event.MOUSE_OUT, caller, cbOut, [param]);
            }
        }
        static getVector3(x, y, z) {
            return new Laya.Vector3(Number(x), Number(y), Number(z));
        }
    }

    class FdAd {
        static inidAd() {
            if (!Laya.Browser.onWeiXin)
                return;
            this.initBanner();
            this.createVideoAd();
            this.initGridAD();
        }
        static getSystemInfoSync() {
            if (!Laya.Browser.onWeiXin)
                return;
            if (!this.sysInfo) {
                this.sysInfo = window['wx'].getSystemInfoSync();
            }
            return this.sysInfo;
        }
        static initBanner() {
            if (!Laya.Browser.onWeiXin)
                return;
            this.bannerIdArr = Utility.shuffleArr(this.bannerIdArr);
            console.log('bannerId 数组排列：', this.bannerIdArr);
            if (!FdMgr.canTrapAll && this.bannerAds.length > 1) {
                this.bannerAds.splice(0, this.bannerAds.length - 1);
            }
            for (let i = 0; i < this.bannerIdArr.length; i++) {
                this.bannerTimesArr.push(0);
                this.bannerShowCount.push(0);
                this.bannerErrorArr.push(false);
            }
            for (let i = 0; i < this.bannerIdArr.length; i++) {
                let bannerAd = this.createBannerAd(i);
                this.bannerAds.push(bannerAd);
            }
        }
        static get isAllBannerError() {
            let isAllError = true;
            for (let i = 0; i < this.bannerErrorArr.length; i++) {
                if (!this.bannerErrorArr[i]) {
                    isAllError = false;
                    break;
                }
            }
            return isAllError;
        }
        static showBannerAd() {
            if (!Laya.Browser.onWeiXin)
                return;
            if (this.isAllBannerError) {
                this.stopCountBannerTime();
                return;
            }
            this.bannerAds[this.bannerIndex] && this.bannerAds[this.bannerIndex].show();
            this.stopCountBannerTime();
            if (!FdMgr.canTrapAll)
                return;
            Laya.timer.loop(100, this, this.countBannerTime);
        }
        static hideBannerAd() {
            if (!Laya.Browser.onWeiXin || this.isAllBannerError) {
                this.stopCountBannerTime();
                return;
            }
            this.bannerAds[this.bannerIndex] && this.bannerAds[this.bannerIndex].hide();
            this.stopCountBannerTime();
        }
        static countBannerTime() {
            this.bannerTimesArr[this.bannerIndex] += 0.1;
            if (this.bannerTimesArr[this.bannerIndex] >= FdMgr.jsonConfig.refresh_banner_time) {
                this.bannerAds[this.bannerIndex] && this.bannerAds[this.bannerIndex].hide();
                this.bannerTimesArr[this.bannerIndex] = 0;
                this.bannerShowCount[this.bannerIndex]++;
                if (this.bannerShowCount[this.bannerIndex] >= 3) {
                    this.bannerAds[this.bannerIndex] && this.bannerAds[this.bannerIndex].destroy();
                    this.bannerAds[this.bannerIndex] = null;
                    this.bannerAds[this.bannerIndex] = this.createBannerAd(this.bannerIndex);
                }
                this.bannerIndex++;
                if (this.bannerIndex >= this.bannerIdArr.length)
                    this.bannerIndex = 0;
                this.showBannerAd();
            }
        }
        static stopCountBannerTime() {
            Laya.timer.clear(this, this.countBannerTime);
        }
        static createBannerAd(index, isShow = false) {
            if (!Laya.Browser.onWeiXin)
                return;
            let sysInfo = this.getSystemInfoSync();
            let bannerAd = Laya.Browser.window['wx'].createBannerAd({
                adUnitId: this.bannerIdArr[index],
                style: {
                    top: sysInfo.screenHeight * 0.8,
                    width: 300,
                    left: sysInfo.screenWidth / 2 - 150
                },
                adIntervals: 30
            });
            bannerAd.onLoad(() => {
                if (isShow) {
                    bannerAd.show();
                }
                this.bannerErrorArr[index] = false;
                console.log("Banner广告加载成功");
            });
            bannerAd.onError(err => {
                this.bannerErrorArr[index] = true;
                console.error("Banner广告加载失败", JSON.stringify(err));
            });
            bannerAd.onResize(res => {
                let realHeight = bannerAd.style.realHeight + 0.1;
                bannerAd.style.top = sysInfo.screenHeight - realHeight;
            });
            return bannerAd;
        }
        static createVideoAd() {
            if (Laya.Browser.onWeiXin) {
                var self = this;
                var videoAd = this.videoAd;
                if (videoAd != null) {
                    videoAd.offLoad(onLoadVideo);
                    videoAd.offError(onErrorVideo);
                    videoAd.offClose(onCloseVideo);
                }
                var videoAd = Laya.Browser.window['wx'].createRewardedVideoAd({ adUnitId: self.videoId });
                videoAd.onLoad(onLoadVideo);
                videoAd.onError(onErrorVideo);
                videoAd.onClose(onCloseVideo);
                this.videoAd = videoAd;
            }
            function onLoadVideo() {
                console.log('video 加载成功');
                self.isExistVideoAd = true;
            }
            function onErrorVideo(err) {
                console.error('video 加载错误', err);
                self.isExistVideoAd = false;
            }
            function onCloseVideo(res) {
                let isEnded = (res && res.isEnded || res === undefined) ? true : false;
                if (isEnded) {
                    self.videoFinishCallback && self.videoFinishCallback();
                    self.videoFinishCallback = null;
                }
                self.videoCancelCallback && self.videoCancelCallback();
                self.videoCancelCallback = null;
            }
        }
        static showVideoAd(finishCB, cancelCB) {
            if (!Laya.Browser.onWeiXin) {
                finishCB && finishCB();
                cancelCB && cancelCB();
                return;
            }
            if (!Laya.Browser.onWeiXin)
                return;
            let self = this;
            this.videoFinishCallback = finishCB;
            this.videoCancelCallback = cancelCB;
            if (!this.isExistVideoAd) {
                this.createVideoAd();
            }
            if (Laya.Browser.onWeiXin) {
                var videoAd = this.videoAd;
                videoAd.show().then(() => { }).catch(err => {
                    videoAd.load().then(() => videoAd.show()).catch(err => {
                        self.videoCancelCallback && self.videoCancelCallback();
                        self.videoCancelCallback = null;
                    });
                });
            }
        }
        static destroyVideoAd() {
            if (!this.videoAd)
                return;
            this.videoAd.destroy();
            this.videoAd = null;
        }
        static initGridAD() {
            if (!Laya.Browser.onWeiXin) {
                return;
            }
            this.createFullGrid();
            this.createBottomGrid();
            this.createSideGrid();
            this.createTopGrid();
        }
        static createFullGrid() {
            this.fullGridAd = Laya.Browser.window['wx'].createCustomAd({
                adUnitId: this.fullGridId,
                adIntervals: 30,
                style: {
                    left: 0,
                    top: this.getSystemInfoSync().screenHeight / 2 - this.getSystemInfoSync().screenWidth / 2 - 50,
                    width: this.getSystemInfoSync().screenWidth
                }
            });
            this.fullGridAd.onError(() => { this.fullGridError = true; console.log('全屏格子加载失败'); });
            this.fullGridAd.onLoad(() => { console.log('全屏格子加载成功'); });
        }
        static visibleFullGridAd(v = true) {
            if (Laya.Browser.onWeiXin && this.fullGridAd && !this.fullGridError) {
                v ? this.fullGridAd.show() : this.fullGridAd.hide();
            }
        }
        static createBottomGrid() {
            this.bottomGridAd = Laya.Browser.window['wx'].createCustomAd({
                adUnitId: this.bottomGridId,
                adIntervals: 30,
                style: {
                    left: 47,
                    top: this.getSystemInfoSync().screenHeight - 110,
                    width: this.getSystemInfoSync().screenWidth
                }
            });
            this.bottomGridAd.onError(() => { this.bottomGridError = true; console.log('底部格子加载失败'); });
            this.bottomGridAd.onLoad(() => { console.log('底部格子加载成功'); });
        }
        static visibleBottomGridAd(v = true) {
            if (Laya.Browser.onWeiXin && this.bottomGridAd && !this.bottomGridError) {
                v ? this.bottomGridAd.show() : this.bottomGridAd.hide();
            }
        }
        static createSideGrid() {
            for (let i = 0; i < 2; i++) {
                let grid = Laya.Browser.window['wx'].createCustomAd({
                    adUnitId: this.sideGridId[i],
                    adIntervals: 30,
                    style: {
                        left: i == 0 ? 0 : this.getSystemInfoSync().screenWidth - 65,
                        top: 200
                    }
                });
                grid.onError(() => { console.log('屏幕侧格子加载失败'); });
                grid.onLoad(() => { this.sideGridAd.push(grid); console.log('屏幕侧格子加载成功'); });
            }
        }
        static visibleSideGridAd(v = true) {
            if (Laya.Browser.onWeiXin && this.sideGridAd.length > 0) {
                for (let i = 0; i < this.sideGridAd.length; i++) {
                    v ? this.sideGridAd[i].show() : this.sideGridAd[i].hide();
                }
            }
        }
        static createTopGrid() {
            this.topGridAd = Laya.Browser.window['wx'].createCustomAd({
                adUnitId: this.topGridId,
                adIntervals: 30,
                style: {
                    left: 0,
                    top: 50,
                    width: this.getSystemInfoSync().screenWidth
                }
            });
            this.topGridAd.onError(() => { this.topGridError = true; console.log('顶部格子加载失败'); });
            this.topGridAd.onLoad(() => { console.log('顶部格子加载成功'); });
        }
        static visibleTopGrid(v = true) {
            if (Laya.Browser.onWeiXin && this.topGridAd && !this.topGridError) {
                v ? this.topGridAd.show() : this.topGridAd.hide();
            }
        }
    }
    FdAd.bannerIdArr = ["adunit-ff59902f38f853f9", "adunit-bbb5010cb0499fde"];
    FdAd.videoId = "adunit-187b73f7d5412cf4";
    FdAd.fullGridId = "adunit-6eda207f9a70bcbd";
    FdAd.bottomGridId = "adunit-7cbb68729da0b318";
    FdAd.sideGridId = ["adunit-be20c800d4bf9b7d", "adunit-ca00345ab950da91"];
    FdAd.topGridId = "adunit-0662532b6d9748d3";
    FdAd.bannerAds = [];
    FdAd.bannerIndex = 0;
    FdAd.bannerTimesArr = [];
    FdAd.bannerShowCount = [];
    FdAd.bannerErrorArr = [];
    FdAd.isExistVideoAd = false;
    FdAd.fullGridAd = null;
    FdAd.fullGridError = false;
    FdAd.bottomGridAd = null;
    FdAd.bottomGridError = false;
    FdAd.sideGridAd = [];
    FdAd.topGridAd = null;
    FdAd.topGridError = false;

    class FdMgr {
        static randTouchProgress() {
            if (this.wuchuProgressValue < 0.19) {
                this.wuchuProgressValue = this.getRangeNumer(0.08, 0.3);
            }
            else {
                this.wuchuProgressValue = this.getRangeNumer(this.wuchuProgressValue - 0.19 + 0.08, this.wuchuProgressValue - 0.19 + 0.3);
            }
        }
        static getRangeNumer(min, max) {
            return (Math.random() * (max - min)) + min;
        }
        static bannerShowHide() {
            FdAd.hideBannerAd();
            Laya.timer.once(1000, this, () => {
                FdAd.showBannerAd();
                Laya.timer.once(800, this, () => {
                    this.bannerShowHide();
                });
            });
        }
        static init(cb) {
            this.randTouchProgress();
            if (Laya.Browser.onWeiXin) {
                this.getConfig(cb);
            }
            else {
                cb && cb();
            }
        }
        static loadGame(cb) {
            var closeVideo = () => {
                this.showReMen(() => {
                    if (this.gridBoxVideo) {
                        FdAd.showVideoAd();
                    }
                    this.showBox2(cb);
                });
            };
            if (this.loadingVideo) {
                FdAd.showVideoAd(null, closeVideo);
            }
            else {
                closeVideo();
            }
        }
        static showReMen(cb) {
            if (this.showRemen) {
                Laya.Scene.open(SceneType.Remen, false, { ccb: () => { cb && cb(); } });
            }
            else {
                cb && cb();
            }
        }
        static showStartReMen(cb) {
            if (this.startRemen) {
                Laya.Scene.open(SceneType.Remen, false, { ccb: () => { cb && cb(); } });
            }
            else {
                cb && cb();
            }
        }
        static showOverReMen(cb) {
            if (this.endRemen) {
                Laya.Scene.open(SceneType.Remen, false, { ccb: () => { cb && cb(); } });
            }
            else {
                cb && cb();
            }
        }
        static showBox1(cb) {
            if (this.bannerBox) {
                Laya.Scene.open(SceneType.Box1, false, { closeCB: cb }, Laya.Handler.create(this, (s) => {
                    Laya.stage.addChild(s);
                    s.size(Laya.stage.width, Laya.stage.height);
                }));
            }
            else {
                cb && cb();
            }
        }
        static showBox2(cb) {
            if (this.gridBox) {
                Laya.Scene.open(SceneType.Box1, false, { closeCB: cb }, Laya.Handler.create(this, (s) => {
                    Laya.stage.addChild(s);
                    s.size(Laya.stage.width, Laya.stage.height);
                }));
            }
            else {
                cb && cb();
            }
        }
        static showVirtualWxpage(cb) {
            if (this.showVitualWx && Laya.Browser.onWeiXin) {
                Laya.Browser.window['wx'].showModal({
                    title: '提示',
                    content: '未观看完广告无法获取奖励，是否继续？',
                    success: (res) => {
                        if (this.showVirtualCount < this.jsonConfig.vitualWx_count) {
                            this.showVirtualCount++;
                            FdAd.showVideoAd(null, () => { this.showVirtualWxpage(cb); });
                        }
                        else {
                            this.showVirtualCount = 0;
                            this.showBox1(cb);
                        }
                    }
                });
            }
            else {
                this.showBox1(cb);
            }
        }
        static inHomePage(cb) {
            FdAd.visibleSideGridAd();
            FdAd.visibleTopGrid();
            if (this.banner_gezi_switch) {
                FdAd.showBannerAd();
            }
            else {
                FdAd.visibleBottomGridAd();
            }
            if (this.homepageVideo) {
                FdAd.showVideoAd(null, cb);
            }
            else {
                cb && cb();
            }
        }
        static startGame(cb) {
            FdAd.hideBannerAd();
            FdAd.visibleSideGridAd(false);
            FdAd.visibleBottomGridAd(false);
            FdAd.visibleTopGrid(false);
            if (this.startVideo) {
                FdAd.showVideoAd(null, () => {
                    this.showVirtualWxpage(() => {
                        this.showStartReMen(cb);
                    });
                });
            }
            else {
                this.showVirtualWxpage(() => {
                    this.showStartReMen(cb);
                });
            }
        }
        static inGame() {
            FdAd.showBannerAd();
            FdAd.visibleSideGridAd();
            FdAd.visibleTopGrid();
        }
        static showGameOver(cb) {
            FdAd.hideBannerAd();
            FdAd.visibleSideGridAd(false);
            FdAd.visibleTopGrid(false);
            this.showOverReMen(cb);
        }
        static inFinish(backBtn) {
            FdAd.visibleSideGridAd();
            FdAd.hideBannerAd();
            FdAd.visibleTopGrid();
            if (this.endBanner) {
                this.bannerShowHide();
                if (backBtn)
                    backBtn.bottom = 20;
            }
            else {
                if (backBtn)
                    backBtn.bottom = 300;
                if (this.banner_gezi_switch) {
                    FdAd.showBannerAd();
                }
                else {
                    FdAd.visibleBottomGridAd();
                }
            }
        }
        static closeFinish(cb) {
            Laya.timer.clearAll(this);
            FdAd.hideBannerAd();
            FdAd.visibleBottomGridAd(false);
            FdAd.visibleSideGridAd(false);
            FdAd.visibleTopGrid(false);
            this.gameCount++;
            this.loadGame(() => {
                cb && cb();
            });
        }
        static get allowScene() {
            if (Laya.Browser.onWeiXin && this.jsonConfig.sceneList) {
                var launchInfo = Laya.Browser.window['wx'].getLaunchOptionsSync();
                let scene = launchInfo.scene.toString();
                let arr = this.jsonConfig.sceneList.split(',');
                return arr.indexOf(scene) != -1;
            }
            return true;
        }
        static getConfig(cb) {
            var launchInfo = Laya.Browser.window['wx'].getLaunchOptionsSync();
            console.log("当前场景：", launchInfo.scene);
            console.log('wxsdk初始化');
            window['wxsdk'].init({
                version: '1.0.0',
                appid: '344',
                secret: '3o9rd1vt07qqo6xoh3phxklv2vs77t2p',
                share: {
                    title: '你能过得了这一关吗？',
                    image: 'https://game-oss.smallshark.cn/game/20211119/1216327431258.jpg?imageslim',
                },
            });
            window['wxsdk'].onInit(() => {
                console.log('wxsdk初始化成功:', window['wxsdk'].user);
                let conf = new config();
                conf.allowMistouch = window['wxsdk'].conf.allowMistouch;
                conf.bannerBox = window['wxsdk'].conf.bannerBox;
                conf.gridBox = window['wxsdk'].conf.gridBox;
                conf.startVideo = window['wxsdk'].conf.startVideo;
                conf.homepageVideo = window['wxsdk'].conf.homepageVideo;
                conf.gridBoxVideo = window['wxsdk'].conf.gridBoxVideo;
                conf.showRemen = window['wxsdk'].conf.showRemen;
                conf.sceneList = window['wxsdk'].conf.sceneList;
                conf.version = window['wxsdk'].conf.version;
                conf.showVitualWx = window['wxsdk'].conf.showVitualWx;
                conf.refresh_banner_time = window['wxsdk'].conf.refresh_banner_time;
                conf.channel_ditch = window['wxsdk'].conf.channel_ditch;
                conf.updateBanner = window['wxsdk'].conf.updateBanner;
                conf.loadingVideo = window['wxsdk'].conf.loadingVideo;
                conf.remenBanner = window['wxsdk'].conf.remenBanner;
                conf.delay_play_count = window['wxsdk'].conf.delay_play_count;
                conf.delay_play_countBanner = window['wxsdk'].conf.delay_play_countBanner;
                conf.delay_play_countVideo = window['wxsdk'].conf.delay_play_countVideo;
                conf.banner_gezi_switch = window['wxsdk'].conf.banner_gezi_switch;
                conf.loadingGezi = window['wxsdk'].conf.loadingGezi;
                conf.vitualWx_count = window['wxsdk'].conf.vitualWx_count;
                conf.endBanner = window['wxsdk'].conf.endBanner;
                conf.bannerBox_count = window['wxsdk'].conf.bannerBox_count;
                conf.remenBanner_count = window['wxsdk'].conf.remenBanner_count;
                conf.startRemen = window['wxsdk'].conf.startRemen;
                conf.endRemen = window['wxsdk'].conf.endRemen;
                this.jsonConfig = conf;
                console.log('config:', this.jsonConfig);
                if (this.jsonConfig.channel_ditch && !window['wxsdk'].user.channel) {
                    this.jsonConfig.allowMistouch = false;
                    console.log('config1:', this.jsonConfig);
                }
                FdAd.inidAd();
                cb && cb();
            });
            window['wxsdk'].login();
        }
        static get isVersionValid() {
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.version.split('.')[2] <= this.jsonConfig.version.split('.')[2];
        }
        static get canTrapAll() {
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.allowScene && this.jsonConfig.allowMistouch && this.version.split('.')[2] <= this.jsonConfig.version.split('.')[2];
        }
        static get bannerBox() {
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.canTrapAll && this.jsonConfig.bannerBox && this.gameCount >= this.jsonConfig.delay_play_count;
        }
        static get gridBox() {
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.canTrapAll && this.jsonConfig.gridBox && this.gameCount >= this.jsonConfig.delay_play_count;
        }
        static get startVideo() {
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.canTrapAll && this.jsonConfig.startVideo && this.gameCount >= this.jsonConfig.delay_play_countVideo;
        }
        static get homepageVideo() {
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.canTrapAll && this.jsonConfig.homepageVideo && this.gameCount >= this.jsonConfig.delay_play_count;
        }
        static get gridBoxVideo() {
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.canTrapAll && this.jsonConfig.gridBoxVideo && this.gameCount >= this.jsonConfig.delay_play_count;
        }
        static get showRemen() {
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.jsonConfig.showRemen;
        }
        static get showVitualWx() {
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.canTrapAll && this.jsonConfig.showVitualWx && this.gameCount >= this.jsonConfig.delay_play_countVideo;
        }
        static get loadingVideo() {
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.canTrapAll && this.jsonConfig.loadingVideo;
        }
        static get remenBanner() {
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.canTrapAll && this.jsonConfig.remenBanner && this.gameCount >= this.jsonConfig.delay_play_countBanner;
        }
        static get banner_gezi_switch() {
            if (!Laya.Browser.onWeiXin)
                return true;
            return this.jsonConfig.banner_gezi_switch;
        }
        static get loadingGezi() {
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.canTrapAll && this.jsonConfig.loadingGezi;
        }
        static get endBanner() {
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.canTrapAll && this.jsonConfig.endBanner && this.gameCount >= this.jsonConfig.delay_play_countBanner;
        }
        static get startRemen() {
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.jsonConfig.startRemen;
        }
        static get endRemen() {
            if (!Laya.Browser.onWeiXin)
                return false;
            return this.jsonConfig.endRemen;
        }
    }
    FdMgr.version = '1.0.2';
    FdMgr.wuchuProgressValue = 0;
    FdMgr.wuchuProgressStepAdd = 0.1;
    FdMgr.wuchuProgressFrameSub = 0.0032;
    FdMgr.gameCount = 1;
    FdMgr.showVirtualCount = 0;
    class config {
    }
    var SceneType;
    (function (SceneType) {
        SceneType["Remen"] = "FDScene/Remen.scene";
        SceneType["VitrualWx"] = "FDScene/VitrualWx.scene";
        SceneType["Box1"] = "FDScene/Box1.scene";
        SceneType["Box2"] = "FDScene/Box2.scene";
    })(SceneType || (SceneType = {}));

    class GameLogic {
        constructor() {
            this.camStartPos = new Laya.Vector3(0, 0, 0);
            this.camStartRotation = null;
            this._cameraCrl = null;
            this.startCamField = 60;
            this.isStartGame = false;
            this.isGameOver = false;
            this.isWin = false;
            this.isPause = false;
            this.isFinish = false;
            this.isMeet = false;
            this._levelNode = null;
            this._player = null;
            this._playerCrl = null;
            this._enemy = null;
            this._enemyCrl = null;
            this.playerHp = 10;
            this.playerPower = 10;
            this.enemyHp = 10;
            this.enemyPower = 10;
            if (!Laya.Browser.onWeiXin)
                localStorage.clear();
            GameLogic.Share = this;
            PlayerDataMgr.getPlayerData();
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window.wx.showShareMenu({
                    withShareTicket: true,
                    menus: ['shareAppMessage', 'shareTimeline']
                });
                Laya.Browser.window.wx.onShareAppMessage(() => {
                    return {
                        title: '怪物对决',
                        imageUrl: ''
                    };
                });
            }
            Laya.Scene.open('MyScenes/LoadingUI.scene');
        }
        initScene() {
            Laya.Scene3D.load(WxApi.UnityPath + 'SampleScene.ls', Laya.Handler.create(this, this.onLoadScene));
        }
        onLoadScene(scene) {
            Laya.Scene.open('MyScenes/StartUI.scene');
            this._scene = Laya.stage.addChild(scene);
            Laya.stage.setChildIndex(this._scene, 0);
            this._camera = this._scene.getChildByName('Main Camera');
            this._light = this._scene.getChildByName('Directional Light');
            this._light.shadowMode = Laya.ShadowMode.SoftLow;
            this._light.shadowDistance = 100;
            this._light.shadowResolution = 1024;
            this._light.shadowCascadesMode = Laya.ShadowCascadesMode.NoCascades;
            this.camStartPos = this._camera.transform.position.clone();
            this.camStartRotation = this._camera.transform.rotation.clone();
            this._camera.fieldOfView = this.startCamField;
            this._cameraCrl = this._camera.addComponent(CameraCrl);
            this._levelNode = this._scene.addChild(new Laya.Sprite3D());
        }
        gameStart() {
            Laya.Scene.open('MyScenes/GameUI.scene');
        }
        gameOver(isWin) {
            Laya.timer.clearAll(this);
            WxApi.DoVibrate(false);
            this.isWin = isWin;
            this.isGameOver = true;
            this.isStartGame = false;
            Laya.Scene.close('MyScenes/GameUI.scene');
            Laya.timer.once(2000, this, () => {
                FdMgr.showGameOver(() => {
                    Laya.Scene.open('MyScenes/FinishUI.scene');
                });
            });
        }
        restartGame() {
            this.isStartGame = false;
            this.isGameOver = false;
            this.isWin = false;
            this.isPause = false;
            this._camera.fieldOfView = this.startCamField;
            this.isFinish = false;
            this.isMeet = false;
            this._camera.transform.position = this.camStartPos;
            this._camera.transform.rotation = this.camStartRotation;
            this._levelNode.destroyChildren();
        }
    }

    class Box1 extends Laya.Scene {
        constructor() {
            super(...arguments);
            this.progressValue = 0;
            this.wuchuCount = 1;
            this.hadShowBanner = false;
            this.onShowCB = null;
        }
        onAwake() {
            this.size(Laya.stage.width, Laya.stage.height);
        }
        onOpened(data) {
            this.wuchuCount = FdMgr.jsonConfig.bannerBox_count;
            if (data && data.closeCB) {
                this.closeCB = data.closeCB;
            }
            FdAd.hideBannerAd();
            this.btnPress.on(Laya.Event.CLICK, this, this.onPress);
            Laya.timer.frameLoop(1, this, this.reFreshUI);
            this.onShowCB = () => {
                this.close();
            };
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window['wx'].onShow(this.onShowCB);
            }
        }
        onClosed() {
            if (Laya.Browser.onWeiXin) {
                Laya.Browser.window['wx'].offShow(this.onShowCB);
            }
            FdAd.hideBannerAd();
            Laya.timer.clearAll(this);
            this.closeCB && this.closeCB();
        }
        onPress() {
            this.progressValue += FdMgr.wuchuProgressStepAdd;
            Laya.Tween.to(this.btnPress, { scaleX: 1.2, scaleY: 1.2 }, 100, null, Laya.Handler.create(this, () => {
                Laya.Tween.to(this.btnPress, { scaleX: 1, scaleY: 1 }, 100, null);
            }));
            if (this.progressValue >= FdMgr.wuchuProgressValue) {
                FdAd.showBannerAd();
                this.hadShowBanner = true;
                FdMgr.randTouchProgress();
                Laya.timer.once(2000, this, () => {
                    this.wuchuCount--;
                    if (this.wuchuCount > 0) {
                        FdAd.hideBannerAd();
                        this.hadShowBanner = false;
                    }
                    else {
                        this.close();
                    }
                });
            }
            Laya.Tween.to(this.imgSushi, { rotation: 30 }, 100, null, Laya.Handler.create(this, () => {
                Laya.Tween.to(this.imgSushi, { rotation: 0 }, 100);
            }));
            this.pressBar.value = this.progressValue;
        }
        reFreshUI() {
            if (this.progressValue > FdMgr.wuchuProgressFrameSub) {
                this.progressValue -= FdMgr.wuchuProgressFrameSub;
            }
            this.pressBar.value = this.progressValue;
            this.light.rotation += 1;
        }
    }

    class Box2 extends Laya.Scene {
        constructor() {
            super(...arguments);
            this.progressValue = 0;
            this.wuchuCount = 1;
        }
        onAwake() {
            this.size(Laya.stage.width, Laya.stage.height);
        }
        onOpened(data) {
            if (data && data.count) {
                this.wuchuCount = data.count;
            }
            if (data && data.closeCB) {
                this.closeCB = data.closeCB;
            }
            FdAd.visibleFullGridAd(false);
            this.btnPress.on(Laya.Event.CLICK, this, this.onPress);
            Laya.timer.frameLoop(1, this, this.reFreshUI);
            this.tweenScale();
            FdAd.showBannerAd();
        }
        onClosed() {
            FdAd.hideBannerAd();
            FdAd.visibleFullGridAd(false);
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this.imgEffect);
            this.closeCB && this.closeCB();
        }
        onPress() {
            this.progressValue += FdMgr.wuchuProgressStepAdd;
            Laya.Tween.to(this.imgGift, { scaleX: 1.2, scaleY: 1.2 }, 100, null, Laya.Handler.create(this, () => {
                Laya.Tween.to(this.imgGift, { scaleX: 1, scaleY: 1 }, 100, null);
            }));
            if (this.progressValue >= FdMgr.wuchuProgressValue) {
                FdAd.visibleFullGridAd();
                FdMgr.randTouchProgress();
                Laya.timer.once(2000, this, () => {
                    this.wuchuCount--;
                    if (this.wuchuCount > 0) {
                        FdAd.visibleFullGridAd(false);
                    }
                    else {
                        this.close();
                    }
                });
            }
        }
        reFreshUI() {
            if (this.progressValue > FdMgr.wuchuProgressFrameSub) {
                this.progressValue -= FdMgr.wuchuProgressFrameSub;
            }
            this.light.rotation += 1;
        }
        tweenScale() {
            var t = 200;
            Laya.Tween.to(this.imgEffect, { scaleX: 1.2, scaleY: 1.2, alpha: 0.8 }, t);
            Laya.timer.once(t, this, () => {
                Laya.Tween.to(this.imgEffect, { scaleX: 1, scaleY: 1, alpha: 1 }, t);
                Laya.timer.once(t, this, this.tweenScale);
            });
        }
    }

    class Remen extends Laya.Scene {
        constructor() {
            super();
            this.ccb = null;
            this.clickCount = 0;
        }
        onAwake() {
            this.size(Laya.stage.displayWidth, Laya.stage.displayHeight);
        }
        onOpened(param) {
            if (param && param.ccb)
                this.ccb = param.ccb;
            this.clickCount = 0;
            this.btnContinue.on(Laya.Event.CLICK, this, this.btnContinueCB);
            FdAd.visibleFullGridAd();
            if (FdMgr.remenBanner && FdMgr.gameCount >= FdMgr.jsonConfig.delay_play_countBanner)
                this.bannerShowHide();
            FdAd.bannerIndex = 0;
        }
        onClosed() {
            Laya.timer.clearAll(this);
            FdAd.hideBannerAd();
            FdAd.visibleFullGridAd(false);
            Laya.timer.once(100, this, () => {
                this.ccb && this.ccb();
            });
        }
        bannerShowHide() {
            FdAd.hideBannerAd();
            Laya.timer.once(1000, this, () => {
                FdAd.showBannerAd();
                Laya.timer.once(800, this, () => {
                    this.bannerShowHide();
                });
            });
        }
        btnContinueCB() {
            this.clickCount++;
            if (this.clickCount >= FdMgr.jsonConfig.remenBanner_count) {
                this.close();
            }
        }
    }

    class FinishUI extends Laya.Scene {
        constructor() {
            super();
            this.freeSkin = [];
        }
        onOpened() {
            this.size(Laya.stage.displayWidth, Laya.stage.displayHeight);
            this.gradeNum.value = PlayerDataMgr.getPlayerData().grade.toString();
            let isWin = GameLogic.Share.isWin;
            this.winTitle.visible = isWin;
            this.loseTitle.visible = !isWin;
            this.nextBtn.visible = isWin;
            this.restartBtn.visible = !isWin;
            Utility.addClickEvent(this.nextBtn, this, this.closeCB);
            Utility.addClickEvent(this.restartBtn, this, this.closeCB);
            FdMgr.inFinish(isWin ? this.nextBtn : this.restartBtn);
        }
        onClosed() {
        }
        closeCB() {
            FdMgr.closeFinish(() => {
                if (GameLogic.Share.isWin) {
                    PlayerDataMgr.getPlayerData().grade++;
                    PlayerDataMgr.setPlayerData();
                }
                GameLogic.Share.restartGame();
                Laya.Scene.open('MyScenes/StartUI.scene');
            });
        }
    }

    class GameUI extends Laya.Scene {
        constructor() {
            super();
            this.touchStartPosX = 0;
        }
        onOpened() {
            GameUI.Share = this;
            this.size(Laya.stage.displayWidth, Laya.stage.displayHeight);
            Laya.timer.frameLoop(1, this, this.myUpdate);
            this.gradeNum.value = PlayerDataMgr.getPlayerData().grade.toString();
            this.touchBtn.on(Laya.Event.MOUSE_DOWN, this, this.touchStart);
            this.touchBtn.on(Laya.Event.MOUSE_MOVE, this, this.touchMove);
            this.touchBtn.on(Laya.Event.MOUSE_UP, this, this.touchEnd);
            FdMgr.inGame();
        }
        onClosed() {
            Laya.timer.clearAll(this);
        }
        touchStart(evt) {
            GameLogic.Share.isStartGame = true;
            let x = evt.stageX;
            this.touchStartPosX = x;
        }
        touchMove(evt) {
            let x = evt.stageX;
            if (Math.abs(x - this.touchStartPosX) < 20) {
                return;
            }
            if (x - this.touchStartPosX > 0) {
                GameLogic.Share._playerCrl.moveDir = -1;
            }
            else {
                GameLogic.Share._playerCrl.moveDir = 1;
            }
            this.touchStartPosX = x;
        }
        touchEnd(evt) {
            GameLogic.Share._playerCrl.moveDir = 0;
        }
        fixPlayerHp() {
            if (!GameLogic.Share._player)
                return;
            let op = new Laya.Vector4(0, 0, 0);
            let hPos = GameLogic.Share._player.transform.position.clone();
            hPos.y += 2.5;
            GameLogic.Share._camera.viewport.project(hPos, GameLogic.Share._camera.projectionViewMatrix, op);
            this.playerHp.pos(op.x / Laya.stage.clientScaleX, op.y / Laya.stage.clientScaleY);
            this.playerHp.value = GameLogic.Share._playerCrl.hp / GameLogic.Share._playerCrl.hpMax;
        }
        myUpdate() {
            this.fixPlayerHp();
        }
    }

    class FixNodeY extends Laya.Script {
        constructor() {
            super();
        }
        onAwake() {
            let myOwner = this.owner;
            myOwner.y = myOwner.y * Laya.stage.displayHeight / 1334;
        }
    }

    class LoadingUI extends Laya.Scene {
        constructor() {
            super();
        }
        onOpened() {
            this.size(Laya.stage.displayWidth, Laya.stage.displayHeight);
            if (!Laya.Browser.onWeiXin) {
                localStorage.clear();
            }
            FdMgr.init(() => {
                if (Laya.Browser.onWeiXin) {
                    this.loadSubpackage();
                }
                else {
                    this.loadRes();
                }
            });
            Laya.timer.frameLoop(1, this, () => {
                this.bar.value += 0.01;
            });
        }
        onClosed() {
        }
        loadSubpackage() {
            const loadTask = Laya.Browser.window.wx.loadSubpackage({
                name: 'unity',
                success: (res) => {
                    this.loadRes();
                },
                fail: (res) => {
                    this.loadSubpackage();
                }
            });
            loadTask.onProgressUpdate(res => {
                console.log('下载进度', res.progress);
                console.log('已经下载的数据长度', res.totalBytesWritten);
                console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite);
            });
        }
        loadRes() {
            var resUrl = [
                WxApi.UnityPath + 'SampleScene.ls'
            ];
            Laya.loader.create(resUrl, Laya.Handler.create(this, this.onComplete), Laya.Handler.create(this, this.onProgress));
        }
        onComplete() {
            FdMgr.loadGame(() => {
                GameLogic.Share.initScene();
            });
        }
        onProgress(value) {
        }
    }

    class StartUI extends Laya.Scene {
        constructor() {
            super();
        }
        onOpened() {
            this.size(Laya.stage.displayWidth, Laya.stage.displayHeight);
            Utility.addClickEvent(this.startBtn, this, this.startBtnCB);
            FdMgr.inHomePage();
        }
        onClosed() {
        }
        startBtnCB() {
            FdMgr.startGame(() => {
                Laya.Scene.open('MyScenes/SelectUI.scene');
            });
        }
    }

    class UpDownLoop extends Laya.Script {
        constructor() {
            super();
            this.startY = 0;
        }
        onAwake() {
            this.myOwner = this.owner;
            this.startY = this.myOwner.y;
            this.startTween();
        }
        startTween() {
            Laya.Tween.to(this.myOwner, { y: this.startY + 50 }, 1000, Laya.Ease.sineInOut, new Laya.Handler(this, () => {
                Laya.Tween.to(this.myOwner, { y: this.startY }, 1000, Laya.Ease.sineInOut, new Laya.Handler(this, () => {
                    this.startTween();
                }));
            }));
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("FanDong/Box1.ts", Box1);
            reg("FanDong/Box2.ts", Box2);
            reg("FanDong/Remen.ts", Remen);
            reg("View/FinishUI.ts", FinishUI);
            reg("View/GameUI.ts", GameUI);
            reg("Libs/FixNodeY.ts", FixNodeY);
            reg("View/LoadingUI.ts", LoadingUI);
            reg("View/StartUI.ts", StartUI);
            reg("Mod/UpDownLoop.ts", UpDownLoop);
        }
    }
    GameConfig.width = 750;
    GameConfig.height = 1334;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "vertical";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "MyScenes/SkinUI.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            Laya.stage.useRetinalCanvas = true;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            new GameLogic();
        }
    }
    new Main();

}());
