---
order: 0
title:
  zh-CN: 基础用法
  en-US: Basic
---

## zh-CN

基本用法

## en-US

basic 

````jsx
import React, { Component } from 'react'
import { Button } from 'igroot'
import IgrootImportExcel from './IgrootImportExcel/src/index'
// 演示使用  正式环境请使用
import IgrootImportExcel  from 'igroot-import-excel'



class App extends Component {
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

ReactDOM.render(
  <App />
, mountNode);

