import React, { Component } from 'react'
import { InputNumber, Button, Upload, Table, Modal, Progress, Card, message } from 'igroot'
import XLSX from 'xlsx'

export default class Excel extends Component {
  state = {
    columns: [],
    data: [],
    fieldData: [],

    visible: false,
    headLine: 1,
    uploading: false,
    upPageNum: 0,
    upPage: 0,
    fileList: [],
    page: 1
  }

  showModal = () => this.setState({
    visible: true,
    columns: [],
    data: []
  })

  handleCancel = e => {
    this.setState({
      visible: false,
      columns: [],
      data: [],
      uploading: false, // 取消上传中
      fileList: [],
      page: 1
    }, () => {
      const { onChange } = this.props
      onChange && onChange()
    })
  }

  handleOk = e => {
    if (!this.state.data.length)
      return message.warn('您还未提交任何文件！', 5)

    if (this.state.upPageNum === this.state.upPage)
      return this.handleCancel()

    const onOk = this.props.onOk || (cb => cb())

    this.setState({ uploading: true })
    onOk(
      () => this.setState({
        uploading: false,
        visible: !!this.state.fieldData.length,
        columns: [],
        data: [],
        page: 1
      }),
      () => this.setState({ upPage: this.state.upPage + 1 })
    )
  }

  // 拦截上传事件
  beforeUpload = (file, fileList) => {
    const name = file.name.split('.')
    const type = name[name.length - 1]

    if (type == 'csv')
      this.getCSVData(file)

    // if (type == 'txt')
    // 暂时未支持

    if (type == 'xls' || type == 'xlsx')
      this.getXLSData(file)

    return false
  }

  setDataPropos = (columns, data) => {
    const { onChange, upSize } = this.props
    const upPageNum = upSize ? Math.ceil(data.length / upSize) : 1    

    onChange && onChange(data, columns)
    this.setState({
      upPageNum,
      upPage: 0,
      columns,
      data
    })
  }

  getTXTData = file => {

  }

  getXLSData = file => {
    const reader = new FileReader()
    reader.readAsBinaryString(file)

    const columns = []
    const returnDatas = []
    const rules = this.props.rules
    const keys = {}

    reader.onload = (e) => {
      // 数据读取
      const headLine = (this.props.headLine || 1) - 1
      const bstr = e.target.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const datas = XLSX.utils.sheet_to_json(ws, { header: 1 })
      const mark = {}
      let i = 0

      for (const data of datas) {
        if (i === headLine) {
          data.forEach((value, index) => {
            // 处理表头每一个数据
            // 通过规则选择需要的数据
            value = value.trim() // 去掉两端的空格
            if (!rules[value]) return

            const key = rules[value]
            mark[index] = key
            keys[value] = true

            columns.push({
              title: value,
              dataIndex: key,
              key
            })
          })

          !this.props.quiet && Object.keys(rules).forEach(key => !keys[key] && message.warn(`导入文件中不存在"${key}"字段`, 5))
        } else if (i > headLine) {
          const rows = {}
          let isEmpty = true

          rows['key'] = i - 1
          data.forEach((value, index) => {
            if (!mark[index]) return

            rows[mark[index]] = value
            isEmpty = false
          })

          !isEmpty && returnDatas.push(rows)
        }

        i++
      }
      this.setDataPropos(columns, returnDatas)
    }
  }

  getCSVData = file => {
    const reader = new FileReader()
    reader.readAsText(file, 'GBK')

    const columns = []
    const returnDatas = []
    const rules = this.props.rules

    reader.onload = function (evt) {
      const str = evt.target.result.replace(/"/g, '') // 读到的数据
      const datas = str.split('\n')
      const mark = {}
      let i = 0

      for (const data of datas) {
        const rowData = data.split(',')
        if (i == 0) {
          let j = -1
          for (let value of rowData) {
            j++
            value = value.trim() // 去掉两端的空格
            // 通过规则选择需要的数据
            if (!rules[value])
              continue

            const key = rules[value]
            const column = {
              title: value,
              dataIndex: key,
              key,
            }
            mark[j] = key
            columns.push(column)
          }
        } else {
          const rows = {}
          let isEmpty = true

          rows['key'] = i - 1
          for (const index in rowData) {
            if (!mark[index]) return

            rows[mark[index]] = rowData[index]
            isEmpty = false
          }

          !isEmpty && returnDatas.push(rows)
        }

        i++
      }
      this.setDataPropos(columns, returnDatas)
    }
  }

  pushFieldData = datas => this.setState({ fieldData: [...this.state.fieldData, ...(datas || [])] })

  render() {
    const { visible, uploading, upPageNum, upPage, columns, data, fieldData, fileList, page } = this.state

    return (
      <span>
        <Button
          icon="upload"
          type="primary"
          onClick={this.showModal}
        >{this.props.title}</Button>

        <Modal
          title="Excel 上传"
          visible={visible}
          confirmLoading={uploading}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="80%"
        >
          {uploading ? (
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={(upPage / upPageNum * 100).toFixed(2)}
                width={80}
              />
            </div>
          ) : (
            <div>
              {this.props.appendHeader}

              <Upload 
                beforeUpload={this.beforeUpload}
                fileList={fileList}
              >
                <Button icon="upload" style={{ marginBottom: 10 }}>
                  选择文件
                </Button>
              </Upload>

              <Table
                bordered
                columns={columns}
                dataSource={data}
                pagination={{
                  total: data.length,
                  current: page,
                  showSizeChanger: true,
                  defaultPageSize: 15,
                  pageSizeOptions: ['10', '15', '20', '30', '50'],
                  onChange: page => this.setState({ page })
                }}
                
              />
            </div>
          )}

          {fieldData.length ? <Card title="导入失败数据" style={{ marginTop: 10 }}>{fieldData.map(this.props.fieldView)}</Card> : undefined}
        </Modal>
      </span>
    )
  }
}
