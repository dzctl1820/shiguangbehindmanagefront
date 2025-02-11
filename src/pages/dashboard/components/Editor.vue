<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { getFeedbackDataApi, getFeedbackAnalyseDataApi, getUserDataApi } from '@@/apis/common/index';

// 用于存储从后端获取的数据
const sentimentStats = ref({
  negative: 0,
  neutral: 0,
  positive: 0
});

const feedbackStats = ref({
  averageRating: 0,
  feedbackCount: 0
});

const userStats = ref({
  totalUsers: 0,
  activeUsers: 0,
  admins: 0
});

const summary = ref("加载中...");

const sentimentChart = ref(null);
const feedbackChart = ref(null);
const userChart = ref(null);

const fetchSentimentData = async () => {
  try {
    const response = await getFeedbackAnalyseDataApi();
    console.log("6661",response);
    feedbackStats.value = {
      averageRating: response.data.averageRating,
      feedbackCount: response.data.feedbackCount,
    };
    initFeedbackChart();
  } catch (error) {
    console.error("获取情感分析数据失败", error);
  }
};

// 获取用户反馈数据
const fetchFeedbackData = async () => {
  try {
    const response = await getFeedbackDataApi();
    console.log("6662",response);
    sentimentStats.value = {
      negative: response.data.sentimentStats.negative,
      neutral: response.data.sentimentStats.neutral,
      positive: response.data.sentimentStats.positive,
    };
    console.log("6663",sentimentStats.value);
    summary.value = response.data.summary;
    initSentimentChart();
  } catch (error) {
    console.error("获取用户反馈数据失败", error);
  }
};

// 获取用户统计数据
const fetchUserData = async () => {
  try {
    const response = await getUserDataApi();
    userStats.value = {
      totalUsers: response.data.totalUsers,
      activeUsers: response.data.activeUsers,
      admins: response.data.admins,
    };
    initUserChart();
  } catch (error) {
    console.error("获取用户数据失败", error);
  }
};

// 初始化情感分布图表
const initSentimentChart = () => {
  const chartInstance = echarts.init(sentimentChart.value);
  const option = {
    title: {
      subtext: '用户反馈情感统计',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        name: '情感类型',
        type: 'pie',
        radius: '55%',
        data: [
          { value: sentimentStats.value.negative, name: '负面' },
          { value: sentimentStats.value.neutral, name: '中立' },
          { value: sentimentStats.value.positive, name: '积极' },
        ],
      },
    ],
  };
  chartInstance.setOption(option);
};

// 初始化用户反馈图表
const initFeedbackChart = () => {
  const chartInstance = echarts.init(feedbackChart.value);
  const option = {
    title: {
      subtext: '用户反馈统计',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ['平均评分', '反馈总数'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '反馈数据',
        type: 'bar',
        data: [feedbackStats.value.averageRating, feedbackStats.value.feedbackCount],
      },
    ],
  };
  chartInstance.setOption(option);
};

// 初始化用户数据统计图表
const initUserChart = () => {
  const chartInstance = echarts.init(userChart.value);
  const option = {
    title: {
      subtext: '用户数据统计',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        name: '用户类型',
        type: 'pie',
        radius: '55%',
        data: [
          { value: userStats.value.totalUsers, name: '总用户数' },
          { value: userStats.value.activeUsers, name: '活跃用户数' },
          { value: userStats.value.admins, name: '管理员数' },
        ],
      },
    ],
  };
  chartInstance.setOption(option);
};

onMounted(() => {
  fetchSentimentData();
  fetchFeedbackData();
  fetchUserData();
});
</script>

<template>
  <div class="app-container">
    <el-row gutter={20} class="dashboard">
      <!-- 情感分布展示 -->
      <el-col :span="8">
        <el-card class="card" shadow="hover">
          <h3>情感分布</h3>
          <div ref="sentimentChart" style="height: 300px; width: 100%; margin: 20px;"></div>
          <p>{{ summary }}</p>
        </el-card>
      </el-col>

      <!-- 用户反馈统计 -->
      <el-col :span="8">
        <el-card class="card" shadow="hover">
          <h3>用户反馈</h3>
          <div ref="feedbackChart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 用户数据统计 -->
      <el-col :span="8">
        <el-card class="card" shadow="hover">
          <h3>用户统计</h3>
          <div ref="userChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.dashboard {
  margin-top: 20px;
}

.card {
  padding: 20px;
  text-align: center;
  background-color: #f4f6f8;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-bottom: 10px;
  font-size: 18px;
}

p {
  font-size: 14px;
  color: #333;
}
</style>
