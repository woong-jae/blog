---
title: 'Vanilla Javascript로 구현하는 SPA - 컴포넌트 만들기'
date: '2022-03-24 21:29'
modified: '2022-04-08'
---

## 발단

새로운 프로젝트가 '웹 페이지'보다는 '어플리케이션'에 가까웠으면 했기에 SPA로 개발되면 좋을 것 같다고 생각했다.
이전에 React를 사용해봤었기 때문에 또 React를 사용하면 수월하게 개발할 수 있었지만, 프로젝트 크기가 작아서 React로 개발해봤자 뭔가 새로 배울게 없을 것 같았다.

그래서 "프로젝트 규모가 작으니까 vanilla javascript로 SPA를 구현해보면 재밌지 않을까?"라고 생각했고, 생각을 행동으로 옮겼다.

그리고 고통은 시작됐다.

### 필요한 것들

모방은 창조의 어머니다. 제일 처음으로 제일 인기있는 SPA 프레임워크인 React와 Vue의 공통적인 특징을 톺아보았다.

- **컴포넌트**

React와 Vue는 웹 UI를 컴포넌트 단위로 구성한다. 스스로 상태를 관리하는 캡슐화된 컴포넌트를 통해 코드의 재사용성과 유지보수성을 증가시켜 준다.

- **선언적(declaritive) 렌더링**

React와 Vue는 **선언적인 패러다임을 사용**한다.
DOM을 직접 조작해 뷰를 변경하는 것이 아닌, '상태'를 변경하면 프레임워크가 알아서 DOM을 변경시켜준다.
즉, "무엇을"을 보여줄지 정의해주면 프레임워크가 "어떻게" 화면에 보여주게 된다. 이것을 공식으로 표현하면 아래와 같다.

```js
f(state) = view
```

- **Virtual DOM**

Virtual DOM을 통해 실제 DOM 변화를 최소화한다.
Virtual DOM은 뷰에 변화가 있다면, 그 변화가 실제 DOM에 적용되기 전에 Virtual DOM에 적용시키고 최종 결과만 실제 DOM에 전달한다.
만약 20개의 변화가 있다면 Virtual DOM은 변화된 부분만 가려내어 실제 DOM에 전달하고 실제 DOM은 그 변화를 1회로 인식하여 단 한 번의 렌더링 과정만 거치게 된다.

React와 Vue 둘 다 UI를 상태를 가지는 개별 컴포넌트로 분리해 개발하고 virtual DOM으로 최적화한다.
일단 최적화는 나중에 적용하기로 하고 제일 핵심인 컴포넌트를 먼저 개발하게 됐다.

## 전체적인 구조 잡기

프로젝트의 구조를 잡기 위해 일단 제일 친숙한 React의 가장 기본적인 구조를 봤다.

React 앱의 최상단인 `index.js`에서 `ReactDOM.render`로 root에 `App.js`를 렌더해준다.
이때 root는 html body의 유일한 요소다. 즉, 이 유일한 요소 안에 `App.js`를 그려넣는 것이다.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

