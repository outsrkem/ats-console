<template>
    <div class="el-aside">
        <el-menu :default-active="activePath" unique-opened>
            <el-menu-item index="/" @click="OnSwitchRoutes('/')"> <i class="el-icon-house"></i><span>审计日志</span> </el-menu-item>
        </el-menu>
    </div>
</template>

<script>
// import globalBus from '@/utils/global-bus'
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
    },
    mounted() {},
    methods: {
        saveActivePath(activePath) {
            this.activePath = activePath;
            window.sessionStorage.setItem("active-path", activePath);
        },
    },
};
</script>

<style scoped lang="less">
.el-aside {
    background-color: #ffffff;
    .el-menu {
        border-right: none;
    }
}
</style>
