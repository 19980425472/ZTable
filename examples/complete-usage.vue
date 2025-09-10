<template>
  <div class="table-container">
    <!-- 表格控制按钮 -->
    <div class="table-controls">
      <el-button @click="toggleSelectionColumn">
        {{ hasSelectionColumn ? "移除选择列" : "添加选择列" }}
      </el-button>
      <el-button @click="resetTestData">
        <el-icon><Refresh /></el-icon> 重置数据
      </el-button>
      <el-button type="primary" @click="addNewItem">
        <el-icon><Plus /></el-icon> 添加项目
      </el-button>
      <el-button
        type="success"
        @click="batchUpdateStatus"
        :disabled="selectedRows.length === 0"
      >
        <el-icon><Edit /></el-icon> 批量启用
      </el-button>
      <el-tag type="info"> 选中：{{ selectedRows.length }}行 </el-tag>
    </div>

    <!-- 主表格区域 -->
    <div class="table-wrapper">
      <TablePro
        :data-source="tableData"
        :columns="tableColumns"
        border
        style="width: 100%"
        @cell-click="handleCellClick"
        v-model:selection="selectedRows"
        :loading="isLoading"
        :empty-text="
          tableData.length === 0
            ? '暂无数据，点击「添加项目」创建'
            : '加载中...'
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, reactive, computed, render } from "vue";
import TablePro from "@zgm-npm/z-table";

// 引入Element Plus组件
import {
  ElButton,
  ElSwitch,
  ElInput,
  ElSlider,
  ElCheckbox,
  ElRadio,
  ElRate,
  ElColorPicker,
  ElDatePicker,
  ElSelect,
  ElOption,
  ElIcon,
  ElTag,
  ElTimePicker,
  ElInputNumber,
  ElCascader,
  ElTransfer,
  ElTreeSelect,
  ElAvatar,
  ElBadge,
  ElProgress,
} from "element-plus";

// 引入图标
import { Refresh, Plus, Edit, Delete, View, Hide } from "@element-plus/icons-vue";

// 定义数据类型接口（统一格式）
interface TableItem {
  id: number;
  name: string;
  status: boolean;
  value: number;
  rating: number;
  color: string;
  date: string; // 统一为字符串格式(YYYY-MM-DD)
  time: string; // 统一为字符串格式(HH:mm:ss)
  number: number;
  option: string; // 确保为字符串类型
  checked: boolean;
  description: string;
  city: string[];
  permissions: string[];
  category: string;
  avatar: string;
  badge: number;
  progress: number;
  idCard: string; // 新增身份证号字段
  showFullIdCard?: boolean; // 控制是否显示完整身份证号
}

// 初始化测试数据
const tableData = reactive<TableItem[]>([
  {
    id: 1,
    name: "项目1",
    status: true,
    value: 30,
    rating: 4,
    color: "#409EFF",
    date: "2023-06-10",
    time: "09:30:00",
    number: 15,
    option: "1",
    checked: true,
    description: "测试项目1",
    city: ["beijing", "haidian"],
    permissions: ["read", "write"],
    category: "1",
    avatar: "https://picsum.photos/id/1/40/40",
    badge: 3,
    progress: 60,
    idCard: "110***********1234", // 新增身份证号
  },
  {
    id: 2,
    name: "项目2",
    status: false,
    value: 60,
    rating: 5,
    color: "#67C23A",
    date: "2023-06-15",
    time: "14:45:00",
    number: 28,
    option: "2",
    checked: false,
    description: "测试项目2",
    city: ["shanghai", "pudong"],
    permissions: ["read"],
    category: "2",
    avatar: "https://picsum.photos/id/2/40/40",
    badge: 0,
    progress: 30,
    idCard: "220***********5678", // 新增身份证号
  },
  {
    id: 3,
    name: "项目3",
    status: true,
    value: 90,
    rating: 3,
    color: "#E6A23C",
    date: "2023-06-20",
    time: "18:20:00",
    number: 5,
    option: "3",
    checked: true,
    description: "测试项目3",
    city: ["guangzhou", "tianhe"],
    permissions: ["read", "write", "delete"],
    category: "3",
    avatar: "https://picsum.photos/id/3/40/40",
    badge: 5,
    progress: 90,
    idCard: "330***********9012", // 新增身份证号
  },
]);

// 状态管理
const hasSelectionColumn = ref(false);
const selectedRows = ref<TableItem[]>([]);
const isLoading = ref(false);

// 组件数据源
const cityOptions = [
  {
    value: "beijing",
    label: "北京",
    children: [
      { value: "chaoyang", label: "朝阳区" },
      { value: "haidian", label: "海淀区" },
    ],
  },
  {
    value: "shanghai",
    label: "上海",
    children: [
      { value: "pudong", label: "浦东新区" },
      { value: "minhang", label: "闵行区" },
    ],
  },
  {
    value: "guangzhou",
    label: "广州",
    children: [
      { value: "tianhe", label: "天河区" },
      { value: "haizhu", label: "海珠区" },
    ],
  },
];

