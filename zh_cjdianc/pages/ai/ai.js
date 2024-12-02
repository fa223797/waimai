// ai.js
var app = getApp();

Page({
  data: {
    money: 0.01, // 支付金额固定为0.01元
    userinfo: null,
    zfz: false // 支付状态
  },
  onLoad: function(options) {
    var that = this;

    // 设置导航栏颜色（根据需要）
    app.setNavigationBarColor(this);

    // 获取用户信息
    app.getUserInfo(function(userInfo) {
      console.log("用户信息：", userInfo);
      that.setData({
        userinfo: userInfo
      });
    });
  },
  formSubmit: function(e) {
    var that = this;
    var money = that.data.money;
    var user_id = that.data.userinfo.id;
    var openid = that.data.userinfo.openid;

    console.log("支付金额：", money);
    console.log("用户ID：", user_id);
    console.log("用户OpenID：", openid);

    if (money <= 0) {
      wx.showModal({
        title: "提示",
        content: "付款金额不能等于0"
      });
      return;
    }

    // 设置正在支付状态
    that.setData({
      zfz: true
    });

    // 创建订单
    app.util.request({
      url: "entry/wxapp/DmOrder",
      cachetime: "0",
      data: {
        money: money,
        user_id: user_id,
        pay_type: 1 // 支付方式：1为微信支付
      },
      success: function(res) {
        console.log("订单创建成功：", res);
        that.setData({
          zfz: false
        });

        var order_id = res.data;
        if (order_id == "下单失败") {
          wx.showToast({
            title: "下单失败",
            icon: "none"
          });
          return;
        }

        // 调用支付接口
        that.pay(order_id, money, openid);
      },
      fail: function(err) {
        console.log("订单创建失败：", err);
        that.setData({
          zfz: false
        });
        wx.showToast({
          title: "订单创建失败",
          icon: "none"
        });
      }
    });
  },
  pay: function(order_id, money, openid) {
    var that = this;

    // 调用支付接口
    app.util.request({
      url: "entry/wxapp/pay",
      cachetime: "0",
      data: {
        openid: openid,
        money: money,
        order_id: order_id
      },
      success: function(res) {
        console.log("支付参数获取成功：", res);
        var payData = res.data;

        // 发起微信支付
        wx.requestPayment({
          timeStamp: payData.timeStamp,
          nonceStr: payData.nonceStr,
          package: payData.package,
          signType: payData.signType,
          paySign: payData.paySign,
          success: function(res) {
            console.log("支付成功：", res);
            wx.showToast({
              title: "支付成功",
              icon: "success"
            });
            // 可在此添加支付成功后的操作
          },
          fail: function(err) {
            console.log("支付失败：", err);
            wx.showToast({
              title: "支付失败",
              icon: "none"
            });
          },
          complete: function(res) {
            console.log("支付完成：", res);
          }
        });
      },
      fail: function(err) {
        console.log("支付接口调用失败：", err);
        wx.showToast({
          title: "支付接口调用失败",
          icon: "none"
        });
      }
    });
  }
});
