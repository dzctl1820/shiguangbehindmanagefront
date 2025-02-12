<script lang="ts" setup>
import type { TableResponseData } from "@@/apis/table/type";
import type { ElMessageBoxOptions } from "element-plus";
import type {
  VxeFormInstance,
  VxeFormProps,
  VxeGridInstance,
  VxeGridProps,
  VxeModalInstance,
  VxeModalProps,
} from "vxe-table";
import {
  deleteTableDataApi,
  createTableDataApi,
  updateTableDataApi,
} from "@@/apis/comment/index"; // 修改为comment相关的API
import { getTableDataApi } from "@@/apis/comment/index"; // 修改为comment相关的API

defineOptions({
  name: "Comment_Table",
});

// #region vxe-grid
interface CommentMeta {
  id: number;
  postId: number;
  userId: number;
  content: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  deleted: number;
  _VXE_ID?: string;
}

const xGridDom = ref<VxeGridInstance>();
const selectedRows = ref<CommentMeta[]>([]);

const xGridOpt: VxeGridProps = reactive({
  loading: true,
  autoResize: true,
  rowStyle: () => ({ padding: "15px 0", margin: "60px 0" }),
  pagerConfig: { align: "right" },
  toolbarConfig: {
    refresh: true,
    custom: true,
    slots: { buttons: "toolbar-btns" },
  },
  columns: [
    { type: "checkbox", width: "50px" },
    { field: "postId", title: "文章ID", width: "180px" },
    { field: "userId", title: "用户ID", width: "150px" },
    { field: "content", title: "评论内容", width: "550px" },
    { field: "createdAt", title: "创建时间", width: "180px" },
    { field: "updatedAt", title: "更新时间", width: "180px" },
    {
      title: "操作",
      width: "150px",
      fixed: "right",
      slots: {
        default: "row-operate",
      },
    },
  ],
  proxyConfig: {
    seq: true,
    autoLoad: true,
    props: { total: "total" },
    ajax: {
      query: ({ page }) => {
        xGridOpt.loading = true;
        return new Promise((resolve) => {
          let total = 0;
          let result: CommentMeta[] = [];

          getTableDataApi({
            size: page.pageSize,
            currentPage: page.currentPage,
          })
            .then((res: TableResponseData) => {
              total = res.data.total;
              result = res.data.records;
              xGridOpt.loading = false;
              resolve({ total, result });
            })
            .catch(() => {
              xGridOpt.loading = false;
              resolve({ total: 0, result: [] });
            });
        });
      },
    },
  },
});
// #endregion

// #region vxe-modal
const xModalDom = ref<VxeModalInstance>();
const xModalOpt: VxeModalProps = reactive({
  title: "",
  showClose: true,
  escClosable: true,
  maskClosable: true,
  beforeHideMethod: () => {
    xFormDom.value?.clearValidate();
    return Promise.resolve();
  },
});
// #endregion

// #region vxe-form
const xFormDom = ref<VxeFormInstance>();
const xFormOpt: VxeFormProps = reactive({
  span: 24,
  titleWidth: "100px",
  loading: false,
  titleColon: false,
  data: {
    id: 0,
    postId: 0,
    userId: 0,
    content: "",
    parentId: null,
    createdAt: "",
    updatedAt: "",
    deleted: 0,
  },
  items: [
    { field: "postId", title: "文章ID", itemRender: { name: "$input" } },
    { field: "userId", title: "用户ID", itemRender: { name: "$input" } },
    { field: "content", title: "评论内容", itemRender: { name: "$input" } },
    {
      field: "parentId",
      title: "父评论ID",
      itemRender: { name: "$input" },
    },
    { field: "createdAt", title: "创建时间", itemRender: { name: "$input" } },
    { field: "updatedAt", title: "更新时间", itemRender: { name: "$input" } },
    {
      field: "deleted",
      title: "是否删除",
      itemRender: { name: "$switch" },
    },
  ],
});
// #endregion

// #region 增删改查
const crudStore = reactive({
  commitQuery: () => xGridDom.value?.commitProxy("query"),
  onShowModal: (row?: CommentMeta) => {
    xModalOpt.title = row ? "修改评论" : "新增评论";
    xModalDom.value?.open();
    nextTick(() => {
      if (!row) xFormDom.value?.reset();
      else xFormOpt.data = { ...row };
    });
  },
  onSubmitForm: () => {
    xModalDom.value?.close();
    crudStore.commitQuery();
  },
  onDelete: (row: CommentMeta) => {
    deleteTableDataApi(row.id).then(() => {
      ElMessage.success("删除成功");
      crudStore.commitQuery();
    });
  },
});
// #endregion
</script>

<template>
  <div class="app-container">
    <vxe-grid ref="xGridDom" v-bind="xGridOpt">
      <template #toolbar-btns>
        <vxe-button
          status="primary"
          icon="vxe-icon-add"
          @click="crudStore.onShowModal()"
        >
          新增评论
        </vxe-button>
        <vxe-button status="danger" icon="vxe-icon-delete">
          批量删除
        </vxe-button>
      </template>
      <template #row-operate="{ row }">
        <el-button link type="primary" @click="crudStore.onShowModal(row)">
          修改
        </el-button>
        <el-button link type="danger" @click="crudStore.onDelete(row)">
          删除
        </el-button>
      </template>
    </vxe-grid>
    <vxe-modal ref="xModalDom" v-bind="xModalOpt">
      <vxe-form ref="xFormDom" v-bind="xFormOpt" />
    </vxe-modal>
  </div>
</template>

<style scoped>
/* 调整表格行间距 */
:deep(.vxe-table--body-wrapper .vxe-body--row) {
  padding: 15px 0 !important;
  margin: 10px 0 !important;
}
</style>
