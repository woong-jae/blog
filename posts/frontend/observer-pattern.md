---
title: '[JS] 옵저버 패턴 (Observer Pattern)'
date: '2022-03-22 21:29'
---

## 옵저버 패턴?

옵저버 패턴은 객체의 상태 변화를 관찰하는 옵저버들의 목록을 객체에 등록해서
상태 변화가 발생할 때마다 메서드 등을 통해 객체가 직접 목록의 각 옵저버에게 통지하도록 하는 디자인 패턴이다.
즉, **어떤 객체의 상태가 변하면 연관된 객체들에게 알림을 보내는 디자인 패턴**이다.

이 패턴의 핵심은 상태를 가진 객체(subject)인 '발행기관(publisher)'에 이 객체를 관찰하는 옵저버들인 '구독자(subscriber)'들을 등록시키는 것이다.
그리고 각각의 구독자들은 발행기관이 발생시키는 이벤트를 받아 처리한다. 이 때문에 **'발행/구독 모델'**이라고도 한다.

옵저버 패턴은 MVC 패러다임과 자주 결합되어 사용된다. 옵저버 패턴을 사용함으로써 MVC에서 **모델과 뷰 사이를 느슨하게 연결**할 수 있다.

React의 'Redux'나 Vue의 'Vuex' 같은 **중앙 집중식 저장소**가 옵저버 패턴에 기반을 둔다.

## 구현

<img
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Observer.svg/1708px-Observer.svg.png"
    alt="observer-pattern"
    width="500px"
/>

위키에 있는 UML 다이어그램을 참고해서 **상태를 가지는 발행기관**을 구현해보자.

### 발행기관(Publisher)

발행기관은 구독자들을 등록(register), 제거(unregister)하는 기능, 이벤트가 발생했을 때 구독자들에게 알려주는 기능을 가진다.

또한 `state`에 접근할 수 있도록 `Proxy`를 통해 get 트랩을 설정했다.

```js
class Publisher {
  constructor(state) {
    this.state = state;
    this.subscriber = new Set();
    return new Proxy(this, {
      get(target, prop) {
        if (prop in target.state) return target.state[prop];
        else return target[prop];
      },
    });
  }
  registerSubscriber(subscriber) {
    this.subscriber.add(subscriber);
  }
  unregisterSubscriber(subscriber) {
    this.subscriber.delete(subscriber);
  }
  notifySubscribers() {
    this.subscriber.forEach((subscriber) => subscriber.notify());
  }
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
  }
}
```

### 구독자(Subscriber)

구독자는 발행기관에서 변화가 생겼을 때 하는 일인 `notify`를 정의해야 한다.

```js
class Subscriber {
  constructor(notify) {
    this.notify = notify;
  }
}
```

### 사용

정의한 발행기관과 구독자를 사용보자.

```js
let state = new Publisher({ a: 1, b: 2 });

let adder = new Subscriber(() => console.log(`a + b = ${state.a + state.b}`));
let multiplier = new Subscriber(() =>
  console.log(`a * b = ${state.a * state.b}`),
);

state.registerSubscriber(adder);
state.registerSubscriber(multiplier);

state.notifySubscribers();
// -> a + b = 3
// -> a * b = 2
state.setState({ a: 3 });
// -> a + b = 5
// -> a * b = 6
state.unregisterSubscriber(multiplier);

state.setState({ b: 7 });
// -> a + b = 10
```

발행기관에 구독자를 구독시킨 후 상태를 바꿨을 때, 각 구독자는 변화한 상태에 대해 처리를 해주는 것을 볼 수 있다.

위에 구현한 발행기관과 구독자를 그대로 사용하기는 문제가 있다.

발행기관의 `state`를 직접 접근해 변경할 경우 구독자들이 상태가 변경됐다는 것을 알 수 없다.
이를 방지하기 위해 `state`를 private 필드로 두거나 클로저를 사용해 숨겨두어야 한다.
`subscriber`도 마찬가지로 숨기는 것이 좋겠다.

또 다른 문제점도 존재한다.
만약 10명의 구독자가 100개의 발행기관에 구독을 해야한다면, 구독 관련 코드가 무려 10 \* 100 = 1000개가 필요하다.

## 개선

문제점을 개선하기 위해 앞서 작성한 코드를 `observable`과 `observe`의 관계로 단순화 해보자.

`observable`은 `observe`에서 사용되고, `observable`에 변화가 생기면 observe에 등록된 함수가 실행되는 것이다.

```js
const state = observable({ a: 1, b: 3 });
observe(() => console.log(`a + b = ${state.a + state.b}`));
observe(() => console.log(`a * b = ${state.a * state.b}`));
state.a = 3;
// -> a + b = 5
// -> a * b = 6
```

### 구현

```js
let requestingObserver = null;

const observable = (object) => {
  const observersPerProps = new Map();
  return new Proxy(object, {
    get(target, prop) {
      if (!observersPerProps.has(prop)) observersPerProps.set(prop, new Set());
      if (requestingObserver)
        observersPerProps.get(prop).add(requestingObserver);
      return target[prop];
    },
    set(target, prop, val) {
      if (target[prop] === val) return true;
      if (JSON.stringify(target[prop]) === JSON.stringify(val)) return true;
      target[prop] = val;
      observersPerProps.get(prop).forEach((notify) => notify());
      return true;
    },
  });
};

const observe = (notify) => {
  requestingObserver = notify;
  notify();
  requestingObserver = null;
};

const state = observable({ a: 3, b: 3 });

observe(() => console.log(`a + b = ${state.a + state.b}`));
// -> a + b = 6
observe(() => console.log(`a * b = ${state.a * state.b}`));
// -> a * b = 9
state.a = 5;
// -> a + b = 8
// -> a * b = 15
state.a = 5;
// 아무것도 출력되지 않는다.
```

이전과 다른 점은 옵저버가 등록되는 방식이다.
`observe`를 통해 `notify`를 등록하면 우선 `requestingObserver`가 `notify`를 가리키게 한다.
그 다음 `notify`를 실행해 `observable`의 get 트랩에서 `requestingObserver`를 통해 `notify`를 옵저버에 추가하게 된다.
`requestingObserver`를 '`observable`에 `notify`를 등록하기 위한 중계소'라고 생각하면 된다.

옵저버를 추가할 때에는 `notify`에서 **사용되는 프로퍼티에만 알람이 갈 수 있도록 프로퍼티 별로 옵저버를 등록**해준다.

`state`가 변경되었을 때는 **변경된 프로퍼티에 등록된 옵저버들에게 변경을 알린다**.
만약 변경된 값이 이전 값과 같다면 알림이 가지 않게 방어 로직을 작성해줬다.

## 참조

- [Vanilla Javascript로 상태관리 시스템 만들기](https://junilhwang.github.io/TIL/Javascript/Design/Vanilla-JS-Store/#_2-observer-pattern%E1%84%8B%E1%85%A6-%E1%84%83%E1%85%A2%E1%84%92%E1%85%A2-%E1%84%8B%E1%85%B5%E1%84%92%E1%85%A2%E1%84%92%E1%85%A1%E1%84%80%E1%85%B5)
- [Wiki-옵저버 패턴](https://ko.wikipedia.org/wiki/%EC%98%B5%EC%84%9C%EB%B2%84_%ED%8C%A8%ED%84%B4)
- <https://lihano.tistory.com/19>
