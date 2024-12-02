var app = getApp();

Page({
    data: {
        czhd: [],
        activeIndex: 0,
        czmoney: 0,
        loading: !1
    },
    lookck: function() {
        wx.navigateTo({
            url: "../car/xydtl?title=充值服务协议"
        });
    },
    tabClick: function(t) {
        this.setData({
            activeIndex: t.currentTarget.id,
            czmoney: Number(this.data.czhd[t.currentTarget.id].full)
        });
    },
    tabClick1: function(t) {
        this.setData({
            activeIndex: -1,
            czmoney: 0
        });
    },
    bindinput: function(t) {
        var e;
        console.log(t.detail.value), e = "" != t.detail.value ? t.detail.value : 0, this.setData({
            czmoney: parseFloat(e)
        });
    },
    jsmj: function(t, e) {
        for (var a, o = 0; o < e.length; o++) if (Number(t) >= Number(e[o].full)) {
            a = o;
            break;
        }
        return a;
    },
    tjddformSubmit: function(t) {
        var a = this, e = t.detail.formId;
        console.log("form发生了submit事件，携带数据为：", t.detail, t.detail.formId);
        var o = this.data.userinfo.openid, n = this.data.czmoney, i = this.data.czhd, s = this.data.userinfo.id;
        if (console.log(i), Number(n) <= 0) wx.showModal({
            title: "提示",
            content: "充值金额不能小于0"
        }); else {
            if (0 == i.length) var c = n; else if (Number(n) >= Number(this.data.czhd[i.length - 1].full)) {
                var l = this.jsmj(n, i);
                console.log(l);
                c = Number(n) + Number(i[l].reduction);
            } else c = n;
            console.log(o, n, s, c, c - n), app.util.request({
                url: "entry/wxapp/AddFormId",
                cachetime: "0",
                data: {
                    user_id: s,
                    form_id: e
                },
                success: function(t) {
                    console.log(t.data);
                }
            }), this.setData({
                loading: !0
            }), wx.showLoading({
                title: "加载中",
                mask: !0
            }), app.util.request({
                url: "entry/wxapp/AddCzorder",
                cachetime: "0",
                data: {
                    user_id: s,
                    money: n,
                    money2: c - n
                },
                success: function(t) {
                    console.log(t);
                    var e = t.data;
                    app.util.request({
                        url: "entry/wxapp/pay",
                        cachetime: "0",
                        data: {
                            openid: o,
                            money: n,
                            order_id: e,
                            type: 2
                        },
                        success: function(t) {
                            console.log(t), wx.requestPayment({
                                timeStamp: t.data.timeStamp,
                                nonceStr: t.data.nonceStr,
                                package: t.data.package,
                                signType: t.data.signType,
                                paySign: t.data.paySign,
                                success: function(t) {
                                    console.log(t);
                                },
                                complete: function(t) {
                                    console.log(t), "requestPayment:fail cancel" == t.errMsg && (wx.showToast({
                                        title: "取消支付"
                                    }), a.setData({
                                        loading: !1
                                    })), "requestPayment:ok" == t.errMsg && (wx.showModal({
                                        title: "提示",
                                        content: "支付成功",
                                        showCancel: !1
                                    }), setTimeout(function() {
                                        wx.navigateBack({});
                                    }, 1e3));
                                }
                            });
                        }
                    });
                }
            });
        }
    },
    onLoad: function(t) {
        app.setNavigationBarColor(this);
        var e = this, a = wx.getStorageSync("users").id;
        app.util.request({
            url: "entry/wxapp/UserInfo",
            cachetime: "0",
            data: {
                user_id: a
            },
            success: function(t) {
                console.log(t), e.setData({
                    wallet: t.data.wallet,
                    userinfo: t.data
                });
            }
        }), app.util.request({
            url: "entry/wxapp/Czhd",
            cachetime: "0",
            success: function(t) {
                console.log(t), 0 < t.data.length && e.setData({
                    czhd: t.data,
                    czmoney: t.data[0].full
                });
            }
        });
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {}
});