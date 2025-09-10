<template>
  <el-table
    v-bind="$attrs"
    :data="dataSource"
    v-model:selection="selection"
    ref="tableRef"
    :key="columnsKey"
    @select="handleEmit('select', ...arguments)"
    @select-all="handleEmit('select-all', ...arguments)"
    @selection-change="handleEmit('selection-change', ...arguments)"
    @cell-mouse-enter="handleEmit('cell-mouse-enter', ...arguments)"
    @cell-mouse-leave="handleEmit('cell-mouse-leave', ...arguments)"
    @cell-click="handleEmit('cell-click', ...arguments)"
    @cell-dblclick="handleEmit('cell-dblclick', ...arguments)"
    @cell-contextmenu="handleEmit('cell-contextmenu', ...arguments)"
    @row-click="handleEmit('row-click', ...arguments)"
    @row-contextmenu="handleEmit('row-contextmenu', ...arguments)"
    @row-dblclick="handleEmit('row-dblclick', ...arguments)"
    @header-click="handleEmit('header-click', ...arguments)"
    @header-contextmenu="handleEmit('header-contextmenu', ...arguments)"
    @sort-change="handleEmit('sort-change', ...arguments)"
    @filter-change="handleEmit('filter-change', ...arguments)"
    @current-change="handleEmit('current-change', ...arguments)"
    @header-dragend="handleEmit('header-dragend', ...arguments)"
    @expand-change="handleEmit('expand-change', ...arguments)"
    @scroll="handleEmit('scroll', ...arguments)"
  >
    <!-- 渲染列 -->
    <template
      v-for="(column, index) in filteredColumnList"
      :key="getColKey(column, index, 0)"
    >
      <RenderColumn
        :column="column"
        :index="index"
        :parent-props="{}"
        :level="0"
      />
    </template>

    <!-- 透传所有插槽 -->
    <template
      v-for="slotName in Object.keys($slots)"
      :key="`table-slot-${slotName}`"
      #[slotName]="scope"
    >
      <slot :name="slotName" v-bind="scope" />
    </template>
  </el-table>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  computed,
  h,
  provide,
  inject,
  onMounted,
  onUnmounted,
  unref,
  defineComponent,
  type PropType,
  nextTick,
  type VNode,
} from "vue";
import { ElTable, ElTableColumn } from "element-plus";
import type {
  TableColumnCtx,
  TableColumnProps,
  Sorting as ElSorting,
  TableCellCtx,
  FilterParams,
} from "element-plus/es/components/table/src/table/defaults";

// ============================================
// 常量定义
// ============================================
const MAX_RECURSION_DEPTH = 5;
const DEFAULT_GLOBAL_PLACEHOLDER = "--";
const DEFAULT_LOADING_PLACEHOLDER = "加载中...";
const DEFAULT_ERROR_PLACEHOLDER = "加载失败";
const DEFAULT_SELECTION_WIDTH = 55;
const DEFAULT_INDEX_WIDTH = 60;

// ============================================
// 类型定义
// ============================================
interface Sorting extends ElSorting {
  column: {
    prop: string;
    label: string;
    [key: string]: any;
  };
}

export type BaseColumnType<T = any> = Omit<
  TableColumnProps<T>,
  "prop" | "label" | "children" | "renderHeader" | "render"
> & {
  key?: string;
  dataIndex?: string;
  title?: string;
  type?: "selection" | "index" | "expand";
  visible?: boolean;
  renderHeader?: (scope: {
    column: ColumnType<T>;
    $index: number;
    row?: T;
  }) => VNode | string | null;
  render?: (scope: {
    row: T;
    column: ColumnType<T>;
    $index: number;
    cell?: TableCellCtx;
  }) => VNode | string | null;
  slot?: string;
  formatObject?: (value: object) => string | VNode;
  formatObjectAsync?: (value: object) => Promise<string | VNode>;
  loadingPlaceholder?: string;
  placeholder?: string;
  extraProps?: Record<string, any>;
  events?: Record<string, (...args: any[]) => void>;
  slots?: Record<string, (scope: any) => VNode | string | null>;
};