const transferData = [
  { key: "read", label: "读取权限" },
  { key: "write", label: "写入权限" },
  { key: "delete", label: "删除权限" },
  { key: "manage", label: "管理权限" },
];

const treeData = [
  {
    id: "1",
    label: "产品类",
    children: [
      { id: "1-1", label: "硬件产品" },
      { id: "1-2", label: "软件产品" },
    ],
  },
  {
    id: "2",
    label: "服务类",
    children: [
      { id: "2-1", label: "咨询服务" },
      { id: "2-2", label: "技术支持" },
    ],
  },
  {
    id: "3",
    label: "资源类",
    children: [
      { id: "3-1", label: "文档资源" },
      { id: "3-2", label: "培训资源" },
    ],
  },
];

// 表格列配置（已修复时间、日期、下拉选择问题）
const tableColumns = computed(() => {
  const columns: any[] = [];

  // 选择列
  if (hasSelectionColumn.value) {
    columns.push({
      type: "selection",
      width: 55,
      selectable: (row: TableItem) => row.id !== 2,
    });
  }

  return columns.concat([
    // 基础信息
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      align: "center",
      formatter: (row: TableItem) => `#${row.id}`,
    },

    { title: "身份证号", dataIndex: "idCard", width: 240, align: "center",
      render: ({ row }: { row: TableItem }) =>
        h("div", { style: "display: flex; align-items: center; justify-content: center; gap: 5px;" }, [
          row.showFullIdCard ? row.idCard.replace(/\*/g, '') : row.idCard,
          h(ElIcon, { 
            size: "small",
            style: "cursor: pointer;",
            onClick: async () => {
              // 如果已经显示完整号码，则直接切换图标
              if (row.showFullIdCard) {
                row.showFullIdCard = false;
                return;
              }
              
              // 模拟接口请求
              isLoading.value = true;
              try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                row.showFullIdCard = true;
              } finally {
                isLoading.value = false;
              }
            }
          }, () => row.showFullIdCard ? h(View) : h(Hide))
        ]),
     },

    {
      title: "名称（Input）",
      dataIndex: "name",
      width: 150,
      render: ({ row }: { row: TableItem }) =>
        h(ElInput, {
          modelValue: row.name,
          size: "small",
          "onUpdate:modelValue": (value: string) => (row.name = value),
        }),
    },

    // 日期和时间（已修复）
    {
      title: "日期选择（DatePicker）",
      width: 180,
      render: ({ row }: { row: TableItem }) =>
        h(ElDatePicker, {
          modelValue: row.date,
          type: "date",
          format: "YYYY-MM-DD",
          valueFormat: "YYYY-MM-DD", // 确保输出为字符串格式
          size: "small",
          "onUpdate:modelValue": (value: string) => (row.date = value),
        }),
    },
    {
      title: "时间选择（TimePicker）",
      width: 180,
      render: ({ row }: { row: TableItem }) =>
        h(ElTimePicker, {
          modelValue: row.time,
          format: "HH:mm:ss",
          valueFormat: "HH:mm:ss", // 确保输出为字符串格式
          size: "small",
          "onUpdate:modelValue": (value: string) => (row.time = value),
        }),
    },

    // 选择类组件（已修复下拉选择）
    {
      title: "下拉选择（Select）",
      width: 160,
      render: ({ row }: { row: TableItem }) =>
        h(
          ElSelect,
          {
            modelValue: row.option,
            size: "small",
            "onUpdate:modelValue": (value: string) => (row.option = value),
          },
          [
            h(ElOption, { label: "选项1", value: "1" }),
            h(ElOption, { label: "选项2", value: "2" }),
            h(ElOption, { label: "选项3", value: "3" }),
          ],
        ),
    },
    {
      title: "单选框组（Radio）",
      width: 200,
      render: ({ row }: { row: TableItem }) =>
        h(
          "div",
          { style: "display: flex; gap: 8px; justify-content: center" },
          [
            h(
              ElRadio,
              {
                modelValue: row.option,
                label: "1",
                name: `radio-${row.id}`,
                "onUpdate:modelValue": (value: string) => (row.option = value),
              },
              "选项1",
            ),
            h(
              ElRadio,
              {
                modelValue: row.option,
                label: "2",
                name: `radio-${row.id}`,
                "onUpdate:modelValue": (value: string) => (row.option = value),
              },
              "选项2",
            ),
            h(
              ElRadio,
              {
                modelValue: row.option,
                label: "3",
                name: `radio-${row.id}`,
                "onUpdate:modelValue": (value: string) => (row.option = value),
              },
              "选项3",
            ),
          ],
        ),
    },

    // 其他交互组件
    {
      title: "开关状态（Switch）",
      width: 140,
      align: "center",
      render: ({ row }: { row: TableItem }) =>
        h(ElSwitch, {
          modelValue: row.status,
          activeText: "启用",
          inactiveText: "禁用",
          "onUpdate:modelValue": (value: boolean) => (row.status = value),
        }),
    },
    {
      title: "复选框（Checkbox）",
      width: 120,
      align: "center",
      render: ({ row }: { row: TableItem }) =>
        h(
          ElCheckbox,
          {
            modelValue: row.checked as boolean,
            "onUpdate:modelValue": (value: boolean) => (row.checked = value),
          },
          "选择",
        ),
    },
    {
      title: "数值滑块（Slider）",
      width: 200,
      render: ({ row }: { row: TableItem }) =>
        h("div", { style: "padding: 10px 0" }, [
          h(ElSlider, {
            modelValue: row.value,
            max: 100,
            "onUpdate:modelValue": (value: number) => (row.value = value),
          }),
          h(
            "span",
            { style: "display: block; text-align: center; font-size: 12px" },
            row.value,
          ),
        ]),
    },
    {
      title: "数字输入（InputNumber）",
      width: 160,
      align: "center",
      render: ({ row }: { row: TableItem }) =>
        h(ElInputNumber, {
          modelValue: row.number,
          min: 0,
          max: 100,
          size: "small",
          "onUpdate:modelValue": (value: number) => (row.number = value),
        }),
    },

    // 操作列
    {
      title: "操作",
      width: 180,
      align: "center",
      render: ({ row }: { row: TableItem }) =>
        h(
          "div",
          { style: "display: flex; gap: 6px; justify-content: center" },
          [
            h(
              ElButton,
              {
                type: "primary",
                size: "small",
                icon: h(Edit),
              },
              "保存",
            ),
            h(
              ElButton,
              {
                type: "danger",
                size: "small",
                icon: h(Delete),
                onClick: () => {
                  const index = tableData.findIndex(
                    (item) => item.id === row.id,
                  );
                  if (index !== -1) {
                    tableData.splice(index, 1);
                    // 同步更新选中状态
                    const selectedIndex = selectedRows.value.findIndex(
                    (item) => item.id === row.id,
                  );
                  if (selectedIndex !== -1) {
                    selectedRows.value.splice(selectedIndex, 1);
                  }
                }
              },
            },
            "删除",
          ),
        ],
      ),
    },
  ]);
});

