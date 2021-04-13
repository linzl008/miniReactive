/*
 * @author: linzl
 * @method: 
 * @param: 
 * @Date: 2021-04-13 10:45:11
 * @return: 
 */

function reactive(obj) {
    console.log(typeof obj);
    if (typeof obj !== 'object') {
        return obj
    }
    return new Proxy(obj, {
        // Reflect 的形参和Proxy 的handle基本一样
        get(target, key) {
            let val = Reflect.get(target, key)
            console.log("get:", val);
            track(target, key)
            return val
        },
        set(target, key, value) {
            let res = Reflect.set(target, key, value)
            console.log("set:", value);
            trigger(target, key)
            return res
        },
        deleteProperty(target, key) {
            let res = Reflect.deleteProperty(target, key)
            console.log("deleteproperty:", res);
            trigger(target, key)
            return res
        }
    })
}

let effectStack = []
let targetMap = new WeakMap()

function effect(fn) {
    let effect = createReactiveEffect(fn)
    effect()
    return effect
}

function createReactiveEffect(fn) {
    let effect = function reactiveEffect() {
        try {
            effectStack.push(effect)
            return fn()
        } finally {
            effectStack.pop()
        }
    }
    return effect
}

function track(target, key) {
    let activeEffect = effectStack[effectStack.length - 1]
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }
    // 注册依赖- 操作集合 key
    let dep = depsMap.get(key)
    if (!dep) {
        depsMap.set(key, (dep = new Set()))
    }
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect)  
    }
}

function trigger(target, key){
    let depsMap = targetMap.get(target)
    if(!depsMap) return
    
    let deps = depsMap.get(key)
    deps.forEach(dep => {
        dep()
    });
}
