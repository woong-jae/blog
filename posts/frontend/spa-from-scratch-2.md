---
title: 'Vanilla Javascript로 구현하는 SPA - 라우팅'
date: '2022-03-25 23:37'
---

## SPA Router

Single-Page Application(SPA)는 기존 멀티 페이지 웹 어플리케이션과 다르게 경로가 변경되도 새로 페이지를 불러오지 않는다. 대신 URL 경로에 따라 올바른 콘텐츠를 그때 그때 그려준다.

이 일을 'Router'가 해준다.

모든 router는 최소 2개의 핵심 기능을 제공해야한다.

1. 어플리케이션의 모든 경로를 저장한 레지스트리(registry)
2. URL의 변경을 감지해 적절한 화면을 보여줌

URL 변경을 감지하는 방법은 두 가지가 있다. Fragment identifier를 사용하는 방식과 History API를 사용하는 방식이다.

Fragment identifier는 현재 웹 페이지의 특정 부분을 식별하기 위해 사용된다. 예를 들어, `www.domain.org/foo.html#bar`에서 `#bar`이 fragment identifier다. `foo.html`에서 `id="bar"`인 요소를 나타낸다. Fragment가 변경되면 `hashchange`가 발생하는데, 이 이벤트에 대해 리스너를 붙여서 router를 구현할 수 있다. 하지만, 못생겼다고 생각해서 History API를 사용하겠다.

### 구현하기

라우터는 새로운 경로 추가, 경로에 맞는 컴포넌트 호출, URL 변경을 감지해야 할 수 있어야 한다.

- `addRoute`: 새로운 경로와 컴포넌트를 추가한다.
- `start`: URL 변경 감지를 시작한다.
- `checkRoutes`: 현재 경로에 맞는 컴포넌트를 호출한다. 현재는 간단하게 `Map`을 사용해 일치하는 것을 찾도록 했다.

```js
const createRouter = () => {
  const routeToView = new Map();
  let notFound = () => {};

  function addRoute(route, view) {
    routeToView.set(route, view);
    return this;
  }

  function setNotFound(cb) {
    notFound = cb;
    return this;
  }

  function start() {
    window.addEventListener('click', (event) => {
      const { target } = event;
      if (target.matches('button[data-navigate]')) {
        const { navigate } = target.dataset;
        history.pushState({}, '', navigate);
        checkRoutes();
      }
    });

    window.addEventListener('popstate', () => {
      checkRoutes();
    });

    checkRoutes();
    return this;
  }

  function checkRoutes() {
    const currentRoute = routeToView.get(window.location.pathname);
    if (!currentRoute) {
      notFound();
      return;
    }
    currentRoute();
  }

  return {
    addRoute,
    setNotFound,
    start,
    checkRoutes,
  };
};
```

`setNotFound`는 맞는 경로가 하나도 없을 때 보여줄 화면이나 기능을 수행할 수 있도록 설정하는 함수다.

가장 중요한 `start` 함수를 살펴보자.

```js
function start() {
  window.addEventListener('click', (event) => {
    const { target } = event;
    if (target.matches('button[data-navigate]')) {
      const { navigate } = target.dataset;
      history.pushState({}, '', navigate);
      checkRoutes();
    }
  });

  window.addEventListener('popstate', () => {
    checkRoutes();
  });

  checkRoutes();
  return this;
}
```

첫 번째 이벤트 리스너는 화면 전환을 담당한다.
클릭한 버튼 요소에 `data-navigate` 속성이 있다면 화면 전환 이벤트가 발생했다고 간주한다. History API의 `pushstate` 메서드를 이용하면 브라우저의 세션 기록 스택에 상태를 추가할 수 있다. 페이지를 새로 갱신하지 않고 주소만 새로 바꿀 수 있다. 주소를 새로 바꾼 후에 `checkRoutes`를 통해 적절한 화면을 보여준다.

`data-` 속성을 사용한 화면 전환이 싫다면, router에 `navigate` 같은 경로 변경용 함수를 선언해 사용해도 괜찮을 것 같다.

두 번째 이벤트 리스너는 앞으로 가기와 뒤로가기를 담당한다. `popstate` 이벤트는 클라이언트가 앞으로 가기, 뒤로가기를 했을 때 발생한다. 이때는 경로에 맞는 적절한 화면을 보여주면 된다.

### 사용하기

구현한 router를 시험해보기 위해 간단한 html을 준비했다. 경로에 적절한 화면을 `main` 요소 안에 보여줄 것이다.

