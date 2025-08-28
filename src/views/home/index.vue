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
                                    style="width: 350px"
                                    value-format="x"
                                    type="datetimerange"
                                    :shortcuts="eventQuery.shortcuts"
                                    :disabled-date="disabledDate"
                                    range-separator="-"
                                    start-placeholder="开始时间"
                                    end-placeholder="结束时间"
                                    @change="onRefresh" />
                                <el-input
                                    size="small"
                                    v-model="eventQuery.inputcriteria"
                                    style="width: 350px"
                                    clearable
                                    placeholder=""
                                    @clear="onRefresh"
                                    @keyup.enter="onRefresh">
                                    <template #prepend>
                                        <el-select size="small" v-model="eventQuery.select" placeholder="查询条件" style="width: 100px">
                                            <el-option label="资源ID" value="resid" />
                                            <el-option label="服务" value="svc" />
                                        </el-select>
                                    </template>
                                    <template #append>
                                        <el-button size="small" @click="onRefresh">搜索</el-button>
                                    </template>
                                </el-input>
                                <el-button size="small" type="primary" @click="onRefresh" :loading="loading.autlog"> 刷新 </el-button>
                            </el-space>
                        </el-row>
                    </div>
                </div>
            </template>
            <div>
                <el-table :data="elogs" v-loading="loading.autlog">
                    <el-table-column prop="name" label="事件名称" width="170" show-overflow-tooltip />
                    <el-table-column prop="service" label="服务" width="100" show-overflow-tooltip />
                    <el-table-column prop="account" label="操作账号" show-overflow-tooltip />
                    <el-table-column prop="resource_id" label="资源ID" width="320" show-overflow-tooltip />
                    <el-table-column prop="rating" label="事件级别" width="100" show-overflow-tooltip>
                        <template #default="scope">
                            <span class="rating-dot" :class="scope.row.rating" />
                            <span>{{ scope.row.rating }}</span>
                        </template>
                    </el-table-column>
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
        <el-dialog v-model="openExtras" title="日志详情" width="1200px" :close-on-click-modal="false" draggable>
            <div style="margin-left: 28px; margin-right: 28px" v-loading="loading.extras">
                <div class="code-container">
                    <pre class="codepre">{{ moreData }}</pre>
                </div>
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
import { convertToLimitOffset } from "../../utils/common.js";

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
            pageSize: 15,
            page: 1,
            eventQuery: {
                select: "resid", // 默认按资源id查询
                inputcriteria: null, // 查询条件
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
            // 设置禁用掉的日期
            disabledDate: (time) => {
                return time.getTime() > Date.now();
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
            const paging = convertToLimitOffset(page, page_size);
            let par1 = {};
            if (etime != null) {
                par1 = { from: etime[0], to: etime[1] };
            }
            let par2 = {};
            if (this.eventQuery.inputcriteria !== null && this.eventQuery.inputcriteria !== "") {
                // 查询条件不为空时才进行查询条件构造
                switch (this.eventQuery.select) {
                    case "resid":
                        par2 = { resid: this.eventQuery.inputcriteria };
                        break;
                    case "svc":
                        par2 = { svc: this.eventQuery.inputcriteria };
                        break;
                }
            }

            const params = { ...par1, ...par2, ...paging };
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
    },
    created() {
        this.$globalBus.emit("updateActivePath", "/");
        this.GetbasicInfo();
        this.onRefresh();
    },
};
</script>

<style scoped lang="less">
.code-container {
    position: relative;
    max-height: 600px;
    overflow: auto;
    margin-top: 10px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 10px;
    background-color: #f5f5f5;
}
.codepre {
    box-sizing: border-box;
    /*以下样式是自动换行代码*/
    white-space: pre-wrap; /* css-3 */
    white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
    white-space: -pre-wrap; /* Opera 4-6 */
    white-space: -o-pre-wrap; /* Opera 7 */
    word-wrap: break-word; /* Internet Explorer 5.5+ */
    /*以上样式是自动换行代码，需要的加上，不需要的删除*/
    overflow: auto;
    font-family: "Menlo", "Monaco", "Consolas", "Courier New", monospace;
    font-size: 13px;
    padding: 1px;
    margin-top: 0px;
    margin-bottom: 0px;
    line-height: 1.2;
    color: #333333;
    word-break: break-all;
    word-wrap: break-word;
    border-radius: 4px;
    background-color: #f5f5f5;
}
.rating-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 7px;
    vertical-align: middle;
}
.normal {
    background-color: #50d4ab;
}
.warning {
    background-color: #ffb700;
}
.incident {
    background-color: #fc5043;
}
</style>
