1. js函数的调用者的确定方式（可能） `o.foo` ，没有点的就是 `globalThis.foo`
2. 类的实例拥有一个指向原型的指针而不是副本，修改了类的 `prototype`，那么所有的实例的 `prototype` 指向的属性都会改变