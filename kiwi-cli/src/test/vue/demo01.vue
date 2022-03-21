<template>
    <div>
        <div class="item">
            <input type="text" placeholder="请输入" />
        </div>
        <div class="item">
            <p>红烧豆腐</p>
            <Test></Test>
        </div>
        <div :class="['item', flag ? 'flag' : '']">
            <span>蜀山街道{{ name }}</span>
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
        return {
            name: "傻逼",
            flag: true
        };
    }
};
</script>