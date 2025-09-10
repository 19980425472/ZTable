import { mount } from '@vue/test-utils';
import ZTable from '../src/index.vue';

describe('ZTable', () => {
  it('renders correctly', () => {
    const wrapper = mount(ZTable, {
      props: {
        data: [{ name: 'Test', age: 20 }],
        columns: [{ prop: 'name', label: 'Name' }],
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
});