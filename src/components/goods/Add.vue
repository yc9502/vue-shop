<template>
  <div class="add">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!--      进度条-->
      <el-steps
        align-center
        :active="active - 0"
        finish-status="success"
        style="margin-top: 15px;"
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--      标签页-->
      <el-form
        :model="addForm"
        :rules="addFormRule"
        ref="addFormRef"
        label-position="top"
      >
        <el-tabs
          tab-position="left"
          style="margin-top: 20px;"
          v-model="active"
          :before-leave="beforeTagsLeave"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                clearable
                @change="cascaderValueChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">商品参数</el-tab-pane>
          <el-tab-pane label="商品属性" name="2">商品属性</el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :headers="headerObj"
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">商品内容</el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Add",
  data() {
    return {
      active: "0",
      addForm: {
        goods_name: "",
        goods_cat: [],
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
      },
      cateList: [],
      cateProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      addFormRule: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请输入商品分类", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    //封装服务器状态码的检查函数
    checkStatus(res, stateCode = 200, errMsg = "表单数据错误,请重新输入") {
      if (res.meta.status !== stateCode) {
        return this.$message.error(errMsg);
      }
    },
    //获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      this.checkStatus(res, 200, "获取商品分类失败!");
      this.cateList = res.data;
      // console.log(res);
    },

    cascaderValueChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    //如果没有选择分类,就不能离开第一个标签页
    beforeTagsLeave(activeTag, oldActiveTag) {
      //判断当前标签页是否第一个,和是否选择了商品分类
      if (oldActiveTag !== 0 && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类!");
        return false;
      }
    },
    //处理上传图片的预览效果
    handlePreview() {},

    handleRemove() {},
  },
  created() {
    this.getCateList();
  },
};
</script>

<style scoped lang="less"></style>