export interface ColumnType<T = any> extends BaseColumnType<T> {
  children?: ColumnType<T>[];
}

interface TableConfig<T = any> {
  getColumnProps: (
    col: ColumnType<T>,
    parent: TableColumnCtx<T>,
    level: number,
  ) => TableColumnCtx<T>;
  getColumnEvents: (
    col: ColumnType<T>,
  ) => Record<string, (...args: any[]) => void>;
  getCellValue: (row: T, col: ColumnType<T>) => VNode | string | number | null;
  getColKey: (col: ColumnType<T>, idx: number, level: number) => string;
  globalPlaceholder: string;
}

// ============================================
// Props与Emits定义（完全映射原生API）
// ============================================
const props = defineProps<{
  dataSource: any[];
  columns: ColumnType<any>[];
  globalPlaceholder?: string;
}>();

// 自动生成所有原生事件的emitter
const emit = defineEmits<{
  (e: "select", selection: any[], row: any): void;
  (e: "select-all", selection: any[]): void;
  (e: "selection-change", selection: any[]): void;
  (
    e: "cell-mouse-enter",
    row: any,
    column: TableColumnCtx<any>,
    cell: HTMLElement,
    event: Event,
  ): void;
  (
    e: "cell-mouse-leave",
    row: any,
    column: TableColumnCtx<any>,
    cell: HTMLElement,
    event: Event,
  ): void;
  (
    e: "cell-click",
    row: any,
    column: TableColumnCtx<any>,
    cell: HTMLElement,
    event: Event,
  ): void;
  (
    e: "cell-dblclick",
    row: any,
    column: TableColumnCtx<any>,
    cell: HTMLElement,
    event: Event,
  ): void;
  (
    e: "cell-contextmenu",
    row: any,
    column: TableColumnCtx<any>,
    cell: HTMLElement,
    event: Event,
  ): void;
  (e: "row-click", row: any, column: TableColumnCtx<any>, event: Event): void;
  (
    e: "row-contextmenu",
    row: any,
    column: TableColumnCtx<any>,
    event: Event,
  ): void;
  (
    e: "row-dblclick",
    row: any,
    column: TableColumnCtx<any>,
    event: Event,
  ): void;
  (e: "header-click", column: TableColumnCtx<any>, event: Event): void;
  (e: "header-contextmenu", column: TableColumnCtx<any>, event: Event): void;
  (e: "sort-change", sorting: Sorting): void;
  (e: "filter-change", filters: FilterParams): void;
  (e: "current-change", currentRow: any, oldCurrentRow: any): void;
  (
    e: "header-dragend",
    newWidth: number,
    oldWidth: number,
    column: TableColumnCtx<any>,
  ): void;
  (e: "expand-change", row: any, expanded: boolean): void;
  (e: "scroll", scrollInfo: { left: number; top: number }): void;
}>();

// ============================================
// 内部状态管理
// ============================================
const tableRef = ref<InstanceType<typeof ElTable> | null>(null);
const selection = ref<any[]>([]);
const columnsKey = ref(Date.now());

// ============================================
// 工具函数
// ============================================
const isAbnormalValue = (value: any): boolean => {
  if (value === "" || value === null || value === undefined) return true;
  if (typeof value === "number" && (isNaN(value) || !isFinite(value)))
    return true;
  return false;
};

const parseNestedValue = <T = any,>(row: T, dataIndex: string): any => {
  if (!row || !dataIndex || typeof row !== "object") return undefined;

  return dataIndex.split(".").reduce((current, key) => {
    if (current === null || current === undefined) return undefined;

    if (Array.isArray(current) && /^\d+$/.test(key)) {
      const idx = parseInt(key);
      return idx >= 0 && idx < current.length ? current[idx] : undefined;
    }

    if (typeof current === "object" && key in current) {
      return current[key as keyof typeof current];
    }

    return undefined;
  }, row as any);
};

