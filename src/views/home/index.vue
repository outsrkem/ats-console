<template>
    <div class="settings-container">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <div class="my_refresh">
                        <el-row>
                            <span>审计日志</span>
                            <span style="padding-left: 5px; padding-right: 5px"></span>
                        </el-row>
                        <el-row>
                            <el-date-picker
                                size="small"
                                v-model="eventQuery.etime"
                                value-format="x"
                                type="datetimerange"
                                :shortcuts="eventQuery.shortcuts"
                                range-separator="-"
                                start-placeholder="开始时间"
                                end-placeholder="结束时间"
                                @change="onRefresh"
                            />
                            <el-button size="small" type="primary" @click="onRefresh" :loading="loading" style="margin-left: 10px">刷新</el-button>
                        </el-row>
                    </div>
                </div>
            </template>
            <div>
                <el-table :data="elogs" v-loading="loading">
                    <el-table-column width="130" prop="name" label="事件名称" show-overflow-tooltip />
                    <el-table-column width="130" prop="service" label="服务" show-overflow-tooltip />
                    <el-table-column width="150" prop="account" label="操作账号" show-overflow-tooltip />
                    <el-table-column prop="resource_id" label="资源ID" show-overflow-tooltip />
                    <el-table-column width="130" prop="rating" label="事件级别" show-overflow-tooltip />
                    <el-table-column prop="message" label="事件内容" show-overflow-tooltip />
                    <el-table-column width="130" prop="source_ip" label="源地址" show-overflow-tooltip />
                    <el-table-column label="操作时间" show-overflow-tooltip>
                        <template #default="scope">{{ formatDate(scope.row.etime) }}</template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="pagination">
                <div>
                    <!--分页开始-->
                    <Pagination :pageTotal="pageTotal" :pageSize="pageSize" @CurrentChange="onCurrentChange" @SizeChange="onSizeChange" />
                    <!--分页结束-->
                </div>
            </div>
        </el-card>
    </div>
</template>
<script>
import Pagination from "@/components/pagination/pagination";
import { formatTime } from "@/utils/date.js";
import { basicInfo, GetAutLog } from "../../api";
export default {
    name: "HomeIndex",
    components: {
        Pagination,
    },
    props: {},
    data() {
        return {
            userInfo: "",
            timeoutId: null,
            elogs: [],
            pageTotal: 0,
            pageSize: 10,
            page: 1,
            loading: true,
            eventQuery: {
                etime: null, // []
                shortcuts: [
                    {
                        text: "最近1小时",
                        value: () => {
                            const end = new Date();
                            const start = new Date();
                            start.setHours(start.getHours() - 1);
                            if (start.getHours() < 0) {
                                start.setDate(start.getDate() - 1); // 如果小时数为负，则日期减一天
                                start.setHours(23); // 设置为前一天的23点
                            }
                            return [start, end];
                        },
                    },
                    {
                        text: "最近1天",
                        value: () => {
                            const end = new Date();
                            const start = new Date();
                            start.setDate(start.getDate() - 1);
                            return [start, end];
                        },
                    },
                    {
                        text: "最近1周",
                        value: () => {
                            const end = new Date();
                            const start = new Date();
                            start.setDate(start.getDate() - 7);
                            return [start, end];
                        },
                    },
                    {
                        text: "最近1月",
                        value: () => {
                            const end = new Date();
                            const start = new Date(end);
                            start.setMonth(start.getMonth() - 1);
                            // 如果当前日期是1月或2月，并且设置了上个月的日期，
                            // 可能会遇到年份变化的情况（例如，从1月减到上个月会变成上一年的12月）。
                            // 此处不需要额外处理，因为setMonth已经正确处理了年份的变化。
                            return [start, end];
                        },
                    },
                ],
            },
        };
    },
    methods: {
        GetbasicInfo: async function () {
            const res = await basicInfo();
            this.userInfo = JSON.stringify(res, null, 4);
        },
        loadGetAutLog: function (page_size, page) {
            const etime = this.eventQuery.etime;
            const paging = { page_size: page_size, page: page };
            let par1 = {};
            if (etime != null) {
                par1 = { from: etime[0], to: etime[1] };
            }
            const params = { ...par1, ...paging };
            GetAutLog(params)
                .then((res) => {
                    this.elogs = res.payload.items;
                    this.pageTotal = res.payload.page_info.total;
                    this.loading = false;
                })
                .catch((err) => {
                    this.loading = false;
                    if (err.status !== 403) {
                        this.$message.error({ message: err.data, plain: true, showClose: true, duration: 2000 });
                    }
                });
        },
        formatDate(time) {
            return formatTime(time);
        },
        onRefresh() {
            this.loading = true;
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                this.loadGetAutLog(this.pageSize, this.page);
            }, this.$config.delayTime);
        },
        onCurrentChange(p) {
            this.page = p;
            this.loadGetAutLog(this.pageSize, p);
        },
        onSizeChange(s) {
            this.pageSize = s;
            this.page = 1;
            this.loadGetAutLog(s, 1);
        },
        // 设置查询的起始时间
        setFromTime() {
            let dateCopy = new Date(new Date());
            dateCopy.setMonth(dateCopy.getMonth() - 2);
            let timestamp = dateCopy.getTime();
            this.eventQuery.etime = [timestamp];
        },
    },
    created() {
        this.setFromTime();
        this.GetbasicInfo();
        this.onRefresh();
    },
};
</script>

<style scoped lang="less"></style>
