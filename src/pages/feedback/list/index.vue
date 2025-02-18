<script lang="ts" setup>
import type {
  CreateOrUpdateTableRequestData,
  TableData,
} from "@@/apis/table/type";
import type { FormInstance, FormRules } from "element-plus";
import {
  exportUserCsvApi,
  exportUserExcelApi,
  exportUserJsonApi,
} from "@@/apis/table";
import {
  getTableDataApi,
  deleteBatchTableDataApi,
  deleteTableDataApi,
  updateFeedbackStatusApi,
} from "@@/apis/feedback/index";
import { usePagination } from "@@/composables/usePagination";
import {
  CirclePlus,
  Delete,
  Download,
  Refresh,
  RefreshRight,
  Search,
} from "@element-plus/icons-vue";
import { cloneDeep } from "lodash-es";
import moment from "moment";
import { ref } from "vue";
import * as XLSX from "xlsx";
import { ElMessage } from "element-plus";

defineOptions({
  // 命名当前组件
  name: "Food_list",
});

const loading = ref<boolean>(false);
const { paginationData, handleCurrentChange, handleSizeChange } =
  usePagination();

const dialogVisible = ref<boolean>(false);
const formRef = ref<FormInstance | null>(null);

const formData = ref({
  id: 0,
  foodId: 0,
  rating: 0,
  comment: "",
  status: "",
  createdAt: "",
  updatedAt: "",
});

const formRules: FormRules<CreateOrUpdateTableRequestData> = {
  username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
  password: [{ required: true, trigger: "blur", message: "请输入密码" }],
};

// sat判断是增还是改
let sat = false;

