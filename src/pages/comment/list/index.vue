<script lang="ts" setup>
import type {
  CreateOrUpdateTableRequestData,
  TableData,
} from "@@/apis/table/type";
import type { FormInstance, FormRules } from "element-plus";
import {
  getTableDataApi,
  createTableDataApi,
  deleteBatchTableDataApi,
  deleteTableDataApi,
  updateTableDataApi,
} from "@@/apis/comment/index";
import { usePagination } from "@@/composables/usePagination";
import { ref } from "vue";
import { ElMessage } from "element-plus";
import moment from "moment";

// 分页配置
const loading = ref<boolean>(false);
const { paginationData, handleCurrentChange, handleSizeChange } =
  usePagination();

// #region 新增/修改评论
const DEFAULT_FORM_DATA = {
  id: 0, // 评论ID
  postId: 0, // 关联的文章ID
  userId: 0, // 用户ID
  content: "", // 评论内容
  parentId: null, // 父评论ID
  createdAt: "", // 创建时间
  updatedAt: "", // 更新时间
  deleted: 0, // 是否删除
};

const dialogVisible = ref<boolean>(false);
const formRef = ref<FormInstance | null>(null);
const formData = ref({
  id: 0,
  postId: 0,
  userId: 0,
  content: "",
  parentId: null,
  createdAt: "",
  updatedAt: "",
  deleted: 0,
});

const formRules: FormRules<CreateOrUpdateTableRequestData> = {
  content: [{ required: true, trigger: "blur", message: "请输入评论内容" }],
};

// sat判断是增还是改
let sat = false;

function handleCreate() {
  resetForm();
  sat = false;
  dialogVisible.value = true;
}

// 提交新增或修改评论
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
      postId: formData.value.postId,
      userId: formData.value.userId,
      content: formData.value.content,
      parentId: formData.value.parentId,
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
  formData.value = { ...DEFAULT_FORM_DATA };
}
// #endregion

// #region 删除评论
function handleDelete(row: TableData) {
  ElMessageBox.confirm(`正在删除评论：${row.content}，确认删除？`, "提示", {
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

// #region 查询
const tableData = ref<TableData[]>([]);
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
        postId: item.postId,
        userId: item.userId,
        content: item.content,
        parentId: item.parentId,
        createdAt: moment(item.createdAt).format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment(item.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
        deleted: item.deleted,
      }));
    })
    .catch(() => {
      tableData.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
}
// #endregion

// #region 搜索功能
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

// 导出功能
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
        exportToCsv("comments.csv", tableData.value);
      } else if (selectedOption.value === "Excel") {
        exportToExcel("comments.xlsx", tableData.value);
      } else if (selectedOption.value === "JSON") {
        exportToJson("comments.json", tableData.value);
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
            placeholder="请输入评论内容"
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
        <el-button type="primary" :icon="CirclePlus" @click="handleCreate">
          新增评论
        </el-button>
        <el-button type="danger" :icon="Delete" @click="handleBatchDelete">
          批量删除
        </el-button>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="40" align="center" />

          <!-- 评论ID -->
          <el-table-column
            prop="id"
            label="评论ID"
            width="120"
            align="center"
          />

          <!-- 文章ID -->
          <el-table-column
            prop="postId"
            label="文章ID"
            width="180"
            align="center"
          />

          <!-- 用户ID -->
          <el-table-column
            prop="userId"
            label="用户ID"
            width="180"
            align="center"
          />

          <!-- 评论内容 -->
          <el-table-column
            prop="content"
            label="评论内容"
            width="550"
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
                size="small"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-button>
              <el-button
                type="danger"
                text
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
      :title="!sat ? '新增评论' : '修改评论'"
      width="30%"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        label-width="100px"
        label-position="left"
      >
        <el-form-item prop="postId" label="文章ID">
          <el-input v-model="formData.postId" placeholder="请输入文章ID" />
        </el-form-item>

        <el-form-item prop="userId" label="用户ID">
          <el-input v-model="formData.userId" placeholder="请输入用户ID" />
        </el-form-item>

        <el-form-item prop="content" label="评论内容">
          <el-input
            v-model="formData.content"
            placeholder="请输入评论内容"
          />
        </el-form-item>

        <el-form-item prop="parentId" label="父评论ID">
          <el-input v-model="formData.parentId" placeholder="请输入父评论ID" />
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

        <el-form-item prop="deleted" label="是否删除">
          <el-switch
            v-model="formData.deleted"
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
</style>
