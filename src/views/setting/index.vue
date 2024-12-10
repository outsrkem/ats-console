<template>
    <div>
        <el-card class="box-card">
            <template #header>日志配置</template>
            <p>实验室功能</p>
        </el-card>
    </div>
</template>

<script>
export default {
    name: "SettingIndex",
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
        this.$globalBus.emit("updateActivePath", "/setting");
    },
};
</script>

<style scoped lang="less"></style>
