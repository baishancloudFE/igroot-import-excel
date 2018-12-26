import React, { Component } from 'react'

import { FormItem } from './FormItem'
import FormContainer from './FormContainer'
import { FormOption } from './FormOption'

/**
 * 高阶组件 传入定制化属性
 * @param {*} WrappedComponent 
 * @param {*} props 
 */
export const  FormItemHOC = (props) => {
  return class ExtendsComponent extends Component {
    render() {
      return <FormItem {...props}  {...this.props} />
    }
  }
}

export { FormItem, FormContainer, FormOption }