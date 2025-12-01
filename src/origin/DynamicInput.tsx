import Vue, { VNode,PropType } from 'vue'
export default Vue.extend({
    name: 'DynamicInput',
    props: {
        size:{
            type: String as PropType<string>,
            default: 'large'
        }
    },
    render(): VNode {
        return <div class='dynamicInput'>
            <div class='aaa'>
                test test
                {this.size}
            </div>
        </div>
    }
})