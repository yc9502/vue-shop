<template>
  <el-container class="home">
    <el-header>
      <h2>电商后台管理系统</h2>
      <el-button type="info" size="small" @click="logout">退出登录</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <button
          class="toggleAside el-icon-back"
          @click="toggleAside"
          :class="{ isClose: isCollapse }"
        ></button>
        <!--侧边栏菜单区域-->
        <el-menu
          class="menu"
          background-color="#333744"
          text-color="#fff"
          unique-opened
          router
          :default-active="$route.path"
          :collapse="isCollapse"
          :collapse-transition="false"
          active-text-color="#ffd04b"
        >
          <!--一级菜单 submenu-->
          <el-submenu
            :index="menuItem.id + ''"
            v-for="menuItem in menuList"
            :key="menuItem.id"
          >
            <template slot="title">
              <i :class="iconList[menuItem.id]"></i>
              <span>{{ menuItem.authName }}</span>
            </template>
            <!--menu-item 二级菜单项-->
            <el-menu-item
              :index="'/' + secItem.path"
              v-for="secItem in menuItem.children"
              :key="secItem.id"
            >
              <i class="el-icon-menu"></i>
              {{ secItem.authName }}
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      menuList: [],
      iconList: {
        "125": "el-icon-user",
        "103": "el-icon-lock",
        "101": "el-icon-shopping-bag-2",
        "102": "el-icon-notebook-2",
        "145": "el-icon-pie-chart",
      },
      isCollapse: false,
    };
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg());
      this.menuList = res.data;
    },
    toggleAside() {
      this.isCollapse = !this.isCollapse;
    },
  },
  created() {
    this.getMenuList();
  },
};
</script>

<style scoped lang="less">
//element ui的组件名就是class类名,可以直接用.class选取添加样式
.home {
  height: 100vh;
}

.el-aside .menu {
  border: none;
}

.el-header {
  background-color: #373d41;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;

  button {
    height: 50%;
  }
}

.el-aside {
  background-color: #333744;
  color: white;
  overflow: hidden;

  .toggleAside {
    width: 100%;
    background-color: #333744;
    border: none;
    outline: none;
    color: white;
    cursor: pointer;
    height: 30px;

    &:hover {
      background-color: rgb(41, 44, 54);
    }
  }
}

.isClose {
  transform: rotateY(180deg);
}

.el-main {
  background-color: #eaedf1;
}
</style>