const isVNodeValid = (vnode: any): vnode is VNode => {
  return vnode && typeof vnode === "object" && "__v_isVNode" in vnode;
};

// 事件转发处理（按需触发，未监听则不处理）
const handleEmit = (eventName: string, ...args: any[]) => {
  emit(eventName as any, ...args);
};

// ============================================
// 异步格式化组件
// ============================================
const AsyncFormatter = defineComponent({
  name: "TableAsyncFormatter",
  props: {
    value: {
      type: Object as PropType<object>,
      required: true,
      validator: (val: object) =>
        typeof val === "object" && !Array.isArray(val),
    },
    formatter: {
      type: Function as PropType<(value: object) => Promise<string | VNode>>,
      required: true,
    },
    loadingPlaceholder: { type: String, default: DEFAULT_LOADING_PLACEHOLDER },
    errorPlaceholder: { type: String, default: DEFAULT_ERROR_PLACEHOLDER },
    emptyPlaceholder: { type: String, default: DEFAULT_GLOBAL_PLACEHOLDER },
  },
  setup(props) {
    const result = ref<string | VNode | null>(null);
    const error = ref<Error | null>(null);
    const isMounted = ref(true);
    const formatPromise = ref<Promise<any> | null>(null);

    const executeFormat = async () => {
      if (!isMounted.value) return;
      if (formatPromise.value) return formatPromise.value;

      try {
        result.value = null;
        error.value = null;

        formatPromise.value = props.formatter(props.value);
        const res = await formatPromise.value;

        if (isMounted.value) {
          result.value =
            isVNodeValid(res) || typeof res === "string"
              ? res
              : props.emptyPlaceholder;
        }
      } catch (err) {
        if (isMounted.value) {
          console.warn("[TablePro] 异步格式化失败:", err);
          error.value = err as Error;
          result.value = null;
        }
      } finally {
        formatPromise.value = null;
      }
    };

    executeFormat();
    watch(() => props.value, executeFormat, { deep: true });
    onUnmounted(() => {
      isMounted.value = false;
    });

    return () => {
      if (error.value) return props.errorPlaceholder;
      if (result.value === null && formatPromise.value)
        return props.loadingPlaceholder;
      return isVNodeValid(result.value)
        ? result.value
        : h("span", null, result.value);
    };
  },
});

