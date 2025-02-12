<script lang="ts" setup>
import {
  getAllPostsApi,
  // deleteBatchPostsApi,
  // deletePostApi,
  // createPostApi,
  // updatePostApi,
  batchDeletePostsApi,
  exportPostsCsvApi,
  exportPostsExcelApi,
  exportPostsJsonApi,
  handlePostReportApi,
  batchRecommendPostsApi,
  getPostReportsApi,
  getPostsOverviewApi,
  getDailyPostStatisticsApi,
  getUserPostRankingApi,
  syncAllDataToESApi,
  rebuildESIndexApi,
  batchPinPostsApi,
  batchUnhighlightPostsApi,
  getHotPostsAnalysisApi,
  getInteractionAnalysisApi,
  getCategoryStatisticsApi,
  auditContentApi,
  detectSensitiveWordsApi,
  analyzeUserBehaviorApi,
  analyzeContentTrendsApi,
  getKeywordAnalysisApi,
  getQualityDistributionApi,
} from "@@/apis/post/index";
import { usePagination } from "@@/composables/usePagination";
import { CirclePlus, Delete, Download, Refresh, RefreshRight, Search } from "@element-plus/icons-vue";
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import * as XLSX from "xlsx";
const { paginationData, handleCurrentChange, handleSizeChange } =
  usePagination();
// #region 表单数据和字段
const DEFAULT_FORM_DATA = {
  id: 0, // 帖子ID
  userId: 0, // 用户ID
  channelId: "", // 频道ID
  channelName: "", // 频道名称
  content: "", // 内容
  mediaUrl: "", // 媒体URL
  tags: "", // 标签（JSON数组格式）
  likeCount: 0, // 点赞数
  commentsCount: 0, // 评论数
  createdAt: "", // 创建时间
  updatedAt: "", // 更新时间
  isDelete: 0, // 是否删除（0=否，1=是）
  countyId: 0, // 区县Id
  cityId: 0, // 市Id
  provinceId: 0, // 省份Id
};

const dialogVisible = ref<boolean>(false);
const formRef = ref<FormInstance | null>(null);
const formData = ref({ ...DEFAULT_FORM_DATA });

const formRules = {
  content: [{ required: true, trigger: "blur", message: "请输入帖子内容" }],
  channelName: [{ required: true, trigger: "blur", message: "请输入频道名称" }],
};

let sat = false;
// #endregion

// #region 新增帖子
function handleCreate() {
  resetForm();
  sat = false;
  dialogVisible.value = true;
}

// 提交新增或修改帖子
function handleCreateOrUpdate() {
  dialogVisible.value = true;
  formRef.value?.validate((valid) => {
    if (!valid) {
      ElMessage.error("表单校验不通过");
      return;
    }
    loading.value = true;

    const api = !sat ? createPostApi : updatePostApi;
    const requestData = { ...formData.value };

    api(requestData)
      .then(() => {
        ElMessage.success(!sat ? "新增成功" : "修改成功");
        dialogVisible.value = false;
        getTableData(); // 重新加载表格数据
      })
      .catch(() => {
        ElMessage.error(!sat ? "新增失败" : "修改失败");
      })
      .finally(() => {
        loading.value = false;
      });
  });
}

// 重置表单数据
function resetForm() {
  formRef.value?.clearValidate();
  formData.value = { ...DEFAULT_FORM_DATA };
}
// #endregion

// #region 删除操作
const selectedRows = ref<TableData[]>([]);

