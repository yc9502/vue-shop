<template>
  <div id="login">
    <div class="login-box">
      <!-- 登录logo-->
      <img src="../assets/logo.png" alt="" />
      <!--      登录表单-->
      <el-form
        ref="loginForm"
        class="form"
        :model="loginForm"
        :rules="formRules"
      >
        <el-form-item prop="username">
          <!--        用户名-->
          <el-input
            prefix-icon="el-icon-user"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <!--    验证规则是给item的,不是给input的    -->
        <el-form-item prop="password">
          <!--          密码-->
          <el-input
            prefix-icon="el-icon-lock"
            type="password"
            v-model="loginForm.password"
          ></el-input>
        </el-form-item>
        <!--        登录和重置按钮-->
        <el-form-item class="btn">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      //登录表单的数据绑定对象
      loginForm: {
        username: "admin",
        password: "123456",
      },
      //表单字段验证规则
      formRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 5,
            max: 10,
            message: "长度在 5 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    //重置,调用form对象的resetFields方法
    reset() {
      this.$refs.loginForm.resetFields();
    },
    //  表单验证 对整个表单进行校验的方法，参数为一个回调函数。该回调函数会在校验结束后被调用，并传入两个参数：是否校验成功和未通过校验的字段。若不传入回调函数，则会返回一个 promise
    login() {
      this.$refs.loginForm.validate().then(async (valid) => {
        //如果验证不通过,函数直接返回停止执行
        if (!valid) {
          return this.$message.error("表单字段验证失败,请重新填写!");
        }
        //验证通过,发起ajax请求,获取数据
        const { data: res } = await this.$http.post("login", this.loginForm);
        if (res.meta.status !== 200) {
          //登录失败,弹出错误提示框
          this.$message.error("账号或密码错误!");
        }
        // this.$message.success('登录成功!');
        //1.将登录成功之后的token保存到客户端的sessionStorage中
        //  1.1 需要登录权限时要验证用户是否登录
        //  1.2 token只应在当前网站打开期间生效,所以将token保存在sessionStorage中
        window.sessionStorage.setItem("token", res.data.token);
        // 通过编程式导航跳转到后台主页,路由地址是/home
        await this.$router.push("/home");
      });
    },
  },
};
</script>

<style scoped lang="less">
#login {
  height: 100%;
  background-image: linear-gradient(-20deg, #6e45e2 0%, #88d3ce 100%);
  display: flex;
  justify-content: center;
  align-items: center;

  .login-box {
    width: 350px;
    height: 350px;
    background-color: #f8f3f3;
    border-radius: 10px;

    img {
      width: 100px;
      border: 5px solid white;
      border-radius: 50%;
      transform: translate(120px, -50%);
      background-color: #89c9b8;
      box-shadow: 0 0 25px #0fabbc;
    }

    .form {
      padding: 0 30px;

      .btn {
        display: flex;
        justify-content: center;
      }
    }
  }
}
</style>
