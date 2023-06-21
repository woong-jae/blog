---
title: '[JS] 객체 프로퍼티 심화'
date: '2022-02-08'
---

객체의 프로퍼티는 '키-값'이 전부가 아니다.

객체 프로퍼티 추가 구성 옵션 몇 가지와, getter/setter 함수에 대해 알아보자.

## 프로퍼티 플래그(Flag)

객체 프로퍼티는 '값'과 함께 '플래그'라는 특별한 프로퍼티 세 가지를 갖는다.

- **writable**: `true`이면 값을 수정할 수 있다.
- **enumerable**: `true`이면 반복문을 사용해 나열할 수 있다.
- **configurable**: `true`이면 프로퍼티 삭제나 플래그 수정이 가능하다.

지금까지 해왔던 평범한 방식으로 프로퍼티를 만들면 플래그는 모두 `true`가 된다.

플래그에 대한 정보는 `Object.getOwnPropertyDescriptor` 메서드를 통해 얻을 수 있다.

```js
let user = {
  name: 'woong-jae',
};

let descriptor = Object.getOwnPropertyDescriptor(user, 'name');

console.log(descriptor);
// -> {value: "woong-jae", writable: true, enumerable: true, configurable: true}
```

`Object.defineProperty`를 사용하면 플래그를 변경할 수 있다.

```js
let user = {};

Object.defineProperty(user, 'name', {
  value: 'woong-jae',
  // writable: false
  // enumerable: false
  // configurable: false
});

console.log(Object.getOwnPropertyDescriptor(user, 'name'));
// -> {value: "woong-jae", writable: false, enumerable: false, configurable: false}
```

평범한 방식으로 프로퍼티를 만들었을 때와 `defineProperty`를 사용했을 때 차이점은 플래그 값이다.
`defineProperty`로 만든 프로퍼티는 플래그 값을 명시하지 않으면 플래그 값이 자동으로 `false`가 된다.

### writable

`writable` 플래그를 `false`로 변경하면 그 누구도 객체의 이름을 변경할 수 없다.

### enumerable

`enumerable` 플래그가 `false`가 되면 열거가 불가능(non-enumerable)하기 때문에 `for..in`에서 나타나지 않는다.
객체 내장 메서드 `toString` 같은 경우가 열거 불가능한 프로퍼티다.

열거 불가능한 프로퍼티는 `Object.keys`에서도 나타나지 않는다.

### configurable

구성 가능하지 않음을 나타내는 플래그다.

어떤 프로퍼티가 `configurable: false` 라면 **쓰기와 열거가 불가**능하고 **해당 프로퍼티를 객체에서 지울 수 없다**.

내장 객체 `Math`의 `PI`가 대표적인 예시라고 할 수 있다.

```js
console.log(Object.getOwnPropertyDescriptor(Math, 'PI'));
// -> {value: 3.141592653589793, writable: false, enumerable: false, configurable: false}
```

한 번 `configurable` 플래그를 `false`로 설정하면 돌이킬 방법이 없다.

## getter와 setter

객체의 프로퍼티는 두 종류로 나눌 수 있다.

- _데이터 프로퍼티(data property)_: 지금까지 사용한 모든 프로퍼티는 '데이터 프로퍼티'다.

- _접근자 프로퍼티(accessor property)_: 접근자 프로퍼티의 본질은 함수인데, 값을 얻고(get) 설정(set)하는 하는 역할을 담당한다. 그런데 **외부 코드에서는 함수가 아닌 일반 프로퍼티**처럼 보인다.

접근자 프로퍼티는 'getter와 setter' 메서드로 표현된다. 객체 리터럴 안에서 `get`과 `set`으로 나타낼 수 있다.

```js
let obj = {
    get propName() {
        // obj.propName을 실행할 때 실행
    },
    set propName() {
        // obj.proName = value를 실행할 때 실행
    }
}
```

getter는 `obj.propName`을 사용해 프로퍼티를 읽으려고 할 때 실행되고, setter는 `obj.propName`에 값을 할당하려 할 때 실행된다.

아래는 getter와 setter를 사용해 가상의 프로퍼티를 구현한 예시다.

```js
let user = {
  name: 'woong-jae',
  surname: 'chung',
  get fullName() {
    return `${this.surname} ${this.name}`;
  },
  set fullName(value) {
    [this.surname, this.name] = value.split(' ');
  },
};

user.fullName = 'Goo Jongman';
console.log(user.name);
// -> Jongman
```

### 접근자 프로퍼티 플래그

접근자 프로퍼티의 플래그는 `value`와 `writable` 대신 `get`과 `set`이 있다.

접근자 프로퍼티는 `get`, `set`, `enumerable`, `configurable`을 플래그로 갖는다.

```js
let user = {
  name: 'John',
  surname: 'Smith',
};

Object.defineProperty(user, 'fullName', {
  get() {
    return `${this.name} ${this.surname}`;
  },

  set(value) {
    [this.name, this.surname] = value.split(' ');
  },
});

console.log(user.fullName);
// -> John Smith

for (let key in user) console.log(key);
// -> name, surname
```

프로퍼티는 '접근자 프로퍼티'나 '데이터 프로퍼티' 중 한 종류에만 속할 수 있다.

## 참조

ko.javascript.info
