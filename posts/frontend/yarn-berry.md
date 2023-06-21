---
title: 'Yarn?'
date: '2022-07-06 23:42'
---

## Yarn?

JavaScript로 프로젝트를 하면 패키지 관리는 필수적이다. 패키지를 관리하기 위해 툴을 사용하는데, 보통 가장 먼저 접하게 되는 것은 NPM이다. Node.js의 공식 패키지 관리자인 만큼, Node.js를 설치하면 같이 설치돼서 많이 사용하는 것 같다.

비공식 패키지 관리자로는 대표적으로 2016년에 페이스북이 개발한 Yarn이 있다. 현재는 Yarn2, Yarn Berry, Yarn3.x으로 불리는데 다 똑같은 것을 의미한다. 이 글에서는 Yarn2로 지칭하겠다.

Yarn2가 등장한 이유는 당연히 NPM에 뭔가 문제가 있기 때문이다. 뭐가 문제인지, Yarn2는 어떻게 해결했는지 한 번 알아보자.

### node_modules

NPM은 `node_modules` 디렉토리로 모든 패키지를 관리한다.

패키지를 많이 설치한 프로젝트를 실수로 깃허브에 올려본적 있는 사람을 알텐데, `node_modules` 디렉토리 구조는 엄청 큰 공간을 차지한다. 용량을 많이 차지할 뿐만 아니라 `node_modules` 디렉토리 구조를 만들기 위해서는 많은 I/O 작업이 필요하다. 미리 설치된 것이 있어도 모든 디렉토리의 내용을 비교해봐야 한다. 그리고 파일 시스템을 통해 중첩된 `node_modules` 디렉토리를 찾아 올라가면서 패키지를 하기 때문에 패키지를 찾는 과정이 엄청나게 비효율적이다.

Yarn1에서도 이 방식으로 패키지를 관리했었다. NPM과 Yarn1에서는 중복설치되는 패키지를 아끼기 위해 끌어올리는(hoisting) 기법을 사용한다.

<img src="https://static.toss.im/assets/toss-tech/yarn-berry-2.png" alt="yarn-berry" />

의존성 트리가 위의 모습이라면, A(1,0)과 B(1.0)이 두 번 설치되니까 디렉토리의 트리 모양을 오른쪽으로 바꿔준다. 하지만 이렇게 되면서 package-1에서는 원래 접근할 수 없었던 B(1.0)을 불러올 수 있게된다. 호이스팅이 일어나서 직접 의존하지 않는 모듈을 접근할 수 있는 현상을 유령 의존성(phantom dependency)라고 한다. 원하지도 않던 의존성이 생겼으니 당연히 패키지 관리에 혼란이 일어날 수 있다.

### Plug’n’Play(PnP)

위의 문제를 Yarn2에서는 PnP를 이용해 해결한다.

Yarn2는 `node_modules`를 생성하지 않고, `.yarn/cache` 폴더에 의존성의 정보를 저장하고 `.pnp.cjs` 파일에 의존성을 찾을 수 있는 정보를 기록한다. `.pnp.cjs` 파일을 이용하면 디스크 I/O 없이 어떤 패키지가 어떤 라이브러리에 의존하는지, 각 라이브러리는 어디 위치하는지 바로 알 수 있다.

패키지 매니저는 의존성 트리를 생성할 때 이미 모든 의존성에 대한 정보를 알고 있으니, 패키지를 찾는 작업을 Node에게 맡기지 않고 정보를 제공하는 것이다. `.pnp.cjs` 파일에는 패키지들에 대한 lookup 테이블로 볼 수 있다.

이제 Yarn2는 `install`시 단 하나의 파일만 생성하면 된다. 설치 시간의 관건이 디스크 I/O가 아닌 프로젝트에서 사용하는 패키지의 개수가 되는 것이다.

#### ZipFS

Yarn PnP의 의존성은 `.yarn/cache`에 zip 압축 파일로 관리된다.

Zip 파일로 의존성을 관리하면 디렉토리 구조를 생성할 필요가 없기 때문에 설치가 빨라지고, 각 패키지는 버전마다 하나의 파일을 가지기 때문에 중복해서 설치되지 않는다. 또한 압축파일인 만큼 디스크 용량도 크게 아낄 수 있다.

용량이 작기 때문에 이제 의존성도 git으로 관리할 수 있다. Pull만 받으면 install 과정없이 바로 같은 환경을 세팅할 수 있는 것이다. Yarn2에서 의존성을 버전 관리에 포함하는 것을 **Zero-Install**이라고 한다.

## 마치며

이번 프로젝트에 Yarn을 사용해보려고 NPM과 차이점을 찾아봤다. 큰 차이점이 없을 줄 알았는데, 패키지를 관리하는 방식이 아예 달라서 신기했다. `.pnp.cjs` 파일로 패키지를 찾는 것이 마치 DB의 인덱싱이나 운영체제의 page table을 적용한 것 같았다.
결국 모두 기본기의 응용인 것 같다.

## 참조F

- [node_modules로부터 우리를 구원해 줄 Yarn Berry](https://toss.tech/article/node-modules-and-yarn-berry)
- [NPM vs Yarn: Which package manager should I use?](https://www.imaginarycloud.com/blog/npm-vs-yarn-which-is-better/)
- [Plug’n’Play | Yarn - Package Manager](https://yarnpkg.com/features/pnp)
