import { request } from "@/http/axios"
import axios from "axios"

/** 增 - 批量推荐帖子 */
export function batchRecommendPostsApi(postIds: number[], days: number = 7) {
  return request({
    url: "/api/admin/posts/batch/recommend",
    method: "post",
    data: { postIds, days }
  })
}

/** 删 - 批量删除帖子 */
export function batchDeletePostsApi(postIds: number[]) {
  return request({
    url: "/api/admin/posts/batch",
    method: "delete",
    data: postIds
  })
}

/** 改 - 批量置顶帖子 */
export function batchPinPostsApi(postIds: number[]) {
  return request({
    url: "/api/admin/posts/batch/pin",
    method: "post",
    data: postIds
  })
}

/** 查 - 获取所有帖子列表 */
export function getAllPostsApi(pageNum: number = 1, pageSize: number = 10, keyword?: string) {
  return request({
    url: "/api/admin/posts/list",
    method: "get",
    params: { pageNum, pageSize, keyword }
  })
}

/** 查 - 获取帖子举报列表 */
export function getPostReportsApi(pageNum: number = 1, pageSize: number = 10) {
  return request<Table.TableResponseData>({
    url: "/api/admin/posts/reports",
    method: "get",
    params: { pageNum, pageSize }
  })
}

/** 查 - 获取帖子总体统计信息 */
export function getPostsOverviewApi() {
  return request<Table.TableResponseData>({
    url: "/api/admin/posts/statistics/overview",
    method: "get"
  })
}

/** 查 - 获取每日帖子统计 */
export function getDailyPostStatisticsApi(days: number = 30) {
  return request<Table.TableResponseData>({
    url: "/api/admin/posts/statistics/daily",
    method: "get",
    params: { days }
  })
}

/** 查 - 获取用户发帖排行 */
export function getUserPostRankingApi(limit: number = 10) {
  return request<Table.TableResponseData>({
    url: "/api/admin/posts/statistics/user-ranking",
    method: "get",
    params: { limit }
  })
}

/** 审核 - 审核帖子 */
export function auditPostApi(postId: number, action: string, reason?: string) {
  return request<boolean>({
    url: `/api/admin/posts/${postId}/audit`,
    method: "post",
    params: { action, reason }
  })
}

/** 审核 - 获取待审核帖子列表 */
export function getAuditPostsApi(pageNum: number = 1, pageSize: number = 10) {
  return request<Table.TableResponseData>({
    url: "/api/admin/posts/audit/list",
    method: "get",
    params: { pageNum, pageSize }
  })
}

/** 导出 - 导出帖子数据为 CSV */
export function exportPostsCsvApi() {
  return axios.get("/api/admin/posts/export/csv", {
    responseType: "blob"
  })
}

/** 导出 - 导出帖子数据为 Excel */
export function exportPostsExcelApi() {
  return axios.get("/api/admin/posts/export/excel", {
    responseType: "blob"
  })
}

/** 导出 - 导出帖子数据为 JSON */
export function exportPostsJsonApi() {
  return axios.get("/api/admin/posts/export/json", {
    responseType: "blob"
  })
}

/** 同步 - 同步所有帖子数据到 ES */
export function syncAllDataToESApi() {
  return request({
    url: "/api/admin/posts/es/sync-all",
    method: "post"
  })
}

/** 重建索引 - 重建 ES 索引 */
export function rebuildESIndexApi() {
  return request({
    url: "/api/admin/posts/es/rebuild-index",
    method: "post"
  })
}

/** 增 - 批量精选帖子 */
export function batchHighlightPostsApi(postIds: number[]) {
  return request({
    url: "/api/admin/posts/batch/highlight",
    method: "post",
    data: postIds
  })
}

/** 删 - 批量取消精选帖子 */
export function batchUnhighlightPostsApi(postIds: number[]) {
  return request({
    url: "/api/admin/posts/batch/highlight",
    method: "delete",
    data: postIds
  })
}

/** 查 - 获取热门帖子分析 */
export function getHotPostsAnalysisApi(days: number = 7, limit: number = 10) {
  return request<Table.TableResponseData>({
    url: "/api/admin/posts/hot/analysis",
    method: "get",
    params: { days, limit }
  })
}

/** 查 - 获取帖子互动分析 */
export function getInteractionAnalysisApi(days: number = 7) {
  return request<Table.TableResponseData>({
    url: "/api/admin/posts/interaction/analysis",
    method: "get",
    params: { days }
  })
}

