<template>
  <div class="roles">
    <!--  面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--   卡片视图-->
    <el-card>
      <!--      添加角色按钮-->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!--      角色列表区域-->
      <el-table stripe border :data="roleList" style="width: 100%">
        <!--        展开列-->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom', index === 0 ? 'bdtop' : '', 'align-center']"
              v-for="(item1, index) in scope.row.children"
              :key="item1.id"
            >
              <!--              <pre>{{scope.row}}</pre>-->
              <!--            循环一级权限-->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="deleteRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--              for循环出二三级权限列表-->
              <el-col :span="19">
                <el-row
                  :class="index2 === 0 ? '' : 'bdtop'"
                  class="align-center"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="deleteRightById(scope.row, item2.id)"
                      >{{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      @close="deleteRightById(scope.row, item3.id)"
                      closable
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      >{{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column
          type="index"
          label="序号"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="roleName"
          label="角色名称"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="roleDesc"
          label="角色描述"
          align="center"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <template v-slot="scope">
            <!--            修改按钮-->
            <el-button
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="showEditRoleDialog(scope.row.id)"
              >编辑
            </el-button>
            <!--            删除按钮-->
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="deleteRoleById(scope.row.id)"
              >删除
            </el-button>
            <!--              分配角色按钮-->
            <el-button
              type="warning"
              size="small"
              icon="el-icon-set-up"
              @click="showRightsSetDialog(scope.row)"
              >分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--    编辑角色的对话框-->
      <el-dialog
        title="编辑角色"
        :visible.sync="editRoleDialogVisible"
        @close="editRoleDialogClosed"
        width="30%"
      >
        <el-form :model="editRoleForm" ref="editRoleFormRef" label-width="70px">
          <el-form-item label="角色名称">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="editRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoleById">确 定</el-button>
        </span>
      </el-dialog>

      <!--      分配角色对话框-->
      <el-dialog title="分配权限" :visible.sync="dialogVisible" width="30%">
        <!--        树结构权限列表-->
        <el-tree
          :data="rightList"
          :props="rightTreeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          ref="roleTree"
          :default-checked-keys="defaultKeys"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false" size="small"
            >取 消</el-button
          >
          <el-button type="primary" @click="allotRights" size="small"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      //角色列表
      roleList: [],
      editRoleForm: {},
      //控制分配角色对话框的显示与隐藏
      dialogVisible: false,
      //编辑角色对话框的显示与隐藏
      editRoleDialogVisible: false,
      //权限列表
      rightList: [],
      //树形控件的属性绑定对象
      rightTreeProps: {
        children: "children",
        label: "authName",
      },
      //默认选中的节点id值数组
      defaultKeys: [],
      roleId: 0,
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    //获取角色列表
    async getRoleList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取列表失败");
      }
      this.roleList = res.data;
    },

    //编辑角色
    async editRoleById() {
      const { data: res } = await this.$http.put(
        "roles/" + this.editRoleForm.roleId,
        {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc,
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改角色失败!");
      }
      this.editRoleDialogVisible = false;
      await this.getRoleList();
      this.$message.success("修改角色成功!");
    },

    async showEditRoleDialog(id) {
      const { data: res } = await this.$http.get(`roles/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色信息失败!");
      }
      this.editRoleForm = res.data;
      this.editRoleDialogVisible = true;
    },

    //删除角色
    deleteRoleById(id) {},

    editRoleDialogClosed() {},

    //根据id删除权限
    async deleteRightById(roleInfo, rightId) {
      const res = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (res !== "confirm") {
        return this.$message.info("取消删除成功!");
      }
      const { data: res2 } = await this.$http.delete(
        `roles/${roleInfo.id}/rights/${rightId}`
      );
      if (res2.meta.status !== 200) {
        return this.$message.error("删除权限失败!");
      }
      roleInfo.children = res2.data;
      this.$message.success("删除权限成功!");
    },

    //展示编辑角色对话框
    async showRightsSetDialog(role) {
      this.roleId = role.id;
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败!");
      }
      this.rightList = res.data;
      //每次设置前清空数组,避免数据混乱
      this.defaultKeys = [];
      //调用递归方法
      this.getLeafKeys(role, this.defaultKeys);
      this.dialogVisible = true;
    },

    //  通过递归的形式,获取角色下所有的三级权限的id,并保存到defaultKeys的数组中
    getLeafKeys(node, array) {
      if (!node.children) {
        return array.push(node.id);
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, array);
      });
    },

    //  点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.roleTree.getCheckedKeys(),
        ...this.$refs.roleTree.getHalfCheckedKeys(),
      ];
      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败!");
      }
      await this.getRoleList();
      this.dialogVisible = false;
      this.$message.success("分配权限成功!");
    },
  },
};
</script>

<style scoped lang="less">
.el-card {
  margin-top: 10px;

  .el-table {
    margin-top: 10px;
    font-size: 12px;

    .el-col > .el-tag {
      margin: 7px;
    }
  }
}

.bdtop {
  border-top: 1px solid #eeeeee;
}

.bdbottom {
  border-bottom: 1px solid #eeeeee;
}

.align-center {
  display: flex;
  align-items: center;
}
</style>
