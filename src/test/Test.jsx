export default {
    name: 'Test',          // 组件名
    props: {
        msg: String          // 组件接收一个 msg 字符串
    },
    render() {             // 用 render 函数 + JSX 写模板
        return <div>Hello {this.msg}</div>
    }
}
