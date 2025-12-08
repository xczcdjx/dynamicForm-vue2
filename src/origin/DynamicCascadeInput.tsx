import Vue, {PropType, toRaw, VNode} from "vue";
import type {ValueType, DyRandomFun, DyBtnConfig, DyListConfig, DyCasConfig, DyCasFormItem} from "../types";
import {
    allowType,
    formatNumberInput,
    resetMulObj,
    saferRepairColor,
    tranMulObj
} from "../utils/tools";

export default Vue.extend({
        name: 'DynamicCascadeInput',
        props: {
            modelValue: {
                type: Object as PropType<ValueType>,
                required: true
            },
            isController: {
                type: Boolean,
            },
            dyCls: {
                type: String,
            },
            randomFun: {
                type: Function as PropType<DyRandomFun>,
                default: (i?: number) => `${Date.now()}_${i ?? 0}`
            },
            // 子层深度 (超过则不再出现添加选项)
            depth: {
                type: Number,
                default: 3
            },
            btnConfigs: {
                type: Object as PropType<Partial<DyBtnConfig>>,
            },
            configs: {
                type: Object as PropType<DyCasConfig>,
            },
            dyListConfigs: {
                type: Object as PropType<DyListConfig>,
            },
            newChildTxt: {
                type: Function as PropType<(it: DyCasFormItem) => string>,
                default: (it: DyCasFormItem) => `添加 '${it.key}' 子项`
            },
        },
        data() {
            const ml: DyListConfig = {
                //@ts-ignore
                arraySplitSymbol: ',',
                ...this.dyListConfigs,
            }
            return {
                renderM: tranMulObj(this.modelValue, this.randomFun as DyRandomFun, ml.arraySplitSymbol),
                ml
            }
        },
        model: {
            prop: 'modelValue',
            event: 'update:modelValue',
        },
        methods: {
            updateModelValue(v: object) {
                this.$emit('update:modelValue', v)
            },
            onSet(o?: object) {
                //@ts-ignore
                this.renderM = tranMulObj(o ?? this.modelValue, this.randomFun, this.ml.arraySplitSymbol)
            },
            getResult(t: 'res' | 'ori' = 'res') {
                return t === 'ori' ? toRaw(this.renderM) : resetMulObj(this.renderM)
            },
        },
        watch: {
            renderM: {
                handler(newVal) {
                    if (this.isController) {
                        this.updateModelValue(resetMulObj(newVal, this.ml.arraySplitSymbol))
                    }
                },
                deep: true
            }
        },
        render(): VNode {
            // config
            const mb: DyBtnConfig = {
                resetTxt: "重置",
                newTxt: "添加项",
                mergeTxt: "合并",
                ...this.btnConfigs,
            }
            const mc: DyCasConfig = {
                hideReset: false,
                maxHeight: "600px",
                allowFilter: true,
                showBorder: true,
                showPad: true,
                retractLen: 0,
                borderColors: [],
                ...this.configs,
            }
            const ml = this.ml
            // render Cascade form
            const renderFormItems = (items: DyCasFormItem[], depth = 1, oriObj?: DyCasFormItem) => {
                return <div class={[
                    `depth-${depth}`,
                    mc.showBorder ? '' : 'no-border',
                    mc.showPad ? '' : 'no-pad',
                ]}
                            style={{
                                '--depth': depth,
                                ['--c' + [depth]]: saferRepairColor(mc.borderColors!, depth),
                            }}>
                    {
                        items.map((r, i, arr) => {
                            const isChildren = Array.isArray(r.value)
                            const isAllow = allowType(typeof r.value)
                            return <div class="dItem" key={r.rId}
                                        style={{marginLeft: depth > 1 ? `${depth * mc.retractLen!}px` : '0'}}>
                                <div class="input">
                                    {
                                        !isChildren && [
                                            <input value={r.key} class="key nativeInput"
                                                   onInput={(v) => (r.key = (v.target as HTMLInputElement).value)}/>,
                                            ':'
                                        ]
                                    }
                                    <div class="vInput">
                                        <div class="slot">
                                            {Array.isArray(r.value) ? undefined :
                                                [
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
                                                    </button>,
                                                    ' '
                                                    ,
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
                                                ]
                                            }
                                        </div>
                                        <input
                                            class={`value nativeV ${isChildren ? 'isKey' : ''}`}
                                            value={isAllow ? r.value as string : r.key}
                                            onInput={(tv) => {
                                                const v = (tv.target as HTMLInputElement).value
                                                if (isChildren) {
                                                    r.key = v
                                                    return
                                                }
                                                if (!mc.allowFilter) r.value = v
                                                else {
                                                    if (r.isNumber) {
                                                        r.value = formatNumberInput(
                                                            v,
                                                            r.isArray,
                                                            ml.arraySplitSymbol
                                                        )
                                                    } else r.value = v
                                                }
                                            }}
                                        />
                                        <div class="surSlot">
                                            {
                                                depth < this.depth ? (
                                                    !isChildren && <button
                                                        class={[
                                                            "success",
                                                            "bt"
                                                        ]}
                                                        onClick={() => {
                                                            if (isAllow) {
                                                                r.value = [];
                                                                r.isArray = undefined
                                                            }
                                                            (r.value as DyCasFormItem[]).push({
                                                                // @ts-ignore
                                                                rId: this.randomFun(),
                                                                key: "",
                                                                value: ""
                                                            });
                                                        }}
                                                    >
                                                        {/*//@ts-ignore*/}
                                                        {this.newChildTxt(r)}
                                                    </button>
                                                ) : null
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div class="btn">
                                    <button
                                        class={['success', 'bt',
                                            'n-btn']}
                                        disabled={i !== arr.length - 1}
                                        onClick={() => {
                                            // @ts-ignore
                                            items.push({rId: this.randomFun() as any, key: "", value: ""});
                                        }}
                                    >
                                        +
                                    </button>
                                    <button
                                        class={[
                                            "danger",
                                            'bt',
                                            'n-btn'
                                        ]}
                                        onClick={() => {
                                            items.splice(i, 1);
                                            if (items.length < 1) {
                                                if (oriObj === undefined) return resetMulObj([])
                                                const fIndex = this.renderM.findIndex(it2 => it2.rId === oriObj?.rId)
                                                if (depth < 1) this.renderM.splice(fIndex, 1, {...oriObj!, value: ""})
                                                else oriObj!.value = ""
                                            }
                                        }}
                                    >
                                        -
                                    </button>
                                </div>
                                {Array.isArray(r.value) && renderFormItems(r.value, depth + 1, r)}
                            </div>
                        })
                    }
                </div>
            };
            return <div class={this.dyCls ?? `dynamicCascadeInput`}>
                <div class="dyFormList" style={{maxHeight: mc.maxHeight}}>{renderFormItems(this.renderM)}</div>
                <div class='control'>
                    {!this.renderM.length && (
                        <button
                            class={[
                                "success", 'bt'
                            ]}
                            onClick={() => {
                                //@ts-ignore
                                this.renderM.push({rId: this.randomFun(), key: "", value: ""});
                            }}
                        >
                            {mb.newTxt}
                        </button>
                    )}
                    {
                        !this.isController && <div>
                            {!mc.hideReset && <button
                                class={[
                                    "default", 'bt'
                                ]}
                                onClick={() => {
                                    //@ts-ignore
                                    this.renderM = tranMulObj(this.modelValue, this.randomFun, ml.arraySplitSymbol)
                                    this.$emit('onReset')
                                }}
                            >
                                {mb.resetTxt}
                            </button>}
                            <button
                                class={[
                                    "info", 'bt'
                                ]}
                                onClick={() => {
                                    const obj = resetMulObj(this.renderM, ml.arraySplitSymbol);
                                    this.updateModelValue(obj)
                                    this.$emit('onMerge', obj, toRaw(this.renderM))
                                    //@ts-ignore
                                    this.renderM = tranMulObj(this.modelValue, this.randomFun, ml.arraySplitSymbol)
                                }}
                            >
                                {mb.mergeTxt}
                            </button>
                        </div>
                    }
                </div>
            </div>
        }
    }
)