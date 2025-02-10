import type * as Table from "./type"
import { request } from "@/http/axios"
import axios from "axios"

/** 增 */
export function createTableDataApi(data: CreateUserRequestData) {
  return request({
    url: "/api/admin/user/create",
    method: "post",
    data
  })
}

/** 删 */
export function deleteTableDataApi(id: number) {
  return request({
    url: `/api/admin/user/delete/${id}`,
    method: "delete"
  })
}
export function deleteBatchTableDataApi(ids: number[]) {
  return request({
    url: "/api/admin/user/delete-batch",
    method: "delete",
    data: ids
  })
}

/** 改 */
export function updateTableDataApi(data: Table.CreateOrUpdateTableRequestData) {
  return request({
    url: `/api/admin/user/update/${data.id}`,
    method: "post",
    data
  })
}

/** 查 */
export function getTableDataApi(params: Table.TableRequestData) {
  return request<Table.TableResponseData>({
    url: "/api/admin/user/get/page",
    method: "get",
    params
  })
}
export function getTableDataApiNew(params: Table.TableRequestDataNew) {
  return request<Table.TableResponseData>({
    url: `/api/admin/user/detail/${params.id}`,
    method: "get",
    params
  })
}

/** 导出 */
// 导出用户数据为 CSV
export function exportUserCsvApi() {
  return axios.get("/api/admin/user/export/csv", {
    responseType: "blob"
  })
}

// 导出用户数据为 Excel
export function exportUserExcelApi() {
  return axios.get("/api/admin/user/export/excel", {
    responseType: "blob"
  })
}

// 导出用户数据为 JSON
export function exportUserJsonApi() {
  return axios.get("/api/admin/user/export/json", {
    responseType: "blob"
  })
}

export interface CreateUserRequestData {
  avatarUrl?: string
  birthday?: string
  createdAt?: string
  deleted?: number
  email?: string
  gender?: number
  id?: number
  lastLoginTime?: string
  nickname?: string
  phone?: string
  role?: string
  status?: number
  updatedAt?: string
  username: string
}