// ============================================
// 列渲染组件
// ============================================
const RenderColumn = defineComponent({
  name: "TableRenderColumn",
  props: {
    column: { type: Object as PropType<ColumnType<any>>, required: true },
    index: { type: Number, required: true },
    parentProps: {
      type: Object as PropType<TableColumnCtx<any>>,
      default: () => ({}),
    },
    level: { type: Number, default: 0 },
  },
  setup(props) {
    const tableConfig = inject<TableConfig<any>>("tableConfig");
    if (!tableConfig) throw new Error("[TablePro] 未提供表格全局配置");

    const { getColumnProps, getColumnEvents, getCellValue, getColKey } =
      tableConfig;

    // 防止递归过深
    if (props.level > MAX_RECURSION_DEPTH) {
      console.warn(`[TablePro] 表格列递归深度超过 ${MAX_RECURSION_DEPTH} 级`);
      return () => null;
    }

    // 渲染表头
    const renderHeader =
      (col: ColumnType<any>, colIndex: number) => (scope: any) => {
        try {
          if (col.renderHeader) {
            const headerContent = unref(
              col.renderHeader({
                ...scope,
                column: col,
                $index: colIndex,
                row: scope.row,
              }),
            );
            return isVNodeValid(headerContent)
              ? headerContent
              : typeof headerContent === "string"
                ? headerContent
                : col.title || col.label || "";
          }
          return col.title || col.label || "";
        } catch (err) {
          console.warn(`[TablePro] 表头渲染失败:`, err);
          return "渲染失败";
        }
      };

    // 渲染单元格
    const renderCell = (col: ColumnType<any>) => (scope: any) => {
      if (col.children?.length) return null;

      try {
        // 优先使用自定义渲染函数
        if (col.render) {
          const cellContent = unref(
            col.render({
              ...scope,
              column: col,
              cell: scope.cell,
            }),
          );
          if (isVNodeValid(cellContent)) return cellContent;
          if (
            typeof cellContent === "string" ||
            typeof cellContent === "number"
          ) {
            return h("span", null, cellContent);
          }
        }

        // 其次使用插槽
        if (col.slot) {
          const slot = (scope as any).$slots[col.slot];
          if (slot) {
            return slot({
              row: scope.row,
              column: col,
              $index: scope.$index,
              cell: scope.cell,
            });
          }
        }

        // 最后使用默认值处理
        const cellValue = getCellValue(scope.row, col);
        return isVNodeValid(cellValue) ? cellValue : h("span", null, cellValue);
      } catch (err) {
        console.warn(`[TablePro] 单元格渲染失败:`, err);
        return h("span", { style: "color: #f56c6c" }, "渲染失败");
      }
    };

    // 渲染子列（多级表头）
    const renderChildren = () => {
      if (!props.column.children?.length) return null;

      const currentColProps = getColumnProps(
        props.column,
        props.parentProps,
        props.level,
      );

      return props.column.children.map((childCol, childIdx) => {
        const childLevel = props.level + 1;
        const childKey = getColKey(childCol, childIdx, childLevel);

        if (childCol.children?.length) {
          return h(RenderColumn, {
            column: childCol,
            index: childIdx,
            parentProps: currentColProps,
            level: childLevel,
            key: childKey,
          });
        }

        return h(
          ElTableColumn,
          {
            ...getColumnProps(childCol, currentColProps, childLevel),
            ...getColumnEvents(childCol),
            key: childKey,
          },
          {
            header: renderHeader(childCol, childIdx),
            default: (cellScope: any) =>
              renderCell(childCol)({
                ...cellScope,
                column: childCol,
                cell: cellScope.cell,
              }),
            // 透传列的其他插槽
            ...Object.fromEntries(
              Object.entries(childCol.slots || {}).map(([slotName, slotFn]) => [
                slotName,
                (scope: any) => slotFn({ ...scope, column: childCol }),
              ]),
            ),
          },
        );
      });
    };

    // 基础列属性与事件
    const columnProps = getColumnProps(
      props.column,
      props.parentProps,
      props.level,
    );
    const columnEvents = getColumnEvents(props.column);
    const columnKey = getColKey(props.column, props.index, props.level);

    return () => {
      // 特殊类型列处理
      if (["selection", "index", "expand"].includes(props.column.type || "")) {
        return h(
          ElTableColumn,
          { ...columnProps, ...columnEvents, key: columnKey },
          {
            header: renderHeader(props.column, props.index),
            default:
              props.column.type === "expand"
                ? renderCell(props.column)
                : undefined,
            // 透传特殊列的插槽
            ...Object.fromEntries(
              Object.entries(props.column.slots || {}).map(([slotName, slotFn]) => [
                slotName,
                (scope: any) => slotFn({ ...scope, column: props.column }),
              ]),
            ),
          },
        );
      }

      // 普通列处理
      return h(
        ElTableColumn,
        { ...columnProps, ...columnEvents, key: columnKey },
        {
          header: renderHeader(props.column, props.index),
          default: props.column.children
            ? renderChildren
            : (cellScope: any) =>
                renderCell(props.column)({
                  ...cellScope,
                  column: props.column,
                  cell: cellScope.cell,
                }),
          // 透传普通列的插槽
          ...Object.fromEntries(
            Object.entries(props.column.slots || {}).map(([slotName, slotFn]) => [
              slotName,
              (scope: any) => slotFn({ ...scope, column: props.column }),
            ]),
          ),
        },
      );
    };
  },
});

