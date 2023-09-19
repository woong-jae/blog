---
title: "[Webpack] HMR이란?"
date: "2023-09-19 21:38"
---

Webpack 같은 번들러로 개발환경을 설정하다보면 HMR이라는 기능을 만날 수 있습니다.

HMR(Hot Module Replacement)는 개발 환경에서 코드가 변경된 것을 그 부분만 바로바로 반영하는 기술입니다.
어떻게 파일에서 변경된 부분만 반영할 수 있을까요? 한번 알아봅시다.

## Hot-Reloading

옛 JS 개발 환경에 HMR이란 개념에 앞서 'hot reloading(=live reloading)'이라는 개념이 있었습니다..

코드가 수정되면 이를 반영하기 위해

- 브라우저에서는 새로고침
- Node에서는 재시작

을 해서 코드 반영을 자동화하는 아이디어였습니다.

### 한계

코드를 반영하기 위해 무조건 재가동하기 때문에 무조건 초기화면부터 다시 시작해야 합니다. 때문에 화면이 번쩍거리는 현상도 발생하죠.
큰 프로젝트라면 코드 반영에 오랜 시간이 걸릴 수도 있겠죠?

## HMR

JS에 모듈이라는 개념이 도입되면서 생겨났습니다. Runtime을 재가동하는 비효율적인 방식 대신, **수정된 코드가 속한 모듈만 새로 교체**하는 것이 가능해진거죠.

덕분에 애플리케이션의 상태를 유지할 수 있고, 새 코드를 반영하는데 걸리는 시간을 절약할 수 있게 됐습니다.

Webpack에서는 아래와 같은 설정을 하면 간단하게 사용할 수 있습니다.

```js
module.exports = {
  //...
  devServer: {
    hot: true,
  },
};
```

### 원리

![hmr_diagram](/images/webpack_hmr_diagram.png)

**HMR Runtime**과 **HMR Server**라는 구성요소가 HMR을 가능하게 해줍니다.

HMR Runtime은 부모와 자식 모듈을 추적하면서 업데이트 요청과 모듈 업데이트를 가능하게 해줍니다.
번들러가 빌드해주는 내 애플리케이션에 주입돼서 동작하게 됩니다.

관리적인 측면에서 HMR Runtime은 `check`와 `apply`, 두 가지 방법을 제공합니다.

`check`는 HMR Server에 주기적으로 요청을 보내 변경사항이 있는지 확인을 하고,
`apply`는 업데이트된 모든 모듈을 유효하지 않은 것으로 표시해 갱신될 수 있도록 합니다.

HMR Server는 HRM Runtime에게 업데이트가 발생했음과 업데이트에 대한 정보를 보내줍니다.

두 요소의 동작 과정은 아래와 같습니다.

1. 실행
   1. 번들이 만들어진다.
   2. Bundle server가 브라우저에 번들을 제공한다.
2. 업데이트
   1. 파일에 변경이 일어난 것을 번들러(Webpack 등)가 감지한다.
   2. 번들러는 변경과 연관된 모듈들을 다시 빌드해서 HMR Server에게 업데이트가 발생했음을 알린다. 주로 웹소켓 통신을 통해 이루어진다.
   3. HMR Runtime은 HRM Server에게 변경사항을 요청한다. 주로 HTTP 요청을 통해 이루어진다.
   4. HMR Runtime은 받은 업데이트 정보로 모듈을 교체하거나, 모듈을 교체할 수 없는 경우 재가동(reload)한다.

## 마치며

HMR의 동작 과정에 대해 알아봤습니다.

크롬 확장 프로그램을 만들면서 HMR 튜닝이 필요해 동작 과정에 대해 공부해보고 있는데요,
성공할지는 잘 모르겠습니다...

성공해서 공유하고 싶네요😀

## 참고

- [Hot Module Replacement | 웹팩 - webpack](https://webpack.kr/guides/hot-module-replacement/)
- [How does HMR works?](https://www.javascriptstuff.com/understanding-hmr/)
- [HMR 이해하기 - gseok](https://gseok.github.io/tech-talk-2022/2022-01-24-what-is-HMR/#webpack-dev-server)
