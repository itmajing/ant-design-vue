import PropTypes from '../_util/vue-types';
import classNames from 'classnames';
import VcCheckbox from '../vc-checkbox';
import hasProp, { getOptionProps, getAttrs, getListeners } from '../_util/props-util';
import { ConfigConsumerProps } from '../config-provider';
import warning from '../_util/warning';
function noop() {}

export default {
  name: 'ACheckbox',
  inheritAttrs: false,
  __ANT_CHECKBOX: true,
  model: {
    prop: 'checked',
  },
  props: {
    prefixCls: PropTypes.string,
    defaultChecked: PropTypes.bool,
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    isGroup: PropTypes.bool,
    value: PropTypes.any,
    name: PropTypes.string,
    id: PropTypes.string,
    indeterminate: PropTypes.bool,
    type: PropTypes.string.def('checkbox'),
    autoFocus: PropTypes.bool,
  },
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
    checkboxGroupContext: { default: () => undefined },
  },
  watch: {
    value(value, prevValue) {
      this.$nextTick(() => {
        const { checkboxGroupContext: checkboxGroup = {} } = this;
        if (checkboxGroup.registerValue && checkboxGroup.cancelValue) {
          checkboxGroup.cancelValue(prevValue);
          checkboxGroup.registerValue(value);
        }
      });
    },
  },
  mounted() {
    const { value, checkboxGroupContext: checkboxGroup = {} } = this;
    if (checkboxGroup.registerValue) {
      checkboxGroup.registerValue(value);
    }

    warning(
      hasProp(this, 'checked') || this.checkboxGroupContext || !hasProp(this, 'value'),
      'Checkbox',
      '`value` is not validate prop, do you mean `checked`?',
    );
  },
  beforeDestroy() {
    const { value, checkboxGroupContext: checkboxGroup = {} } = this;
    if (checkboxGroup.cancelValue) {
      checkboxGroup.cancelValue(value);
    }
  },
  methods: {
    handleChange(event) {
      const targetChecked = event.target.checked;
      this.$emit('input', targetChecked);
      this.$emit('change', event);
    },
    focus() {
      this.$refs.vcCheckbox.focus();
    },
    blur() {
      this.$refs.vcCheckbox.blur();
    },
  },

  render() {
    const { checkboxGroupContext: checkboxGroup, $slots } = this;
    const props = getOptionProps(this);
    const children = $slots.default;
    const { mouseenter = noop, mouseleave = noop, input, ...restListeners } = getListeners(this);
    const { prefixCls: customizePrefixCls, indeterminate, ...restProps } = props;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('checkbox', customizePrefixCls);

    const checkboxProps = {
      props: { ...restProps, prefixCls },
      on: restListeners,
      attrs: getAttrs(this),
    };
    if (checkboxGroup) {
      checkboxProps.on.change = (...args) => {
        this.$emit('change', ...args);
        checkboxGroup.toggleOption({ label: children, value: props.value });
      };
      checkboxProps.props.name = checkboxGroup.name;
      checkboxProps.props.checked = checkboxGroup.sValue.indexOf(props.value) !== -1;
      checkboxProps.props.disabled = props.disabled || checkboxGroup.disabled;
    } else {
      checkboxProps.on.change = this.handleChange;
    }
    const classString = classNames({
      [`${prefixCls}-wrapper`]: true,
      [`${prefixCls}-wrapper-checked`]: checkboxProps.props.checked,
      [`${prefixCls}-wrapper-disabled`]: checkboxProps.props.disabled,
    });
    const checkboxClass = classNames({
      [`${prefixCls}-indeterminate`]: indeterminate,
    });
    return (
      <label class={classString} onMouseenter={mouseenter} onMouseleave={mouseleave}>
        <VcCheckbox {...checkboxProps} class={checkboxClass} ref="vcCheckbox" />
        {children !== undefined && <span>{children}</span>}
      </label>
    );
  },
};
