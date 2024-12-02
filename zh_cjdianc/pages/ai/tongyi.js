Page({
  data: {
    inputContent: '',          // 用户输入的内容
    chatHistory: [],           // 聊天记录
    scrollToId: '',            // 控制滚动的ID
    keyboardHeight: 0          // 键盘高度，用于动态调整输入框位置
  },

  // 处理输入框的内容变化
  onInputChange(e) {
    this.setData({
      inputContent: e.detail.value
    });
  },

  // 输入框聚焦事件，设置键盘高度
  onInputFocus(e) {
    this.setData({
      keyboardHeight: e.detail.height // 获取键盘高度
    });
  },

  // 输入框失焦事件，重置键盘高度
  onInputBlur() {
    this.setData({
      keyboardHeight: 0 // 重置键盘高度
    });
  },

  // 发送消息
  sendMessage() {
    const { inputContent, chatHistory } = this.data;
    if (inputContent.trim() === '') {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    // 将用户的输入加入聊天记录
    chatHistory.push({ sender: 'user', content: inputContent });
    this.setData({
      chatHistory,
      inputContent: '',                // 清空输入框
      scrollToId: `msg${chatHistory.length - 1}` // 设置滚动ID为最新消息
    });

    // 添加“助手正在思考，请等待……”的临时消息
    const thinkingMessageIndex = chatHistory.length;
    chatHistory.push({ sender: 'assistant', content: '助手正在思考，请等待……' });
    this.setData({
      chatHistory,
      scrollToId: `msg${chatHistory.length - 1}`
    });

    // 模拟服务器请求并更新消息
    wx.request({
      url: 'https://site1.roseyy.cn/ai/ai.php',  // 替换为你的 PHP 服务接口地址
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        user_input: inputContent
      },
      success: (res) => {
        if (res.data && res.data.reply) {
          chatHistory[thinkingMessageIndex].content = res.data.reply;
          this.setData({
            chatHistory,
            scrollToId: `msg${chatHistory.length - 1}` // 滚动到底部
          });
        } else {
          chatHistory[thinkingMessageIndex].content = '抱歉，无法获取回复，请稍后再试。';
          this.setData({
            chatHistory
          });
        }
      },
      fail: () => {
        chatHistory[thinkingMessageIndex].content = '请求失败，请检查网络连接。';
        this.setData({
          chatHistory
        });
      }
    });
  }
});
