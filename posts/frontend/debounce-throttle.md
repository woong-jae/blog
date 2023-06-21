---
title: '[JS] Debounce와 Throttle'
date: '2022-06-10 11:28'
---

디바운스와 쓰로틀링은 이벤트의 발생 빈도를 제한하여 최적화하는 기법이다.
두 기법이 뭔지, 차이점은 뭔지 알아보자.

## Debounce(디바운스)

먼저 바운싱이란 용어는 전자공학에서 기계적인 접점을 가진 스위치에서 접점이 붙거나 떨어지는 그 짧은 순간에 고속으로 여러번 on/off 되는 현상을 말한다.
한 번만 on/off가 발생하길 원하는데 불필요한 인풋이 발생하는 것이다.

이런 바운싱 현상을 방지하기 위한 기법을 **디바운싱**이라고 한다.

프로그래밍에서 디바운싱은 연속적으로 발생한 이벤트를 하나의 그룹으로 묶어서 처리하는 방식으로, 주로 그룹에서 처음이나 마지막으로 실행된 함수를 처리하는 방식으로 사용된다.

디바운싱은 주로 이벤트에 AJAX 요청이 묶여있을 때 사용하게 된다. 연속적인 이벤트가 발생했을 때 모든 이벤트마다 AJAX 요청을 보내면 성능상 문제가 발생하기 때문이다.

유저 인풋을 받아 추천을 해주는 기능을 구현한다고 해보자.

```js
document.querySelector('input').addEventListener('input', function (e) {
  console.log('AJAX 요청 발생', e.target.value);
});
```

`console.log`를 AJAX 요청이라고 해보면, 유저가 키보드를 누를 때마다 서버로 AJAX 요청을 보내게 된다.
이것보다는 유저가 입력을 멈췄을 때 추천을 해주는 것이 가장 이상적이다.

```js
const debounce = (callback) => {
  let timer = null;

  return (event) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => callback(event), 200);
  };
};

document.querySelector('input').addEventListener(
  'input',
  debounce((e) => console.log('AJAX 요청 발생', e.target.value)),
);
```

유저의 마지막 입력후 아직 200ms가 지나지 않았으면 이전에 등록한 타이머를 지우고 다시 타이머를 등록한다.
200ms 동안 아무 입력이 없으면 마지막 이벤트가 적용된다.

### 디바운스의 leading edge

디바운싱을 할 때 마지막으로 발생한 이벤트를 처리하는 것을 **trailing edge**, 처음에 발생한 이벤트를 처리하는 것을 **leading edge**라고 한다.

Leading edge로 구현하면 연속적인 이벤트가 발생했을 때 첫 이벤트만 처리하고 뒤따라오는 이벤트는 모두 무시된다.

Trailing과 leading edge를 모두 처리해주는 디바운스 함수를 구현해보면 아래와 같다.

```js
const debounce = (callback, wait, leading = false) => {
  let timer;

  return (event) => {
    const callNow = leading && !timer;

    const later = () => {
      timer = null;
      if (!leading) callback(event);
    };

    clearTimeout(timer);
    timer = setTimeout(later, wait);

    if (callNow) callback(event);
  };
};
```

`callNow`를 통해 콜백함수의 실행시점을 조절한다.

## Throttle(쓰로틀)

**쓰로틀링**은 출력을 조절한다는 의미를 가지고 있다.

프로그래밍에서 쓰로틀링은 여러번 발생하는 이벤트를 일정 시간 동안, 한번만 실행 되도록 만드는 것이다.

쓰로틀의 설정 시간으로 100ms를 주게 된다면, 해당 이벤트는 100ms 동안 최대 한 번만 발생하게 된다.
즉, 마지막 함수가 호출된 이후 일정 시간이 지나기 전까지 함수는 다시 호출될 수 없다.

쓰로틀링은 주로 스크롤 이벤트에 많이 적용한다. 스크롤을 올리거나 내릴 때 이벤트가 아주 많이 발생하는데, 이벤트마다 뭔가 복잡한 작업을 하도록 설장한다면 블로킹으로 인해 화면이 뚝뚝 끊길 수 있다.
이때 쓰로틀링을 적용해 몇 초에 한 번, 몇 밀리초에 한 번만 실행되게 최적화 할 수 있다.

위에서 사용한 예시에 쓰로틀링을 적용하면 아래와 같다.

```js
const throttle = (callback) => {
  let timer;

  return (event) => {
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        callback(event);
      }, 200);
    }
  };
};

document.querySelector('input').addEventListener(
  'input',
  throttle((e) => console.log('AJAX 요청 발생', e.target.value)),
);
```

## 마치며

디바운싱은 AJAX 요청같이 한 번만 실행하면 좋겠을 때 적합하고, 쓰로틀링은 무한 스크롤과 같이 주기적인 이벤트에 대한 성능 저하를 개선할 때 사용하면 좋을 것 같다.

면접에서 처음 접한 개념이라 당황했었다. 이런걸 모르고 있었다니... 하지만, 덕분에 새로운 지식을 얻었다!

## 참조

<https://www.zerocho.com/category/JavaScript/post/59a8e9cb15ac0000182794fa>  
<https://minimax95.tistory.com/entry/%EB%B0%94%EC%9A%B4%EC%8B%B1Bouncing-%ED%98%84%EC%83%81-%EB%B0%A9%EC%A7%80>
