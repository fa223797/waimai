var app = getApp();

Page({
    data: {},
    onLoad: function(o) {
        var a = this, t = wx.getStorageSync("order_info");
        app.setNavigationBarColor(this), (a = this).setData({
            url: wx.getStorageSync("url")
        }), console.log(t), a.setData({
            info: t
        }), app.util.request({
            url: "entry/wxapp/OrderCode",
            cachetime: "0",
            data: {
                order_id: t.id
            },
            success: function(o) {
                a.setData({
                    hx_code: o.data
                });
            }
        });
    },
    maketel: function(o) {
        var a = o.currentTarget.dataset.tel;
        wx.makePhoneCall({
            phoneNumber: a
        });
    },
    location: function() {
        var o = this.data.info.coordinates.split(",");
        console.log(o), wx.openLocation({
            latitude: parseFloat(o[0]),
            longitude: parseFloat(o[1]),
            name: this.data.info.store_name
        });
    },
    my_group: function(o) {
        var a = this.data.info;
        wx.navigateTo({
            url: "collageInfo?id=" + a.group_id + "&user_id=" + a.user_id + "&goods_id=" + a.goods_id
        });
    },
    buy: function(o) {
        var a = this.data.info;
        wx.navigateTo({
            url: "/zh_cjdianc/pages/collage/index?id=" + a.goods_id + "&store_id=" + a.store_id
        });
    },
    more: function(o) {
        wx.navigateTo({
            url: "/zh_cjdianc/pages/collage/group"
        });
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {}
});