// 提交新增或修改食物
function handleCreateOrUpdate() {
  dialogVisible.value = true;
  formRef.value?.validate((valid) => {
    if (!valid) {
      ElMessage.error("表单校验不通过");
      return;
    }
    loading.value = true;

    const api = !sat ? createTableDataApi : updateTableDataApi;
    const requestData = {
      id: formData.value.id,
      code: formData.value.code,
      name: formData.value.name,
      healthLabel: formData.value.healthLabel,
      healthLight: formData.value.healthLight,
      suggest: formData.value.suggest,
      thumbImageUrl: formData.value.thumbImageUrl,
      largeImageUrl: formData.value.largeImageUrl,
      contrastPhotoUrl: formData.value.contrastPhotoUrl,
      isDynamicDish: formData.value.isDynamicDish,
      liquid: formData.value.liquid,
      createdAt: formData.value.createdAt,
      updatedAt: formData.value.updatedAt,
      deleted: formData.value.deleted,
    };

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
}
// #endregion

// #region 删
function handleDelete(row: TableData) {
  ElMessageBox.confirm(`正在删除${row.username}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteTableDataApi(row.id).then(() => {
      ElMessage.success("删除成功");
      getTableData();
    });
  });
}

const selectedRows = ref<TableData[]>([]);

function handleBatchDelete() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请选择要删除的行");
    return;
  }

  ElMessageBox.confirm(
    `确定要删除 ${selectedRows.value.length} 项吗？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(() => {
    const ids = selectedRows.value.map((row) => row.id);
    console.log(ids);
    deleteBatchTableDataApi(ids).then(() => {
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

// #region 改
function handleUpdate(row: TableData) {
  sat = true;
  console.log("开始修改");
  dialogVisible.value = true;
  formData.value = cloneDeep(row);
}
// #endregion

// #region 查
const tableData = ref<TableData[]>([]);
const searchFormRef = ref<FormInstance | null>(null);
const searchData = reactive({
  keyword: "",
});

function getTableData() {
  loading.value = true;
  getTableDataApi({
    page: paginationData.currentPage || 1, // 确保传递正确的当前页
    size: paginationData.pageSize || 10, // 确保传递每页条数
    keyword: searchData.keyword || undefined,
  })
    .then(({ data }) => {
      paginationData.total = data.total;
      tableData.value = data.records.map((item) => ({
        id: item.id.toString(),
        foodId: item.foodId, // Food ID
        rating: item.rating, // Rating
        comment: item.comment, // Comment
        status: item.status, // Status
        createdAt: moment(item.createdAt).format("YYYY-MM-DD HH:mm:ss"), // Format createdAt
        updatedAt: moment(item.updatedAt).format("YYYY-MM-DD HH:mm:ss"), // Format updatedAt
      }));
    })
    .catch(() => {
      tableData.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
}

let wait = "nickname";
function updateWait(a: any) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  // 检查 a 是否为字符串，并且是否符合手机号码的正则表达式
  if (typeof a === "string" && phoneRegex.test(a)) {
    wait = "phone";
  }
  const emailRegex = /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

  // 检查是否符合正则表达式
  if (typeof a === "string" && emailRegex.test(a)) {
    wait = "email"; // 邮箱符合规范
  }
}
function handleSearch() {
  updateWait(searchData.keyword);
  paginationData.currentPage === 1
    ? getTableData()
    : (paginationData.currentPage = 1);
}
function resetSearch() {
  searchData.keyword = "";
  handleSearch();
}
// #endregion

// 导出不同格式
function exportToCsv(filename: string, data: any[]) {
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

function exportToExcel(filename: string, data: any[]) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, filename);
}

function exportToJson(filename: string, data: any[]) {
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

function handleExport() {
  const selectedOption = ref<string | null>(null);

  ElMessageBox.prompt("", "导出", {
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
      if (selectedOption.value === "CSV") {
        exportToCsv("users.csv", tableData.value);
      } else if (selectedOption.value === "Excel") {
        exportToExcel("users.xlsx", tableData.value);
      } else if (selectedOption.value === "JSON") {
        exportToJson("users.json", tableData.value);
      } else {
        ElMessage.info("导出操作已取消");
      }
    })
    .catch(() => {
      ElMessage.info("导出操作已取消");
    });
}
// #endregion

// 监听分页参数的变化
watch(
  [() => paginationData.currentPage, () => paginationData.pageSize],
  () => {
    getTableData();
  },
  { immediate: true }
);
// 处理状态更新
function handleStatusChange(row: TableData) {
  // 调用 updateFeedbackStatusApi 更新状态
  updateFeedbackStatusApi(row.id, row.status)
    .then(() => {
      ElMessage.success("状态更新成功");
      // 你可以在这里执行一些后续操作，比如重新加载表格数据等
    })
    .catch(() => {
      ElMessage.error("状态更新失败");
    });
}
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item :prop="wait" label="关键字">
          <el-input
            v-model="searchData.keyword"
            placeholder="请输入邮箱/手机号/昵称"
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

          <!-- ID -->
          <el-table-column
            prop="foodId"
            label="ID"
            width="160"
            align="center"
          />

          <!-- 评分 -->
          <el-table-column
            prop="rating"
            label="评分"
            width="120"
            align="center"
          />

          <!-- 评论 -->
          <el-table-column
            prop="comment"
            label="评论"
            width="550"
            align="center"
          />

          <el-table-column
            prop="status"
            label="状态"
            width="150"
            align="center"
          >
            <template #default="scope">
              <el-select
                v-model="scope.row.status"
                @change="handleStatusChange(scope.row)"
                :disabled="scope.row.status === '已处理'"
              >
                <el-option label="待处理" value="待处理" />
                <el-option label="已处理" value="已处理" />
              </el-select>
            </template>
          </el-table-column>

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
      :title="!sat ? '新增食品' : '修改食品'"
      width="30%"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        label-width="100px"
        label-position="left"
      >
        <el-form-item prop="foodId" label="食物ID">
          <el-input v-model="formData.foodId" placeholder="请输入食物ID" />
        </el-form-item>

        <el-form-item prop="rating" label="评分">
          <el-input v-model="formData.rating" placeholder="请输入评分" />
        </el-form-item>

        <el-form-item prop="comment" label="评论">
          <el-input v-model="formData.comment" placeholder="请输入评论" />
        </el-form-item>

        <el-form-item prop="status" label="状态">
          <el-input v-model="formData.status" placeholder="请输入状态" />
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
</style>