/** 查 - 获取分类统计信息 */
export function getCategoryStatisticsApi() {
  return request<Table.TableResponseData>({
    url: "/api/admin/posts/category/statistics",
    method: "get"
  })
}

/** 查 - 获取帖子内容审核 */
export function auditContentApi(limit: number = 10) {
  return request<Table.TableResponseData>({
    url: "/api/admin/posts/es/content-audit",
    method: "get",
    params: { limit }
  })
}

/** 查 - 获取敏感词检测 */
export function detectSensitiveWordsApi(limit: number = 10) {
  return request<Table.TableResponseData>({
    url: "/api/admin/posts/es/sensitive-words",
    method: "get",
    params: { limit }
  })
}

/** 查 - 用户行为分析 */
export function analyzeUserBehaviorApi(userId: number, days: number = 30) {
  return request<Table.TableResponseData>({
    url: "/api/admin/posts/es/user-behavior",
    method: "get",
    params: { userId, days }
  })
}

/** 查 - 内容趋势分析 */
export function analyzeContentTrendsApi(days: number = 30) {
  return request<Table.TableResponseData>({
    url: "/api/admin/posts/es/content-trends",
    method: "get",
    params: { days }
  })
}

/** 查 - 关键词分析 */
export function getKeywordAnalysisApi(days: number = 7, limit: number = 20) {
  return request<Table.TableResponseData>({
    url: "/api/admin/posts/es/keyword-analysis",
    method: "get",
    params: { days, limit }
  })
}

/** 查 - 内容质量分布 */
export function getQualityDistributionApi() {
  return request<Table.TableResponseData>({
    url: "/api/admin/posts/es/quality-distribution",
    method: "get"
  })
}

/** 查 - 获取帖子举报处理状态 */
export function handlePostReportApi(reportId: number, action: string, feedback?: string) {
  return request<boolean>({
    url: `/api/admin/posts/reports/${reportId}/handle`,
    method: "post",
    params: { action, feedback }
  })
}

/** 查 - 获取帖子举报的详情 */
export function getPostReportDetailsApi(reportId: number) {
  return request<Table.TableResponseData>({
    url: `/api/admin/posts/reports/${reportId}`,
    method: "get"
  })
}

/** 查 - 获取帖子内容详情 */
export function getPostDetailsApi(postId: number) {
  return request<Table.TableResponseData>({
    url: `/api/admin/posts/${postId}`,
    method: "get"
  })
}

/** 查 - 获取帖子与评论分析 */
export function getPostCommentAnalysisApi(postId: number) {
  return request<Table.TableResponseData>({
    url: `/api/admin/posts/${postId}/comments/analysis`,
    method: "get"
  })
}

/** 查 - 获取帖子互动数据 */
export function getPostInteractionDataApi(postId: number) {
  return request<Table.TableResponseData>({
    url: `/api/admin/posts/${postId}/interaction`,
    method: "get"
  })
}

/** 查 - 获取帖子作者的其他帖子 */
export function getOtherPostsByAuthorApi(userId: number) {
  return request<Table.TableResponseData>({
    url: `/api/admin/posts/user/${userId}/posts`,
    method: "get"
  })
}

/** 同步 - 同步帖子数据到 ES */
export function syncPostsToESApi() {
  return request({
    url: "/api/admin/posts/es/sync",
    method: "post"
  })
}

/** 重建索引 - 重新构建帖子索引 */
export function rebuildPostIndexApi() {
  return request({
    url: "/api/admin/posts/es/rebuild-index",
    method: "post"
  })
}

/** 同步 - 批量同步帖子到 ES */
export function syncBatchPostsToESApi(postIds: number[]) {
  return request({
    url: "/api/admin/posts/es/sync-batch",
    method: "post",
    data: postIds
  })
}

/** 改 - 置顶帖子 */
export function pinPostApi(postId: number) {
  return request({
    url: `/api/admin/posts/${postId}/pin`,
    method: "post"
  })
}

/** 改 - 取消置顶帖子 */
export function unpinPostApi(postId: number) {
  return request({
    url: `/api/admin/posts/${postId}/unpin`,
    method: "delete"
  })
}

/** 改 - 移动帖子分类 */
export function movePostCategoryApi(postId: number, targetCategory: string) {
  return request({
    url: `/api/admin/posts/${postId}/move-category`,
    method: "post",
    params: { targetCategory }
  })
}