function handleDelete(row: TableData) {
  ElMessageBox.confirm(`正在删除帖子：${row.content}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deletePostApi(row.id).then(() => {
      ElMessage.success("删除成功");
      getTableData();
    });
  });
}

function handleBatchDelete() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请选择要删除的行");
    return;
  }

  const postTitles = selectedRows.value.map((row) => row.content).join(", ");
  ElMessageBox.confirm(
    `确定要删除 ${selectedRows.value.length} 项帖子: ${postTitles} 吗？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(() => {
    const ids = selectedRows.value.map((row) => row.id);
    batchDeletePostsApi(ids).then(() => {
      ElMessage.success("删除成功");
      getTableData(); // 重新加载数据
      selectedRows.value = []; // 清空选中项
    });
  });
}

function handleSelectionChange(rows: TableData[]) {
  selectedRows.value = rows;
}
// #endregion

// #region 查询
const tableData = ref<TableData[]>([]);
  const searchData = reactive({
  keyword: "",
  channelName: "", // 可以扩展更多条件
});

const loading = ref(false);

function getTableData() {
  loading.value = true;
  getAllPostsApi(
    paginationData.currentPage || 1,  // 当前页
    paginationData.pageSize || 10,    // 每页条数
    searchData.keyword || undefined   // 关键词（可选）
  )
    .then(({ data }) => {
      paginationData.total = data.total;
      tableData.value = data.records.map((item) => ({
        ...item,
        id: item.id.toString(),
        channelName: item.channelName || "未定义",
        mediaUrl: item.mediaUrl || "",
        likeCount: item.likeCount || 0,
        commentsCount: item.commentsCount || 0,
        createdAt: item.createdAt || "",
        updatedAt: item.updatedAt || "",
      }));
    })
    .catch(() => {
      tableData.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleSearch() {
  paginationData.currentPage === 1
    ? getTableData()
    : (paginationData.currentPage = 1);
}

function resetSearch() {
  searchData.keyword = "";
  handleSearch();
}
// #endregion

// 改进导出为CSV格式的函数
function exportToCsv(filename: string, data: any[]) {
  // 确保数据是有效的
  if (data.length === 0) {
    ElMessage.error("没有数据可导出");
    return;
  }

  const csvContent = data.map((row) => Object.values(row).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// 改进导出为Excel格式的函数
function exportToExcel(filename: string, data: any[]) {
  if (data.length === 0) {
    ElMessage.error("没有数据可导出");
    return;
  }
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, filename);
}

// 改进导出为JSON格式的函数
function exportToJson(filename: string, data: any[]) {
  if (data.length === 0) {
    ElMessage.error("没有数据可导出");
    return;
  }
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8;",
  });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// 导出功能改进
function handleExport() {
  const selectedOption = ref<string | null>(null);

  ElMessageBox.prompt("请输入导出格式", "导出", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /^(CSV|Excel|JSON)$/i,
    inputErrorMessage: "请选择有效的导出格式",
    inputPlaceholder: "CSV/Excel/JSON",
    beforeClose: (action, instance, done) => {
      if (action === "confirm") {
        selectedOption.value = instance.inputValue;
        done();
      } else {
        selectedOption.value = "取消";
        done();
      }
    },
  })
    .then(() => {
      // 在选择CSV、Excel或JSON后，根据选项导出数据
      if (selectedOption.value === "CSV") {
        exportPostsCsvApi().then((res) => {
          if (res.data) {
            exportToCsv("posts.csv", res.data);
          } else {
            ElMessage.error("CSV导出失败，未获取到数据");
          }
        });
      } else if (selectedOption.value === "Excel") {
        exportPostsExcelApi().then((res) => {
          if (res.data) {
            exportToExcel("posts.xlsx", res.data);
          } else {
            ElMessage.error("Excel导出失败，未获取到数据");
          }
        });
      } else if (selectedOption.value === "JSON") {
        exportPostsJsonApi().then((res) => {
          if (res.data) {
            exportToJson("posts.json", res.data);
          } else {
            ElMessage.error("JSON导出失败，未获取到数据");
          }
        });
      } else {
        ElMessage.info("导出操作已取消");
      }
    })
    .catch(() => {
      ElMessage.info("导出操作已取消");
    });
}

// #endregion
watch(
  [() => paginationData.currentPage, () => paginationData.pageSize],
  () => {
    getTableData();
  },
  { immediate: true }
);
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item :prop="wait" label="关键字">
          <el-input
            v-model="searchData.keyword"
            placeholder="请输入标题/内容"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            查询
          </el-button>
          <el-button :icon="Refresh" @click="resetSearch"> 重置 </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="handleCreate">
            新增帖子
          </el-button>
          <el-button type="danger" :icon="Delete" @click="handleBatchDelete">
            批量删除
          </el-button>
        </div>
        <div>
          <el-tooltip content="下载">
            <el-button
              type="primary"
              :icon="Download"
              circle
              @click="handleExport"
            />
          </el-tooltip>
          <el-tooltip content="刷新当前页">
            <el-button
              type="primary"
              :icon="RefreshRight"
              circle
              @click="getTableData"
            />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="40" align="center" />
          <!-- 帖子ID -->
          <el-table-column
            prop="id"
            label="帖子ID"
            width="120"
            align="center"
          />
          <!-- 频道名称 -->
          <el-table-column
            prop="channelName"
            label="频道名称"
            width="180"
            align="center"
          />
          <!-- 内容 -->
          <el-table-column
            prop="content"
            label="帖子内容"
            width="500"
            align="center"
          />
          <!-- 点赞数 -->
          <el-table-column
            prop="likeCount"
            label="点赞数"
            width="120"
            align="center"
          />
          <!-- 评论数 -->
          <el-table-column
            prop="commentsCount"
            label="评论数"
            width="120"
            align="center"
          />
          <!-- 创建时间 -->
          <el-table-column
            prop="createdAt"
            label="创建时间"
            width="180"
            align="center"
          />
          <!-- 更新时间 -->
          <el-table-column
            prop="updatedAt"
            label="更新时间"
            width="180"
            align="center"
          />
          <!-- 删除操作 -->
          <el-table-column
            fixed="right"
            label="操作"
            width="150"
            align="center"
          >
            <template #default="scope">
              <el-button
                type="primary"
                text
                bg
                size="small"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-button>
              <el-button
                type="danger"
                text
                bg
                size="small"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :current-page="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/修改 -->
    <el-dialog
      v-model="dialogVisible"
      :title="!sat ? '新增帖子' : '修改帖子'"
      width="30%"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        label-width="100px"
        label-position="left"
      >
        <el-form-item prop="channelName" label="频道名称">
          <el-input v-model="formData.channelName" placeholder="请输入频道名称" />
        </el-form-item>

        <el-form-item prop="content" label="帖子内容">
          <el-input v-model="formData.content" placeholder="请输入帖子内容" />
        </el-form-item>

        <el-form-item prop="mediaUrl" label="媒体URL">
          <el-input v-model="formData.mediaUrl" placeholder="请输入媒体URL" />
        </el-form-item>

        <el-form-item prop="tags" label="标签">
          <el-input v-model="formData.tags" placeholder="请输入标签" />
        </el-form-item>

        <el-form-item prop="likeCount" label="点赞数">
          <el-input-number
            v-model="formData.likeCount"
            :min="0"
            label="点赞数"
            placeholder="请输入点赞数"
          />
        </el-form-item>

        <el-form-item prop="commentsCount" label="评论数">
          <el-input-number
            v-model="formData.commentsCount"
            :min="0"
            label="评论数"
            placeholder="请输入评论数"
          />
        </el-form-item>

        <el-form-item prop="createdAt" label="创建时间">
          <el-date-picker
            v-model="formData.createdAt"
            type="datetime"
            placeholder="选择创建时间"
          />
        </el-form-item>

        <el-form-item prop="updatedAt" label="更新时间">
          <el-date-picker
            v-model="formData.updatedAt"
            type="datetime"
            placeholder="选择更新时间"
          />
        </el-form-item>

        <el-form-item prop="isDelete" label="是否删除">
          <el-switch
            v-model="formData.isDelete"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleCreateOrUpdate"
          >确认</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.el-dialog {
  .el-form-item {
    margin-bottom: 20px;
  }

  .el-button {
    margin-right: 10px;
  }
}
</style>
