<template>
  <div class="category">
    <!--  面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!--   卡片视图-->
    <el-card class="box-card">
      <!--      添加分类按钮-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--      分类列表区域-->
      <el-table
        border
        :data="categoryList"
        row-key="cat_id"
        :tree-props="{ children: 'children' }"
        lazy
        style="width: 100%;"
      >
        <el-table-column
          prop="cat_name"
          label="分类名称"
          align="center"
        ></el-table-column>
        <el-table-column prop="cat_deleted" label="是否有效" align="center">
          <template v-slot="scope">
            <i
              class="el-icon-success"
              v-if="!scope.row.cat_deleted"
              style="color: lightgreen;"
            ></i>
            <i class="el-icon-error" v-else style="color: red;"></i>
          </template>
        </el-table-column>
        <el-table-column prop="cat_level" label="排序" align="center">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.cat_level === 0"
              >一级</el-tag
            >
            <el-tag type="info" v-else-if="scope.row.cat_level === 1"
              >二级</el-tag
            >
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template v-slot="scope">
            <!--            修改按钮-->
            <el-button
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="showEditCategoryDialog(scope.row.id)"
              >编辑
            </el-button>
            <!--            删除按钮-->
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="deleteCategoryById(scope.row.id)"
              >删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--      分页-->
      <el-pagination
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        :current-page="pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="pagesize"
        layout="total, sizes,prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!--    添加商品分类的对话框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCategoryDialogVisible"
      width="40%"
      @close="closeCateGialog"
    >
      <el-form :model="addCateForm" ref="addCateFormRef" label-width="80px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name" clearable></el-input>
        </el-form-item>
        <el-form-item label="父级分类:" prop="cat_pid">
          <!-- 级联选择器 这里的v-model必须绑定一个数组     options绑定数据源 props配置选项-->
          <el-cascader
            v-model="cateCascaderValue"
            :options="ParentCateList"
            :props="cateCascaderProps"
            checkStrictly
            clearable
            @change="cascaderValueChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Category",
  data() {
    return {
      categoryList: [],
      pagenum: 1,
      pagesize: 5,
      total: 0,
      addCateForm: {
        cat_name: "",
        //分类父级id,一级分类,也就是大分类
        cat_pid: 0,
        //  分类层级
        cat_level: 0,
      },
      addCategoryDialogVisible: false,
      ParentCateList: [],
      cateCascaderValue: [],
      cateCascaderProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children",
        checkStrictly: "true",
      },
    };
  },
  methods: {
    async getCategoryList() {
      const { data: res } = await this.$http.get("categories", {
        params: {
          pagenum: this.pagenum,
          pagesize: 5,
        },
      });
      this.checkStatus(res, 200, "获取分类数据失败!");
      this.categoryList = res.data.result;
      this.total = res.data.total;
    },
    showEditCategoryDialog() {},
    deleteCategoryById() {},
    //封装服务器状态码的检查函数
    checkStatus(res, stateCode = 200, errMsg = "表单数据错误,请重新输入") {
      if (res.meta.status !== stateCode) {
        return this.$message.error(errMsg);
      }
    },
    //监听页码值改变的事件
    handleCurrentChange(currentPage) {
      this.pagenum = currentPage;
      this.getCategoryList();
    },
    //监听设置每页显示数据的条数
    handleSizeChange(newSize) {
      this.pagesize = newSize;
      this.getUserList();
    },
    //  展示添加分类对话框
    showCateDialog() {
      this.getParentCateList();
      this.addCategoryDialogVisible = true;
    },
    //  获取父级分类数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: {
          type: 2,
        },
      });
      this.checkStatus(res, 200, "获取列表失败!");
      this.ParentCateList = res.data;
      // console.log(res);
    },
    //  监听级联选择器的值
    cascaderValueChange(value) {
      this.cateCascaderValue = value;
      // console.log(this.cateCascaderValue);
      //  如果cateCascaderValue数组中的length大于0,证明选中的父级分类
      //  反之,说明没有选择父级分类
      if (this.cateCascaderValue.length > 0) {
        //把选中的父级id赋值给addCateForm的cat_pid
        this.addCateForm.cat_pid = this.cateCascaderValue[
          this.cateCascaderValue.length - 1
        ];
        //  给当前分类的等级赋值,表示式第几级分类,正好分类等级等于数组的长度!
        this.addCateForm.cat_level = this.cateCascaderValue.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    //点击确定时,向服务器发起添加分类请求
    async addCate() {
      const { data: res } = await this.$http.post(
        "categories",
        this.addCateForm
      );
      this.checkStatus(res, 201, "添加分类失败!");
      await this.getCategoryList();
      this.$message.success("添加分类成功!");
      this.addCategoryDialogVisible = false;
    },
    //关闭添加分类对话框重置表单
    closeCateGialog() {
      //表单重置需要添加prop属性,不然无法生效
      this.$refs.addCateFormRef.resetFields();
      this.cateCascaderValue = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
  },
  created() {
    this.getCategoryList();
  },
};
</script>

<style scoped lang="less">
.box-card {
  .el-table {
    margin-top: 10px;
    font-size: 12px;
  }
}

.el-cascader {
  width: 100%;
}
</style>
