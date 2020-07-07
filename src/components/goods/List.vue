<template>
  <div class="list">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodList"
          >
            <el-button slot="append" @click="getGoodList" icon="el-icon-search">
            </el-button>
          </el-input>
        </el-col>
        <el-col :span="1">
          <el-button @click="addGoods" type="primary">添加商品</el-button>
        </el-col>
      </el-row>

      <!--      商品列表表格-->
      <el-table
        :data="goodList"
        stripe
        border
        style="font-size: 12px; margin-top: 10px;"
      >
        <el-table-column
          type="index"
          label="序号"
          align="center"
        ></el-table-column>
        <el-table-column
          width="700"
          prop="goods_name"
          label="商品名称"
          align="center"
        ></el-table-column>
        <el-table-column
          width="100"
          prop="goods_price"
          label="商品价格(元)"
          align="center"
        ></el-table-column>
        <el-table-column
          width="100"
          prop="goods_weight"
          label="商品重量"
          align="center"
        ></el-table-column>
        <el-table-column
          width="100"
          prop="add_time"
          label="创建时间"
          align="center"
        ></el-table-column>
        <el-table-column width="200" prop="" label="操作" align="center">
          <template v-slot="scope">
            <!--            修改按钮-->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editGoods(scope.row.id)"
            ></el-button>
            <!--            删除按钮-->
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteGoods(scope.row.id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--      分页-->
      <el-pagination
        style="margin-top: 10px;"
        @size-change="handleSizeChange"
        @current-change="handleNumChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 8, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="goodsTotal"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "List",
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 8,
      },
      goodList: [],
      goodsTotal: 0,
    };
  },
  methods: {
    //封装服务器状态码的检查函数
    checkStatus(res, stateCode, errMsg = "表单数据错误,请重新输入") {
      if (res.meta.status !== stateCode) {
        return this.$message.error(errMsg);
      }
    },

    //获取商品数据
    async getGoodList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      // console.log(res);
      this.checkStatus(res, 200, "获取商品列表失败!");
      this.goodList = res.data.goods;
      this.goodsTotal = res.data.total;
    },

    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodList();
    },

    handleNumChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodList();
    },
    //  跳转到添加商品页面
    addGoods() {
      this.$router.push("goods/add");
    },
  },
  created() {
    this.getGoodList();
  },
};
</script>

<style scoped></style>
