import React, { Component } from 'react'
import { Button } from 'igroot'
import IgrootImportExcel from './IgrootImportExcel'

export default class App extends Component {
  handleImportSuccess = (data) => {
    console.log(data, 'data')
  }

  render() {
    const columnRules = {
      "ISP": {
        key: 'isp',
        width: 50
      },
      "城市": {
        key: 'city',
        width: 100
      }
    }

    return (
      <IgrootImportExcel 
        columnRules={columnRules}
        onImportSuccess={this.handleImportSuccess}
      >
        <Button> 上传 Excel 文件</Button>
      </IgrootImportExcel>
    )
  }
} 