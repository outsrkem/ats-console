<template>
    <el-aside class="aside" style="width: auto">
        <p style="text-align: center">审计日志</p>
        <el-menu :default-active="activePath" unique-opened>
            <el-menu-item index="/" @click="OnSwitchRoutes('/')">
                <el-icon><Tickets /></el-icon>
                <template #title><span>事件列表</span></template>
            </el-menu-item>
            <el-menu-item index="/setting" @click="OnSwitchRoutes('/setting')">
                <el-icon><Setting /></el-icon>
                <template #title><span>日志配置</span></template>
            </el-menu-item>
        </el-menu>
    </el-aside>
</template>

<script>
export default {
    name: "AppAside",
    components: {},
    props: {},
    data() {
        return {
            activePath: "",
            menusList: [],
        };
    },
    computed: {},
    watch: {},
    created() {
        this.activePath = window.sessionStorage.getItem("active-path") || "/";
        this.$globalBus.on("updateActivePath", (data) => {
            this.activePath = data;
        });
    },
    mounted() {},
    methods: {
        saveActivePath(activePath) {
            this.activePath = activePath;
            window.sessionStorage.setItem("active-path", activePath);
        },
        OnSwitchRoutes(activePath) {
            this.saveActivePath(activePath);
            this.$router.push({ path: activePath });
        },
    },
};
</script>

<style scoped lang="less">
.aside {
    flex-shrink: 0;
    .aside-menu {
        height: 100%;
    }
    .el-menu {
        border-right: none;
    }
}
</style>
