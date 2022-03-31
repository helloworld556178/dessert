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
## 目前需要的东西：
- [ ] 1. 一个Linux漏洞 dirtyPipe
- [ ] 2. webgpu学习
- [ ] 3. 一种自动编程机器学习模型——Code-LMs
- [x] 4. 俄罗斯公布文件
- [ ] 5. 微塑料论文


# ES7新增特性
1. includes添加第二个参数，`[1,2,3].includes(1,1) === false`
2. 添加幂运算符 \*\*
# ES8新增特性
1. 添加padStart和padEnd
2. 添加Object.values()和Object.entries()
3. 提供async await关键字
# ES9新增特性
1. **放松对标签模板里字符串转义的限制**，遇到不合法的字符串转义返回undefined,并且从raw上可获取原字符串。```test `\123` ```
2. Promise.finally
3. for await of，允许在for后添加await，迭代异步操作
# ES10新增特性
1. JSON.stringify可返回不符合UTF-8标准的字符串，`JSON.stringify("\uD83D") => '"\\uD83D"'`，如果转义失败，就维持编码的原始形态
2. flatMap和flat
3. Object.fromEntries()     `Object.fromEntries([['a', 1], ['b', 2]])`
4. Function.prototype.toString()将从头到尾返回源代码中的实际文本片段。这意味着还将返回注释、空格和语法详细信息。
5. catch参数变为可选
# ES11新增特性
1. 新增原始数据类型BigInt
2. Promise.allSettled()
   1. 将多个实例包装成一个新实例，返回全部实例状态变更后的状态数组(齐变更再返回)
   2. 无论结果是 fulfilled 还是 rejected, 无需 catch
3. `import()`
4. `globalThis`
5. `?.`
6. `??`
# ES12新增特性
1. replaceAll
2. Promise.any()
3. WeakRefs，允许使用这个类创建一个对某个对象的弱引用   `const ref = new WeakRefs({a:1});`
4. &&=  `a&&=b; a&&(a=b)`
5. ||=  `a||=b; a||(a=b)`
6. ??=  `a??=b; a??(a=b)`
7. 数值分隔符，现在这种东西被认为是合法数字 `123_456`


# 设计程序原型：
1. 设计需要的数据结构
2. 设计调用过程
3. 如果是类，则设计类的成员函数
4. 调用过程与类应该声明其改变了哪些外部数据结构