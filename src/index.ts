import ZTable from './components/index.vue';

export default ZTable;

export { ZTable };

const install = (app: any) => {
  app.component('ZTable', ZTable);
  app.component('z-table', ZTable); // Alias for backward compatibility
};

export { install };