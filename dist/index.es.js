import { defineComponent as P, ref as y, watch as N, onUnmounted as ne, h as m, inject as H, computed as re, nextTick as I, onMounted as oe, provide as ae, openBlock as T, createBlock as M, unref as D, mergeProps as ue, createSlots as ie, withCtx as V, createElementBlock as se, Fragment as de, renderList as B, renderSlot as ce, normalizeProps as fe, guardReactiveProps as ge } from "vue";
import { ElTableColumn as k, ElTable as ve } from "element-plus";
const K = 5, O = "--", U = "\u52A0\u8F7D\u4E2D...", me = "\u52A0\u8F7D\u5931\u8D25", ye = 55, be = 60, z = /* @__PURE__ */ P({
  __name: "index",
  props: {
    dataSource: {},
    columns: {},
    globalPlaceholder: {}
  },
  emits: ["select", "select-all", "selection-change", "cell-mouse-enter", "cell-mouse-leave", "cell-click", "cell-dblclick", "cell-contextmenu", "row-click", "row-contextmenu", "row-dblclick", "header-click", "header-contextmenu", "sort-change", "filter-change", "current-change", "header-dragend", "expand-change", "scroll"],
  setup(x, { expose: W, emit: q }) {
    const S = x, G = q, i = y(null), p = y([]), A = y(Date.now()), X = (e) => !!(e === "" || e === null || e === void 0 || typeof e == "number" && (isNaN(e) || !isFinite(e))), Z = (e, t) => {
      if (!(!e || !t || typeof e != "object"))
        return t.split(".").reduce((l, a) => {
          if (l != null) {
            if (Array.isArray(l) && /^\d+$/.test(a)) {
              const o = parseInt(a);
              return o >= 0 && o < l.length ? l[o] : void 0;
            }
            if (typeof l == "object" && a in l)
              return l[a];
          }
        }, e);
    }, b = (e) => e && typeof e == "object" && "__v_isVNode" in e, s = (e, ...t) => {
      G(e, ...t);
    }, J = P({
      name: "TableAsyncFormatter",
      props: {
        value: {
          type: Object,
          required: !0,
          validator: (e) => typeof e == "object" && !Array.isArray(e)
        },
        formatter: {
          type: Function,
          required: !0
        },
        loadingPlaceholder: { type: String, default: U },
        errorPlaceholder: { type: String, default: me },
        emptyPlaceholder: { type: String, default: O }
      },
      setup(e) {
        const t = y(null), l = y(null), a = y(!0), o = y(null), g = async () => {
          if (!!a.value) {
            if (o.value)
              return o.value;
            try {
              t.value = null, l.value = null, o.value = e.formatter(e.value);
              const r = await o.value;
              a.value && (t.value = b(r) || typeof r == "string" ? r : e.emptyPlaceholder);
            } catch (r) {
              a.value && (console.warn("[TablePro] \u5F02\u6B65\u683C\u5F0F\u5316\u5931\u8D25:", r), l.value = r, t.value = null);
            } finally {
              o.value = null;
            }
          }
        };
        return g(), N(() => e.value, g, { deep: !0 }), ne(() => {
          a.value = !1;
        }), () => l.value ? e.errorPlaceholder : t.value === null && o.value ? e.loadingPlaceholder : b(t.value) ? t.value : m("span", null, t.value);
      }
    }), F = P({
      name: "TableRenderColumn",
      props: {
        column: { type: Object, required: !0 },
        index: { type: Number, required: !0 },
        parentProps: {
          type: Object,
          default: () => ({})
        },
        level: { type: Number, default: 0 }
      },
      setup(e) {
        const t = H("tableConfig");
        if (!t)
          throw new Error("[TablePro] \u672A\u63D0\u4F9B\u8868\u683C\u5168\u5C40\u914D\u7F6E");
        const { getColumnProps: l, getColumnEvents: a, getCellValue: o, getColKey: g } = t;
        if (e.level > K)
          return console.warn(`[TablePro] \u8868\u683C\u5217\u9012\u5F52\u6DF1\u5EA6\u8D85\u8FC7 ${K} \u7EA7`), () => null;
        const r = (n, d) => (u) => {
          try {
            if (n.renderHeader) {
              const c = D(
                n.renderHeader({
                  ...u,
                  column: n,
                  $index: d,
                  row: u.row
                })
              );
              return b(c) || typeof c == "string" ? c : n.title || n.label || "";
            }
            return n.title || n.label || "";
          } catch (c) {
            return console.warn("[TablePro] \u8868\u5934\u6E32\u67D3\u5931\u8D25:", c), "\u6E32\u67D3\u5931\u8D25";
          }
        }, v = (n) => (d) => {
          var u;
          if ((u = n.children) != null && u.length)
            return null;
          try {
            if (n.render) {
              const f = D(
                n.render({
                  ...d,
                  column: n,
                  cell: d.cell
                })
              );
              if (b(f))
                return f;
              if (typeof f == "string" || typeof f == "number")
                return m("span", null, f);
            }
            if (n.slot) {
              const f = d.$slots[n.slot];
              if (f)
                return f({
                  row: d.row,
                  column: n,
                  $index: d.$index,
                  cell: d.cell
                });
            }
            const c = o(d.row, n);
            return b(c) ? c : m("span", null, c);
          } catch (c) {
            return console.warn("[TablePro] \u5355\u5143\u683C\u6E32\u67D3\u5931\u8D25:", c), m("span", { style: "color: #f56c6c" }, "\u6E32\u67D3\u5931\u8D25");
          }
        }, E = () => {
          var d;
          if (!((d = e.column.children) != null && d.length))
            return null;
          const n = l(
            e.column,
            e.parentProps,
            e.level
          );
          return e.column.children.map((u, c) => {
            var j;
            const f = e.level + 1, R = g(u, c, f);
            return (j = u.children) != null && j.length ? m(F, {
              column: u,
              index: c,
              parentProps: n,
              level: f,
              key: R
            }) : m(
              k,
              {
                ...l(u, n, f),
                ...a(u),
                key: R
              },
              {
                header: r(u, c),
                default: ($) => v(u)({
                  ...$,
                  column: u,
                  cell: $.cell
                }),
                ...Object.fromEntries(
                  Object.entries(u.slots || {}).map(([$, te]) => [
                    $,
                    (le) => te({ ...le, column: u })
                  ])
                )
              }
            );
          });
        }, C = l(
          e.column,
          e.parentProps,
          e.level
        ), w = a(e.column), h = g(e.column, e.index, e.level);
        return () => ["selection", "index", "expand"].includes(e.column.type || "") ? m(
          k,
          { ...C, ...w, key: h },
          {
            header: r(e.column, e.index),
            default: e.column.type === "expand" ? v(e.column) : void 0,
            ...Object.fromEntries(
              Object.entries(e.column.slots || {}).map(([n, d]) => [
                n,
                (u) => d({ ...u, column: e.column })
              ])
            )
          }
        ) : m(
          k,
          { ...C, ...w, key: h },
          {
            header: r(e.column, e.index),
            default: e.column.children ? E : (n) => v(e.column)({
              ...n,
              column: e.column,
              cell: n.cell
            }),
            ...Object.fromEntries(
              Object.entries(e.column.slots || {}).map(([n, d]) => [
                n,
                (u) => d({ ...u, column: e.column })
              ])
            )
          }
        );
      }
    }), Q = re(() => {
      const e = (t) => t.filter((l) => l.visible !== !1).map((l) => {
        var a;
        if ((a = l.children) != null && a.length) {
          const o = e(l.children);
          return o.length ? { ...l, children: o } : null;
        }
        return l;
      }).filter((l) => !!l);
      return e(S.columns);
    }), L = (e, t, l) => {
      const a = e.fixed ? `fixed-${e.fixed}` : "fixed-none";
      return `${e.dataIndex || e.prop || e.key || e.type || `col-${t}`}-level-${l}-${a}-${A.value}`;
    }, Y = (e, t = {}, l = 0) => {
      var g, r, v, E, C, w, h, n, d;
      const o = {
        id: (() => e.key ? `table-col-${e.key}-level-${l}` : `table-col-${e.dataIndex || e.prop || Date.now()}-level-${l}`)(),
        level: l,
        prop: e.dataIndex || e.prop,
        label: e.title || e.label,
        width: (g = e.width) != null ? g : t.width,
        minWidth: (r = e.minWidth) != null ? r : t.minWidth,
        fixed: (v = e.fixed) != null ? v : t.fixed,
        align: (E = e.align) != null ? E : t.align,
        headerAlign: (C = e.headerAlign) != null ? C : t.headerAlign,
        sortable: (w = e.sortable) != null ? w : !1,
        resizable: (n = (h = e.resizable) != null ? h : t.resizable) != null ? n : !0,
        showOverflowTooltip: (d = e.showOverflowTooltip) != null ? d : t.showOverflowTooltip,
        cellStyle: e.cellStyle || t.cellStyle,
        headerCellStyle: e.headerCellStyle || t.headerCellStyle,
        className: e.className,
        labelClassName: e.labelClassName,
        selectable: e.selectable,
        reserveSelection: e.reserveSelection,
        filters: e.filters,
        filterPlacement: e.filterPlacement,
        filterMultiple: e.filterMultiple,
        filterMethod: e.filterMethod,
        filteredValue: e.filteredValue,
        sortMethod: e.sortMethod,
        sortBy: e.sortBy,
        sortOrders: e.sortOrders,
        index: e.index,
        ...e.extraProps
      };
      switch (e.type) {
        case "selection":
          Object.assign(o, {
            type: "selection",
            width: e.width || ye
          });
          break;
        case "index":
          Object.assign(o, {
            type: "index",
            width: e.width || be
          });
          break;
        case "expand":
          o.type = "expand";
          break;
      }
      return o;
    }, _ = (e) => ({
      ...e.events || {}
    }), ee = (e, t) => {
      const l = H("tableConfig"), a = (l == null ? void 0 : l.globalPlaceholder) || O, o = t.placeholder || a, g = t.dataIndex || t.prop;
      if (!g)
        return o;
      try {
        const r = Z(e, g);
        if (r === void 0 || X(r))
          return o;
        if (t.formatter)
          return t.formatter(e, t, r);
        if (typeof r == "object" && !Array.isArray(r)) {
          if (t.formatObjectAsync)
            return m(J, {
              value: r,
              formatter: t.formatObjectAsync,
              loadingPlaceholder: t.loadingPlaceholder || U,
              emptyPlaceholder: o
            });
          if (t.formatObject) {
            const v = t.formatObject(r);
            return b(v) ? v : v.toString();
          }
          return JSON.stringify(r);
        }
        return Array.isArray(r) ? r.join(", ") : r;
      } catch (r) {
        return console.warn("[TablePro] \u83B7\u53D6\u5355\u5143\u683C\u503C\u9519\u8BEF:", r), o;
      }
    };
    return N(
      () => S.columns,
      () => {
        A.value = Date.now(), I(() => {
          var e;
          return (e = i.value) == null ? void 0 : e.doLayout();
        });
      },
      { deep: !0, flush: "post" }
    ), oe(() => {
      I(() => {
        var e;
        return (e = i.value) == null ? void 0 : e.doLayout();
      });
    }), ae("tableConfig", {
      getColumnProps: Y,
      getColumnEvents: _,
      getCellValue: ee,
      getColKey: L,
      globalPlaceholder: S.globalPlaceholder || O
    }), W({
      clearSelection: () => {
        var e;
        return (e = i.value) == null ? void 0 : e.clearSelection();
      },
      getSelectionRows: () => {
        var e;
        return ((e = i.value) == null ? void 0 : e.getSelectionRows()) || [];
      },
      toggleRowSelection: (e, t) => {
        var l;
        return (l = i.value) == null ? void 0 : l.toggleRowSelection(e, t);
      },
      toggleAllSelection: () => {
        var e;
        return (e = i.value) == null ? void 0 : e.toggleAllSelection();
      },
      toggleRowExpansion: (e, t) => {
        var l;
        return (l = i.value) == null ? void 0 : l.toggleRowExpansion(e, t);
      },
      setCurrentRow: (e) => {
        var t;
        return (t = i.value) == null ? void 0 : t.setCurrentRow(e);
      },
      clearSort: () => {
        var e;
        return (e = i.value) == null ? void 0 : e.clearSort();
      },
      clearFilter: (e) => {
        var t;
        return (t = i.value) == null ? void 0 : t.clearFilter(e);
      },
      doLayout: () => {
        var e;
        return (e = i.value) == null ? void 0 : e.doLayout();
      },
      sort: (e, t) => {
        var l;
        return (l = i.value) == null ? void 0 : l.sort(e, t);
      },
      scrollTo: (e, t) => {
        var l;
        return (l = i.value) == null ? void 0 : l.scrollTo(e, t);
      },
      setScrollTop: (e) => {
        var t;
        return (t = i.value) == null ? void 0 : t.setScrollTop(e);
      },
      setScrollLeft: (e) => {
        var t;
        return (t = i.value) == null ? void 0 : t.setScrollLeft(e);
      },
      getTableInstance: () => i.value,
      get columns() {
        var e;
        return ((e = i.value) == null ? void 0 : e.columns) || [];
      },
      updateKeyChildren: (e, t) => {
        var l;
        return (l = i.value) == null ? void 0 : l.updateKeyChildren(e, t);
      }
    }), (e, t) => (T(), M(D(ve), ue(e.$attrs, {
      data: e.dataSource,
      selection: p.value,
      "onUpdate:selection": t[0] || (t[0] = (l) => p.value = l),
      ref_key: "tableRef",
      ref: i,
      key: A.value,
      onSelect: t[1] || (t[1] = (l) => s("select", ...arguments)),
      onSelectAll: t[2] || (t[2] = (l) => s("select-all", ...arguments)),
      onSelectionChange: t[3] || (t[3] = (l) => s("selection-change", ...arguments)),
      onCellMouseEnter: t[4] || (t[4] = (l) => s("cell-mouse-enter", ...arguments)),
      onCellMouseLeave: t[5] || (t[5] = (l) => s("cell-mouse-leave", ...arguments)),
      onCellClick: t[6] || (t[6] = (l) => s("cell-click", ...arguments)),
      onCellDblclick: t[7] || (t[7] = (l) => s("cell-dblclick", ...arguments)),
      onCellContextmenu: t[8] || (t[8] = (l) => s("cell-contextmenu", ...arguments)),
      onRowClick: t[9] || (t[9] = (l) => s("row-click", ...arguments)),
      onRowContextmenu: t[10] || (t[10] = (l) => s("row-contextmenu", ...arguments)),
      onRowDblclick: t[11] || (t[11] = (l) => s("row-dblclick", ...arguments)),
      onHeaderClick: t[12] || (t[12] = (l) => s("header-click", ...arguments)),
      onHeaderContextmenu: t[13] || (t[13] = (l) => s("header-contextmenu", ...arguments)),
      onSortChange: t[14] || (t[14] = (l) => s("sort-change", ...arguments)),
      onFilterChange: t[15] || (t[15] = (l) => s("filter-change", ...arguments)),
      onCurrentChange: t[16] || (t[16] = (l) => s("current-change", ...arguments)),
      onHeaderDragend: t[17] || (t[17] = (l) => s("header-dragend", ...arguments)),
      onExpandChange: t[18] || (t[18] = (l) => s("expand-change", ...arguments)),
      onScroll: t[19] || (t[19] = (l) => s("scroll", ...arguments))
    }), ie({
      default: V(() => [
        (T(!0), se(de, null, B(Q.value, (l, a) => (T(), M(D(F), {
          key: L(l, a, 0),
          column: l,
          index: a,
          "parent-props": {},
          level: 0
        }, null, 8, ["column", "index"]))), 128))
      ]),
      _: 2
    }, [
      B(Object.keys(e.$slots), (l) => ({
        name: l,
        fn: V((a) => [
          ce(e.$slots, l, fe(ge(a)))
        ])
      }))
    ]), 1040, ["data", "selection"]));
  }
}), he = (x) => {
  x.component("ZTable", z), x.component("z-table", z);
};
export {
  z as ZTable,
  z as default,
  he as install
};
