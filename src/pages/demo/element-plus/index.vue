<script lang="ts" setup>
import type { CreateOrUpdateTableRequestData, TableData } from "@@/apis/table/type"
import type { FormInstance, FormRules } from "element-plus"
import { createTableDataApi, deleteBatchTableDataApi, deleteTableDataApi, exportUserCsvApi, exportUserExcelApi, exportUserJsonApi, getTableDataApi, updateTableDataApi } from "@@/apis/table"
import { usePagination } from "@@/composables/usePagination"
import { CirclePlus, Delete, Download, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { cloneDeep } from "lodash-es"
import moment from "moment"
import { ref } from "vue"
import * as XLSX from "xlsx"

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

// #region 新增用户
const DEFAULT_FORM_DATA: CreateOrUpdateTableRequestData = {
  avatarUrl: "",
  id: 0, // 将默认值设为 undefined，便于判断是否为新增操作
  username: "",
  gender: 0,
  birthday: "",
  role: "",
  nickname: "",
  phone: "",
  email: "",
  status: 0,
  createdAt: "",
  updatedAt: "",
  lastLoginTime: "",
  deleted: 0
}

const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = ref<CreateOrUpdateTableRequestData>(cloneDeep(DEFAULT_FORM_DATA))
const formRules: FormRules<CreateOrUpdateTableRequestData> = {
  username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
  password: [{ required: true, trigger: "blur", message: "请输入密码" }]
}

// sat判断是增还是改
let sat = false

function handleDateChange1(date: Date) {
  if (date) {
    formData.value.birthday = formatDate1(date) // 格式化日期
  }
}

// 格式化函数
function formatDate1(date: Date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

function handleDateChange2(date: Date) {
  if (date) {
    formData.value.createdAt = formatDate2(date) // 格式化日期
  }
}

function handleDateChange3(date: Date) {
  if (date) {
    formData.value.updatedAt = formatDate2(date) // 格式化日期
  }
}

function handleDateChange4(date: Date) {
  if (date) {
    formData.value.lastLoginTime = formatDate2(date) // 格式化日期
  }
}

// 格式化函数
function formatDate2(date: Date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const seconds = date.getSeconds().toString().padStart(2, "0")
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function handleCreate() {
  resetForm()
  sat = false
  dialogVisible.value = true
}

// 提交新增或修改用户
function handleCreateOrUpdate() {
  dialogVisible.value = true
  formRef.value?.validate((valid) => {
    if (!valid) {
      ElMessage.error("表单校验不通过")
      return
    }
    loading.value = true
    const api = !sat ? createTableDataApi : updateTableDataApi
    console.log("wc")
    api(formData.value)
      .then(() => {
        ElMessage.success(!sat ? "新增成功" : "修改成功")
        dialogVisible.value = false
        getTableData() // 重新加载表格数据
      })
      .catch(() => {
        ElMessage.error(!sat ? "新增失败" : "修改失败")
      })
      .finally(() => {
        loading.value = false
      })
  })
}

// 重置表单数据
function resetForm() {
  formRef.value?.clearValidate()
  formData.value = cloneDeep(DEFAULT_FORM_DATA)
}
// #endregion

// #region 删
function handleDelete(row: TableData) {
  ElMessageBox.confirm(`正在删除用户：${row.username}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteTableDataApi(row.id).then(() => {
      ElMessage.success("删除成功")
      getTableData()
    })
  })
}

const selectedRows = ref<TableData[]>([])

function handleBatchDelete() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请选择要删除的行")
    return
  }

  ElMessageBox.confirm(`确定要删除 ${selectedRows.value.length} 项吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    const ids = selectedRows.value.map(row => row.id)
    console.log(ids)
    deleteBatchTableDataApi(ids).then(() => {
      ElMessage.success("删除成功")
      getTableData() // 重新加载数据
      selectedRows.value = [] // 清空选中项
    })
  })
}

function handleSelectionChange(rows: TableData[]) {
  selectedRows.value = rows
}
// #endregion

// #region 改
function handleUpdate(row: TableData) {
  sat = true
  console.log("开始修改")
  dialogVisible.value = true
  formData.value = cloneDeep(row)
}
// #endregion

// #region 查
const tableData = ref<TableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  keyword: ""
})
function getTableData() {
  loading.value = true
  getTableDataApi({
    page: paginationData.page || undefined,
    size: paginationData.size || undefined,
    keyword: searchData.keyword || undefined
  }).then(({ data }) => {
    paginationData.total = data.total
    tableData.value = data.records
    console.log(data)
  }).catch(() => {
    tableData.value = []
  }).finally(() => {
    loading.value = false
  })
}
let wait = "nickname"
function updateWait(a: any) {
  const phoneRegex = /^1[3-9]\d{9}$/
  // 检查 a 是否为字符串，并且是否符合手机号码的正则表达式
  if (typeof a === "string" && phoneRegex.test(a)) {
    wait = "phone"
  }
  const emailRegex = /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i

  // 检查是否符合正则表达式
  if (typeof a === "string" && emailRegex.test(a)) {
    wait = "email" // 邮箱符合规范
  }
}
function handleSearch() {
  updateWait(searchData.keyword)
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
function resetSearch() {
  searchData.keyword = ""
  handleSearch()
}
// #endregion

// 导出不同格式
function exportToCsv(filename: string, data: any[]) {
  const csvContent = data.map(row =>
    Object.values(row).join(",")
  ).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

function exportToExcel(filename: string, data: any[]) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
  XLSX.writeFile(workbook, filename)
}

function exportToJson(filename: string, data: any[]) {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
  const link = document.createElement("a")
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

function handleExport() {
  const selectedOption = ref<string | null>(null)

  ElMessageBox.prompt("", "导出", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /^(CSV|Excel|JSON)$/i,
    inputErrorMessage: "请选择有效的导出格式",
    inputPlaceholder: "CSV/Excel/JSON",
    beforeClose: (action, instance, done) => {
      if (action === "confirm") {
        selectedOption.value = instance.inputValue
        done()
      } else {
        selectedOption.value = "取消"
        done()
      }
    }
  }).then(() => {
    if (selectedOption.value === "CSV") {
      exportToCsv("users.csv", tableData.value)
    } else if (selectedOption.value === "Excel") {
      exportToExcel("users.xlsx", tableData.value)
    } else if (selectedOption.value === "JSON") {
      exportToJson("users.json", tableData.value)
    } else {
      ElMessage.info("导出操作已取消")
    }
  }).catch(() => {
    ElMessage.info("导出操作已取消")
  })
}
// #endregion

// 监听分页参数的变化
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })

