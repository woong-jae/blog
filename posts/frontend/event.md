---
title: '[JS] 이벤트'
date: '2022-02-18'
---

이벤트(event)는 무언가 일어났다는 신호다. 브라우저에서의 이벤트는, 예를 들어, 사용자가 버튼을 클릭했을 때나 웹페이지가 로드 되었을 때 같은 것이다.
모든 DOM 노드는 이런 신호를 만들어 낸다.

이벤트는 일반적인 제어 흐름과는 다른 접근 방식이 필요하다. 이벤트가 발생하면 누군가 이를 감지해서 처리해주어야 한다.
브라우저는 이벤트를 감지할 수 있으며, 이벤트 발생 시 통지해준다. 이를 통해 사용자와 웹페이지는 상호작용 할 수 있게 된다.

## 이벤트 루프(Event Loop)

이벤트를 다루기 앞서, 브라우저의 환경에 대해 알아보고 넘어가자.

Javascript는 브라우저에서 싱글 스레드로 동작한다. 싱글 스레드라는 소리는 하나의 call stack을 가진다는 말과 같고, 한 번에 하나의 일만 가능하다는 말과 같다.

> Javascript는 브라우저에서 동작하는 경량 프로그래밍 언어를 목적으로 만들어졌기 때문에 싱글 스레드로 만들어졌다. 멀티 스레드 모델은 동시성 문제에 신경을 많이 써야한다.

<img src="https://poiemaweb.com/img/event-loop.png" alt="event-loop" />

가장 대표적인 자바스크립트 엔진인 구글의 V8을 비롯한 대부분의 자바스크립트 엔진은 크게 2개의 영역으로 나뉜다.

- **Call stack**: 작업이 요청되면 요청된 작업은 순차적으로 콜 스택에 쌓이고, 순차적으로 실행된다. 자바스크립트는 단 하나의 콜 스택을 사용한다.

- **Heap**: 동적으로 생성된 객체 인스턴스가 할당되는 영역이다.

콜 스택은 요청된 작업을 순차적으로 처리할 뿐이기 때문에, 동시성을 지원하기 위해 **비동기 요청의 처리는 자바스크립트 엔진을 구동하는 환경(브라우저, Node.js 등)이 담당**하게 된다.

- _Event queue(task queue)_: 비동기 처리 함수의 콜백, 비동기식 이벤트 핸들러, Timer(`setTimeout`, `setInterval`) 함수의 콜백이 보관되는 영역이다.
  이벤트 루프에 의해 특정 시점(콜 스택이 비었을 때)에 순차적으로 콜 스택으로 이동되어 실행된다.

- **Event loop**: 태스크가 들어오길 기다렸다가 태스크가 들어오면 이를 처리하고, 처리할 태스크가 없는 경우엔 잠드는, 끊임없이 돌아가는 자바스크립트 내 루프다.
  콜 스택 내에 현재 실행중인 태스크가 있는지 그리고 이벤트 큐에 태스크가 있는지 반복하여 확인한다.
  1. 처리해야 할 태스크가 있는 경우.
     - 먼저 들어온 태스크부터 순차적으로 처리한다.
  2. 처리해야 할 태스크가 없는 경우.
     - 잠들어 있다가 새로운 태스크가 추가되면 다시 1로 돌아간다.

### Event queue

Event는 크게 두가지로 나눌 수 있다. *"태스크(task)"와 "마이크로태스크(microtask)*"다.

`setTimeout`, `setInterval`, `setImmediate`, `requestAnimationFrame`, I/O 등 일반적인 이벤트 처리 작업은 태스크 큐에 들어간다. 태스크 큐는 2개 이상 있을 수 있다. 마이크로태스크(PromiseJobs 큐)에는 프로미스의 콜백함수가 들어간다. 둘 말고 rAF 같은 브라우저 렌더링 작업을 받는 animation frames라는 큐도 존재한다.

큐의 우선순위는 microtask queue > animation frames > task queue 순서다.

<img
  src="https://uploads.disquscdn.com/images/9466d8aa53fc5b3e63a92858a94bb429df02bbd20012b738f0461343beaa6f90.gif?w=800&h=416"
  alt="queue"
  width="600px"
/>

