<template>
  <div class="params">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-alert
        title="注意: 只允许为第三级分类设置相关参数!"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>
      <!--      选择商品分类区域-->
      <el-row>
        <el-col>
          <span>请选择分类:</span>
          <!-- 级联选择器 这里的v-model必须绑定一个数组     options绑定数据源 props配置选项-->
          <el-cascader
            v-model="cateValue"
            :options="cateList"
            :props="cateProps"
            clearable
            @change="cascaderValueChange"
          ></el-cascader
        ></el-col>
      </el-row>

      <!--      tab选项卡-->
      <el-tabs v-model="activeName" type="card" @tab-click="handleTabsClick">
        <!--        添加动态属性面板-->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            @click="dialogFormVisible = true"
            size="mini"
            type="primary"
            :disabled="isBtnDisabled"
            >添加参数</el-button
          >
          <!--          表格渲染-->
          <el-table :data="manyData" stripe border>
            <!--            展开行-->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!--                循环渲染tag标签-->
                <el-tag
                  @close="deleteTag(i, scope.row)"
                  closable
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                >
                  {{ item }}
                </el-tag>
                <!--                新建tag的输入框-->
                <el-input
                  clearable
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--                新建tag按钮,触发输入框-->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ 新建标签</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称"
              align="center"
            ></el-table-column>
            <el-table-column label="操作" align="center">
              <template v-slot="scope">
                <el-button type="primary" size="mini">编辑</el-button>
                <el-button type="danger" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!--        添加静态属性面板-->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            @click="dialogFormVisible = true"
            size="mini"
            type="primary"
            :disabled="isBtnDisabled"
            >添加属性</el-button
          >
          <el-table :data="onlyData" stripe border>
            <el-table-column type="expand"> </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="属性名称"
              align="center"
            ></el-table-column>
            <el-table-column label="操作" align="center">
              <template v-slot="scope">
                <el-button type="primary" size="mini">编辑</el-button>
                <el-button type="danger" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!--  添加商品参数或静态属性的对话框-->
      <el-dialog
        :title="`添加${dialogTitle}`"
        :visible.sync="dialogFormVisible"
        @close="handleDialogClose"
      >
        <el-form
          :model="ParamsForm"
          :rules="ParamsFormRule"
          ref="ParamsFormRef"
        >
          <el-form-item :label="dialogTitle" prop="attr_name">
            <el-input v-model="ParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Params",
  data() {
    return {
      cateList: [],
      cateValue: [],
      cateId: 0,
      cateProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      activeName: "many",
      manyData: [],
      onlyData: [],
      dialogFormVisible: false,
      ParamsForm: {
        attr_name: "",
      },
      ParamsFormRule: {
        attr_name: [
          {
            required: true,
            message: "请输入参数名称!",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {
    //只有选择了分类的时候,按钮才能点击
    isBtnDisabled() {
      return this.cateValue.length !== 3;
    },
    //  添加参数的对话框标题
    dialogTitle() {
      return this.activeName === "many" ? "动态参数" : "静态属性";
    },
  },
  methods: {
    //封装服务器状态码的检查函数
    checkStatus(res, stateCode = 200, errMsg = "表单数据错误,请重新输入") {
      if (res.meta.status !== stateCode) {
        return this.$message.error(errMsg);
      }
    },

    //对话框关闭时清空表单
    handleDialogClose() {
      this.$refs.ParamsFormRef.resetFields();
    },

    //获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      this.checkStatus(res, 200, "获取商品分类失败!");
      this.cateList = res.data;
    },

    //根据所选分类的id,和当前所处面板,获取对应的参数
    async cascaderValueChange() {
      if (this.cateValue.length !== 3) {
        this.cateValue = [];
        this.onlyData = [];
        this.manyData = [];
        return;
      }
      //  拿到选择的三级id
      this.cateId = this.cateValue[2];
      //根据所选分类的id,和当前所处面板,获取对应的参数
      if (this.cateValue.length !== 0) {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: this.activeName },
          }
        );
        this.checkStatus(res, 200, "获取分类参数列表失败!");
        //把res.data中的attr_vals值渲染为数组
        res.data.forEach((item) => {
          //处理字符串为空的时候,会有一个空白的标签
          item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
          //为每一行的input输入框绑定单独的变量,避免打开一个input,所有的输入框都要展示
          item.inputVisible = false;
          item.inputValue = "";
        });
        // console.log(res.data);
        //根据不同的列表名字给不同的数组赋值
        if (this.activeName === "many") {
          this.manyData = res.data;
        } else {
          this.onlyData = res.data;
          // console.log(this.onlyData);
        }
      }
    },

    //添加参数
    addParams() {
      //验证表单
      this.$refs.ParamsFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateValue[2]}/attributes`,
          {
            attr_name: this.ParamsForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        this.checkStatus(res, 201, "添加参数失败!");
        this.$message.success("添加参数成功!");
        await this.cascaderValueChange();
        this.dialogFormVisible = false;
      });
    },

    //tabs点击事件处理函数
    async handleTabsClick() {
      await this.cascaderValueChange();
    },

    //修改属性的方法
    async handleInputConfirm(row) {
      //清除字符串空格
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      await this.saveAttrValue(row);
    },

    //删除参数下的属性
    deleteTag(i, row) {
      row.attr_vals.splice(i, 1);
      this.saveAttrValue(row);
    },

    //向数据库中保存属性的操作
    async saveAttrValue(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      this.checkStatus(res, 200, "修改标签失败!");
      row.inputValue = "";
      row.inputVisible = false;
      this.$message.success("修改参数项成功!");
    },

    //点击按钮触发新建tag输入框
    showInput(row) {
      row.inputVisible = true;
      //让输入框自动获取焦点
      //$nextTick方法的作用就是当页面的元素重新被渲染之后才会执行回调函数中的代码
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
  },
  created() {
    this.getCateList();
  },
};
</script>

<style scoped lang="less">
.el-alert {
  margin-bottom: 15px;
}

.el-col span {
  margin-right: 10px;
}

.el-card {
  .el-tabs {
    margin-top: 15px;

    .el-table {
      margin-top: 10px;

      .el-tag {
        margin: 5px;
      }

      .el-input {
        width: 90px;
      }

      .el-button {
        margin-left: 5px;
      }
    }
  }
}
</style>
