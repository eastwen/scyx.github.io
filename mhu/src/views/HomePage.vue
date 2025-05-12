<template>
  <div class="home-container">
    <!-- 顶部导航 -->
    <div class="top-nav-wrapper">
      <div class="top-nav-inner">
        <el-menu
          :default-active="activeIndex"
          class="top-nav"
          mode="horizontal"
          background-color="#409EFF"
          text-color="#fff"
          active-text-color="#ffd04b">
          <el-menu-item index="1">首页</el-menu-item>
          <el-menu-item index="2">新房</el-menu-item>
          <el-menu-item index="3">二手房</el-menu-item>
          <el-menu-item index="4">租房</el-menu-item>
          <el-menu-item index="5">房产资讯</el-menu-item>
          <el-menu-item index="6">关于我们</el-menu-item>
        </el-menu>
      </div>
    </div>

    <!-- Banner区域 -->
    <div class="banner">
      <el-carousel height="400px">
        <el-carousel-item v-for="item in 4" :key="item">
          <div class="banner-item" :class="'banner-item-' + item">
            <h2>精品房源推荐 {{ item }}</h2>
            <p>为您提供最优质的房源选择</p>
            <el-button type="primary" size="large">立即查看</el-button>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 主要内容区域 -->
    <div class="home-wrapper">
      <el-row :gutter="40" class="main-section">
        <el-col :span="6">
          <el-card class="search-card">
            <h3>房源搜索</h3>
            <el-input placeholder="请输入城市/小区/地铁等关键词" v-model="search"></el-input>
            <el-button type="primary" style="width:100%;margin-top:16px;">搜索</el-button>
          </el-card>
        </el-col>
        <el-col :span="18">
          <el-card class="listing-card">
            <h3>热门房源推荐</h3>
            <div class="listing-placeholder">
              <!-- 这里将来可以放房源列表 -->
              暂无房源数据，敬请期待！
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 公司简介区域 -->
      <el-card class="company-intro">
        <h2 class="section-title">公司简介</h2>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="company-image">
              <!-- 公司图片占位 -->
              <div class="image-placeholder">公司形象图</div>
            </div>
          </el-col>
          <el-col :span="16">
            <div class="company-text">
              <h3>关于我们的房地产服务</h3>
              <p>我们是一家专业的房地产服务机构，致力于为客户提供高质量的房产交易、租赁及咨询服务。公司成立于2010年，拥有丰富的行业经验和专业的服务团队。</p>
              <p>我们的使命是帮助每一位客户找到理想的居所，无论是首次置业、改善住房还是投资房产，我们都能提供全方位的专业支持和建议。</p>
              <p>公司业务覆盖新房销售、二手房交易、房屋租赁、房产评估等多个领域，为不同需求的客户提供个性化的解决方案。</p>
              <el-button type="primary">了解更多</el-button>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const search = ref('')
const activeIndex = ref('1')
</script>

<style scoped>
/* 全局容器 */
.home-container {
  width: 100%;
  overflow-x: hidden;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

/* 顶部导航 */
.top-nav-wrapper {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #409EFF;
}

.top-nav {
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: transparent !important;
  display: flex;
  justify-content: flex-start;
  border-bottom: none !important;
  box-shadow: none !important;
}

.top-nav-inner {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: flex-start;
}

/* 移除.nav-content相关样式 */
.nav-content {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

/* Banner区域 */
.banner {
  width: 100%;
  margin-bottom: 30px;
  margin-top: 60px; /* 添加上边距，避免被固定导航栏遮挡 */
}

.banner-item {
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  background-size: cover;
  background-position: center;
}

.banner-item h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.7);
}

.banner-item p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
}

.banner-item-1 {
  background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://via.placeholder.com/1200x400?text=房源1') no-repeat center;
}

.banner-item-2 {
  background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://via.placeholder.com/1200x400?text=房源2') no-repeat center;
}

.banner-item-3 {
  background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://via.placeholder.com/1200x400?text=房源3') no-repeat center;
}

.banner-item-4 {
  background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://via.placeholder.com/1200x400?text=房源4') no-repeat center;
}

/* 主内容区域 */
.home-wrapper {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 16px;
}

.main-section {
  margin-bottom: 40px;
}

.search-card {
  padding: 24px 16px;
}

.listing-card {
  min-height: 400px;
  padding: 24px 16px;
}

.listing-placeholder {
  color: #bbb;
  text-align: center;
  margin-top: 40px;
  font-size: 1.1rem;
}

/* 公司简介区域 */
.company-intro {
  margin-bottom: 40px;
  padding: 30px;
}

.section-title {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  font-size: 28px;
  color: #333;
}

.section-title:after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: #409EFF;
}

.company-image {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  width: 100%;
  height: 250px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  border-radius: 4px;
}

.company-text {
  padding: 0 15px;
}

.company-text h3 {
  margin-bottom: 20px;
  color: #303133;
}

.company-text p {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #606266;
}
</style>