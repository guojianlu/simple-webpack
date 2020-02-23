// 依赖 为什么要分析依赖，因为我们需要拿到路径
import { add } from './a.js';
import { double } from './b.js';
console.log(add(1, 2));
console.log(double(3));
// 源代码
console.log('hello webpack');
