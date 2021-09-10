<template>
    <div>
        <div class="item">
            <input type="text" placeholder="请输入" />
        </div>
        <div class="item">
            <p>红烧豆腐</p>
            <Test></Test>
        </div>
        <div class="item">
            <span>蜀山街道</span>
        </div>
    </div>
</template>
<script>
import Test from './components/test.vue';
export default {
    components: {
        Test
    },
    data() {
        return {};
    }
};
</script>