<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script>
export default {
    name: "App",
    methods: {},
    created() {
        let url = new URL(window.location.href);
        url.searchParams.set("project", "default");
        window.history.pushState({}, "", url);
    },
};
</script>

<style></style>