// ============================================
// 主逻辑
// ============================================

// 过滤隐藏列
const filteredColumnList = computed<ColumnType<any>[]>(() => {
  const filterCols = (cols: ColumnType<any>[]): ColumnType<any>[] =>
    cols
      .filter((col) => col.visible !== false)
      .map((col) => {
        if (col.children?.length) {
          const filteredChildren = filterCols(col.children);
          return filteredChildren.length
            ? { ...col, children: filteredChildren }
            : null;
        }
        return col;
      })
      .filter((col): col is ColumnType<any> => !!col);

  return filterCols(props.columns);
});

// 生成列唯一Key
const getColKey = (
  column: ColumnType<any>,
  index: number,
  level: number,
): string => {
  const fixedTag = column.fixed ? `fixed-${column.fixed}` : "fixed-none";
  const baseKey =
    column.dataIndex ||
    column.prop ||
    column.key ||
    column.type ||
    `col-${index}`;
  return `${baseKey}-level-${level}-${fixedTag}-${columnsKey.value}`;
};

// 列属性映射（完全映射原生属性）
const getColumnProps = <T = any,>(
  column: ColumnType<T>,
  parentProps: Record<string, any> = {},
  level: number = 0,
): TableColumnCtx<T> => {
  const genId = () =>
    column.key
      ? `table-col-${column.key}-level-${level}`
      : `table-col-${column.dataIndex || column.prop || Date.now()}-level-${level}`;

  // 基础属性映射（优先使用column定义，其次使用parentProps，最后使用默认值）
  const baseProps: TableColumnCtx<T> = {
    id: genId(),
    level,
    prop: column.dataIndex || column.prop,
    label: column.title || column.label,
    width: column.width ?? parentProps.width,
    minWidth: column.minWidth ?? parentProps.minWidth,
    fixed: column.fixed ?? parentProps.fixed,
    align: column.align ?? parentProps.align,
    headerAlign: column.headerAlign ?? parentProps.headerAlign,
    sortable: column.sortable ?? false,
    resizable: column.resizable ?? parentProps.resizable ?? true,
    showOverflowTooltip:
      column.showOverflowTooltip ?? parentProps.showOverflowTooltip,
    cellStyle: column.cellStyle || parentProps.cellStyle,
    headerCellStyle: column.headerCellStyle || parentProps.headerCellStyle,
    className: column.className,
    labelClassName: column.labelClassName,
    selectable: column.selectable,
    reserveSelection: column.reserveSelection,
    filters: column.filters,
    filterPlacement: column.filterPlacement,
    filterMultiple: column.filterMultiple,
    filterMethod: column.filterMethod,
    filteredValue: column.filteredValue,
    sortMethod: column.sortMethod,
    sortBy: column.sortBy,
    sortOrders: column.sortOrders,
    index: column.index,
    ...column.extraProps,
  };

  // 特殊类型列配置
  switch (column.type) {
    case "selection":
      Object.assign(baseProps, {
        type: "selection",
        width: column.width || DEFAULT_SELECTION_WIDTH,
      });
      break;
    case "index":
      Object.assign(baseProps, {
        type: "index",
        width: column.width || DEFAULT_INDEX_WIDTH,
      });
      break;
    case "expand":
      baseProps.type = "expand";
      break;
  }

  return baseProps;
};

// 列事件处理
const getColumnEvents = <T = any,>(column: ColumnType<T>) => {
  const events: Record<string, (...args: any[]) => void> = {
    ...(column.events || {}),
  };
  return events;
};

