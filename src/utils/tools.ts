import type {ValueType, DyCFormItem, DyRandomFun, DyCasFormItem} from "@/types";

const allowType = (v: any) => ['string', 'number'].includes(v)
const tranArr = (obj: ValueType, arrayFun: DyRandomFun, splitSymbol: string) => Object.keys(obj).map((it, i) => {
    const v = obj[it]
    const isArray = Array.isArray(v)
    const isNumber = isArray ? v.every(v => typeof v === 'number') : typeof v === 'number'
    return {
        rId: arrayFun(i),
        key: it,
        value: isArray ? v.join(splitSymbol) : v,
        isArray: isArray || undefined,
        isNumber: isNumber || undefined
    }
}) as DyCFormItem[];
const tranMulObj = (obj: ValueType, arrayFun: DyRandomFun, arraySplitSymbol: string = ','): DyCasFormItem[] => {
    return Object.keys(obj).map((it, i) => {
        let v = obj[it]
        const isArray = Array.isArray(v)
        const isNumber = isArray ? v.every((it2: string | number) => typeof it2 === 'number') : typeof v === 'number'
        const isNull = v === null
        if (allowType(typeof v)) v = obj[it]
        if (isNull) v = ''
        return {
            // @ts-ignore
            rId: arrayFun(i),
            key: it,
            value: Object.prototype.toString.call(v) === '[object Object]' ? tranMulObj(obj[it], arrayFun, arraySplitSymbol) : isArray ? v.join(arraySplitSymbol) : v,
            isArray: isArray || undefined,
            isNumber: isNumber || undefined
        }
    })
}
const resetObj = (arr: DyCFormItem[], splitSymbol: string) => {
    return arr.reduce((pre, cur) => {
        if (cur.key.trim()) {
            pre[cur.key] = parseValue(cur.value, cur.isArray, cur.isNumber, splitSymbol);
        }
        return pre;
    }, {} as ValueType);
};
const resetMulObj = (items: DyCasFormItem[], arraySplitSymbol: string = ',') => {
    return items.reduce((pre, cur) => {
        const v = cur.value
        if (cur.key.trim().length) {
            pre[cur.key] = Array.isArray(v) ? resetMulObj(v) : parseValue(cur.value as string, cur.isArray, cur.isNumber, arraySplitSymbol);
        }
        return pre;
    }, {} as ValueType)
}
const parseValue = (value: string, isArray?: boolean, isNumber?: boolean, splitSym: string = ',') => {
    let d: any
    if (isArray) {
        if (isNumber) {
            d = String(value).split(splitSym).map(Number).filter(it => !Number.isNaN(it))
        } else d = String(value).split(splitSym)
    } else {
        if (isNumber) {
            d = parseFloat(value)
        } else d = value.toString()
    }
    return d
};
// 允许数字 / 小数点 / 负号，兼容数组（用 splitSymbol 分隔）
const formatNumberInput = (
    val: string,
    isArray?: boolean,
    splitSymbol: string = ','
) => {
    const sanitizeOne = (s: string) => {
        // 只保留数字、小数点、负号
        s = s.replace(/[^\d.-]/g, '')

        // 处理负号：只允许一个负号，且在最前面
        let negative = false
        if (s.startsWith('-')) {
            negative = true
        }
        // 去掉所有负号
        s = s.replace(/-/g, '')

        // 处理小数点：只保留第一个 '.'
        const firstDot = s.indexOf('.')
        if (firstDot !== -1) {
            s =
                s.slice(0, firstDot + 1) +
                s.slice(firstDot + 1).replace(/\./g, '')
        }

        // 重新加上负号
        return (negative ? '-' : '') + s
    }

    if (isArray) {
        return val
            .split(splitSymbol)
            .map(item => sanitizeOne(item))
            .join(splitSymbol)
    } else {
        return sanitizeOne(val)
    }
}
const allowFormat = (e: KeyboardEvent, {arraySplitSymbol, isArray, isNumber}: {
    isArray?: boolean,
    isNumber?: boolean,
    arraySplitSymbol?: string
}): boolean => {
    // 只在允许过滤 + 数字模式下做键盘拦截
    if (!isNumber) return true

    const ev = e as KeyboardEvent & { key: string }
    const key = ev.key

    // 1. 放行常用控制键
    const controlKeys = [
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Enter',
        'Home',
        'End',
    ]
    if (controlKeys.includes(key)) return true

    // 2. 如果是数组，允许分隔符（比如逗号/你自定义的 split 符号）
    if (isArray && key === arraySplitSymbol) return true

    // 3. 允许数字 0-9
    if (/^[0-9]$/.test(key)) return true

    // 4. 允许负号与小数点
    if (key === '-' || key === '.') return true

    return false
}
const getDepthColor = (depth: number) => {
    const hue = (depth * 35) % 360
    const saturation = 60
    const lightness = 65

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
const saferRepairColor = (colors: string[], i: number): string => {
    const c = colors[i - 1]
    return c ?? getDepthColor(i)
}
export {
    tranArr,
    tranMulObj,
    resetObj,
    resetMulObj,
    allowType,
    parseValue,
    formatNumberInput,
    getDepthColor,
    saferRepairColor,
    allowFormat
}