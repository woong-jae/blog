---
title: '[JS] Execution Context(실행 컨텍스트)'
date: '2022-11-02 15:09'
---

실행 컨텍스트(Execution Context)는 scope, hoisting, this, function, closure 등의 동작원리를 담고 있는 자바스크립트의 핵심원리다.

실행 컨텍스트는 '코드가 실행되기 위해 필요한 환경 정보들을 모아놓은 객체'다. 실행 컨텍스트가 생성되는 시점에서 호이스팅이 발생하고, 외부 환경 정보를 구성하고, this 값을 설정하게 된다.

## 실행 컨텍스트 구성

실행 컨텍스트는 다음과 같은 일이 발생하면 call stack에 쌓이게 된다.

- 프로그램 실행시 전역 컨텍스트 생성(global execution context): 전역 객체를 생성한다.
- 함수 실행
- `eval` 함수 실행

일반적인 함수를 실행했을 때 생성되는 실행 컨텍스트에는 다음과 같은 정보들이 저장된다.

### Lexical environment

렉시컬 환경은 environment record(환경 레코드)와 outer environment reference(외부 렉시컬 환경에 대한 참조)로 구성된다. 블록의 유효 범위 안에 있는 식별자와 결과를 저장한다.

### Variable Environment

Variable environment는 lexical environment와 똑같지만, 함수 유효범위 안에 있는 식별자의 결과를 저장한다.

```js
function test() {
  var a = 1;
  const b = 2;
  if (true) {
    var c = 3;
    let d = 4;
  }
}
test();
```

`test`가 호출되는 시점에서 실행 컨텍스트는 아래와 같이 생성된다.

```js
ExecutionContext:
	LexicalEnvironment:
		b: nothing
		outer: VariableEnvironment
	VariableEnvironment:
		a: undefined
		c: undefined
		outer: global
	...
```

`if(true)`를 만나 block을 스코프를 생성하기 위해 새로운 lexical environment가 생성된다.

```js
ExecutionContext:
	LexicalEnvironment:
		d: nothing
		outer:
			LexicalEnvironment:
				b: 2
				outer: VariableEnvironment
	VariableEnvironment:
		a: 1
		c: undefined
		outer: global
	...
```

> Global execution context에는 variable environment가 생성되지 않는다.

### ThisBinding

ThisBinding 컴포넌트는 함수를 호출한 객체의 참조가 저장되는 곳이고, 가리키는 값이 실행컨텍스트의 this가 된다.

## 정리

- 실행 컨텍스트는 실행할 코드에서 사용할 정보들을 모아놓은 객체다.
- 실행 컨텍스트는 프로그램 실행(전역 컨텍스트), eval 함수, 함수 실행, block 생성시에 만들어진다.
- 실행 컨텍스트는 만들어지는 시점에서 variable environment, lexical environment, this binding를 구성한다.

## 참조

- https://stackoverflow.com/questions/23948198/variable-environment-vs-lexical-environment
- [실행컨텍스트 (1) 개요와 구성](https://velog.io/@zigje9/%EC%8B%A4%ED%96%89%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8-1-%EA%B0%9C%EC%9A%94%EC%99%80-%EA%B5%AC%EC%84%B1)
- [개발자 황준일 - 실행 컨텍스트 구성](https://junilhwang.github.io/TIL/Javascript/Domain/Execution-Context/#_2-%E1%84%89%E1%85%B5%E1%86%AF%E1%84%92%E1%85%A2%E1%86%BC-%E1%84%8F%E1%85%A5%E1%86%AB%E1%84%90%E1%85%A6%E1%86%A8%E1%84%89%E1%85%B3%E1%84%90%E1%85%B3-%E1%84%80%E1%85%AE%E1%84%89%E1%85%A5%E1%86%BC)
