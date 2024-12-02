const app = getApp();

Page({
  data: {
    step: 1, // 当前步骤
    tf_image_path: '',
    ff_image_path: '',
    tb_image_path: '',
    inquiry_questions: [], // 初始化 inquiry_questions
    answers: {},
    reportData: null,
    responseData: null, // 用于显示后端返回的信息
    showInquiryQuestions: false, // 控制询问问题部分的显示与隐藏
    hasCameraAuth: false // 用于判断用户是否授权相机功能
  },

  onLoad: function() {
    console.log('页面加载完成');
    this.setData({
      showFloatingImage: true
    });
    console.log('showFloatingImage:', this.data.showFloatingImage);
    
    this.checkCameraAuth();
  },

  closeFloatingImage: function() {
    this.setData({
      showFloatingImage: false
    });
    console.log('showFloatingImage:', this.data.showFloatingImage);
  },
  onImageError: function(e) {
    console.error('图片加载失败:', e);
    wx.showToast({
      title: '图片加载失败',
      icon: 'none'
    });
  },
  // 拍照
  takePhoto: function() {
    if (!this.data.hasCameraAuth) {
      this.checkCameraAuth();
      return;
    }

    const ctx = wx.createCameraContext();
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log('拍照成功:', res);
        const tempFilePath = res.tempImagePath;
        
        // 根据当前步骤设置对应的图片路径
        if (this.data.step === 1) {
          this.setData({ tf_image_path: tempFilePath });
        } else if (this.data.step === 2) {
          this.setData({ ff_image_path: tempFilePath });
        } else if (this.data.step === 3) {
          this.setData({ tb_image_path: tempFilePath });
        }
        
        this.uploadImageToServer(tempFilePath);
      },
      fail: (err) => {
        console.error('拍照失败:', err);
        wx.showToast({
          title: '拍照失败',
          icon: 'none'
        });
      }
    });
  },

  // 检查相机权限
  checkCameraAuth: function() {
    wx.authorize({
      scope: 'scope.camera',
      success: () => {
        // 用户同意授权
        this.setData({
          hasCameraAuth: true
        });
      },
      fail: () => {
        // 用户拒绝授权，此时再引导用户去设置页面
        wx.showModal({
          title: '提示',
          content: '需要您授权相机权限才能使用舌诊功能',
          confirmText: '去授权',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting({
                success: (settingRes) => {
                  if (settingRes.authSetting['scope.camera']) {
                    this.setData({
                      hasCameraAuth: true
                    });
                  }
                }
              });
            }
          }
        });
      }
    });
  },

  // 从相册选择图片
  chooseImage: function() {
    wx.chooseImage({
      count: 1,
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        console.log(`选择的图片路径: ${tempFilePath}`);
        this.uploadImageToServer(tempFilePath);
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  // 上传图片到服务器
  uploadImageToServer: function(filePath) {
    wx.showLoading({
      title: '上传中',
    });

    // 根据当前的 step，确定上传的图片类型和参数
    let stepName = '';
    let fileFieldName = '';
    if (this.data.step == 1) {
      stepName = 'upload_tf_image';
      fileFieldName = 'tf_image';
      this.setData({ tf_image_path: filePath });
    } else if (this.data.step == 2) {
      stepName = 'upload_ff_image';
      fileFieldName = 'ff_image';
      this.setData({ ff_image_path: filePath });
    } else if (this.data.step == 3) {
      stepName = 'upload_tb_image';
      fileFieldName = 'tb_image';
      this.setData({ tb_image_path: filePath });
    }

    wx.uploadFile({
      url: 'https://site1.roseyy.cn/ai/shezhen.php',
      filePath: filePath,
      name: fileFieldName,
      formData: {
        'step': stepName,
        'session_id': app.globalData.session_id || ''
      },
      header: {
        'Content-Type': 'multipart/form-data'
      },
      success: (res) => {
        wx.hideLoading();
        console.log('上传响应:', res);
        let data;
        if (res.data) {
          try {
            data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          } catch (e) {
            console.error('解析响应失败:', e);
            wx.showToast({
              title: '响应解析错误',
              icon: 'none'
            });
            return;
          }
        } else {
          console.error('上传响应为空');
          wx.showToast({
            title: '上传响应为空',
            icon: 'none'
          });
          return;
        }
        console.log('上传响应数据:', data);
        if (data.success && data.code === 20000) {
          // 更新 session_id
          if (data.data.session_id) {
            app.globalData.session_id = data.data.session_id;
            console.log('更新后的 session_id:', app.globalData.session_id);
          }
          this.setData({
            responseData: data.msg || '',
            inquiry_questions: data.data.inquiry_questions || []
          });
          console.log('设置的 inquiry_questions:', this.data.inquiry_questions); // 调试信息
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          });

          // 如果有询问问题，则停留在当前步骤，等待用户回答
          if (this.data.inquiry_questions.length > 0) {
            // 显示询问问题
            this.setData({
              showInquiryQuestions: true
            });
          } else {
            // 没有询问问题，直接进入下一步
            this.proceedToNextStep();
          }
        } else {
          console.error('服务器返回错误:', data.msg);
          wx.showToast({
            title: data.msg || '上传失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('上传失败:', err);
        wx.showToast({
          title: '上传失败，请检查网络',
          icon: 'none'
        });
      }
    });
  },

  // 点击“继续”按钮，进入下一步
  proceedToNextStep: function() {
    if (this.data.step < 3) {
      // 还有照片需要上传，进入下一步
      this.setData({
        step: this.data.step + 1,
        responseData: null, // 清空上一阶段的反馈
        showInquiryQuestions: false // 隐藏询问问题
      });
    } else if (this.data.step == 3) {
      // 照片上传完毕，进入决定是否继续的步骤
      this.setData({
        step: 4,
        responseData: null,
        showInquiryQuestions: false // 隐藏询问问题
      });
    }
  },

  // 用户回答完问题后调用此方法
  onQuestionsAnswered: function() {
    this.setData({
      showInquiryQuestions: false
    });
    this.proceedToNextStep();
  },

  // 绑定单选框事件，收集用户回答的问题
  bindAnswerChange: function(e) {
    const questionName = e.currentTarget.dataset.name;
    const value = e.detail.value;
    console.log(`收集答案 - 问题: ${questionName}, 答案: ${value}`);
    this.setData({
      [`answers.${questionName}`]: value
    });
  },

  // 提交回答
  submitAnswers: function() {
    wx.showLoading({
      title: '提交中',
    });

    console.log('提交回的数据:', {
      step: 'answer_questions',
      session_id: app.globalData.session_id,
      answers: this.data.answers
    });

    wx.request({
      url: 'https://site1.roseyy.cn/ai/shezhen.php',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        step: 'answer_questions',
        session_id: app.globalData.session_id || '',
        answers: this.data.answers
      },
      success: (res) => {
        wx.hideLoading();
        console.log('提交回答响应:', res);
        let data;
        if (res.data) {
          try {
            data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          } catch (e) {
            console.error('解析响应失败:', e);
            wx.showToast({
              title: '响应解析错误',
              icon: 'none'
            });
            return;
          }
        } else {
          console.error('提交回答响应为空');
          wx.showToast({
            title: '提交回答响应为空',
            icon: 'none'
          });
          return;
        }
        console.log('提交回答数据:', data);
        if (data.success && data.code === 20000) {
          this.setData({
            reportData: data.data,
            step: 6
          });
          wx.showToast({
            title: '报告生成成功',
            icon: 'success'
          });
        } else {
          console.error('服务器返回错误:', data.msg);
          wx.showToast({
            title: data.msg || '提交失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('提交失败:', err);
        wx.showToast({
          title: '提交失败，请检查网络',
          icon: 'none'
        });
      }
    });
  },

  // 处理相机错误
  cameraError: function(e) {
    console.error('相机错误:', e.detail.errMsg);
    wx.showToast({
      title: '相机初始化失败，请重试',
      icon: 'none'
    });
  },

  // 用户决定是否继续
  decideContinue: function(e) {
    const option = e.currentTarget.dataset.option;
    if (option === 'yes') {
      this.setData({
        step: 5
      });
    } else {
      wx.navigateBack(); // 返回上一级页面
    }
  },

  onShow: function() {
    // 每次显示页面时检查相机权限
    this.checkCameraAuth();
  }
});