ReactDOM.render(<App></App>, document.getElementById('root'));
```

이를 참고해서 나도 HTML의 body에 `id=root`인 `div` 요소 하나만을 두고, 컴포넌트를 달아주기 위해 `index.js`를 만들어줬다.

## 컴포넌트 만들기

### 웹 컴포넌트를 사용해볼까?

자바스크립트를 공부하면서 '웹 컴포넌트'를 접했었다. 웹 컴포넌트에 대한 자세한 내용은 [여기](https://woong-jae.com/javascript/220222-web-component)서 확인하자.

"브라우저 내장 기능이 제공하는 웹 컴포넌트를 사용하면 되지 않을까?"라고 생각해서 바로 실천으로 옮겼다.

결과는 처참했다. 웹 컴포넌트는 웹 프레임워크에서 제공되는 컴포넌트와는 느낌이 너무 달랐다.
웹 컴포넌트는 커스텀 요소 생성, 쉐도우 DOM, 템플릿으로 구성되는데, 이 구성 요소들이 아직은 각각 따로 노는 느낌이였다.
특히 웹 컴포넌트 작성은 어찌어찌 했어도, 이를 실제 사용할 HTML에 불러올 방법이 모두 야매스러웠다.

> 물론 내가 초보라서 이상하게 사용했을 수도 있다... 혹시 잘 사용된 예시가 있다면 레퍼런스 부탁드립니다ㅜㅜ

"어떻게든 활용할 수 없을까"해서 이러저리 2주 정도 만져보다가,
"이건 프레임워크를 대체하는 것이 아니라 컴포넌트 라이브러리를 만들 때 사용하는 것"이라는 결론을 내리고 다른 방법을 찾았다.

### Vanilla Javascript 컴포넌트

남은 방법은 직접 만드는 것 뿐이다. 다시 한 번 React를 살펴보자.

React는 클래스형 컴포넌트와 함수형 컴포넌트가 있는데, 나는 클래스형 컴포넌트를 참고했다.
클래스형 컴포넌트를 참고하면 React 컴포넌트의 생명주기를 이해하는데 유용할 것 같았고 React도 처음에는 클래스형을 사용했기 때문이다.

클래스형 컴포넌트로 프로젝트를 진행하고 난 후 함수형 컴포넌트로 리펙토링 하는 것이 목표다.

React 공식문서의 [React.Component](https://ko.reactjs.org/docs/react-component.html) 부분을 보자. 특히 **컴포넌트의 생명주기**에 집중해보자.

#### 생성

React의 컴포넌트는 생성될 때 메서드들이 아래 순서대로 호출된다.

1. `constructor`: state를 초기화 하거나 메서드를 바인딩 할 때 사용된다.
2. `render`: 내용 반환
3. `componentDidMount`: 컴포넌트가 마운트된 직후 호출된다. 외부에 데이터를 불러오거나 자식 컴포넌트를 달아줄 때 사용한다.

일단 메서드 안의 내용은 빼고 `Component` 안에 쭉 채워 넣어보자.

```js
class Component {
  constructor() {}
  render() {}
  mounted() {}
}
```

이제 메서드 안을 채워보자.

클래스의 인스턴스를 만들게 되면 `ReactDOM.render`처럼 실제 DOM의 '어떤 요소' 밑에 컴포넌트가 렌더링 돼야한다.
나는 가상 DOM을 사용하지 않고 실제 DOM에 바로 넣어버릴 것이기 때문에,
생성자에서 컴포넌트를 렌더링할 타겟 요소를 인자로 받아 저장하게 하고 `render`에서 타겟 요소 안에 컴포넌트의 내용을 출력하게 했다.

그리고 React 컴포넌트의 생성 때 생명주기와 비슷하게 `constructor` 호출 후 안에서 `render`, `mounted`가 순서대로 호출되게 했다.
하지만 이러면 `constructor`에서 `state`를 초기화 하거나 메서드를 바인딩하기 어려워진다.
`setup`이라는 메서드를 새로 만들어 여기서 `state`를 초기화할 수 있도록 했다.

`mounted`에서 리스너를 등록하거나 자식 컴포넌트를 렌더링하는 등의 작업을 해야한다.

```js
class Component {
  constructor(target) {
    this.target = target;
    this.setup();
    this.render();
    this.mounted();
  }
  setup() {}
  render() {
    this.target.innerHTML = ``;
  }
  mounted() {}
}
```

#### 변경

컴포넌트의 상태가 변했을 때는 메서드들이 아래 순서대로 호출된다.

1. `setState`: state를 변경한다.
2. `render`
3. `componentDidUpdated`

마찬가지로 일단 넣어보자.

```js
class Component {
  constructor(target) {
    this.target = target;
    this.setup();
    this.render();
    this.mounted();
  }
  setup() {}
  render() {
    this.target.innerHTML = ``;
  }
  mounted() {}
  setState() {}
  updated() {}
}
```

`setState`를 하면 `state`를 변경해준 후 `render`와 `updated`를 순차적으로 호출해주면 된다.
여기에 추가해서 `render`와 `updated`사이에 `mounted`를 넣어서 데이터와 하위 컴포넌트를 로드해줘야 한다.

여기에 `props`를 추가해주고 `render`의 내용 부분을 `template`으로 따로 빼주었다.

```js
class Component {
  constructor(target, props = {}) {
    this.target = target;
    this.props = props;
    this.setup();
    this.render();
    this.mounted();
  }
  setup() {}
  template() {
    return ``;
  }
  render() {
    this.target.innerHTML = this.template();
  }
  mounted() {}
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
    this.mounted();
    this.updated();
  }
  updated() {}
}
```

#### 문제점

```js
class Input extends Component {
  template() {
    return `
      <div>
        <input class="input" value="${this.state.typed}" />
        <div>Typed: ${this.state.typed}<div/>
        <div>Updated: ${this.state.updated}<div/>
      </div>
    `;
  }
  setup() {
    this.state = { typed: '', updated: false };
  }
  mounted() {
    document.querySelector('.input').addEventListener('change', (event) => {
      this.setState({ typed: event.target.value });
    });
  }
  updated() {
    this.setState({ updated: true });
  }
}

