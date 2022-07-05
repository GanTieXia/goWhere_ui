<template>
  <div class="register">
    <el-form ref="registerForm" :model="registerForm" :rules="registerRules" class="register-form">
      <h3 class="title">去哪儿</h3>
      <el-form-item prop="username">
        <el-input v-model="registerForm.username" type="text" auto-complete="off" placeholder="账号">
          <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter.native="handleRegister"
        >
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          auto-complete="off"
          placeholder="确认密码"
          @keyup.enter.native="handleRegister"
        >
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>

      <el-form-item prop="email">
        <el-input
          v-model="registerForm.email"
          auto-complete="off"
          placeholder="请输入邮箱"
          @keyup.enter.native="handleRegister"
        >
          <svg-icon slot="prefix" icon-class="email" class="el-input__icon input-icon" />
          <el-button :loading="loading_email" title="发送验证码" slot="append" icon="el-icon-s-promotion" @click="sendCode"></el-button>
        </el-input>
      </el-form-item>
      <el-form-item prop="emailCode">
        <el-input
          v-model="registerForm.emailCode"
          auto-complete="off"
          placeholder="请输入邮箱验证码"
          @keyup.enter.native="handleRegister"
        >
          <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>

      <el-form-item prop="code" v-if="captchaOnOff">
        <el-input
          v-model="registerForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter.native="handleRegister"
        >
          <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
        </el-input>
        <div class="register-code">
          <img :src="codeUrl" @click="getCode" class="register-code-img"/>
        </div>
      </el-form-item>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="medium"
          type="primary"
          style="width:100%;"
          @click.native.prevent="handleRegister"
        >
          <span v-if="!loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
        <div style="float: right;">
          <router-link class="link-type" :to="'/login'">使用已有账户登录</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-register-footer">
      <span>Copyright © 2021-2022 hailin All Rights Reserved.</span>
    </div>
  </div>
</template>

<script>
import {getCodeImg, register, sendCheckCode} from "@/api/login";
import {MessageBox} from "element-ui";
import modal from '@/plugins/modal'

export default {
  name: "Register",
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.registerForm.password !== value) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };
    // 发送验证码
    const checkEmail = (rule, value, callback) => {
      // 邮箱校验正则表达式
      let checkEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!checkEmail.test(value)) {
        callback(new Error("邮箱格式错误"));
      } else {
        callback();
      }
    };
    return {
      codeUrl: "",
      registerForm: {
        username: "",
        password: "",
        confirmPassword: "",
        code: "",
        uuid: "",
        email : "",
        emailCode : ""
      },
      registerRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" },
          { min: 2, max: 20, message: '用户账号长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" },
          { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, trigger: "blur", message: "请再次输入您的密码" },
          { required: true, validator: equalToPassword, trigger: "blur" }
        ],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }],
        email : [
          { required: true, trigger: "blur", message: "请输入您的邮箱" },
          { required: true, validator: checkEmail, trigger: "change" },
          { required: true, validator: checkEmail, trigger: "blur" }
        ],
        emailCode : [
          { required: true, trigger: "blur", message: "请输入您的邮箱验证码" },
          { min: 6, max: 6, message: '请输入6位数的邮箱验证码', trigger: 'change' },
          { min: 6, max: 6, message: '请输入6位数的邮箱验证码', trigger: 'blur' }
        ]
      },
      loading: false,
      loading_email: false,
      captchaOnOff: true
    };
  },
  created() {
    this.getCode();
  },
  methods: {
    // 发送邮箱验证码
    sendCode(){
      if(this.registerForm.email == null || this.registerForm.email === ''){
        modal.alertWarning('请输入邮箱！')
        return
      }
      modal.loading('验证码发送中，请稍后...')
      this.loading_email = true;
      sendCheckCode(this.registerForm.email).then(res => {
        console.log(res)
        if(res.data.code === '200'){
          modal.alertSuccess('验证码发送成功！')
        } else if(res.data.code === '404'){
          modal.alertWarning('已发送验证码，请勿重复发送！')
        } else if (res.data.code === '405'){
          modal.alertWarning('此邮箱已被绑定！')
        } else {
          modal.alertWarning('验证码发送失败，请重试或联系管理员！')
        }
        this.loading_email = false;
        modal.closeLoading();
      })
    },

    getCode() {
      getCodeImg().then(res => {
        this.captchaOnOff = res.captchaOnOff === undefined ? true : res.captchaOnOff;
        if (this.captchaOnOff) {
          this.codeUrl = "data:image/gif;base64," + res.img;
          this.registerForm.uuid = res.uuid;
        }
      });
    },
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          this.loading = true;

          modal.notify('注册功能维护中，尽情期待！');
          this.loading = false;
          return;

          register(this.registerForm).then(res => {
            const username = this.registerForm.username;
            this.$alert("<font color='red'>恭喜你，您的账号 " + username + " 注册成功！</font>", '系统提示', {
              dangerouslyUseHTMLString: true,
              type: 'success'
            }).then(() => {
              this.$router.push("/login");
            }).catch(() => {});
          }).catch(() => {
            this.loading = false;
            if (this.captchaOnOff) {
              this.getCode();
            }
          })
        }
      });
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.register-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  .el-input {
    height: 38px;
    input {
      height: 38px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}
.register-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.register-code {
  width: 33%;
  height: 38px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-register-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.register-code-img {
  height: 38px;
}
</style>
