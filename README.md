# 导入 Excel 数据组件

## 何时使用

需要导入 excel 数据到表格中，导入的数据是个二维数组，同时希望定义导入的二维数据的 key。

## 安装方法(请修改您的业务组件的安装方法)

```jsx
  sl add -c igroot-import-excel
```

## API

```jsx
<IgrootImportExcel 
  columnRules={columnRules}
  onImportSuccess={this.handleImportSuccess}
>
  <Button> 上传 Excel 文件</Button>
</IgrootImportExcel>
```

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| style | 样式 | Object | - |
| className | 扩展样式类名 | String | - |
| type | 类型 | String | 两种类型：'click' 和 'drag', 默认值 'click' |
| autoPreview | 是否预览 | boolean | false |
| columnRules | 配置要显示的字段 | Object | - |
| onImportSuccess | 导入成功的回调函数 | function | - |


#### columnRules
```jsx
columnRules = {
  "ISP": {
    key: 'isp',
    width: 50
  },
  "城市": {
    key: 'city',
    width: 100
  }
}
```