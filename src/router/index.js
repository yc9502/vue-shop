import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../components/Login";
import Home from "../components/Home";
import Welcome from "../components/Welcome";
import Users from "../components/users/Users";
import Roles from "../components/power/Roles";
import Rights from "../components/power/Rights";
import Category from "../components/goods/Category";
import Params from "../components/goods/Params";

Vue.use(VueRouter);

const routes = [
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/home",
    component: Home,
    redirect: "/welcome",
    children: [
      { path: "/welcome", component: Welcome },
      { path: "/users", component: Users },
      { path: "/roles", component: Roles },
      { path: "/rights", component: Rights },
      { path: "/categories", component: Category },
      { path: "/params", component: Params },
    ],
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

//挂载路由导航守卫,有的页面需要权限才能访问,这时候就需要路由首页进行配置
router.beforeEach((to, from, next) => {
  //  to 将要访问的路径
  //  from 代表从哪个路径跳转而来
  //  next 是一个函数,表示放行
  if (to.path === "/login") return next();
  //从sessionStorage中取出保存的token
  const tokenStr = window.sessionStorage.getItem("token");
  //如果没有token,就跳转到登录页面
  if (!tokenStr) return next("/login");
  //存在token,放行
  next();
});
export default router;
