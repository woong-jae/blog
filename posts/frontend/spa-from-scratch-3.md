---
title: 'Vanilla Javascript로 구현하는 SPA - 상태관리 시스템'
date: '2022-03-27 17:05'
---

## 필요성

이전에 만들었던 컴포넌트를 사용하다보면 한가지 문제점이 발생한다. 자식 컴포넌트들끼리 상태 공유가 필요하면, 그 상태가 공통 부모까지 끌어올려져야 한다. 이 문제를 **props drilling** 문제라고 한다. React에서도 똑같은 문제가 발생한다.

문제에 대한 해결법 중 하나가 중앙 집중식 저장소를 사용하는 것이다. 상태를 컴포넌트 외부에 둠으로써 props drilling 현상이 발생하지 않도록 할 수 있다.

## 옵저버 패턴

React의 'Redux'나 Vue의 'Vuex' 같은 중앙 집중식 저장소는 [옵저버 패턴](https://woong-jae.com/javascript/220322-observer-pattern)에 기반을 둔다.

'Publisher-Subscriber' 모델이라고도 불리는 이 패턴은, 어떤 객체의 상태가 변하면 연관된 객체들에게 알림을 보내는 디자인 패턴이다.

이 패턴의 핵심은 상태를 가진 객체인 'Publisher'에, 이 객체를 관찰하는 옵저버들인 'Subscriber'들을 등록시키는 것이다. 구독자들은 발행기관이 발생시키는 이벤트를 받아 처리한다.

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Observer.svg/1708px-Observer.svg.png" alt="observer-pattern" />

우리의 문제에서 publisher는 저장소, subscriber는 컴포넌트가 될 것이다. 그리고 발행기관이 발생시키는 이벤트는 상태가 변경됐을 때이고, 컴포넌트들은 변경된 상태에 따라 리렌더링을 하면 된다.

## 구현

### Observable model

Publisher-Subscriber 모델을 간략화한 observable 모델을 사용할 것이다. 개념은 똑같다. Observe로 이벤트가 발생했을 때 실행할 행동을 등록하고, observable은 이벤트를 일으키는 객체가 된다.

```js
// observable.js
let requestingListener = null;

export const observe = (cb) => {
  requestingListener = cb;
  cb();
  requestingListener = null;
};

export const observable = (obj) => {
  const propsToListener = new Map();

  return new Proxy(obj, {
    get(target, prop) {
      // observe로 호출한 함수에서 사용한 prop마다 리스너를 추가한다.
      if (!propsToListener.has(prop)) propsToListener.set(prop, new Set());
      if (requestingListener) propsToListener.get(prop).add(requestingListener);
      return target[prop];
    },
    set(target, prop, val) {
      if (target[prop] === val) return true;
      target[prop] = val;
      propsToListener.get(prop).forEach((cb) => cb());
      return true;
    },
  });
};
```

실행흐름

1. `observe`를 호출한다.
2. `requestingListener`가 `cb`(콜백)을 참조하고, 콜백이 한 번 실행된다.
3. 콜백 안에서 `observable`로 만들어진 객체의 프로퍼티가 참조되면, `Proxy`의 `get` trap을 통해 프로퍼티에 대한 리스너로 `requestingListener(= cb)`이 등록된다.
4. 콜백의 실행이 끝나고 `requestingListener`를 `null`로 바꿔준다.
5. `observable`로 만들어진 객체의 프로퍼티가 변경되면, `set` trap으로 이를 감지할 수 있다. 새로운 값이 기존 프로퍼티의 값과 다르다면, 프로퍼티를 새로운 값으로 변경하고 해당 프로퍼티에 등록된 모든 리스터를 호출(알림)한다.

이것을 저장소에 적용하면 된다. 저장소의 상태가 변경됐을 때 어떻게 컴포넌트에게 알릴 수 있을까?

저장소의 state를 `observable`로 생성하고, 컴포넌트의 렌더링 작업을 `observe`로 등록하면 state가 변경됐을 때 리렌더링이 발생할 것이다.

```js
export default class Component {
  constructor(target, props) {
    this.target = target;
    this.props = props;
    this.setup();
    observe(() => {
      this.render();
      this.mounted();
    });
  }
  // ...
}
```

### 중앙 집중식 저장소

저장소는 `state`와 `state`를 변경하는 행위들인 `actions`를 받도록 구현할 것이다. `actions`를 따로 주는 이유는, `state`를 직접 변경할 수 없도록 하기 위함이다. 이 방식을 사용하면 데이터 변화가 훨씬 예측하기 쉬워진다.

저장소로 `state` 정보를 접근할 수 있고, `commit`을 통해 정의한 행위를 실행해 상태를 변경할 수 있다.

```js
class Store {
  #state;
  #actions;
  state = {};
  constructor({ state, actions }) {
    this.#state = observable(state);
    this.#actions = actions;
    Object.keys(state).forEach((key) => {
      Object.defineProperty(this.state, key, { get: () => this.#state[key] });
    });
  }
  commit(action, payload) {
    this.#actions[action](this.#state, payload);
  }
}
```

## 사용예시

'컴포넌트 만들기'에서 사용한 예시와 동일하지만, 컴포넌트의 `state` 대신 `Store`를 사용한 예시다.

```js
const store = new Store({
  state: {
    typed: '',
  },
  actions: {
    CHANGE_TYPED(state, payload) {
      state.typed = payload;
    },
  },
});

class InputMirror extends Component {
  template() {
    return `
			<div>
				<div class="input-container"></div>
				<div class="mirror-container"></div>
			</div>
		`;
  }
  mounted() {
    new Input(document.querySelector('.input-container'));
    new Mirror(document.querySelector('.mirror-container'));
  }
}

class Input extends Component {
  template() {
    return `
			<div>
				<input class="input" value="${store.state.typed}" />
			</div>
		`;
  }
  mounted() {
    document.querySelector('.input').addEventListener('change', (event) => {
      store.commit('CHANGE_TYPED', event.target.value);
    });
  }
}

class Mirror extends Component {
  template() {
    return `<p>Typed: ${store.state.typed}</p>`;
  }
}

const app = document.getElementById('app');
new InputMirror(app);
```

## 마치며

직접 구현해보니 중앙 집중식 저장소에 더 잘 이해하게 된 것 같다. 그리고 역시 만들어진 것을 사용하는게 편하긴 하다...ㅋㅋ 나도 언젠간 나의 철학이 담긴 뷰 프레임워크를 만들어보고 싶다.

## 참조

- https://junilhwang.github.io/TIL/Javascript/Design/Vanilla-JS-Store/#_5-flux-pattern
- https://peter-cho.gitbook.io/book/5/5_2
- https://vuex.vuejs.org/
