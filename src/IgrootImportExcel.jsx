import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Upload, Modal, Table, Spin, Alert, Icon, Card, Input, Row, Col, Switch } from 'igroot'
import XLSX from 'xlsx'


import './IgrootImportExcel.css'

const Dragger = Upload.Dragger

export default class IgrootImportExcel extends Component {
  static displayName = 'IgrootImportExcel'

  static propTypes = {
    style: PropTypes.object,
    className: PropTypes.string,
    type: PropTypes.string,
    autoPreview: PropTypes.bool,
    columnRules: PropTypes.object,
    onImportSuccess: PropTypes.func
  }

  static defaultProps = {
    style: {},
    className: '',
    type: 'click', // type: 'click' or 'drag'
    autoPreview: true,
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

  handleChangeSetting = (key, type, value) => {
    const { columns } = this.state 
    
    columns.map(item => {
      if(item.key === key) {
        item[type] = value 
      }
    })
    
    this.setState({ columns })
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
    const { columnRules, autoPreview } = this.props 
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
        const col = columnRules[item.trim()] || {}
        const key = col.key || String.fromCharCode(index+65)
        const width = col.width || 100

        return {
          show: !Object.keys(columnRules).length || !!columnRules[item.trim()],
          title: item,
          dataIndex: key,
          key,
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

      if (autoPreview) {
        this.setState({
          visible: true,
          uploadLoading: false,
          columns,
          uploadData,
          selectedRowKeys
        })
      } else {
        this.setState({
          visible: false,
          columns,
          uploadData,
          selectedRowKeys
        }, () => {
          this.importSuccess()
        })
      }
    }
  }

  renderSetContent() {
    const { columns } = this.state 

    return (
      <Row>
        {
          columns.map(item => (
            <Col span={12} key={item.key}>
              <Switch 
                className="set-switch" 
                checked={item.show} 
                onChange={(ev) => {this.handleChangeSetting(item.key, 'show', ev)}}/>
              <span className="set-label">{item.title}</span>
              <Input  
                className="set-input" 
                placeholder="Key" 
                value={item.key || ''}  
                onChange={(ev) => {this.handleChangeSetting(item.key, 'key', ev.target.value)}} />
              <Input 
                className="set-input" 
                placeholder="Width" 
                value={item.width || ''}  
                onChange={(ev) => {this.handleChangeSetting(item.key, 'width', parseInt(ev.target.value))}} />
            </Col>
          ))
        }
      </Row>
    )
  }

  render() {
    const { children, className, style } = this.props 
    const { visible, columns, uploadData, uploadLoading, setting, selectedRowKeys } = this.state 
    const num = uploadData.length
    const newColumns = columns.filter(item => item.show)
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectChange,
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
              {
                this.renderSetContent()
              }
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
