import './IgrootImportExcel.css'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Upload, Modal, Table, Spin, Alert, Icon, Card, Input, Row, Col, Switch } from 'igroot'
import XLSX from 'xlsx'

import { ExcelSetting } from './ExcelSetting'

const Dragger = Upload.Dragger

export default class IgrootImportExcel extends Component {
  static displayName = 'IgrootImportExcel'

  static propTypes = {
    style: PropTypes.object,
    className: PropTypes.string,
    type: PropTypes.string,
    autoPreview: PropTypes.bool,
    needEqual: PropTypes.bool,
    columnRules: PropTypes.object,
    onImportSuccess: PropTypes.func
  }

  static defaultProps = {
    style: {},
    className: '',
    type: 'click', // type: 'click' or 'drag'
    autoPreview: true,
    needEqual: false,
    columnRules: {},
    onImportSuccess: () => {}
  }

  constructor(props) {
    super(props)

    this.state = {
      visible: false,
      uploadLoading: false,
      columns: [],
      uploadData: [],
      selectedRowKeys: [],
      setting: false
    }
  }

  emptyNum = 0

  editingColumns = []

  handleBeforeUpload = (file) => {
    const fileName = file.name.split('.')
    const fileType = fileName[fileName.length - 1]

    this.setState({
      columns: []
    })

    if (fileType == 'xls' || fileType == 'xlsx') {
      this.getXLSData(file)
    }

    return false
  }

  handleUploadOk = () => {
    this.importSuccess()

    this.setState({
      visible: false
    })
  }

  handleUploadCancel = () => {
    this.setState({
      visible: false
    })
  }

  handleSetColumn = () => {
    const { setting } = this.state 

    this.setState({
      setting: !setting 
    })
  }
  
  handleSetSuccess = (values) => {
    const { columns, setting } = this.state 

    const newColumns = []
    columns.map(item => {
      if (values[item.id].show) {
        newColumns.push(values[item.id])
      } else {
        newColumns.push(item) 
      }
    })
    
    this.setState({
      columns: newColumns,
      setting: !setting 
    })
  }

  handleSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys })
  }

  getSelectedData = () => {
    const { uploadData, columns, selectedRowKeys } = this.state 
    const selectedCols = columns.filter(item => item.show).map(item => item.key)
    const data = []

    uploadData.map((item, index) => {
      const obj = {}
      if (selectedRowKeys.includes(index+1)) {
        selectedCols.map(col => {
          obj[col] = item[col]
        })

        data.push(obj)
      }
    })

    return data 
  }

  importSuccess = () => {
    const { onImportSuccess } = this.props 
    const data = this.getSelectedData()

    onImportSuccess && onImportSuccess(data)  
  }

  getXLSData = (file) => {
    const { columnRules, autoPreview, needEqual } = this.props 
    const reader = new FileReader()
    reader.readAsBinaryString(file)
    
    this.emptyNum = 0

    reader.onload = (e) => {
      //数据读取
      const bstr = e.target.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const excelData = XLSX.utils.sheet_to_json(ws, { header: 1 })
      const data = excelData.filter(item => item.length)

      const keyNums = []
      data[0].filter((key, index) => {
        if (key) {
          keyNums.push(index)
        }
      })

      // 过滤对应表头空字段的数据
      let newData = data.map(item => {
        const obj = {}
        keyNums.map(key => {
          if (!item[key]) {
            item[key] = ''
            this.emptyNum ++ 
          }
        })

        return item
      })

      newData = newData.map(item => {
        return item.filter((key,index) => keyNums.includes(index))
      })


      const header = newData[0]
      const columns = header.map((item, index) => {
        let colKey = Object.keys(columnRules).find(key => item.trim().includes(key))
        if (needEqual) {
          colKey = Object.keys(columnRules).find(key => item.trim() === key.trim())
        }

        const col = columnRules[colKey] || {}
        const id = String.fromCharCode(index+65)
        const key = col.key || id
        const width = col.width || 100

        

        return {
          id: id,
          show: !!colKey,
          title: item,
          key,
          dataIndex: key,
          width
        }
      })

      const uploadData = newData.map((item, index) => {
        const obj = {}
        if (index > 0) {
          columns.map((col, i) => {
            obj[col.key] = item[i]
          }) 

          obj['key'] = index

          return obj
        }
      }).filter(item => item)

      const selectedRowKeys = uploadData.map((item, index) => index)
      selectedRowKeys.push(0)
      selectedRowKeys.push(uploadData.length)

      this.setState({
        visible: autoPreview,
        uploadLoading: false,
        columns,
        uploadData,
        selectedRowKeys
      }, () => {
        !autoPreview && this.importSuccess()
      })
    }
  }

  render() {
    const { children, className, style } = this.props 
    const { visible, columns, uploadData, uploadLoading, setting, selectedRowKeys } = this.state 
    const num = uploadData.length
    const newColumns = columns.filter(item => item.show)
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectChange
    }

    return (
      <div className={`igroot-import-excel ${className || ''}`} style={style}>
        <Modal
          title="导入数据预览"
          visible={visible}
          onOk={this.handleUploadOk}
          onCancel={this.handleUploadCancel}
          width='90%'
          style={styles.modal}
          className="igroot-import-excel-modal"
        > 
          <Alert message={`共导入 ${num} 条数据，其中空数据有 ${this.emptyNum}个`} type="info" showIcon style={styles.alert}/>
          { 
            setting &&
            <Card className="set-content">
              <ExcelSetting columns={columns} onSetSuccess={this.handleSetSuccess}/>
            </Card>
          }
          <div className="set-column">
            <span className="set-icon" onClick={this.handleSetColumn}>
              <Icon type="setting" />
            </span>
          </div>
          <Table
            rowSelection={rowSelection}
            columns={newColumns}
            dataSource={uploadData}
            pagination={false}
            bordered
            scroll={{ y: 400 }}
          />
        </Modal>
        <Upload beforeUpload={this.handleBeforeUpload}>
          {children}
        </Upload>
      </div>
    )
  }
}

const styles = {
  modal: {
    maxWidth: 1200
  },
  alert: {
    marginBottom: 30
  }
}
