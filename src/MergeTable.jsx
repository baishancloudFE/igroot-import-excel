import React, { Component } from 'react'
import { Table } from 'igroot'

export default class MergeTable extends Component {
  columns = []
  dataSource = []
  mergeConfig = {}
  mergeCount = {}

  // 获取合并配置
  getMergeConfig = () => {
    const columns = this.props.columns || []
    const mergeConfig = []

    for (const column of columns)
      if (column.merge && column.sort)
        mergeConfig.push(column)

    mergeConfig.sort((a, b) => a.sort - b.sort)
    for (const column of columns)
      if (column.merge && !column.sort)
        mergeConfig.push(column)

    const returnConfig = []
    let i = 0
    for (const column of mergeConfig)
      returnConfig[i++] = column.dataIndex

    return returnConfig
  }

  // 合并数据聚合为多维数组
  setMergeArray = (data, mergeIndex) => {
    if (!this.mergeConfig[mergeIndex])
      return data

    // 获取合并dataIndex
    const dataIndex = this.mergeConfig[mergeIndex]
    const mergeData = {}
    for (const row of data) {
      const index = row[dataIndex] || 'other_'   // 没有的统一用其他

      if (!mergeData[index])
        mergeData[index] = []

      mergeData[index].push(row)
    }

    const returnData = {}
    for (const index in mergeData) {
      const rows = mergeData[index]
      returnData[index] = this.setMergeArray(rows, mergeIndex + 1)
    }

    return returnData
  }

  // 计算合并行数
  caculateMergeColumns = (datas, mergeIndex, row) => {
    // 如果递归到最后一层
    if (!this.mergeConfig[mergeIndex]) {
      for (const data of datas)
        this.dataSource.push(data)

      return datas.length
    }

    const dataIndex = this.mergeConfig[mergeIndex]
    if (!this.mergeCount[dataIndex])
      this.mergeCount[dataIndex] = []

    // 本组总行数
    let rowCount = 0
    for (const index in datas) {
      const start = row // 定位当前所在行
      const data = datas[index]
      const count = this.caculateMergeColumns(data, mergeIndex + 1, row)

      if (count == 0)
        continue

      row += count
      const end = row - 1
      rowCount += count
      this.mergeCount[dataIndex].push({ start, end })
    }

    return rowCount
  }

  // 设置头部
  setMergeColunmns = () => {
    const columns = this.props.columns || []

    // 设置关联合并列
    columns.forEach(column => {
      const { merge, affects, dataIndex } = column

      merge && affects && affects.forEach(affect => this.mergeCount[affect] = this.mergeCount[dataIndex])
    })

    const merge = this.mergeCount

    // 加入合并函数
    const columnsData = []

    columns.forEach(value => {
      const dataIndex = value.dataIndex
      const mergeConfig = merge[dataIndex]

      // 设置列头合并规则函数
      value.render = mergeConfig ? (valueF, rowF, indexF) => {
        const obj = {
          children: value._render ? value._render(valueF, rowF, indexF) : valueF,
          props: {}
        }

        for (const config of mergeConfig) {
          const start = config.start
          const end = config.end
  
          if (indexF == start) {
            obj.props.rowSpan = end - start + 1
            return obj
          }
        }
  
        obj.props.rowSpan = 0
        return obj
      } : value._render

      columnsData.push(value)
    })

    return columnsData
  }

  // 合并处理
  mergeData = () => {
    this.columns = []
    this.dataSource = []
    this.mergeConfig = {}
    this.mergeCount = {}
    this.mergeConfig = this.getMergeConfig()
    const data = this.props.dataSource || []
    const mergeArray = this.setMergeArray(data, 0)
    // 解数组计算合并行数
    this.caculateMergeColumns(mergeArray, 0, 0)
    // 设置头部
    this.columns = this.setMergeColunmns()
  }

  render() {
    this.mergeData()

    return (
      <Table
        bordered
        pagination={false}
        loading={this.props.loading}
        columns={this.columns}
        dataSource={this.dataSource}
        scroll={this.props.scroll}
        onRowDoubleClick={this.props.onRowDoubleClick}
      />
    )
  }
}