```js
setTimeout(() => {
  console.log('finished');
}, 5000);

console.log('finished...?');
```

위 스크립트의 실행과정을 따라가보자.

1. Call stack에 setTimeout이 push된다.
2. Web API에 timer와 콜백이 등록된다.
3. setTimeout이 call stack에서 pop된다.
4. console.log가 call stack에 push, 실행되고 pop된다.
5. 등록된 타이머가 끝나면 Web API의 콜백은 task queue에 push된다.
6. Event loop가 call stack에 아무것도 없다면 task queue의 콜백 하나를 pop해 callstack으로 옮겨준다.
7. 콜백이 실행된다.

하나 주의해야할 점이 있다. Call stack은 javascript의 엔진에서 다루는 부분이다. 반면, event loop과 task queue는 javascript 엔진을 구동하는 환경(브라우저, node.js)에서 담당한다. Javascript 엔진은 그저 스크립트를 실행할 뿐이다.

## 이벤트의 종류

#### 마우스 이벤트

- `click`: 요소 위에서 마우스 왼쪽 버튼을 눌렀을 때 발생한다.
- `contextmenu`: 요소 위에서 마우스 오른쪽 버튼을 눌렀을 때 발생한다.
- `mouseover`/`mouseout`: 마우스 커서를 요소 위/밖으로 움직였을 때 발생한다.
- `mousedown`/`mouseup`: 요소 위에서 마우스 왼쪽 버튼을 누르고 있을 때/땔 때 발생한다.
- `mousemove`: 마우스를 움직일 때 발생한다.

#### 폼 요소 이밴트

- `submit`: 사용자가 `<form>`을 제출할 때 발생한다.
- `focus`: 사용자가 `<input>`과 같은 요소에 포커스 할 때 발생한다.

#### 키보드 이벤트

- `keydown`/`keyup`: 사용자가 키보드 버튼을 누르거나 뗄 때 발생한다.

#### 문서 이벤트

- `DOMContentLoaded`: HTML이 전부 로드 및 처리되어 DOM 생성이 완료되었을 때 발생한다.
  ####CSS 이벤트
- `transitioned`: CSS 애니메이션이 종료되었을 때 발생한다.

## 이벤트 핸들러

이벤트에 반응하려면 이벤트가 발생했을 때 실행되는 함수인 핸들러(handler)를 할당해야 한다. 핸들러는 여러 가지 방법으로 할당할 수 있다.

### HTML 속성

HTML 안의 `on<event>` 속성에 핸들러를 할당할 수 있다.

```html
<input value="클릭해 주세요." onclick="alert('클릭!')" type="button" />
```

버튼을 클릭하면 `onclick` 안의 코드가 실행된다.

HTML과 자바스크립트의 기능적 관심사를 분리하는 것이 좋기 때문에 이 방식을 사용하는 것은 좋지 않다.

### DOM 프로퍼티

DOM 프로퍼티 `on<event>`를 사용해서 핸들러를 할당할 수 있다.

```html
<input id="elem" type="button" value="클릭해 주세요." />
<script>
  document.getElementById(elem).onclick = function () {
    alert('감사합니다.');
  };
</script>
```

핸들러를 HTML 속성을 사용해 할당하면, **브라우저는 속성값을 이용해 새로운 함수를 만들어 DOM 프로퍼티에 할당**한다.

따라서, DOM 프로퍼티를 사용해 만든 핸들러는 HTML 속성을 사용해 만든 방법과 동일하게 작동한다.

`onclick` 프로퍼티는 단 하나밖에 없기 때문에, 핸들러를 하나 더 추가하면 기존의 핸들러가 덮어씌워진다.

> `setAttribute`로 핸들러를 할당하면 안된다. 속성은 항상 문자열이기 때문에, 함수가 문자열이 되어버리기 때문이다.

#### this로 요소에 접근하기

핸들러 내부에 쓰인 `this`의 값은 핸들러가 할당된 요소다.

아래 예시의 `this.innerHTML`에서 `this`는 `button`이므로 버튼을 클릭하면 버튼 안의 콘텐츠가 출력된다.

```html
<button onclick="alert(this.innerHTML)">클릭해 주세요.</button>
```

### addEventListener

