# 记录
1. js函数的调用者的确定方式（可能） `o.foo` ，没有点的就是 `globalThis.foo`
2. 类的实例拥有一个指向原型的指针而不是副本，修改了类的 `prototype`，那么所有的实例的 `prototype` 指向的属性都会改变
3. `JSON.stringify`会忽略 `undefined`，不会忽略 `null`，`NaN`，`Infinity`等无效数据会被转化为 `null`
4. js的自增自减运算符，如果写在变量后面，执行方式应该是`返回,变量修改,执行后面的计算`，这个修改大概是立即的，即 `var a=1; a++ + a === 3;`
5. `console.log(Object.is(NaN, NaN), true, '*')`

# 新闻
## 阿里女员工被侵害案
> 2021年09月07日文
1. [判定为猥亵，不入刑](https://mbd.baidu.com/newspage/data/landingsuper?context=%7B%22nid%22%3A%22news_8665461110681100718%22%7D&n_type=-1&p_from=-1)
2. 周某状告张某文性侵
3. 结果：判定为猥亵，性侵行为不成立，状告失败
