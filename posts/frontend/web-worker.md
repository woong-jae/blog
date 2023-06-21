---
title: "Web Worker"
date: "2022-10-25 21:57"
---

"어떤 기능이 무조건 2초 뒤에 실행되게 보장해주세요!"라는 요구사항을 받았다고 해보자. `setTimeout`으로 2초 뒤에 그 기능을 실행하도록 하면 될까? 자바스크립트는 싱글 스레드로 동작하기 때문에, call stack에서 3초 이상 걸리는 작업이 있는 경우 그 기능은 3초를 넘겨 동작하게 될 것이다.

```js
const start = new Date();
const timeout = 2000;
setTimeout(() => {
  console.log(`from timeout ${new Date() - start}`);
}, timeout);

while (new Date() - start < 3000);
```

이때 웹 워커를 사용할 수 있다. 웹 워커로 새로운 스레드를 생성해서 스크립트를 실행할 수 있다. Worker는 메인 스레드의 [`window`](https://developer.mozilla.org/ko/docs/Web/API/Window)와는 다른 글로벌 컨텍스트에서 실행되기 때문에 DOM 조작이나, console 객체의 사용 등이 불가능하다. 각 worker는 별도의 힙, 스택, 큐, 이벤트 루프를 할당받는다.

메인 스레드와 web worker는 메시지 방식으로 서로 통신할 수 있다. 양쪽 모두 `postMessage` 메서드를 사용해 메시지를 전달하고, `onmessage` 이벤트 핸들러로 메시지를 받을 수 있다. 전송되는 데이터는 복사돼 전달된다. 때문에 같은 데이터에 대한 경합 조건이 없어 동기화 문제는 발생하지 않지만, 큰 데이터를 주고 받는다면 복사본을 생성하는데 비용이 많이 든다.

## 종류

Web worker는 두 가지 타입이 있다.

- Dedicated worker(전용 워커): 생성한 워커가 하나의 thread를 가진다.
- Shared worker(공유 워커): 여래 개의 워커가 하나의 background process를 공유한다. 공유 워커는 `port`객체를 통해 통신을 한다.

## 사용해보기

맨 위의 예시에서 worker를 사용해보자.

```js
const start = new Date();
const timeout = 2000;

setTimeout(() => {
  console.log(`from timeout ${new Date() - start}`);
}, timeout);

const worker = new Worker("worker.js");
worker.postMessage({ start, timeout });
worker.onmessage = (msg) => {
  console.log(`from worker ${msg.data}`);
  worker.terminate();
};

while (new Date() - start < 3000);
```

```js
// worker.js
self.onmessage = (msg) => {
  const start = new Date();
  setTimeout(() => {
    self.postMessage(new Date() - start);
  }, msg.data.timeout);
};
```

결과로 `from timeout 3002`, `from worker 2002`가 순서대로 출력됐다.

한가지 주의해야 할 점이 있는데, worker의 생성은 비동기적이라는 것이다. Worker를 생성하기 위해 스크립트를 읽어야하기 때문이다. Worker를 생성하는 동안 전달된 메시지는 port message queue에 저장된다.

이런 사용예시 외에도 아래와 같은 작업을 할 때 worker의 사용을 고려할 수 있다.

- 매우 많은 문자열의 Encoding/Decoding, 복잡한 수학 계산(소수prime numbers, 암호화 등)
- 매우 큰 배열의 정렬
- 네트워크를 통한 데이터 처리
- 이미지 처리• 비디오나 오디오 데이터 처리
- UI 스레드를 방해하지 않고 지속적으로 수행해야 하는 작업
- 기타 백그라운드에서 오랜 시간 작업해야 하는 경우

## 참조

- [MDN - 웹 워커 사용하기](https://developer.mozilla.org/ko/docs/Web/API/Web_Workers_API/Using_web_worker)
- https://tech.kakao.com/2021/09/02/web-worker/
- https://darrengwon.tistory.com/1171
- [stackoverflow - The JavaScript Event Loop and Web Workers](https://stackoverflow.com/questions/41125303/the-javascript-event-loop-and-web-workers)
- [stackoverflow - are messages sent via worker.postMessage() queued?](https://stackoverflow.com/questions/34409254/are-messages-sent-via-worker-postmessage-queued)