'HTML 속성'과 'DOM 프로퍼티'를 이용한 이벤트 핸들러 할당 방식은 **하나의 이벤트에 핸들러 여러개를 할당할 수 없다**는 문제를 가진다.

문제를 해결하기 위해 `addEventListener`와 `removeEventListener`라는 특별한 메서드가 등장했다.

```js
elem.addEventListener(event, handler, [options]);
```

- `options`
  - `once`: `true`이면 이벤트가 트리거 될 때 리스너가 자동으로 삭제된다.
  - `capture`: 어느 단계에서 이벤트를 다뤄야 하는지를 알려주는 프로퍼티다(캡처링과 버블링 지원).
  - `passive`: `true`이면 리스너에서 지정한 함수가 `preventDefault()`를 호출하지 않는다.

`addEventListener`를 여러 번 호출하면 핸들러를 여러 개 붙일 수 있다. 이벤트 핸들러를 여러개 설정했다면, 핸들러들은 설정한 순서대로 동작한다.

`addEventListener`를 사용하면 함수뿐만 아니라 객체를 이벤트 핸들러로 할당할 수 있다. 이벤트가 발생하면 객체에 구현한 `handleEvent` 메서드가 호출된다.

```html
<button id="elem">클릭해 주세요.</button>

<script>
  let obj = {
    handleEvent(event) {
      alert(
        event.type + ' 이벤트가 ' + event.currentTarget + '에서 발생했습니다.',
      );
    },
  };

  elem.addEventListener('click', obj);
</script>
```

핸들러 삭제는 `removeEventListener`로 한다.

```js
elem.removeEventListener(event, handler, [options]);
```

## 버블링과 캡처링

계층적 구조에 포함되어 있는 HTML 요소에서 이벤트가 발생하면 연쇄적인 반응이 발생, 즉, **이벤트가 전파**된다.
이벤트가 전파되는 방향에 따라 **_버블링(event bubbling)_**과 **_캡처링(event capturing)_**으로 구분할 수 있다.

### 버블링

한 요소에 이벤트가 발생하면, 이 요소에 할당된 핸들러가 동작하고, 이어서 부모 요소의 핸들러가 동작한다.
**가장 최상단의 조상 요소를 만날 때까지 이 과정이 반복되면서 요소 각각에 할당된 핸들러가 동작**한다.

<img src="https://ko.javascript.info/article/bubbling-and-capturing/event-order-bubbling.svg" alt="event-bubbling" />

몇몇 이벤트(`focus`)를 제외하곤 대부분의 이벤트는 버블링 된다.

#### 버블링 중단하기

핸들러에게 이벤트를 완전히 처리하고 난 후 버블링을 중단하도록 명령할 수도 있다.

이벤트 객체의 메서드인 `event.stopPropagation()`을 사용하면 된다.

```html
<body onclick="alert(`버블링은 여기까지 도달하지 못합니다.`)">
  <button onclick="event.stopPropagation()">클릭해 주세요.</button>
</body>
```

버블링을 멈추고, 요소에 할당된 다른 핸들러의 동작도 막으려면 `event.stopImmediatePropagation()`을 사용하면 된다.

### 캡처링

표준 DOM 이벤트에서 정의한 이벤트 흐름엔 3가지 단계가 있다.

1. **캡처링 단계** - 이벤트가 하위 요소로 전파

2. **타깃 단계** - 이벤트가 실제 타겟 요소에 전달

3. **버블링 단계** - 이벤트가 상위 요소로 전파되는 단계

<img src="https://ko.javascript.info/article/bubbling-and-capturing/eventflow.svg" alt="event-capturing" />

`on<event>` 프로퍼티나 HTML 속성, `addEventListener`를 이용해 할당된 핸들러는 캡처링에 대해 전혀 알 수 없다.
핸들러들은 타깃 단계와 버블링 단계에서만 동작하기 때문이다.

캡처링 단계에서 이벤트를 잡아내려면 `addEventListener`의 `capture` 옵션을 `true`로 설정해야 한다.

`capture` 옵션이 `true`면 캡처링 단계에서 동작하고, `false`(default)이면 버블링 단계에서 동작한다.

## 이벤트 객체

