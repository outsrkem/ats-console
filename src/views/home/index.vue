<template>
    <div>
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <div class="my_refresh">
                        <el-row>
                            <span>事件列表</span>
                            <span style="padding-left: 5px; padding-right: 5px"></span>
                        </el-row>
                        <el-row>
                            <el-space :size="10" spacer="">
                                <el-text>查询条件:</el-text>
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
                                <el-input size="small" v-model="eventQuery.name" style="width: 180px" clearable placeholder="事件名称" />
                                <el-input size="small" v-model="eventQuery.resourceId" style="width: 260px" clearable placeholder="资源ID" />
                                <el-button size="small" type="primary" @click="onRefresh" :loading="loading.autlog"> 刷新 </el-button>
                            </el-space>
                        </el-row>
                    </div>
                </div>
            </template>
            <div>
                <el-table :data="elogs" v-loading="loading.autlog">
                    <el-table-column prop="name" label="事件名称" show-overflow-tooltip />
                    <el-table-column prop="service" label="服务" show-overflow-tooltip />
                    <el-table-column prop="account" label="操作账号" show-overflow-tooltip />
                    <el-table-column prop="resource_id" label="资源ID" show-overflow-tooltip />
                    <el-table-column prop="rating" label="事件级别" show-overflow-tooltip />
                    <el-table-column prop="message" label="事件消息" show-overflow-tooltip />
                    <el-table-column label="操作时间" show-overflow-tooltip>
                        <template #default="scope">{{ formatDate(scope.row.etime) }}</template>
                    </el-table-column>
                    <el-table-column label="操作">
                        <template #default="scope">
                            <span v-if="scope.row.extras">
                                <el-button link type="primary" @click="onExtras(scope.row)">查看更多</el-button>
                            </span>
                        </template>
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
        <!-- 详情开始 -->
        <el-dialog v-model="openExtras" title="日志详情" width="960px" :close-on-click-modal="false" draggable>
            <div style="margin-left: 28px; margin-right: 28px" v-loading="loading.extras">
                <pre>{{ moreData }}</pre>
            </div>
        </el-dialog>
        <!-- 详情结束 -->
    </div>
</template>
<script>
import Pagination from "@/components/pagination/pagination";
import { deepClone } from "@/utils/deepClone.js";
import { formatTime } from "@/utils/date.js";
import { basicInfo, GetAutLog, GetExtras } from "../../api";
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
            eventQuery: {
                name: null,
                resourceId: null,
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
            openExtras: false,
            loading: {
                autlog: true,
                extras: true,
            },
            moreData: {},
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
                    this.loading.autlog = false;
                })
                .catch((err) => {
                    this.loading.autlog = false;
                    if (err.status !== 403) {
                        this.$message.error({ message: err.data, plain: true, showClose: true, duration: 2000 });
                    }
                });
        },
        onExtras(val) {
            this.loading.extras = true;
            this.openExtras = true;
            this.moreData = deepClone(val);
            const paths = { exid: val.extras };
            GetExtras(paths)
                .then((res) => {
                    this.loading.extras = false;
                    this.moreData.extras = res.payload.extras;
                })
                .catch();
        },
        formatDate(time) {
            return formatTime(time);
        },
        onRefresh() {
            this.loading.autlog = true;
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
        this.$globalBus.emit("updateActivePath", "/");
        this.setFromTime();
        this.GetbasicInfo();
        this.onRefresh();
    },
};
</script>

<style scoped lang="less">
pre {
    background-color: #f4f4f4;
    font-family: monospace;
    padding: 10px;
    white-space: pre-wrap;
    tab-size: 4;
    border-radius: 5px; /* 设置边框圆角 */
    overflow-x: auto; /* 设置水平滚动条（如果需要） */
}
</style>
