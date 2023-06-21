---
title: '[JS] 프로미스(Promises)'
date: '2022-01-02'
---

## 비동기 동작

많은 프로그램들은 바깥 세상에 있는 것들과 상호작용을 한다. 네트워크를 통해 무언가 요구할 수도 있고, 하드디스크에서 뭔가 들고올 수도 있다.
필요한 것들을 요청한 후, 이것들을 받을 때까지 기다려야 받은 것에 대한 추가작업이 가능할 것이다.

요청에 대한 기다림을 처리하는 방법에는 크게 두 가지 모델이 있다. **동기 모델(synchronous model)**과 **비동기 모델(asynchronous model)**이다.

동기 모델로 요청을 처리할 경우, 요청에 대한 응답이 올 때까지 뒤의 다른 작업은 기다려야 한다. 이것을 **블로킹(blocking)**이라고 한다.
뒤에 요청에 대한 응답과는 전혀 무관한 일들이 있어도 대기해야 하기 때문에 자원 낭비가 발생할 수 있다.

반면 비동기 모델에서는 요청에 대한 응답이 올 때까지 기다리지 않고 다음 작업을 실행한다.
이후 응답이 도착하면 이벤트를 발생시켜 받은 데이터로 수행해야 할 작업을 계속한다.

**자바스크립트가 실행되는 주요 환경인 브라우저와 Node.js에서는 비동기 방식을 사용**한다.

## Callbacks

비동기 프로그래밍을 구현하는 한 가지 방법으로는 **'callback'** 함수를 이용하는 방법이 있다.

느린 동작을 수행하는 함수가 콜백 함수를 추가적인 인수로 받게해서, 동작이 끝났을 때 콜백 함수를 결과와 함께 호출하는 방식이다.
예로, `setTimeout` 함수는 인수로 준 밀리초 이후 함수를 호출한다.

```js
setTimeout(() => console.log('Tick'), 500);
```

이런 식으로 비동기 동작을 구현하는 것에는 문제점이 있다.

- 연속적인 비동기 호출을 수행하려고 한다면, 콜백안에 콜백, 또 콜백 안에 콜백이 쌓여 콜백 지옥이 형성될 수 있다.
- 가장 큰 문제는 에러처리가 곤란하다는 것이다.

### Event Loops

**비동기적 동작은 '빈 함수 콜 스택'에서 실행**된다.

`setTimeout` 함수를 어떤 함수 안에서 호출했다고 가정해보자.
아마도 호출한 함수는 `setTimeout`의 콜백 함수가 호출되기 전에 이미 작업을 끝냈을 것이다.
따라서, 콜백이 리턴을 한 후에는 컨트롤이 자신을 스케쥴한 함수 `setTimeout`으로 다시 돌아가지 않는다. 이런 특성 때문에 에러 처리가 힘들어진다.
아래 예를 보자.

```js
try {
  setTimeout(() => {
    throw new Error('에러!');
  }, 20);
} catch (_) {
  // 에러 처리 안됨
  console.log('에러 발견');
}
```

**콜백에서 에러를 던지지만, 빈 함수 콜 스택에서 처리되기 때문에 에러를 핸들링하지 못한다.**

자바스크립트 런타임은 이벤트가 발생한 비동기 프로그램을 처리하기 위해 **'Event Loop(이벤트 루프)'**을 사용한다.
처리할 이벤트가 큐에 들어가고, 이벤트 루프는 가장 오래된 것부터 하나씩 처리한다. 이벤트 루프를 다음과 같이 코드화하면 쉽게 이해할 수 있다.

```js
while (queue.waitForMessage()) {
  queue.processNextMessage();
}
```

이벤트 루프는 가장 오래된 것부터 처리한다고 했는데... 그럼 위에서 봤던 `setTimeout(() => console.log("Tick"), 500)`은 뭘까?
0.5초 후에 실행되는 것이 아니였나? **아니다.** `setTimeout`에 넣어주는 지연시간은 보장 시간이 아니라 **대기할 최소 시간**이다.
0.5초가 지났어도 자신보다 앞에 있는 이벤트들이 전부 처리되어야 실행될 수 있다.

## Promises

프로미스는 **정해진 장시간 걸리는 기능을 수행하고 나서 성공 여부와, 그에 따라서 결과 혹은 에러를 전달**해주는 객체다.

프로미스는 `Promise` 생성자를 통해 생성할 수 있다.

```js
let promise = new Promise(function (resolve, reject) {
  // executor
});
```

`Promise` 생성자 함수는 비동기 작업을 수행할 콜백 함수를 인자로 받는다. 이 콜백 함수는 'executor'라고 부르고 `resolve`와 `reject` 콜백 함수를 인자로 갖는다.
각각은 일이 성공적으로 끝났을 때, 일이 실패했을 때 사용된다. 두 콜백 중 하나는 무조건 executor에서 실행되야 한다.

