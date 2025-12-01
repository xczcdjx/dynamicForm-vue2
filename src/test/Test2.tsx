// src/origin/Test.tsx
import Vue, { VNode,PropType } from 'vue'

export default Vue.extend({
    name: 'Test2',
    props: {
        msg: {
            type: String as PropType<string>,
        }
    },
    render(): VNode {
        return <div>Hello {this.msg}</div>
    }
})
