'use strict'

import React, { Component } from 'react'
import { Form, Select, Input } from 'igroot'

const { Item } = Form 
const defaultFormItemLayout = {
  labelCol: {
    xs: {
      span: 24
    },
    md: {
      span: 12
    },
    sm: {
      span: 6
    }
  },
  wrapperCol: {
    xs: {
      span: 24
    },
    md: {
      span: 12
    },
    sm: {
      span: 18
    }
  }
}

/**
 * 表单子项
 */
export class FormItem extends Component {
  constructor(props) {
    super(props)
  }


  getFieldProps = () => {
    const { fieldProps, initialValue, required, label } = this.props 
    const newFieldProps = {
      rules: fieldProps && fieldProps['rules'] || []
    }

    if (initialValue || (fieldProps && fieldProps['initialValue']) ) {
      newFieldProps['initialValue'] = initialValue || (fieldProps && fieldProps['initialValue']) 
    }

    if (required) newFieldProps['rules'].push({ 
      required: true, message: `${label}为必填项！`
    })

    return newFieldProps
  }

  renderChildren = () => {
    return React.Children.map(this.props.children, child => {
      return <child.type {...child.props} />
    })
  }

  render() {
    const { label, name, form, formItemLayout } = this.props 

    if (!form ) return this.props.children

    const { getFieldDecorator } = form 
    const newFormItemLayout = formItemLayout || defaultFormItemLayout
    const fieldProps = this.getFieldProps() 
    
    return (
      <Item {...newFormItemLayout} label={label}>
      {
        React.Children.map(this.props.children, child => {
          const Child = React.cloneElement(child)
          
          return getFieldDecorator(name, fieldProps)(
            Child
          )
        })
      }
      </Item>
    )
  }
}