**프로미스는 `new Promise`가 만들어질 때 executor가 자동으로 실행**된다. 불필요한 네트워크 통신을 줄이려면 이 점에 유의하자.

프로미스는 아래와 같은 `state`를 속성으로 가진다.

- **pending**: 초기 상태
- **fullfilled**: `resolve` 호출 시
- **rejected**: `reject` 호출 시

'fullfilled'되거나 'rejected'된 프로미스는 'settled' 프로미스라고 한다.

또한 `result`라는 속성을 가진다. 처음 값 `undefined`에서 `resolve(value)`가 호출되면 `value`로, `reject(error)`가 호출되면 `error`로 변한다.

아래는 두 가지 상태를 실험해볼 간단한 프로미스를 구현했다.

```js
function resolveOrReject(flag) {
  return new Promise((resolve, reject) => {
    if (flag === 1) {
      setTimeout(() => resolve('성공!'), 1000);
    } else {
      setTimeout(() => reject(new Error('으아 에러다')), 1000);
    }
  });
}
```

`flag`가 1 이면, `resolve("성공!")`이 1초후 실행되어 프로미스의 `state`는 'fullfilled', `result`는 `"성공!"`이 된다.
아니라면, `reject(new Error("으아 에러다"))`이 1초후 실행되어 프로미스의 `state`는 'rejected', `result`는 `error`가 된다.

이렇게 구현된 프로미스 객체는 `then`, `catch`, `finally` 메서드를 통해 후속 처리할 수 있다.
이 메서드들은 모두 **프로미스를 반환**하기 때문에 서로 연결이 가능해진다.

### then

`then`은 프로미스에서 가장 중요하고 기본이 되는 메서드다.
두가지 인자를 받을 수 있다. 첫 번째는 프로미스가 resolve 되었을 때 결과를 받아 실행되는 함수, 두 번째는 프로미스가 reject 되었을 때 에러를 받아 실행하는 함수다.

```js
resolveOrReject(1).then(
  (res) => console.log(res),
  () => console.log(res),
);
// -> 성공!
resolveOrReject(0).then(
  (res) => console.log(res),
  () => console.log(res),
);
// -> Error: 으아 에러다
```

`then`에 인자를 하나만 전달하면 성공적으로 처리된 경우만 다룬다.

### catch

`.catch(errorHandling)`사용 시, `.then(null, errorHandling)`같이 에러가 발생한 경우에 대해서만 다룬다.
둘다 똑같이 작동하지만, `then(f1).catch(f2)`가 아닌 `.then(f1, f2)`로 구현하면 `f1`에서 발생한 에러를 잡지 못한다는 차이가 발생한다.

### finally

`.finally(f)` 호출은 프로미스가 처리되면(resolve/reject) `f`가 항상 실행된다.
이 메서드에서는 프라미스가 resolve 되었는지, reject 되었는지 알 수 없다. 성공 혹은 실패 여부에 상관없는 보편적 동작을 취하기 때문이다.
`finally` 핸들러는 자동으로 다음 헨들러에 결과와 에러를 전달한다. 아래 예시를 보자.

```js
resolveOrReject(1)
  .finally(() => console.log('사이에 끼기'))
  .then((res) => console.log(res));
// -> 사이에 끼기
// -> 성공!
```

`result`가 `finally`를 거쳐 `then`에 전달되는 것을 볼 수 있다.

## 프로미스 체이닝

콜백으로 비동기 함수의 처리 결과를 비동기 함수로 처리해야 하는 경우, 함수 중첩으로 인해 콜백 지옥이 나타날 수 있다.
프로미스는 후속 처리 메소드를 통해 여러 개의 프로미스를 연결해 사용하는 방법으로 이 문제를 해결할 수 있다.

```js
new Promise(function (resolve, reject) {
  setTimeout(() => resolve(1), 1000);
})
  .then(function (result) {
    alert(result); // 1

    return result * 2;
  })
  .then(function (result) {
    // (**)

    alert(result); // 2

    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(result * 2), 1000);
    });
  })
  .then(function (result) {
    alert(result); // 4
  });
```

위 코드를 실행해보면 결과가 체인에 따라 전달되는 것을 볼 수 있다.
`promise.then`을 호출하면 프로미스가 반환되기 때문에 체이닝이 가능하다.

**비동기 동작은 항상 프라미스를 반환하도록 하는 것이 좋다**.
나중에 체인 확장이 필요한 경우 손쉽게 체인을 확장할 수 있기 떄문이다.

