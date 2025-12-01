// src/origin/Test2.tsx
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Test2 extends Vue {
    @Prop(String) readonly msg!: string

    render() {
        return <div>Test2: {this.msg}</div>
    }
}
