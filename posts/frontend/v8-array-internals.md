---
title: '[V8] 배열 내부 처리 이해하기'
date: '2022-04-19 12:36'
---

배열은 자바스크립트의 핵심 기능중 하나고 정말 자주 사용한다.
자주 사용하는 만큼, '잘' 사용해야 한다.
배열을 잘 사용하기 위해 배열의 내부를 살펴보자.

모든 자바스크립트 엔진을 보기는 힘드니까, 가장 많이 사용하는 엔진인 V8을 볼 것이다.

## Element kinds

V8은 정수형 이름을 가지는 프로퍼티(보통 `Array` constructor로 만들어진 객체)를 특별하게 다룬다.

V8은 자바스크립트 코드를 실행하는 동안 각 배열이 어떤 element kind를 가지는지 기록한다.
Element kind에 따라 V8은 배열에 대한 연산(`reduce`, `map`, `forEach` 등)을 최적화한다.

그래서 'element kind'가 뭘까?

아래 배열을 보자.

```js
const array = [1, 2, 3];
```

배열의 요소가 `number`니까, `number`가 element kind 일까? 아니다.

자바스크립트는 숫자가 integer든, float든, double이든 모두 number로 처리한다.
하지만, **엔진 레벨에서는 더욱 정밀한 구분**을 한다.

배열이 어떤 element kind를 가지는지 직접 확인해보자.

터미널에 `node --allow-natives-syntex`를 사용해 노드를 실행하면 `%DebugPrint()` 함수를 통해 내부 디버그 정보를 볼 수 있다.

```sh
> const array = [1, 2, 3];
undefined
> %DebugPrint(array);
DebugPrint: 0x32fb3b0738c9: [JSArray] in OldSpace
 - map: 0x32fbe2fc3dd1 <Map(PACKED_SMI_ELEMENTS)> [FastProperties]
 - prototype: 0x32fbeeea10b9 <JSArray[0]>
 - elements: 0x32fbf562dd59 <FixedArray[3]> [PACKED_SMI_ELEMENTS (COW)]
 - length: 3
 - properties: 0x32fb7de41309 <FixedArray[0]>
 - All own properties (excluding elements): {
    0x32fb7de44d41: [String] in ReadOnlySpace: #length: 0x32fb47e41189 <AccessorInfo> (const accessor descriptor), location: descriptor
 }
 ...
```

`elements`를 통해 배열에 대한 정보를 알 수 있다.
`FixedArray[3]`라는 것은 요소를 저장하기 위해 **고정된 크기의 배열**을 사용한다는 의미다.
그 다음 `PACKED_SMI_ELEMENTS`는 element kind를 의미한다.

여기서 `array`에 `4.3`과 `'x'`를 추가하면서 내부 정보가 어떻게 변하는지 살펴보자.

```sh
> array.push(4.3);
4
> %DebugPrint(array);
DebugPrint: 0xad33ffc67a9: [JSArray] in OldSpace
 - map: 0x0ad37a9c4f89 <Map(PACKED_DOUBLE_ELEMENTS)> [FastProperties]
 - prototype: 0x0ad33b7210b9 <JSArray[0]>
 - elements: 0x0ad329703101 <FixedDoubleArray[22]> [PACKED_DOUBLE_ELEMENTS]
...
> array.push('x');
5
> %DebugPrint(array);
DebugPrint: 0xad33ffc67a9: [JSArray] in OldSpace
 - map: 0x0ad37a9c4ef9 <Map(PACKED_ELEMENTS)> [FastProperties]
 - prototype: 0x0ad33b7210b9 <JSArray[0]>
 - elements: 0x0ad3576a3839 <FixedArray[22]> [PACKED_ELEMENTS]
...
```