// 单元格值处理
const getCellValue = <T = any,>(
  row: T,
  column: ColumnType<T>,
): VNode | string | number | null => {
  const tableConfig = inject<TableConfig<any>>("tableConfig");
  const globalPlaceholder =
    tableConfig?.globalPlaceholder || DEFAULT_GLOBAL_PLACEHOLDER;
  const columnPlaceholder = column.placeholder || globalPlaceholder;

  const prop = column.dataIndex || column.prop;
  if (!prop) return columnPlaceholder;

  try {
    const val = parseNestedValue(row, prop);

    if (val === undefined || isAbnormalValue(val)) {
      return columnPlaceholder;
    }

    // 应用formatter
    if (column.formatter) {
      return column.formatter(row, column as any, val);
    }

    // 对象类型值处理
    if (typeof val === "object" && !Array.isArray(val)) {
      if (column.formatObjectAsync) {
        return h(AsyncFormatter, {
          value: val,
          formatter: column.formatObjectAsync,
          loadingPlaceholder:
            column.loadingPlaceholder || DEFAULT_LOADING_PLACEHOLDER,
          emptyPlaceholder: columnPlaceholder,
        });
      }
      if (column.formatObject) {
        const formatted = column.formatObject(val);
        return isVNodeValid(formatted) ? formatted : formatted.toString();
      }
      return JSON.stringify(val);
    }

    // 数组类型值处理
    if (Array.isArray(val)) {
      return val.join(", ");
    }

    return val;
  } catch (err) {
    console.warn(`[TablePro] 获取单元格值错误:`, err);
    return columnPlaceholder;
  }
};

// 监听列变化
watch(
  () => props.columns,
  () => {
    columnsKey.value = Date.now();
    nextTick(() => tableRef.value?.doLayout());
  },
  { deep: true, flush: "post" },
);

// 初始化布局
onMounted(() => {
  nextTick(() => tableRef.value?.doLayout());
});

// 提供全局配置
provide<TableConfig<any>>("tableConfig", {
  getColumnProps,
  getColumnEvents,
  getCellValue,
  getColKey,
  globalPlaceholder: props.globalPlaceholder || DEFAULT_GLOBAL_PLACEHOLDER,
});

// 暴露所有原生方法
defineExpose<{
  clearSelection: () => void;
  getSelectionRows: () => any[];
  toggleRowSelection: (row: any, selected?: boolean) => void;
  toggleAllSelection: () => void;
  toggleRowExpansion: (row: any, expanded?: boolean) => void;
  setCurrentRow: (row: any) => void;
  clearSort: () => void;
  clearFilter: (columnKeys?: string[]) => void;
  doLayout: () => void;
  sort: (prop: string, order: "ascending" | "descending" | null) => void;
  scrollTo: (options: ScrollToOptions | number, yCoord?: number) => void;
  setScrollTop: (top: number) => void;
  setScrollLeft: (left: number) => void;
  getTableInstance: () => InstanceType<typeof ElTable> | null;
  columns: TableColumnCtx<any>[];
  updateKeyChildren: (key: string | number, data: any[]) => void;
}>({
  clearSelection: () => tableRef.value?.clearSelection(),
  getSelectionRows: () => tableRef.value?.getSelectionRows() || [],
  toggleRowSelection: (row, selected) =>
    tableRef.value?.toggleRowSelection(row, selected),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
  toggleRowExpansion: (row, expanded) =>
    tableRef.value?.toggleRowExpansion(row, expanded),
  setCurrentRow: (row) => tableRef.value?.setCurrentRow(row),
  clearSort: () => tableRef.value?.clearSort(),
  clearFilter: (columnKeys) => tableRef.value?.clearFilter(columnKeys),
  doLayout: () => tableRef.value?.doLayout(),
  sort: (prop, order) => tableRef.value?.sort(prop, order),
  scrollTo: (options, yCoord) => tableRef.value?.scrollTo(options, yCoord),
  setScrollTop: (top) => tableRef.value?.setScrollTop(top),
  setScrollLeft: (left) => tableRef.value?.setScrollLeft(left),
  getTableInstance: () => tableRef.value,
  get columns() {
    return tableRef.value?.columns || [];
  },
  updateKeyChildren: (key, data) =>
    tableRef.value?.updateKeyChildren(key, data),
});
</script>