<template>
  <el-container class="main-container">
    <!-- 移除header元素，避免与HomePage.vue中的导航栏冲突 -->
    <el-main class="main-content">
      <!-- 路由视图，用于显示不同页面的内容 -->
      <router-view></router-view>
    </el-main>
    <el-footer class="footer">© 2024 房地产门户</el-footer>
  </el-container>
</template>

<script setup>
// 未来可以在这里添加脚本逻辑
</script>

<style scoped>
.main-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.header {
  background-color: #409EFF; /* Element Plus 主题蓝 */
  color: white;
  text-align: center;
  line-height: 0; /* 移除高度 */
  font-size: 20px;
  padding: 0; /* 移除内边距 */
  height: 0; /* 设置高度为0 */
}

.main-content {
  flex-grow: 1; /* 让主内容区域占据剩余空间 */
  padding: 0;
  width: 100%;
}

.footer {
  background-color: #f2f6fc; /* Element Plus 浅灰色 */
  color: #909399; /* Element Plus 次要文字颜色 */
  text-align: center;
  line-height: 60px; /* 默认 el-footer 高度 */
  width: 100%;
  border-top: none !important;
  box-shadow: none !important;
}

/* 移除可能存在的全局或父级样式影响 */
body, #app {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow-x: hidden;
  width: 100%;
}
</style>
