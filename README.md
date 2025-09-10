# z-table

一个基于 Element Plus 封装的表格组件。

## 安装

```bash
npm install z-table
```

## 使用示例

```vue
<template>
  <z-table :data="tableData" :columns="columns" />
</template>

<script setup>
import { ref } from 'vue';
import ZTable from 'z-table';

const tableData = ref([
  { name: '张三', age: 20 },
  { name: '李四', age: 25 }
]);

const columns = ref([
  { prop: 'name', label: '姓名' },
  { prop: 'age', label: '年龄' }
]);
</script>
```

## API

### Props
- `data`: 表格数据
- `columns`: 列配置

## 许可证
MIT