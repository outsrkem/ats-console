<template>
    <div class="settings-container">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>审计日志</span>
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
            elogs: [],
            pageTotal: 0,
            pageSize: 10,
            page: 1,
        };
    },
    methods: {
        GetbasicInfo: async function () {
            const res = await basicInfo();
            this.userInfo = JSON.stringify(res, null, 4);
        },
        loadGetAutLog: function (page_size, page) {
            const params = { page_size: page_size, page: page };
            GetAutLog(params).then((res) => {
                this.elogs = res.payload.items;
                this.pageTotal = res.payload.page_info.total;
            });
        },
        formatDate(time) {
            return formatTime(time);
        },
        onRefresh() {
            this.loadGetAutLog(this.pageSize, this.page);
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
        this.GetbasicInfo();
        this.onRefresh();
    },
};
</script>

<style scoped lang="less"></style>