## 프라미스 API

프라미스는 다섯 가지 정적 메소드를 가진다.

### Promise.all

**여러 프라미스를 동시에 실행시키고 모든 프라미스가 준비될 때까지 기다릴 때** 사용할 수 있다.

```js
let promise = Promise.all([...promises...]);
```

`Promise.all`은 요소 전체가 프로미스인 배열(iterable)을 받고 새로운 프라미스를 반환한다.
새로운 프로미스의 `result`는 배열 안 프라미스의 결괏값을 담은 배열이다.

```js
Promise.all([
  new Promise((resolve) => setTimeout(() => resolve(1), 3000)),
  new Promise((resolve) => setTimeout(() => resolve(2), 2000)),
  new Promise((resolve) => setTimeout(() => resolve(3), 1000)),
]).then(console.log);
// -> [1, 2, 3]
```

프로미스 중 하나라도 거부되면, `Promise.all`이 반환하는 프로미스는 가장 먼저 reject한 프로미스의 에러와 함께 바로 거부된다.
나머지 프로미스는 처리되기는 하지만 그 결과는 무시된다.

### Promise.allSettled

모든 프로미스가 처리될 때까지 기다린다. `Promise.all`과 다르게 여러 요청 중 하나가 실패해도 다른 요청 결과를 그대로 가지고 있는다.

```js
let promise = Promise.allSettled([...promises...]);
```

반환되는 배열의 결과는 다음 두 가지를 가질 수 있다.

- 응답이 성공할 경우: `{status:"fulfilled", value:result}`
- 응답이 실패할 경우: `{status:"rejected", reason:error}`

각 프로미스의 상태와 값 혹은 에러를 받을 수 있다.

### Promise.race

`Promise.all`과 비슷하지만, **가장 먼저 처리되는 프로미스의 결과(혹은 에러)를 반환**하는 것이 다르다.

```js
let promise = Promise.race(iterable);
```

가장 빨리 처리된 프로미스가 등장하는 순간부터는 다른 프로미스에서 에러가 나던 결과가 나던 무시된다.

### Promise.resolve/reject

`Promise.resolve`는 결괏값이 `value`인 resloved 프로미스를 생성한다. 호환성을 위해 함수가 프로미스를 반환하도록 해야할 때 사용할 수 있다.
아래 예시를 보자

```js
let cache = new Map();

function loadCached(url) {
  if (cache.has(url)) {
    return Promise.resolve(cache.get(url));
  }

  return fetch(url)
    .then((response) => response.text())
    .then((text) => {
      cache.set(url, text);
      return text;
    });
}
```

`loadCached`는 URL을 대상으로 `fetch`를 호출하고, 그 결과를 캐시한다. 나중에 동일한 URL로 사용할 때 다시 `fetch`하지 않게 할 수 있는데,
이떄 `Promise.resolve`를 사용해서 캐시된 내용을 프로미스로 만들어 반환값이 항상 프로미스로 되게한다. 따라서 `then`, `catch` 같은 후속 처리를 할 수 있다.

`Promise.reject`는 똑같지만 결괏값이 에러인 rejected 프로미스를 반환한다.

## 마이크로태스크 큐

모든 프라미스 동작은 **'마이크로태스크 큐'**라고 불리는 내부 `PromiseJobs` 큐에 들어가서 처리되기 때문에 프라미스 핸들링은 항상 비동기로 처리된다.

```js
let promise = Promise.resolve();
promise.then(() => console.log(1));
console.log(2);
// -> 2
// -> 1
```

마이크로태스크 큐는 먼저 들어온 작업을 먼저 실행하고, **마이크로태스크 큐에 있는 작업은 실행할 것이 아무것도 남아있지 않을 때만 실행**된다.
따라서 `.then/catch/finally` 핸들러는 항상 현재 코드가 종료되고 난 후에 호출된다.

<img 
  src='https://uploads.disquscdn.com/images/9466d8aa53fc5b3e63a92858a94bb429df02bbd20012b738f0461343beaa6f90.gif?w=800&h=416' 
  alt="microtask-queue"
  width='600px' 
/>

마이크로태스크는 코드를 사용해서만 만들 수 있는데, 주로 프라미스를 사용해 만든다. 프라미스와 함께 쓰이는 `.then/catch/finally`나 `await`가 마이크로태스크가 된다.
이 외에도 표준 API인 `queueMicrotask(func)`를 사용하면 함수를 마이크로태스크 큐에 넣어 처리할 수 있다.

## 참조

Eloquent JavaScript  
ko.javascript.info  
<https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Promise>  
<https://developer.mozilla.org/ko/docs/Web/JavaScript/EventLoop>
<https://poiemaweb.com/es6-promise>