// 表格控制方法
const toggleSelectionColumn = () => {
  hasSelectionColumn.value = !hasSelectionColumn.value;
  if (!hasSelectionColumn.value) {
    selectedRows.value = [];
  }
};

const resetTestData = async () => {
  isLoading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 清空现有数据
  tableData.length = 0;

  // 恢复初始数据
  tableData.push(
    {
      id: 1,
      name: "项目1",
      status: true,
      value: 30,
      rating: 4,
      color: "#409EFF",
      date: "2023-06-10",
      time: "09:30:00",
      number: 15,
      option: "1",
      checked: true,
      description: "测试项目1",
      city: ["beijing", "haidian"],
      permissions: ["read", "write"],
      category: "1",
      avatar: "https://picsum.photos/id/1/40/40",
      badge: 3,
      progress: 60,
    },
    {
      id: 2,
      name: "项目2",
      status: false,
      value: 60,
      rating: 5,
      color: "#67C23A",
      date: "2023-06-15",
      time: "14:45:00",
      number: 28,
      option: "2",
      checked: false,
      description: "测试项目2",
      city: ["shanghai", "pudong"],
      permissions: ["read"],
      category: "2",
      avatar: "https://picsum.photos/id/2/40/40",
      badge: 0,
      progress: 30,
    },
    {
      id: 3,
      name: "项目3",
      status: true,
      value: 90,
      rating: 3,
      color: "#E6A23C",
      date: "2023-06-20",
      time: "18:20:00",
      number: 5,
      option: "3",
      checked: true,
      description: "测试项目3",
      city: ["guangzhou", "tianhe"],
      permissions: ["read", "write", "delete"],
      category: "3",
      avatar: "https://picsum.photos/id/3/40/40",
      badge: 5,
      progress: 90,
    },
  );

  selectedRows.value = [];
  isLoading.value = false;
};

const addNewItem = () => {
  const newId = Math.max(...tableData.map((item) => item.id), 0) + 1;
  tableData.push({
    id: newId,
    name: `新项目${newId}`,
    status: true,
    value: 50,
    rating: 3,
    color: "#909399",
    date: new Date().toISOString().split("T")[0], // 格式化为YYYY-MM-DD
    time: new Date().toTimeString().slice(0, 8), // 格式化为HH:mm:ss
    number: 10,
    option: "2",
    checked: false,
    description: `新增项目${newId}`,
    city: ["beijing", "chaoyang"],
    permissions: ["read"],
    category: "2",
    avatar: `https://picsum.photos/id/${newId + 10}/40/40`,
    badge: 0,
    progress: 50,
  });
};

const batchUpdateStatus = () => {
  selectedRows.value.forEach((row) => {
    row.status = true;
  });
};

const handleCellClick = (row: TableItem, column: any) => {
  // 单元格点击事件处理
};
</script>

<style scoped>
.table-container {
  padding: 16px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
}

.table-controls {
  margin-bottom: 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.table-wrapper {
  overflow-x: auto;
}

/* 调整穿梭框大小 */
::v-deep .el-transfer {
  --el-transfer-height: 120px;
}

::v-deep .el-transfer-panel {
  height: 120px !important;
}

::v-deep .el-transfer-panel__body {
  height: 70px !important;
}
</style>