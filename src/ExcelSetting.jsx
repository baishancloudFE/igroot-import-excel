import React, { Component } from 'react'
import { Row, Col } from 'igroot'
import { FormItem, FormContainer, FormOption } from './FormContainer'
import { SettingItem } from './SettingItem'


export class ExcelSetting extends Component {
  constructor(props) {
    super(props)
  }

  handleSubmit = (values) => {
    const { onSetSuccess } = this.props 

    onSetSuccess && onSetSuccess(values)
  }

  render() {
    const { columns } = this.props 

    return (
      <FormContainer onSubmit={this.handleSubmit}>
        <Row>
          {
            columns.map(item => (
              <Col span={12} key={item.id}>
                <FormItem label={item.title} name={item.id} initialValue={item}>
                  <SettingItem />
                </FormItem>
              </Col>
            ))
          }
        </Row>
      <Row>
        <FormOption
          option={['submit']}
          submitText="确定"
          onSubmit={this.handleSubmit}
        />
      </Row>
    </FormContainer>
    )
  }
}
