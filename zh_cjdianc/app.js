var _App;

function _defineProperty(a, o, e) {
    return o in a ? Object.defineProperty(a, o, {
        value: e,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : a[o] = e, a;
}

App({
    onLaunch: function() {
        // 初始化全局数据
        this.globalData = {
            userInfo: null,
            systemInfo: null,
            statusBarHeight: 20,
            model: 'unknown',
            session_id: ''
        };

        // 获取系统信息
        try {
            const systemInfo = wx.getSystemInfoSync();
            if (systemInfo) {
                this.globalData.systemInfo = systemInfo;
                this.globalData.statusBarHeight = systemInfo.statusBarHeight || 20;
                this.globalData.model = systemInfo.model || 'unknown';
            }
        } catch (e) {
            console.error('获取系统信息失败:', e);
        }

        // 登录
        wx.login({
            success: res => {
                if (res.code) {
                    console.log('登录成功，code:', res.code);
                } else {
                    console.error('登录失败:', res.errMsg);
                }
            }
        });
    },

    // 全局方法
    getSystemInfo: function() {
        return this.globalData.systemInfo;
    },

    setSessionId: function(sessionId) {
        this.globalData.session_id = sessionId;
    },

    getSessionId: function() {
        return this.globalData.session_id;
    },

    // 全局数据
    globalData: {
        userInfo: null,
        systemInfo: null,
        statusBarHeight: 20,
        model: 'unknown',
        session_id: ''
    }
});
