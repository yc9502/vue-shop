<template>
  <div>
    <!--  面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--    卡片视图区-->
    <el-card class="box-card">
      <!--      搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button slot="append" @click="getUserList" icon="el-icon-search">
            </el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button @click="addDialogVisible = true" type="primary"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!--      用户列表区域-->
      <el-table stripe border :data="userList" style="width: 100%;">
        <el-table-column
          type="index"
          label="序号"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="username"
          label="用户名"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="mobile"
          label="手机号"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="role_name"
          label="角色"
          align="center"
        ></el-table-column>
        <el-table-column prop="mg_state" label="状态" align="center">
          <template v-slot="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
              active-color="#13ce66"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template v-slot="scope">
            <!--            修改按钮-->
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              @click="editUser(scope.row.id)"
            ></el-button>
            <!--            删除按钮-->
            <el-button
              type="danger"
              icon="el-icon-delete"
              circle
              @click="deleteUserById(scope.row.id)"
            ></el-button>
            <el-tooltip
              content="分配角色"
              effect="dark"
              placement="top"
              :enterable="false"
            >
              <!--              分配角色按钮-->
              <el-button
                type="warning"
                icon="el-icon-set-up"
                circle
                @click="showSetRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--      分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!--    添加用户的对话框-->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      @close="closeHandle"
      width="30%"
    >
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleFormRef"
        label-width="70px"
        status-icon
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="ruleForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="ruleForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="ruleForm.email" type="email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model.number="ruleForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!--    编辑用户的对话框-->
    <el-dialog
      title="编辑用户"
      :visible.sync="editDialogVisible"
      @close="editDialogClose"
      width="30%"
    >
      <el-form
        :model="editForm"
        :rules="rules"
        ref="editFormRef"
        label-width="70px"
        status-icon
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" type="email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model.number="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUser">确 定</el-button>
      </span>
    </el-dialog>

    <!--    分配角色的对话框-->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      @close="clearSelectedRole"
      width="30%"
    >
      <div>
        <p>当前的用户: {{ userInfo.username }}</p>
        <p>当前的角色: {{ userInfo.role_name }}</p>
        <p>
          分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setUserRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Users",
  data() {
    //自定义校验规则 验证邮箱的规则
    let checkEmail = (rule, value, callback) => {
      const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
      //  测试邮箱是否合法
      if (!regEmail.test(value)) {
        return callback(new Error("请输入正确的邮箱"));
      }
      return callback();
    };
    // 验证手机号的规则
    let checkMobile = (rule, value, callback) => {
      const regEmail = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
      //  测试邮箱是否合法
      if (!regEmail.test(value)) {
        return callback(new Error("请输入正确的手机号"));
      }
      return callback();
    };
    return {
      //  用户列表参数的参数对象
      queryInfo: {
        query: "",
        //当前的第几页
        pagenum: 1,
        //当前每页多少条数据
        pagesize: 5,
      },
      userList: [],
      //页码总数
      total: 0,
      //控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      //控制编辑用户对话框的显示与隐藏
      editDialogVisible: false,
      setRoleDialogVisible: false,
      //编辑用户的数据
      editForm: {},
      //表单数据
      ruleForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      //表单字段验证规则
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 4,
            max: 15,
            message: "长度在 4 到 15 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 20,
            message: "长度在 6 到 20 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          {
            min: 8,
            max: 20,
            message: "长度在 8 到 20 个字符",
            trigger: "blur",
          },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
          // {type: 'number', message: '手机号必须为数字值'}
        ],
      },
      //  用户信息
      userInfo: {},
      //角色列表
      roleList: [],
      //已选中的角色id值
      selectedRoleId: "",
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    //获取用户列表
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("用户列表获取失败");
      }
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    //监听设置每页显示数据的条数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    //监听页码值改变的事件
    handleCurrentChange(currentPage) {
      this.queryInfo.pagenum = currentPage;
      this.getUserList();
    },
    //  监听开关state的值改变
    async userStateChange(userInfo) {
      //  更新state的状态
      const { data: res } = await this.$http.put(
        "users/" + userInfo.id + "/state/" + userInfo.mg_state
      );
      if (res.meta.status !== 200) {
        //因为数据库中的状态更新失败了,而页面上的成功了,所以我们要取反重置一下,把成功改成失败.
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error("更新用户状态失败");
      }
      this.$message.success("更新状态成功!");
    },
    //  监听用户对话框的关闭事件,重置表单
    closeHandle() {
      //重置表单
      this.$refs.ruleFormRef.resetFields();
    },
    //封装服务器状态码的检查函数
    checkStatus(res, stateCode, errMsg = "表单数据错误,请重新输入") {
      if (res.meta.status !== stateCode) {
        return this.$message.error(errMsg);
      }
    },
    //  添加用户 提交前表单的预验证
    addUser() {
      this.$refs.ruleFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("表单数据错误,请重新输入");
        //  验证通过,发起ajax请求
        const { data: res } = await this.$http.post("users", this.ruleForm);
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败!");
        }
        this.$message.success("添加用户成功!");
        //隐藏对话框
        this.addDialogVisible = false;
        //获取最新的用户列表
        await this.getUserList();
      });
    },
    //  编辑用户
    async editUser(id) {
      const { data: res } = await this.$http.get("users/" + id);
      this.checkStatus(res, 200, "查询用户信息失败!");
      //给表单赋值
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    updateUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("表单数据错误,请重新输入!");
        //  验证通过,发起ajax请求
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );
        this.checkStatus(res, 200, "修改用户信息失败!");
        //隐藏对话框
        this.editDialogVisible = false;
        //获取最新的用户列表
        await this.getUserList();
        //提示更新成功
        this.$message.success("修改用户成功!");
      });
    },
    //  监听修改用户对话框的关闭时间
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    //根据id删除用户
    async deleteUserById(id) {
      const confirmRes = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmRes !== "confirm") {
        return this.$message({
          type: "info",
          message: "已取消删除",
        });
      }
      const res = await this.$http.delete("users/" + id);
      this.checkStatus(res.data, 200, "删除失败!");
      await this.getUserList();
      this.$message({
        type: "success",
        message: "删除成功!",
      });
    },
    //展示分配角色对话框
    async showSetRoleDialog(userInfo) {
      this.userInfo = userInfo;
      //获取所有角色列表
      const { data: res } = await this.$http.get("roles");
      this.checkStatus(res, 200, "获取角色列表失败!");
      this.roleList = res.data;
      this.setRoleDialogVisible = true;
    },
    //  更改用户角色
    async setUserRole() {
      if (!this.selectedRoleId) {
        return this.message.error("请选择要分配的角色!");
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId,
        }
      );
      this.checkStatus(res, 200, "分配用户角色失败!");
      await this.getUserList();
      this.setRoleDialogVisible = false;
      this.$message.success("分配用户角色成功!");
    },
    clearSelectedRole() {
      //  清空selectedId
      this.selectedRoleId = "";
      this.userInfo = {};
    },
  },
};
</script>

<style scoped lang="less">
.el-table {
  margin-top: 10px;
  font-size: 12px;
}

.el-pagination {
  margin-top: 10px;
}
</style>