먼저 `4.3`을 넣기 전에는 배열의 크기가 `3`이였는데, 넣고난 후에는 `4`가 아니라 `22`로 변경됐다.
사용하는 것보다 더 많은 메모리가 할당되었는데,
이는 `push`같은 **배열의 크기를 증가시키는 작업이 constant [amortized time](https://en.wikipedia.org/wiki/Amortized_analysis#Dynamic_array)을 가질 수 있도록 하기 위함**이다.
배열의 크기가 부족해지면 아래와 같은 공식을 통해 새로운 사이즈를 할당한다.

```js
new_capacity = (old_capacity + 50%) + 16
```

위에서 공간이 부족했을 때 배열의 크기가 `4`였으므로 새로운 크기는 `(4 + 50%) + 16 = 22`가 된다.

배열에 실수를 넣으니까 element kind가 `PACKED_DOUBLE_ELEMENTS`로 바꼈고,
문자를 넣으니까 `PACKED_ELEMENTS`로 바꼈다.

`SMI`는 small integer를 뜻한다. Small integer는 $-2^{31}$과 $2^{31}-1$ 범위의 정수다.
`DOUBLE`은 정수의 범위가 small integer를 벗어나거나, floating-point 수를 나타낸다.
`SMI`도, `DOUBLE`도 아닌 요소는 그냥 `ELEMENTS`로 저장된다.

`SMI`의 더 일반화된 변형이 `DOUBLE`이고, `DOUBLE`의 일반화된 변형은 `ELEMENTS`로 볼 수 있다(specific to gerneral).

여기서 알아야 할 점은 element kind는 더 특정화하는 방향(general to specific)으로는 갈 수 없다는 것이다.
한 번 `DOUBLE`로 바꼈으면 다시는 `SMI`로 돌아갈 수 없다.

### PACKED vs HOLEY

`push(4.3)`를 하고나서 `array`의 정보를 다시 한 번 보자.

```sh
 - elements: 0x0ad329703101 <FixedDoubleArray[22]> {
           0: 1
           1: 2
           2: 3
           3: 4.3
        4-21: <the_hole>
 }
```

여기 보면 `4-21: <the_hole>`이란게 있다.
이것으로 알 수 있는점은 현재 사용되고 있지 않은 부분은 `the_hole`으로 채워진다는 것이다.
V8에서 'Hole'은 할당되지 않은 요소나 삭제된 배열 요소를 마크하기 위해 사용된다.

앞서본 `PACKED` element kind 외에 `HOLEY`라는 것도 있다.
`push(4.3)`를 한 상태에서 `array[10] = 10`을 하게되면 element kind는 `HOLEY_DOUBLE_ELEMENTS`로 변경된다.
이는 배열의 요소가 연속적이지 않고, **사이사이에 'hole'이 있다**는 것을 나타낸다.

한 번 `HOLEY`가 됐으면 다시 `PACKED`가 될 수 없다.

중간 중간에 구멍이 있으면 V8은 배열을 순회하거나 변경할 때 요소가 hole인지 아닌지 계속 확인해서 `PACKED` 보다는 더 느려지게 된다.

이때까지 본 element kind와 변형을 나타내면 아래 그림과 같이 나타날 수 있다. 변형은 무조건 화살표 방향으로만 진행된다.

<img src="https://v8.dev/_img/elements-kinds/lattice.svg" alt="element-kinds" />

> V8은 21가지 element kind를 둔다.

보통 element kind가 더 구체적일 수록 더 세밀한 최적화를 받을 수 있다.
반대로 element kind가 더 일반화 될 수록 배열에 대한 연산이 더 느려질 수 있다.
**최적의 성능을 위해서는 아무 이유 없이 element kind를 변경하지 않고 가장 구체적인 element kind를 사용해야 한다.**

### Large/Sparse Array

배열의 hole이 엄청나게 커지면 특이한 일이 벌어진다.

```sh
> array[32 << 20] = 0;
0
> %DebugPrint(array)
DebugPrint: 0xad33ffc67a9: [JSArray] in OldSpace
 - map: 0x0ad365ac1119 <Map(DICTIONARY_ELEMENTS)> [FastProperties]
 - prototype: 0x0ad33b7210b9 <JSArray[0]>
 - elements: 0x0ad3c17422f9 <NumberDictionary[52]> [DICTIONARY_ELEMENTS]
 - length: 33554433
```

배열의 hole이 엄청 커지면 V8은 요소를 저장할 때 `FixedArray`가 아닌 `NumberDictionary`를 사용한다.
`NumberDictionary`는 해시 테이블 기반 콜렉션으로 숫자 키에 특화돼있다.

Element kind 역시 `DICTIONARY_ELEMENTS`로 변경된 것을 알 수 있다.

V8은 hole이 많은 배열은 메모리를 아끼기 위해 해쉬 테이블로 저장한다.
해쉬 테이블에 대한 연산은 해시 코드 계산, 엔트리 룩업, 리해싱 때문에 배열에 대한 연산보다 느리다.

배열의 크기가 엄청 커졌을 때도 `NumberDictionary`를 사용한다.

## 마치며

배열의 내부를 살펴봤다.

배열을 사용할 때 `new Array(n)`보다 `[]`를 사용하는 것이 좋은 것은 알았는데, 왜 좋은지는 몰랐다.
`new Array(n)`을 사용하면 배열은 무조건 `HOLEY`가 되기 때문이라는 것을 알 수 있다.

그리고 배열을 사용할 때 **가능한 구체적인 element kind를 사용**하는 것이 성능에 좋다는 것을 알게 되었다.

참고로 **배열의 길이 밖 인덱스를 읽는 것을 삼가**해야 한다.
Out-of-bound 인덱스를 읽게되면 프로퍼티가 배열에 없기 떄문에 자바스크립트 엔진은 프로토타입 체인을 뒤지게 된다.
이렇게 되면 V8은 "이 배열은 특별한 경우를 처리해야 한다"라는 것을 기억하고, out-of-bound를 읽기 전만큼 빠르게 동작하지 않게된다.

앞으로 배열을 사용할 때는 위 내용을 참고해서 더 좋은 코드를 작성해보자.

## 참조

<https://v8.dev/blog/elements-kinds>  
<https://itnext.io/v8-deep-dives-understanding-array-internals-5b17d7a28ecc>
