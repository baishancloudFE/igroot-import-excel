'use strict'

import React, { Component } from 'react'
import { Button, Popconfirm } from 'igroot'

/**
 * 表单底部操作栏
 */
export class FormOption extends Component {
  static displayName = 'FormOption'

  constructor(props) {
    super(props)
  }

  handleSave = () => {

  }

  handleReset = () => {
    const { form } = this.props 

    form.resetFields()
  }

  handleSubmit = () => {
    const { form, onSubmit } = this.props 
    console.log(onSubmit, form)
    form.validateFields((err, values) => {
      if (!err) {
        onSubmit && onSubmit(values)
      }
    })
  }

  renderCustomButtons() {
    const { buttons } = this.props

    const buttonsList = buttons.map(({ text, handleClick, type }) => {
      return <Button onClick={handleClick} type={type} style={styles.btn}>{text}</Button>
    })

    return buttonsList
  }

  renderSummitButton() {
    const { submitText, loading, doubleCheck} = this.props
    const text = submitText || '提交'

    if (doubleCheck) {
      return (
        <Popconfirm title={`确定${text}吗？`} onConfirm={this.handleSubmit}>
          <Button type="primary" loading={loading} style={styles.btn} key="submit">{text}</Button>
        </Popconfirm>
      )
    } else {
      return (
        <Button type="primary" loading={loading} onClick={this.handleSubmit} style={styles.btn} key="submit">{text}</Button>
      )
    }
  }

  render() {
    const { 
      buttons, 
      fixed,
      visiable, 
      option,
      loading
    } = this.props
    const _visiable = (visiable === undefined ? true : visiable)
    const style = fixed ? styles.fixed : styles.normal
    const optButtons = {
      submit: this.renderSummitButton(),
      save: <Button onClick={this.handleSave} key="save" loading={loading} style={styles.btn}>保存草稿</Button>,
      reset: <Button onClick={this.handleReset}  key="reset" style={styles.btn}>重置</Button>
    }

    if (!option || !_visiable) return <div />

    if (buttons && buttons.length) {
      return (
        <div style={styles.footer}>
          {this.renderCustomButtons()}
        </div>
      )
    }

    return (
      <div style={style}>
       {option.map(type => optButtons[type])}
      </div>
    )
  }
}

const styles = {
  normal: {
    textAlign: 'center'
  },
  btn: {
    marginRight: 10
  },
  fixed: {
    position: 'fixed',
    left: 240,
    right: 0,
    bottom: 0,
    height: 52,
    zIndex: 1,
    lineHeight: '52px',
    backgroundColor: '#fff',
    textAlign: 'center',
    padding: '0 10px',
    border: '1px solid #ccc',
    transition: 'all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)'
  }
}