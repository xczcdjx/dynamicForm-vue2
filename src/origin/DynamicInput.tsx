import Vue, {VNode, PropType, toRaw} from 'vue'
import type {FSize, ValueType, DyRandomFun, DyBtnConfig, DyListConfig, DyConfig, DyCFormItem} from "../types";
import {allowFormat, formatNumberInput, resetObj, tranArr} from "../utils/tools";

export default Vue.extend({
    name: 'DynamicInput',
    props: {
        size: {
            type: String as PropType<FSize>,
            required: false
        },
        isController: {
            type: Boolean,
            required: false
        },
        dyCls: {
            type: String,
            required: false
        },
        randomFun: {
            type: Function as PropType<DyRandomFun>,
            default: (i?: number) => `${Date.now()}_${i ?? 0}`
        },
        btnConfigs: {
            type: Object as PropType<Partial<DyBtnConfig>>,
            required: false
        },
        configs: {
            type: Object as PropType<DyConfig>,
            required: false
        },
        dyListConfigs: {
            type: Object as PropType<DyListConfig>,
            required: false
        },
        modelValue: {
            type: Object as PropType<ValueType>,
            required: true
        }
    },
    model: {
        prop: 'modelValue',
        event: 'update:modelValue',
    },
    data() {
        const ml: DyListConfig = {
            arraySplitSymbol: ',',
            // ...this.dyListConfigs,
        }
        return {
            ml,
            renderM: tranArr(this.modelValue, this.randomFun as DyRandomFun, ml.arraySplitSymbol),
            dyFormListRef: null,
        }
    },
    methods: {
        updateModelValue(v: object) {
            this.$emit('update:modelValue', v)
        },
        addRInput() {
            // @ts-ignore
            const rId = this.randomFun()
            this.renderM.push({
                rId, key: '', value: '', isArray: false,
                isNumber: false,
            })
            // this.$set(this.renderM,this.renderM.length,{rId, key: '', value: ''})
        },
        onSet(o?: object) {
            //@ts-ignore
            this.renderM = tranArr(o ?? this.modelValue, this.randomFun, this.ml.arraySplitSymbol)
        },
        getResult(t: 'res' | 'ori' = 'res') {
            return t === 'ori' ? toRaw(this.renderM) : resetObj(this.renderM, this.ml.arraySplitSymbol)
        },
    },
    watch: {
        renderM: {
            handler(newVal) {
                if (this.isController) {
                    this.updateModelValue(resetObj(newVal, this.ml.arraySplitSymbol))
                }
            },
            deep: true
        }
    },
    render(): VNode {
        const mb: DyBtnConfig = {
            resetTxt: "重置",
            newTxt: "添加项",
            mergeTxt: "合并",
            ...this.btnConfigs,
        }
        const mc: DyConfig = {
            hideReset: false,
            maxHeight: "300px",
            autoScroll: true,
            allowFilter: true,
            ...this.configs,
        }
        return <div class={this.dyCls ?? `dynamicInput ${this.size}`}>
            <div class="dyFormList" style={{maxHeight: mc.maxHeight}} ref={'dyFormListRef'}>
                {this.renderM.map((r, i, arr) => <div class="dItem" key={r.rId}>
                    <div class="input">
                        <input value={r.key} class="key nativeInput" onInput={v => {
                            r.key = (v.target as HTMLInputElement).value
                        }}/>:
                        <div class="vInput">
                            <div class="slot">
                                <button
                                    class={[
                                        r.isArray ? "success" : "default",
                                        "small",
                                        "bt"
                                    ]}
                                    onClick={() => {
                                        r.isArray = !r.isArray
                                    }}
                                >
                                    Array
                                </button>
                                &nbsp;
                                <button
                                    class={[
                                        r.isNumber ? "success" : "default",
                                        "small",
                                        "bt"
                                    ]}
                                    onClick={() => {
                                        r.isNumber = !r.isNumber
                                    }}
                                >
                                    Number
                                </button>
                            </div>
                            <input value={r.value} class='value nativeV' onKeydown={(e: KeyboardEvent) => {
                                if (!mc.allowFilter) return;
                                const check = allowFormat(e, {
                                    arraySplitSymbol: this.ml.arraySplitSymbol,
                                    isNumber: r.isNumber,
                                    isArray: r.isArray,
                                })
                                if (check) return
                                // no allow
                                else e.preventDefault()
                            }} onInput={v => {
                                const vv = (v.target as HTMLInputElement).value
                                if (!mc.allowFilter) {
                                    r.value = vv
                                } else {
                                    if (r.isNumber) {
                                        r.value = formatNumberInput(
                                            vv,
                                            r.isArray,
                                            this.ml.arraySplitSymbol
                                        )
                                    } else {
                                        r.value = vv
                                    }
                                }
                            }}/>
                        </div>
                    </div>
                    <div class="btn">
                        <button class={[this.size, 'success', 'bt']} disabled={i !== arr.length - 1} onClick={() => {
                            this.addRInput()
                            if (mc.autoScroll) {
                                this.$nextTick(() => {
                                    const el = this.$refs.dyFormListRef as HTMLDivElement
                                    el?.scrollTo({top: el.scrollHeight, behavior: 'smooth'})
                                })
                            }
                        }}>+
                        </button>
                        <button class={[
                            "danger",
                            this.size
                            , 'bt'
                        ]} onClick={() => {
                            this.renderM = this.renderM.filter(it => it.rId !== r.rId)
                        }}>-
                        </button>
                    </div>
                </div>)}
            </div>
            <div class='control'>
                {
                    !this.renderM.length && <button class={[
                        "success",
                        this.size, 'bt'
                    ]} onClick={() => {
                        this.addRInput()
                    }}>{mb.newTxt}</button>
                }
                {
                    !this.isController && <div>
                        {!mc.hideReset && <button class={[
                            "default",
                            this.size, 'bt'
                        ]} onClick={() => {
                            // @ts-ignore
                            this.renderM = tranArr(this.modelValue, this.randomFun, this.ml.arraySplitSymbol)
                            this.$emit('onReset')
                        }}>{mb.resetTxt}</button>}
                        <button class={[
                            "info",
                            this.size, 'bt'
                        ]} onClick={() => {
                            this.renderM.sort((a, b) => +a.rId - +b.rId)
                            const obj = resetObj(this.renderM, this.ml.arraySplitSymbol)
                            this.updateModelValue(obj)
                            this.$emit('onMerge', obj, toRaw(this.renderM))
                            // @ts-ignore
                            this.renderM = tranArr(obj, this.randomFun, this.ml.arraySplitSymbol)
                        }}>{mb.mergeTxt}</button>
                    </div>
                }
            </div>
        </div>
    }
})