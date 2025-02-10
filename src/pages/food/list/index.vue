<script lang="ts" setup>
import type {
  CreateOrUpdateTableRequestData,
  TableData,
} from "@@/apis/table/type";
import type { FormInstance, FormRules } from "element-plus";
import {
  deleteTableDataApi,
  exportUserCsvApi,
  exportUserExcelApi,
  exportUserJsonApi,
  updateTableDataApi,
} from "@@/apis/table";
import { getTableDataApi, createTableDataApi, deleteBatchTableDataApi } from "@@/apis/food/index";
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

defineOptions({
  // 命名当前组件
  name: "Food_list",
});

const loading = ref<boolean>(false);
const { paginationData, handleCurrentChange, handleSizeChange } =
  usePagination();

// #region 新增食品
const DEFAULT_FORM_DATA = {
  id: 0, // 食物ID
  code: "", // 食物代码
  name: "", // 食物名称
  healthLabel: "", // 健康标签
  healthLight: 0, // 健康等级（0-3）
  suggest: "", // 建议食用量
  thumbImageUrl: "", // 缩略图链接
  largeImageUrl: "", // 大图链接
  contrastPhotoUrl: "", // 对比图链接
  isDynamicDish: false, // 是否为动态菜肴
  liquid: false, // 是否液体
  createdAt: "", // 创建时间
  updatedAt: "", // 更新时间
  deleted: 0, // 是否删除（0: 否，1: 是）
};

const dialogVisible = ref<boolean>(false);
const formRef = ref<FormInstance | null>(null);

const formData = ref({
  id: 0,
  code: "",
  name: "",
  healthLabel: "",
  healthLight: 0,
  suggest: "",
  thumbImageUrl: "",
  largeImageUrl: "",
  contrastPhotoUrl: "",
  isDynamicDish: false,
  liquid: false,
  createdAt: "",
  updatedAt: "",
  deleted: 0,
});

const formRules: FormRules<CreateOrUpdateTableRequestData> = {
  username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
  password: [{ required: true, trigger: "blur", message: "请输入密码" }],
};

// sat判断是增还是改
let sat = false;

function handleDateChange1(date: Date) {
  if (date) {
    formData.value.birthday = formatDate1(date); // 格式化日期
  }
}

