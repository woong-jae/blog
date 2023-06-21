---
title: '[JS] sort는 어떤 알고리즘을 사용할까?'
date: '2022-04-12 20:24'
---

## Array.prototype.sort()

우리는 배열의 요소를 정렬하고 싶을 때 `sort` 메서드를 사용한다.

```js
arr.sort([compareFunc]);
```

이 메서드는 파라미터로 `compareFunc`(비교함수)를 제공해도 되고 안해도 된다.

비교함수를 제공하지 않으면 요소를 자동으로 **ASCII 문자를 기준으로 오름차순 정렬**한다.
`compareFunc(elem1, elem2)`를 제공할 때는 첫 번째 요소가 두 번째 요소보다 우선순위가 높으면 음수를 반환해주고, 낮으면 양수롤 반환해주는 함수를 작성하면 된다.
같다면 0을 반환해주면 된다.

알고리즘 문제를 풀다보면 자주 사용하는 `sort` 메서드지만, 사용 방법만 알고 어떤 내부 알고리즘을 사용하는지는 모르고 있었다.

**어떤 정렬 알고리즘을 사용할까?** 한 번 알아보자.

## 자바스크립트에서 사용하는 정렬 알고리즘

자바스크립트 명세에는 `sort` 구현에 어떤 알고리즘을 사용해야 한다고 특정하지 않는다.

이 말은 자바스크립트를 해석하는 엔진을 **어떻게 구현했냐에 따라 정렬에 사용되는 알고리즘에 달라질 수 있다**는 것이다.

가장 많이 쓰이는 V8 엔진에서는 어떻게 구현했는지 찾아보자.

[V8 깃허브](https://github.com/v8/v8)에 가서 'sort'를 검색해보면 `third_party/v8/builtins/array-sort.tq`라는 파일을 찾을 수 있다.
이 파일의 상단에 주석을 보면 아래와 같은 내용이 적혀져있다.

```
// This file implements a stable, adapative merge sort variant called TimSort.
```

"이 파일은 TimSort라는 안정적인 적응형 병합 정렬 변형을 구현합니다.".

**V8은 정렬 알고리즘으로 'Tim Sort'를 사용한다는 것을 알 수 있다.**

> 추가적으로 파이어폭스에서 사용하는 'Spidermonkey'는 merge sort를 사용한다.
>
> Spidermonkey 깃허브의 [jsarray.cpp](https://github.com/ricardoquesada/Spidermonkey/blob/master/js/src/jsarray.cpp)를 보면 `MergeSort`가 구현되어 있다.

### Tim Sort?

이 정렬 알고리즘은 'Insertion Sort'과 'Merge Sort'를 결합하여 만든 정렬이라고 한다.
주석의 내용으로 추측할 수 있듯이 merge sort를 기반으로 엄청나게 최적화를 한 알고리즘이다.
시간복잡도 $O(n\log n)$, stable, in-place 정렬이다.

$O(n\log n)$ 정렬 알고리즘의 단점을 최대한 극복한 알고리즘으로, Java와 Python에서도 사용된다.

알고리즘 동작에 대한 자세한 내용은 [여기](https://d2.naver.com/helloworld/0315536)에서 살펴보자.

## 마치며

배열의 `sort` 메서드가 내부적으로 어떤 알고리즘을 사용하는지 알아봤다.

막연히 quick sort나 merge sort를 사용할 줄 알았지만, 처음 듣는 알고리즘이 튀어나와서 당황했다.

## 참조

<https://stackoverflow.com/questions/234683/javascript-array-sort-implementation>  
<https://tc39.es/ecma262/#sec-array.prototype.sort>  
<https://github.com/v8/v8>  
<https://github.com/ricardoquesada/Spidermonkey/blob/master/js/src/jsarray.cpp>
