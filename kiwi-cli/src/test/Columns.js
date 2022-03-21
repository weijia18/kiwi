export const fundColumns = [{
    props: 'inventory_date',
    label: '日期',
    width: '2.4rem',
    fixed: true,
    order: 1
}, {
    props: 'assets_current_sum',
    label: '总资产',
    width: '1.6rem',
    fixed: false,
    order: 2,
    isAmount: true,
    showInChart: true,
    chartOptions: {
        colorOpt: {
            color: '#2B60DD',
            gradient: 'transparent'
        },
        widthOpt: 132
    },
    tapAction: (ctx, text) => {
        ctx.$toast((Number(text) / 100).toFixed(2));
    }
}, {
    props: 'assets_balance_fund',
    label: '货基',
    width: '1.6rem',
    fixed: false,
    order: 3,
    isAmount: true,
    showInChart: true,
    chartOptions: {
        colorOpt: {
            color: '#0DB384',
            gradient: 'transparent'
        },
        widthOpt: 160
    }
}, {
    props: 'assets_steady_fund',
    label: '稳健',
    width: '1.6rem',
    fixed: false,
    order: 4,
    isAmount: true,
    showInChart: true,
    chartOptions: {
        colorOpt: {
            color: '#23B1ED',
            gradient: 'transparent'
        },
        widthOpt: 112
    }
}, {
    props: 'assets_advanced_fund',
    label: '进阶',
    width: '1.6rem',
    fixed: false,
    order: 5,
    isAmount: true,
    showInChart: true,
    chartOptions: {
        colorOpt: {
            color: '#F8C563',
            gradient: 'transparent'
        },
        widthOpt: 132
    }
}, {
    props: 'assets_high_end_fund',
    label: '高端',
    width: '1.6rem',
    fixed: false,
    order: 6,
    isAmount: true,
    showInChart: true,
    chartOptions: {
        colorOpt: {
            color: '#6E5EFF',
            gradient: 'transparent'
        },
        widthOpt: 112
    }
}, {
    props: 'assets_yiqitou_fund',
    label: '一起投',
    width: '1.6rem',
    fixed: false,
    order: 7,
    isAmount: true,
    showInChart: true,
    chartOptions: {
        colorOpt: {
            color: '#F72C5B',
            gradient: 'transparent'
        },
        widthOpt: 112
    }
}, {
    props: 'assets_other_fund',
    label: '其他',
    width: '1.6rem',
    fixed: false,
    order: 8,
    isAmount: true,
    showInChart: true,
    chartOptions: {
        colorOpt: {
            color: '#68c9d3',
            gradient: 'transparent'
        },
        widthOpt: 112
    }
}];

export const fundProductColumns = [{
        props: 'fund_name',
        label: '产品名称',
        width: '2.88rem',
        fixed: true
    }, {
        props: 'fund_type',
        label: '产品类型',
        width: '2rem',
        fixed: false
    }, {
        props: 'hold_amount',
        label: '持有金额',
        width: '2rem',
        fixed: false,
        isAmount: true
    }, {
        props: 'profits_yesterday',
        label: '昨日收益',
        width: '2rem',
        fixed: false,
        isAmount: true
    }
    // {
    //   props: 'expiry_date',
    //   label: '到期时间',
    //   width: '2.56rem',
    //   fixed: false
    // }
];

export const tradeColumns = [{
    props: 'trade_time',
    label: '时间',
    width: '3rem',
    fixed: true,
    tapAction: (ctx, text) => {
        ctx.$toast(text);
    }
}, {
    props: 'fund_name',
    label: '资产',
    width: '2.88rem',
    fixed: false,
    tapAction: (ctx, text) => {
        ctx.$toast(text);
    }
}, {
    props: 'trade_amount',
    label: '交易金额',
    width: '2rem',
    fixed: false,
    isAmount: true
}, {
    props: 'trade_type',
    label: '交易类型',
    width: '2rem',
    fixed: false
}];

export const customerProfileColumns = [{
    label: '姓名',
    props: 'name',
    hasVerLine: true
}, {
    label: '会员',
    props: 'vip_level'
}, {
    label: '年龄',
    props: 'age',
    hasVerLine: true
}, {
    label: '生日',
    props: 'birthday'
}, {
    label: '开户日期',
    props: 'account_open_time',
    hasVerLine: true
}, {
    label: '首笔申购日期',
    props: 'first_purchase_time'
}];