이벤트가 발생하면 브라우저는 **_이벤트 객체(event object)_**라는 것을 만든다. 여기에 이벤트에 관한 상세한 정보를 넣은 다음, 핸들러에 인수 형태로 전달한다.

```html
<input type="button" value="클릭해 주세요." id="elem" />

<script>
  elem.onclick = function (event) {
    // 이벤트 타입과 요소, 클릭 이벤트가 발생한 좌표를 보여줌
    alert(
      event.type + ' 이벤트가 ' + event.currentTarget + '에서 발생했습니다.',
    );
    alert(
      '이벤트가 발생한 곳의 좌표는 ' +
        event.clientX +
        ':' +
        event.clientY +
        '입니다.',
    );
  };
</script>
```

`event` 객체에서 지원하는 프로퍼티 중 일부는 다음과 같다.

- `event.type`: 이벤트 타입
- `event.target`: 실제로 이벤트를 발생시킨 요소를 가리킨다.
- `event.currentTarget`: 이벤트에 바인딩된 DOM 요소를 가리킨다. 쉽게 말하면 이벤트를 처리하는 요소다.
- `event.clientX / event.clientY`: 포인터 관련 이벤트에서 커서의 상대 좌표.

## 이벤트 위임(Event Delegation)

```html
<ul id="post-list">
  <li id="post-1">Item 1</li>
  <li id="post-2">Item 2</li>
  <li id="post-3">Item 3</li>
  <li id="post-4">Item 4</li>
  <li id="post-5">Item 5</li>
  <li id="post-6">Item 6</li>
</ul>
```

모든 `li` 요소가 클릭 이벤트에 반응하는 처리를 구현하고 싶은 경우, `li` 요소에 이벤트 핸들러를 바인딩하면 총 6개의 이벤트 핸들러를 바인딩해야 한다.
만약, `li` 요소가 100개라면 100개의 이벤트 핸들러를, 1000개면 1000개의 핸들러를 바인딩 해야한다.
더 나아가 동적으로 `li`가 추가되는 경우, 추가될 때마다 이벤트 핸들러를 바인딩 해야한다.
이는 실행 속도 저하의 원인이 될 뿐만 아니라 코드가 엄청 길어지고 작성도 불편하다.

이때 **_'이벤트 위임'_**을 사용하면 **요소마다 핸들러를 할당하지 않고, 요소의 공통 조상에 이벤트 핸들러를 단 하나만 할당해 여러 요소를 한꺼번에 다룰 수 있다**.

이벤트 위임을 사용하면 많은 핸들러를 할당하지 않아도 되기 때문에 초기화가 단순해지고 메모리를 절약할 수 있고, DOM 수정이 쉬워진다.

```html
<script>
  document.getElementById('post-list').addEventListener('click', (event) => {
    alert(event.target.nodeName + ' was clicked!');
  });
</script>
```

## 브라우저 기본 동작

상당수의 이벤트는 발생 즉시 브라우저에 의해 특정 동작을 자동으로 수행한다.

링크를 클릭하면 해당 URL로 이동하거나, 마우스 버튼을 누른 채로 글자 위에서 커서를 움직이면 글자가 선택되는 것처럼 말이다.

이런 브라우저의 기본 동작을 취소하고 싶을 때 사용할 수 있는 방법은 두 가지가 있다.

- `event` 객체의 `event.preventDefault()` 메서드를 사용한다.
- 핸들러가 `addEventListener`가 아닌 `on<event>`를 사용해 할당되었다면 `false`를 반환하게 해 기본 동작을 막을 수 있다.

> `on<event>`를 사용해 할당한 핸들러에서 `false`를 반환하는 것은 예외 상황이다. 이 외의 값들은 리턴되어도 무시된다.
> `false`를 반환하는 것은 예외 상황이기 때문에 기본 동작과 이벤트의 흐름(버블링, 캡처링)이 중단된다.

```html
<a href="/" onclick="return false">이곳</a>
이나
<a href="/" onclick="event.preventDefault()">이곳을</a> 클릭해주세요.
```

기본동작을 막은 경우, `event.defaultPrevented` 값은 `true`가 된다.

## 참조

- ko.javascript.info
- <https://poiemaweb.com/js-event>
