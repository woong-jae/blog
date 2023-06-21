---
title: '[JS] 제너레이터'
date: '2022-10-25 23:20'
---

제너레이터를 사용하면 여려 개의 값을 필요에 따라 하나씩 반환할 수 있다.

## Generator function

제너레이터를 만들기 위해서는 '제너레이터 함수'라고 불리는 `function*`이 필요하다.

```js
function* generateSequence() {
  yield 1;
  yield 2;
  return 3;
}
```

제너레이터 함수를 호출하면 특별 객체인 '제너레이터 객체'가 반환된다. `generateSequence()`로 함수를 호출해도 본문은 실행되지 않는다.

본문을 실행하기 위해서는 제너레이터 객체의 `next` 메서드를 호출해야한다. `next`를 호출하면 가장 가까운 `yield`를 만날 때까지 실행하고 반환한다.

제너레이터가 반환하는 것은 `value`와 `done`을 프로퍼티로 가지는 객체다. 제너레이터가 `return`문으로 반환한다면 `done:true`를 받을 수 있다. 제너레이터가 종료된 이후에는 `next`를 호출해도 `{done: true}`만 반환된다.

## Generator와 iterable

제너레이터는 [[Iterable]]이기 때문에 `for..of` 반복문을 사용할 수 있다.

```js
for (let value of generator) {
  console.log(value);
}
```

이때 `done: true`일 때 `value`는 무시된다는 점을 주의해야한다. 위 코드에서 `return`으로 반환한 값은 출력되지 않는다. `return` 대신 `yield`를 사용하면 마지막 값까지 받을 수 있다.

제너레이터를 사용하면 이터러블을 훨씬 쉽게 구현할 수 있다.

## Generator composition

제너레이터 안에 제너레이터를 임베딩하는 것도 가능하다.

`yield*` 문법을 사용하면 실행을 다른 제너레이터에 위임할 수 있다.

```js
function* generateSequence(start, end) {
  for (let i = start; i <= end; i++) yield i;
}

function* generatePasswordCodes() {
  // 0..9
  yield* generateSequence(48, 57);
  // A..Z
  yield* generateSequence(65, 90);
  // a..z
  yield* generateSequence(97, 122);
}

const chars = [];
for (let code of generatePasswordCodes()) {
  chars.push(String.fromCharCode(code));
}
console.log(chars.join('')); // 0...9A...Za...z
```

한 제너레이터의 흐름을 자연스럽게 다른 제너레이터에 삽입할 수 있다.

## `yield`를 통한 데이터 교환

`yield`를 사용하면 결과를 바깥으로 전달할 뿐만 아니라 값을 전달 받을 수 있다. 값을 전달받기 위해서는 밖에서 `generator.next(arg)`를 호출해야 한다. `arg`는 `yield`의 결과가 된다.

```js
function* gen() {
  const result = yield '2 + 2 = ?';
  console.log(result);
}
const generator = gen();
const question = generator.next().value;
generator.next(4);
// 4
```

## Generator와 async/await

async/await 문법은 Generator와 Promise로 구현할 수 있다. 실제로 babel이 async/await를 ES5 스펙으로 변환한 것을 통해 알 수 있다.

```js
// ES7
async function foo() {
  await bar();
}

// ES5 transpiled
let foo = (() => {
  var _ref = _asyncToGenerator(function* () {
    yield bar();
  });

  return function foo() {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            function (value) {
              step('next', value);
            },
            function (err) {
              step('throw', err);
            },
          );
        }
      }
      return step('next');
    });
  };
}
```

async 함수를 제너레이터로, await를 yield로 치환해 생각했을 때 실행흐름을 생각해보면 아래와 같다.

1. 스크립트가 실행된다.
2. 비동기 호출을 만난다.
3. 비동기 호출이 끝나고 `next`가 호출된다.
4. 다음 비동기 호출이 있으면 2번부터 반복한다.
5. 비동기 호출이 없다면 반환하고 끝낸다.

비동기 로직이 종료됐을 때마다 적절하게 `next`를 호출하면 된다. 여기서 문제점은 `next`를 어떻게 호출할지다. `next`를 `bar` 안에서 직접 실행하면 의존성이 생긴다. 대신 Promise와 함수로 감싸서 `next`를 대신 호출하게 할 수 있다.

`step` 함수는 iterator 객체를 `done` 상태가 될 때까지 재귀적으로 실행한다.

1. `step` 함수가 실행된다.
2. iterator 객체의 `next` 메서드가 호출된다.
3. `value`에 프로미스가 반환된다.
4. `done: true`면 `value`를 `resolve`해 최종적으로 반환한다.
5. 아니라면 프라미스가 끝나길 기다리고, `resolve`된 값으로 `step` 함수를 실행시키고 2번부터 반복한다.

흐름이 어렵다면 [**ES6의 제너레이터를 사용한 비동기 프로그래밍**](https://meetup.toast.com/posts/73)을 한 번 읽어보면 이해에 도움이 될 것 같다.

## 참조

- https://ko.javascript.info/generators
- [Async-await는 어떻게 구현하는가](https://medium.com/@la.place/async-await%EB%8A%94-%EC%96%B4%EB%96%BB%EA%B2%8C-%EA%B5%AC%ED%98%84%ED%95%98%EB%8A%94%EA%B0%80-fa08a3157647)
- [ES6의 제너레이터를 사용한 비동기 프로그래밍](https://meetup.toast.com/posts/73)