new Input(document.getElementById('app'));
```

`mounted`와 `updated`에서 동시에 `setState`를 하는 경우 "setState -> render -> mounted -> updated -> setState ..."의 무한반복이 시작된다.
이를 방지하기 위해 `setState`에서 `newState`의 값이 기존 값과 같다면 리렌더링하지 않도록 했다.

```js
setState(newState) {
  let needRerender = false;
  Object.keys(newState).forEach((key) => {
    if (this.state[key] === newState[key]) return;
    needRerender = true;
  });

  if (!needRerender) return;
  this.state = { ...this.state, ...newState };
  this.render();
  this.mounted();
  this.updated();
}
```

### 사용예시

```js
class InputMirror extends Component {
  setup() {
    this.state = { typed: '' };
    this.handleChange = (value) => {
      this.setState({ typed: value });
    };
  }
  template() {
    return `
      <div>
        <div class="input-container"></div>
        <div class="mirror-container"></div>
      </div>
    `;
  }
  mounted() {
    new Input(document.querySelector('.input-container'), {
      typed: this.state.typed,
      handleChange: this.handleChange,
    });
    new Mirror(document.querySelector('.mirror-container'), {
      typed: this.state.typed,
    });
  }
}

class Input extends Component {
  template() {
    return `
      <div>
        <input class="input" value="${this.props.typed}" />
      </div>
    `;
  }
  mounted() {
    document.querySelector('.input').addEventListener('change', (event) => {
      this.props.handleChange(event.target.value);
    });
  }
}

class Mirror extends Component {
  template() {
    return `<p>Typed: ${this.props.typed}</p>`;
  }
}

const app = document.getElementById('app');
new InputMirror(app);
```

## 마치며

정말 간단하게 만든 컴포넌트기 때문에 어플리케이션이 커지면 다양한 문제가 발생할 수 있을 것 같다.
특히 리렌더링 과정이 엄청나게 비효율적이다.
하지만, 만들 어플리케이션이 간단하기 때문에 지금은 이 정도로 충분하다고 생각된다.

## 참조

- [Vanilla Javascript로 웹 컴포넌트 만들기](https://junilhwang.github.io/TIL/Javascript/Design/Vanilla-JS-Component/#_1-%E1%84%8F%E1%85%A5%E1%86%B7%E1%84%91%E1%85%A9%E1%84%82%E1%85%A5%E1%86%AB%E1%84%90%E1%85%B3%E1%84%8B%E1%85%AA-%E1%84%89%E1%85%A1%E1%86%BC%E1%84%90%E1%85%A2%E1%84%80%E1%85%AA%E1%86%AB%E1%84%85%E1%85%B5)
- <https://library.gabia.com/contents/8284/>
- <https://ko.reactjs.org/>
- <https://kr.vuejs.org/>
