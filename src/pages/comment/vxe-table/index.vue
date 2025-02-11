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
} from "@@/apis/table";
import { getTableDataApi } from "@@/apis/food/index";

defineOptions({
  name: "Food_Table",
});

// #region vxe-grid
interface FoodMeta {
  id: number;
  code: string;
  name: string;
  healthLabel: string;
  healthLight: number;
  suggest: string;
  thumbImageUrl: string;
  largeImageUrl: string;
  contrastPhotoUrl: string | null;
  isDynamicDish: boolean;
  isLiquid: boolean;
  isAvailable: boolean | null;
  prompt: string | null;
  createdAt: string;
  updatedAt: string;
  deleted: number;
  _VXE_ID?: string;
}

const xGridDom = ref<VxeGridInstance>();
const selectedRows = ref<FoodMeta[]>([]);

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
    { field: "code", title: "食物代码", width: "180px" },
    { field: "name", title: "食物名称", width: "200px" },
    {
      field: "healthLabel",
      title: "健康标签",
      width: "150px",
      slots: {
        default: ({ row }: { row: FoodMeta }) => {
          return [
            h(
              "span",
              {
                class: {
                  "text-green-500": row.healthLight === 1,
                  "text-yellow-500": row.healthLight === 2,
                  "text-red-500": row.healthLight === 3,
                },
              },
              row.healthLabel
            ),
          ];
        },
      },
    },
    { field: "suggest", title: "建议食用量", width: "150px" },
    {
      field: "thumbImageUrl",
      title: "食物图片",
      width: "120px",
      slots: {
        default: ({ row }: { row: FoodMeta }) => {
          return h("img", {
            src: row.thumbImageUrl,
            style: "width: 60px; height: 60px; object-fit: contain;",
          });
        },
      },
    },
    {
      field: "isLiquid",
      title: "是否液体",
      width: "100px",
      formatter: ({ cellValue }: { cellValue: boolean }) =>
        cellValue ? "是" : "否",
    },
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
          let result: FoodMeta[] = [];

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
    code: "",
    name: "",
    healthLabel: "",
    healthLight: 0,
    suggest: "",
    thumbImageUrl: "",
    largeImageUrl: "",
    contrastPhotoUrl: null,
    isDynamicDish: false,
    isLiquid: false,
    isAvailable: null,
    prompt: null,
    createdAt: "",
    updatedAt: "",
  },
  items: [
    { field: "code", title: "食物代码", itemRender: { name: "$input" } },
    { field: "name", title: "食物名称", itemRender: { name: "$input" } },
    { field: "healthLabel", title: "健康标签", itemRender: { name: "$input" } },
    {
      field: "healthLight",
      title: "健康等级",
      itemRender: {
        name: "$select",
        options: [
          { label: "绿灯（健康）", value: 1 },
          { label: "黄灯（适量）", value: 2 },
          { label: "红灯（不推荐）", value: 3 },
        ],
      },
    },
    { field: "suggest", title: "建议食用量", itemRender: { name: "$input" } },
    { field: "thumbImageUrl", title: "缩略图", itemRender: { name: "$input" } },
    {
      field: "largeImageUrl",
      title: "大图链接",
      itemRender: { name: "$input" },
    },
    {
      field: "contrastPhotoUrl",
      title: "对比图",
      itemRender: { name: "$input" },
    },
    {
      field: "isDynamicDish",
      title: "是否动态菜肴",
      itemRender: { name: "$switch" },
    },
    { field: "isLiquid", title: "是否液体", itemRender: { name: "$switch" } },
  ],
});
// #endregion

// #region 增删改查
const crudStore = reactive({
  commitQuery: () => xGridDom.value?.commitProxy("query"),
  onShowModal: (row?: FoodMeta) => {
    xModalOpt.title = row ? "修改食品" : "新增食品";
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
  onDelete: (row: FoodMeta) => {
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
          新增食品
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