```html
<body>
  <ul>
    <li>
      <button data-navigate="/">main</button>
    </li>
    <li>
      <button data-navigate="/list">list</button>
    </li>
  </ul>
  <main></main>
</body>
```

Router를 직접 사용하면 아래와 같다.

```js
const createPages = (container) => {
  const home = () => {
    container.innerHTML = 'home page';
  };
  const list = () => {
    container.innerHTML = 'list page';
  };
  const notFound = () => {
    container.innerHTML = 'not found';
  };

  return {
    home,
    list,
    notFound,
  };
};

const pages = createPages(document.querySelector('main'));
const router = createRouter();

router
  .addRoute('/', pages.home)
  .addRoute('/list', pages.list)
  .setNotFound(pages.notFound)
  .start();
```

실제 사용해보면 원하는 대로 잘 동작하는 것을 확인할 수 있다.

### 경로 파라미터

어떤 페이지들은 경로 정보로 데이터를 요청하는 기능이 필요하다. 예를 들어, `https://woong-jae.com/javascript/220325-spa-from-scratch-2`는 이 블로그의 `javascript` 카테고리의 `220325-spa-from-scratch-2` 글을 화면에 보여준다. 이 정보를 URL으로 표현하면 `/:category/:post`가 될 것이다. 이처럼 파라미터를 가진 경로를 구현해보자.

우선 `addRoute`에서 경로를 등록하는 방식을 변경해야 한다. 경로를 매칭할 수 있게 받은 경로를 정규표현식으로 바꿔주는 작업을 할 것이다.

경로에서 파라미터에 해당하는 정규 표현식은 `/:(\w)+`로 나타낼 수 있다. `String.prototype.replace` 메서드를 통해 받은 경로의 파라미터를 전부 `([^\\/]+)`로 치환해준다. `([^\\/]+)`는 / 나 \\ 를 포함하지 않는 문자열을 의미한다.

```js
const ROUTE_PARAMETER_REGEX = /:(\w+)/g;
const URL_FRAGMENT_REGEX = '([^\\/]+)';

const createRouter = () => {
  // const routeToView = new Map();
  const routes = [];
  // ...
  function addRoute(route, view) {
    const params = [];

    const parsedRoute = route
      .replace(ROUTE_PARAMETER_REGEX, (match, paramName) => {
        params.push(paramName);
        return URL_FRAGMENT_REGEX;
      })
      .replace(/\//g, '\\/');

    routes.push({
      testRegExp: new RegExp(`^${parsedRoute}$`),
      view,
      params,
    });

    return this;
  }
};
```

이제 경로에서 파라미터를 추출할 수 있다. 경로에 대해 `String.prototype.match`와 방금 구한 `testRegExp`를 사용하면 쉽게 추출할 수 있다.

```js
const createRouter = () => {
  // const routeToView = new Map();
  const routes = [];
  // ...
  const extractURLParams = (route, pathName) => {
    if (route.params.length === 0) return {};

    const matches = pathName.match(route.testRegExp);

    matches.shift();

    const params = {};
    matches.forEach((paramValue, index) => {
      const paramName = route.params[index];
      params[paramName] = paramValue;
    });

    return params;
  };
};
```

`checkRoutes`에서는 `testRegExp`를 사용해 일치하는 경로를 찾고, 파라미터를 추출해 `view`에 전달해주면 된다.

```js
function checkRoutes() {
  const path = window.location.pathname;
  const currentRoute = routes.find(({ testRegExp }) => testRegExp.test(path));
  if (!currentRoute) {
    notFound();
    return;
  }

  const urlParams = extractURLParams(currentRoute, path);

  currentRoute.view(urlParams);
}
```

아까 사용하기에 경로를 추가해서 사용해보면 원하는 파라미터를 화면에 제대로 보여주는 것을 확인할 수 있다.

```js
const createPages = (container) => {
  const home = () => {
    container.innerHTML = 'home page';
  };
  const list = () => {
    container.innerHTML = 'list page';
  };
  const blog = ({ category, post }) => {
    contaner.innerHTML = `category: ${category}, post: ${post}`;
  };
  const notFound = () => {
    container.innerHTML = 'not found';
  };

  return {
    home,
    list,
    blog,
    notFound,
  };
};

const pages = createPages(document.querySelector('main'));
const router = createRouter();

router
  .addRoute('/', pages.home)
  .addRoute('/list', pages.list)
  .addRoute('/blog/:category/:post', pages.blog)
  .setNotFound(pages.notFound)
  .start();
```

## 참조

- Frameworkless Frontend Development
- <https://developer.mozilla.org/ko/docs/Web/API/History/pushState>
