---
title: '[JS] 네트워크 요청'
date: '2022-02-22'
---

## AJAX

AJAX(Asynchronous Javascript And XML)는 자바스크립트를 이용해서 **비동기적으로 서버와 브라우저가 데이터를 교환**할 수 있는 접근법을 의미한다.
AJAX 그 자체가 특정 기술을 가리키는 것이 아니다.
AJAX를 통해 XML 뿐만 아니라 JSON, HTML, 일반 텍스트 형식 등을 포함한 다양한 포맷을 주고 받을 수 있다.

AJAX를 사용하면 **페이지 전체를 새로고침 하지 않고서도 페이지의 일부분만을 업데이트** 할 수 있게 된다.
AJAX를 통해 아래의 작업이 가능해진다.

- 페이지 새로고침 없이 서버에 요청
- 서버로부터 데이터를 받고 작업 수행

<img src="https://poiemaweb.com/img/ajax-webpage-lifecycle.png" alt="ajax-lifecycle" width="400px" />

AJAX는 `XMLHttpRequest`나 'Fetch API'로 구현된다.

## XMLHttpRequest

`XMLHttpRequest`는 HTTP 요청을 할 수 있게 해주는 브라우저 내장 객체다.

현재는 더 현대적인 메서드인 `fetch`가 있어서 `XMLHttpRequest`은 어떻게 보면 구식이라 할 수 있다.
`XMLHttpRequest`가 사용된다면, 아래와 같은 이유 때문에 사용될 수 있다.

- 현재 사용하는 스크립트를 `XMLHttpRequest`로 지원해야 할 때
- 오래된 브라우저를 지원해야 할 때
- `fetch`가 할 수 없는 것이 필요할 때(업로드 진행 상황 추적)

위 같은 이유가 아니라면 `fetch`를 사용하는 것이 좋다.

### 요청하기

`XMLHttpRequest`로 요청을 보내기 위해서는 아래와 같은 단계가 필요하다.

1. **`XMLHttpRequest` 인스턴스 생성**

```js
let xhr = new XMLHttpRequest();
```

2. **초기화하기**

```js
xhr.open(method, URL, [async, user, password]);
```

- `method`: HTTP method
- `URL`: 요청을 보낼 URL
- `async`: `false`로 설정할 시 요청이 동기적으로 작동한다(사용하지 않는다).
- `user`, `password`: HTTP auth에서 필요할 때 사용한다.

> `open`은 요청을 구성할 뿐, 네트워트 동작을 시작하지 않는다.

3. **요청하기**

```js
xhr.send([body]);
```

4. `xhr`로 보낸 요청에 대한 응답은 이벤트로 다뤄진다. 아래는 주로 사용되는 이벤트다.

- `load`: 요청이 성공적으로 끝나고 응답이 완료되었을 때 발생한다.
- `error`: 요청에 문제가 생겼을 때 발생한다.
- `progress`: 요청이 다운로드 되는 동안 주기적으로 발생한다.

```js
xhr.onload = function () {
  console.log(`Loaded: ${xhr.status} ${xhr.response}`);
};

xhr.onerror = function () {
  console.log(`Network Error`);
};

xhr.onprogress = function (event) {
  // triggers periodically
  // event.loaded - how many bytes downloaded
  // event.lengthComputable = true if the server sent Content-Length header
  // event.total - total number of bytes (if lengthComputable)
  console.log(`Received ${event.loaded} of ${event.total}`);
};
```

### Ready states

`XMLHttpRequest`는 진행상황에 따라 상태(state)가 변한다. 현재 상태는 `readyState` 프로퍼티로 접근할 수 있다.

```js
UNSENT = 0; // initial state
OPENED = 1; // open called
HEADERS_RECEIVED = 2; // response headers received
LOADING = 3; // response is loading (a data packed is received)
DONE = 4; // request complete
```

`XMLHttpRequest`의 상태는 '1 -> 2 -> 3 -> 4 -> 3 -> ... -> 3 -> 4' 의 형태로 변화한다.
상태 3번은 새로운 데이터 패킷을 전달받을 때마다 반복된다.

상태 변화는 `onreadystatechange`로 추적할 수 있다. 상태가 변했을 때 발생하는 `readystatechange` 이벤트를 잡는다.

```js
xhr.onreadystatechange = function () {
  if (xhr.readyState == 3) {
    // loading
  }
  if (xhr.readyState == 4) {
    // request finished
  }
};
```

## Fetch API

Fetch API는 `XMLHttpRequest`보다 더 강력하고 유연하다.

**이벤트 기반인 `XMLHttpRequest`와는 달리, Fetch API는 프라미스 기반**으로 구성되어 있어 사용하기 훨씬 편리하다.

### fetch

```js
let promise = fetch(url, [options]);
```

`options`에 아무것도 넘기지 않으면 요청은 GET 메서드로 진행된다. 옵션에는 `method`, `body`(보내려는 데이터 본문), `headers` 등을 추가할 수 있다.

`fetch()`를 호출하면 브라우저는 네트워크 요청을 보내고 프라미스가 반환된다.

응답은 대개 두 단계를 거쳐 진행된다.

1. 서버에서 **응답 헤더를 받자마자, `fetch` 호출 시 받은 프라미스가 내장 클래스 `Response`와 함께 'resolve'**된다.

아직 본문이 도착하기 전이지만, 헤더를 통해 요청이 성공적으로 처리되었는지 아닌지 확인할 수 있다.

```js
let response = await fetch(url);

if (response.ok) {
  // HTTP 상태 코드가 200~299일 경우
  // 응답 몬문을 받는다(관련 메서드는 아래에서 설명).
  let json = await response.json();
} else {
  alert('HTTP-Error: ' + response.status);
}
```

2. 추가 메서드를 호출해 응답 본문을 받는다.
   `Response` 인스턴스의 다양한 프라미스 기반 메서드를 통해 다양한 형태의 응답 본문을 처리할 수 있다.

- `text()`: 응답을 읽고 텍스트를 반환
- `json()`: 응답을 JSON 형태로 파싱
- `formData()`: 응담을 `FormData` 객체 형태로 반환
- `blob()`: 응답을 `Blob`(타입이 있는 바이너리 데이터) 형태로 반환
- `arrayBuffer()`: 응답을 `ArrayBuffer`(로우 레벨 바이너리 데이터) 형태로 반환
  이 외에도 `ReadableStream` 객체인 `body` 프로퍼티를 사용해 응답 본문을 청크 단위로 읽을 수 있다.

```js
let url =
  'https://api.github.com/repos/javascript-tutorial/ko.javascript.info/commits';
let response = await fetch(url);

let commits = await response.json(); // 응답 본문을 읽고 JSON 형태로 파싱함

console.log(commits[0].author.login);
```

## 참조

- ko.javasciprt.info
- <https://poiemaweb.com/js-ajax>
- <https://developer.mozilla.org/ko/docs/Web/Guide/AJAX/Getting_Started>
- <https://wonit.tistory.com/449>