function genderFormatter(row: any, column: any, cellValue: any) {
  if (cellValue === 0) {
    return "女"
  } else if (cellValue === 1) {
    return "男"
  } else {
    return "不规范"
  }
}
function birthdayFormatter(row: any, column: any, cellValue: any) {
  // 定义日期格式的正则表达式（YYYY-MM-DD）
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

  // 检查是否符合正则表达式
  if (typeof cellValue === "string" && dateRegex.test(cellValue)) {
    // 进一步验证日期是否有效（例如 2025-02-30 是无效的）
    const [year, month, day] = cellValue.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    if (
      date.getFullYear() === year
      && date.getMonth() === month - 1
      && date.getDate() === day
    ) {
      return cellValue // 日期有效
    }
  }
  return "不规范" // 不符合格式或无效日期
}
function roleFormatter(row: any, column: any, cellValue: any) {
  if (cellValue === "ADMIN" || cellValue === "USER" || cellValue === "SUPER_ADMIN") {
    return cellValue
  } else {
    return "不规范"
  }
}
function formatNickname(row: any, column: any, cellValue: any) {
  // 截断昵称，最多显示 7 个字符
  if (cellValue.length > 7) {
    return `${cellValue.slice(0, 7)}...`
  } else if (cellValue.length === 0) {
    return "不规范"
  }
  return cellValue
}
function phoneFormatter(row: any, column: any, cellValue: any) {
  const phoneRegex = /^1[3-9]\d{9}$/

  // 检查 cellValue 是否为字符串，并且是否符合手机号码的正则表达式
  if (typeof cellValue === "string" && phoneRegex.test(cellValue)) {
    return cellValue // 如果符合，返回原始手机号码
  } else {
    return "不规范" // 如果不符合，返回“不规范”
  }
}
function emailFormatter(row: any, column: any, cellValue: any) {
  // 定义邮箱格式的正则表达式
  const emailRegex = /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i

  // 检查是否符合正则表达式
  if (typeof cellValue === "string" && emailRegex.test(cellValue)) {
    return cellValue // 邮箱符合规范
  } else {
    return "不规范" // 邮箱不符合规范
  }
}
function statusFormatter(row: any, column: any, cellValue: any) {
  if (cellValue === 1) {
    return "正常"
  } else if (cellValue === 2) {
    return "未填写信息"
  } else if (cellValue === 3) {
    return "锁定"
  } else if (cellValue === 4) {
    return "禁用"
  } else {
    return "不规范"
  }
}
function timeFormatter(row: any, column: any, cellValue: any) {
  // 定义日期时间格式的正则表达式（YYYY-MM-DD HH:MM:SS）
  const datetimeRegex = /^\d{4}-[01]\d-[0-3]\d [0-2]\d:[0-5]\d:[0-5]\d$/

  // 检查是否符合正则表达式
  if (typeof cellValue === "string" && datetimeRegex.test(cellValue)) {
  // 进一步验证日期时间是否有效（例如 2025-02-30 是无效的）
    const [datePart, timePart] = cellValue.split(" ")
    const [year, month, day] = datePart.split("-").map(Number)
    const [hour, minute, second] = timePart.split(":").map(Number)

    const date = new Date(year, month - 1, day, hour, minute, second)
    if (
      date.getFullYear() === year
      && date.getMonth() === month - 1
      && date.getDate() === day
      && date.getHours() === hour
      && date.getMinutes() === minute
      && date.getSeconds() === second
    ) {
      return cellValue // 日期时间有效
    }
  }
  return "不规范" // 不符合格式或无效日期时间
}
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item :prop="wait" label="关键字">
          <el-input v-model="searchData.keyword" placeholder="请输入邮箱/手机号/昵称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            查询
          </el-button>
          <el-button :icon="Refresh" @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="handleCreate">
            新增用户
          </el-button>
          <el-button type="danger" :icon="Delete" @click="handleBatchDelete">
            批量删除
          </el-button>
        </div>
        <div>
          <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle @click="handleExport" />
          </el-tooltip>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="40" align="center" />
          <el-table-column prop="avatarUrl" label="头像" width="80" align="center">
            <template #default="scope">
              <el-avatar :src="scope.row.avatarUrl" size="default" />
            </template>
          </el-table-column>
          <el-table-column prop="id" label="用户ID" width="80" align="center" />
          <el-table-column prop="username" label="用户名" width="80" align="center" :formatter="formatNickname" />
          <el-table-column prop="gender" label="性别" width="80" align="center" :formatter="genderFormatter" />
          <el-table-column prop="birthday" label="生日" width="80" align="center" :formatter="birthdayFormatter" />
          <el-table-column prop="role" label="角色" align="center" width="80" :formatter="roleFormatter" />
          <el-table-column prop="nickname" label="昵称" align="center" width="80" :formatter="formatNickname" />
          <el-table-column prop="phone" label="手机号" align="center" :formatter="phoneFormatter" />
          <el-table-column prop="email" label="邮箱" align="center" :formatter="emailFormatter" />
          <el-table-column prop="status" label="状态" align="center" :formatter="statusFormatter" />
          <el-table-column prop="createdAt" label="创建时间" align="center" :formatter="timeFormatter" />
          <el-table-column prop="updatedAt" label="更新时间" align="center" :formatter="timeFormatter" />
          <el-table-column prop="lastLoginTime" label="最后登录时间" align="center" :formatter="timeFormatter" />
          <el-table-column fixed="right" label="删改操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">
                修改
              </el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">
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
      :title="!sat ? '新增用户' : '修改用户'"
      width="30%"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="avatarUrl" label="头像">
          <el-input v-model="formData.avatarUrl" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="username" label="用户名">
          <el-input v-model="formData.username" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="gender" label="性别">
          <el-input v-model="formData.gender" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="birthday" label="生日">
          <div>
            <div>
              <el-date-picker
                v-model="formData.birthday"
                type="date"
                placeholder="选择日期"
                size="default"
                @change="handleDateChange1"
              />
            </div>
          </div>
        </el-form-item>
        <el-form-item prop="role" label="角色">
          <el-input v-model="formData.role" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="nickname" label="昵称">
          <el-input v-model="formData.nickname" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="phone" label="手机号">
          <el-input v-model="formData.phone" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入" />
        </el-form-item>
        <div v-if="sat">
          <el-form-item prop="createdAt" label="创建时间">
            <div>
              <div class="block">
                <el-date-picker
                  v-model="formData.createdAt"
                  type="datetime"
                  placeholder="选择日期和时间"
                  @change="handleDateChange2"
                />
              </div>
            </div>
          </el-form-item>
          <el-form-item prop="updatedAt" label="更新时间">
            <div>
              <div class="block">
                <el-date-picker
                  v-model="formData.updatedAt"
                  type="datetime"
                  placeholder="选择日期和时间"
                  @change="handleDateChange3"
                />
              </div>
            </div>
          </el-form-item>
          <el-form-item prop="lastLoginTime" label="最后登录时间">
            <div>
              <div class="block">
                <el-date-picker
                  v-model="formData.lastLoginTime"
                  type="datetime"
                  placeholder="选择日期和时间"
                  @change="handleDateChange4"
                />
              </div>
            </div>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="loading" @click="handleCreateOrUpdate">
          确认
        </el-button>
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
