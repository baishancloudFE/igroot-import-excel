import React, { Component } from 'react'
import { Input, Row, Col, Switch } from 'igroot'

export class SettingItem extends Component {
  constructor(props) {
    super(props)

    const { value, defaultValue, title } = props  
    const defaultItemValue = {...defaultValue, ...this.defaultValue}

    this.state = {
      value: {
        ...defaultItemValue,
        ...value
      }
    }
  }

  defaultValue = {
    title: this.props.title || '',
    show: false, 
    dataIndex: '', 
    key: '', 
    width: 100
  }

  handleChangeSetting = (key, val) => {
    const { value } = this.state 
    const { onChange } = this.props 

    value[key] = val
    if (key === 'key') value['dataIndex'] = val 

    this.setState({ value })
    onChange && onChange(value)
  }

  render() {
    const { value } = this.state  

    return (
      <div>
        <Switch 
          className="set-switch" 
          checked={!!value.show} 
          onChange={checked => {this.handleChangeSetting('show', checked)}}
        />
        {/* <span className="set-label">{value.title}</span> */}
        <Input  
          className="set-input" 
          placeholder="Key" 
          value={value.key || ''}  
          onChange={ev => {this.handleChangeSetting('key', ev.target.value)}}
        />
        <Input 
          className="set-input input-width" 
          placeholder="Width" 
          value={value.width || ''} 
          onChange={ev => {this.handleChangeSetting('width', parseInt(ev.target.value))}} 
        />
      </div>
    )
  }
}


