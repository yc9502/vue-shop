<template>
  <div class="rights">
    <!--  面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--    卡片视图区-->
    <el-card class="box-card">
      <el-table
        stripe
        height="520"
        border
        :data="rightList"
        style="width: 100%;"
      >
        <el-table-column
          type="index"
          label="序号"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="authName"
          label="权限名称"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="path"
          label="路径"
          align="center"
        ></el-table-column>
        <el-table-column prop="level" label="权限等级" align="center">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.level === '0'"
              >一级权限</el-tag
            >
            <el-tag type="info" v-else-if="scope.row.level === '1'"
              >二级权限</el-tag
            >
            <el-tag type="warning" v-else>三级权限</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Rights",
  data() {
    return {
      rightList: [],
    };
  },
  created() {
    this.getRightList();
  },
  methods: {
    checkStatus(res, stateCode, errMsg = "表单数据错误,请重新输入") {
      if (res.meta.status !== stateCode) {
        return this.$message.error(errMsg);
      }
    },
    async getRightList() {
      const { data: res } = await this.$http.get("rights/list");
      this.checkStatus(res, 200, "获取权限列表失败!");
      this.rightList = res.data;
    },
  },
};
</script>

<style scoped lang="less">
.el-table {
  font-size: 12px;
}
</style>