// 格式化函数
function formatDate1(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function handleDateChange2(date: Date) {
  if (date) {
    formData.value.createdAt = formatDate2(date); // 格式化日期
  }
}

function handleDateChange3(date: Date) {
  if (date) {
    formData.value.updatedAt = formatDate2(date); // 格式化日期
  }
}

function handleDateChange4(date: Date) {
  if (date) {
    formData.value.lastLoginTime = formatDate2(date); // 格式化日期
  }
}

// 格式化函数
function formatDate2(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function handleCreate() {
  resetForm();
  sat = false;
  dialogVisible.value = true;
}

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
  formData.value = cloneDeep(DEFAULT_FORM_DATA);
}
// #endregion

// #region 删
function handleDelete(row: TableData) {
  ElMessageBox.confirm(`正在删除用户：${row.username}，确认删除？`, "提示", {
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
      console.log(data.records[0].id);
      tableData.value = data.records.map((item) => ({
        ...item,
        id: item.id.toString(),
        // 可以根据接口的返回字段进行映射
        healthLight: item.healthLight || 0, // 默认为 0
        healthLabel: item.healthLabel || "未定义",
        thumbImageUrl: item.thumbImageUrl || "", // 确保有缩略图
        suggest: item.suggest || "无建议",
        isLiquid: item.isLiquid ? "是" : "否",
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

function genderFormatter(row: any, column: any, cellValue: any) {
  if (cellValue === 0) {
    return "女";
  } else if (cellValue === 1) {
    return "男";
  } else {
    return "不规范";
  }
}
function birthdayFormatter(row: any, column: any, cellValue: any) {
  // 定义日期格式的正则表达式（YYYY-MM-DD）
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

  // 检查是否符合正则表达式
  if (typeof cellValue === "string" && dateRegex.test(cellValue)) {
    // 进一步验证日期是否有效（例如 2025-02-30 是无效的）
    const [year, month, day] = cellValue.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return cellValue; // 日期有效
    }
  }
  return "不规范"; // 不符合格式或无效日期
}
function roleFormatter(row: any, column: any, cellValue: any) {
  if (
    cellValue === "ADMIN" ||
    cellValue === "USER" ||
    cellValue === "SUPER_ADMIN"
  ) {
    return cellValue;
  } else {
    return "不规范";
  }
}
function formatNickname(row: any, column: any, cellValue: any) {
  // 截断昵称，最多显示 7 个字符
  if (cellValue.length > 7) {
    return `${cellValue.slice(0, 7)}...`;
  } else if (cellValue.length === 0) {
    return "不规范";
  }
  return cellValue;
}
function phoneFormatter(row: any, column: any, cellValue: any) {
  const phoneRegex = /^1[3-9]\d{9}$/;

  // 检查 cellValue 是否为字符串，并且是否符合手机号码的正则表达式
  if (typeof cellValue === "string" && phoneRegex.test(cellValue)) {
    return cellValue; // 如果符合，返回原始手机号码
  } else {
    return "不规范"; // 如果不符合，返回“不规范”
  }
}
function emailFormatter(row: any, column: any, cellValue: any) {
  // 定义邮箱格式的正则表达式
  const emailRegex = /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

  // 检查是否符合正则表达式
  if (typeof cellValue === "string" && emailRegex.test(cellValue)) {
    return cellValue; // 邮箱符合规范
  } else {
    return "不规范"; // 邮箱不符合规范
  }
}
function statusFormatter(row: any, column: any, cellValue: any) {
  if (cellValue === 1) {
    return "正常";
  } else if (cellValue === 2) {
    return "未填写信息";
  } else if (cellValue === 3) {
    return "锁定";
  } else if (cellValue === 4) {
    return "禁用";
  } else {
    return "不规范";
  }
}
function timeFormatter(row: any, column: any, cellValue: any) {
  // 定义日期时间格式的正则表达式（YYYY-MM-DD HH:MM:SS）
  const datetimeRegex = /^\d{4}-[01]\d-[0-3]\d [0-2]\d:[0-5]\d:[0-5]\d$/;

  // 检查是否符合正则表达式
  if (typeof cellValue === "string" && datetimeRegex.test(cellValue)) {
    // 进一步验证日期时间是否有效（例如 2025-02-30 是无效的）
    const [datePart, timePart] = cellValue.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);

    const date = new Date(year, month - 1, day, hour, minute, second);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day &&
      date.getHours() === hour &&
      date.getMinutes() === minute &&
      date.getSeconds() === second
    ) {
      return cellValue; // 日期时间有效
    }
  }
  return "不规范"; // 不符合格式或无效日期时间
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
          <el-button type="primary" :icon="CirclePlus" @click="handleCreate">
            新增食品
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
          <!-- 食物ID -->
          <el-table-column
            prop="id"
            label="食物ID"
            width="120"
            align="center"
          />

          <!-- 食物代码 -->
          <el-table-column
            prop="code"
            label="食物代码"
            width="180"
            align="center"
          />
          <!-- 食物图片 -->
          <el-table-column
            prop="thumbImageUrl"
            label="食物图片"
            width="120"
            align="center"
          >
            <template #default="scope">
              <el-image
                :src="scope.row.thumbImageUrl"
                fit="contain"
                style="width: 80px; height: 80px"
              />
            </template>
          </el-table-column>

          <!-- 食物名称 -->
          <el-table-column
            prop="name"
            label="食物名称"
            width="200"
            align="center"
          />

          <!-- 健康标签 -->
          <el-table-column
            prop="healthLabel"
            label="健康标签"
            width="120"
            align="center"
          >
            <template #default="scope">
              <span
                :class="{
                  'text-green-500': scope.row.healthLight === 1,
                  'text-yellow-500': scope.row.healthLight === 2,
                  'text-red-500': scope.row.healthLight === 3,
                }"
                >{{ scope.row.healthLabel }}</span
              >
            </template>
          </el-table-column>

          <!-- 建议食用量 -->
          <el-table-column
            prop="suggest"
            label="建议食用量"
            width="120"
            align="center"
          />

          <!-- 创建时间 -->
          <el-table-column
            prop="isLiquid"
            label="是否为液体"
            width="180"
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
        <el-form-item prop="code" label="食物代码">
          <el-input v-model="formData.code" placeholder="请输入食物代码" />
        </el-form-item>

        <el-form-item prop="name" label="食物名称">
          <el-input v-model="formData.name" placeholder="请输入食物名称" />
        </el-form-item>

        <el-form-item prop="healthLabel" label="健康标签">
          <el-input
            v-model="formData.healthLabel"
            placeholder="请输入健康标签"
          />
        </el-form-item>

        <el-form-item prop="healthLight" label="健康等级">
          <el-select
            v-model="formData.healthLight"
            placeholder="请选择健康等级"
          >
            <el-option label="绿灯（健康）" :value="1" />
            <el-option label="黄灯（适量）" :value="2" />
            <el-option label="红灯（不推荐）" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item prop="suggest" label="建议食用量">
          <el-input v-model="formData.suggest" placeholder="请输入建议食用量" />
        </el-form-item>

        <el-form-item prop="thumbImageUrl" label="缩略图">
          <el-input
            v-model="formData.thumbImageUrl"
            placeholder="请输入缩略图URL"
          />
        </el-form-item>

        <el-form-item prop="largeImageUrl" label="大图链接">
          <el-input
            v-model="formData.largeImageUrl"
            placeholder="请输入大图URL"
          />
        </el-form-item>

        <el-form-item prop="contrastPhotoUrl" label="对比图链接">
          <el-input
            v-model="formData.contrastPhotoUrl"
            placeholder="请输入对比图URL"
          />
        </el-form-item>

        <el-form-item prop="isDynamicDish" label="是否为动态菜肴">
          <el-switch
            v-model="formData.isDynamicDish"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>

        <el-form-item prop="liquid" label="是否液体">
          <el-switch
            v-model="formData.liquid"
            active-text="是"
            inactive-text="否"
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
