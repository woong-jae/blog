---
title: '유한 상태 기계(FSM)를 활용한 채점 추적기 구현'
date: '2022-12-14'
---

알고리즘 문제 플랫폼에서 제출한 코드가 성공하면 자동 제출하는 기능을 만드는데, 채점 상태를 추적하기 위한 Tracker가 필요했다.
Tracker는 채점관련 이벤트를 받고 현재 상태와 받은 이벤트에 따라 상태를 전이한다는 점에서 FSM(유한 상태 기계)를 적용하면 좋겠다는 생각이 들었다.

안타깝게도 오토마타 강의를 듣지 않아서 유한 상태 기계가 뭔지 공부하는 것부터 시작했다.

## FSM(Finite State Machine)

FSM, 유한 상태 기계는 유한한 개수의 상태를 가질 수 있는 추상 기계다. 기계는 한 번에 하나의 상태만을 가질 수 있고, 현재 상태는 주어진 임의의 시간에서의 상태를 뜻한다.

FSM은 다섯가지 부분으로 이뤄진다.

- 유한한 개수의 상태(states)
- 유한한 개수의 이벤트(events)
- 현재 상태와 이벤트가 주어졌을때 다음 상태를 결정하는 전이 함수(transition function)
- 초기 상태
- 최종 상태의 집합

### 왜 사용할까?

FSM은 컴퓨터 프로그램과 전자 논리 회로를 설계하는데 사용하는 수학적 모델이다. **수학적 모델이고 통제 가능한 변인을 제어한다는 점에서 FSM은 안정성을 제공한다**. 특히 상태의 개수가 많아지면 복잡도가 매우 증가할 수 있는 상황에 유용하다. FSM은 이런 상황에서 제한된 구조와 몇가지 제약으로 복잡하게 얽힌 코드를 정리하도록 도와준다.

### State Explosion

UI의 상태가 유효한지 나타내는 유저 인터페이스가 있다고 하자. 이런 경우에는 FSM을 'Valid'와 'Invalid'로 간단하게 나타낼 수 있다.

하지만, 이 인터페이스가 활성화 됐는지 표기하기 위한 상태(enabled or disabled)와 변경됐는지 여부를 나타내기 위한 상태(changed or unchanged)를 추가하면 필요한 상태가 $2^3=8$ 개로 지수적으로 증가한다. 이 정도 상태는 어찌저찌 표현할 수 있다고 하더라도 최악인 것은 다른 상태로의 전이를 관리하는 것이다.

![state_explosion](https://statecharts.dev/valid-invalid-enabled-disabled-changed-unchanged.svg)

이렇게 새로운 관점을 FSM에 추가하면 필요한 상태의 수가 제곱으로 늘어나고 전이는 더욱 크게 증가하는 현상을 'state explosion'이라고 부른다.

이 문제를 해결하기 위해 'statecharts'를 사용할 수 있다.

### Statecharts

Statecharts는 parallel states, hierarchies, guards라는 개념으로 문제를 해결한다.

#### Parallel states

**서로 독립적인 변수들을 모델링에서도 독립적일 수 있도록 허용**한다. 예를 들어, 위 예제에서 enabled/disabled와 change/unchanged 변수가 서로 독립적, 즉, 어떤 변수들의 조합도 유효하다고 해보자. 이런 독립적인 변수들을 parallel state를 사용해 아래와 같이 모델링 할 수 있다.

![statecharts_paralell-states](https://statecharts.dev/valid-invalid-enabled-disabled-changed-unchanged-parallel.svg)

점선으로 구분된 각 영역은 서로 독립적이다. **영역을 더 추가해도 statechart는 선형적으로 커지기 때문에 state explosion을 일으키지 않는다**.

#### Hierarchies

Statecharts에서 **상태는 계층으로 구성**할 수 있다. 위 예제에서 valid/invalid 상태가 오직 changed 상태에서 의미가 있다면, valid/invalid 상태를 changed의 부분 상태로 이동시킬 수 있다.

![statecharts_hierarchies](https://statecharts.dev/valid-invalid-enabled-disabled-changed-unchanged-parallel-hierarchy.svg)

상태에 계층을 둠으로써 state explosion을 억제할 수 있다.

#### Guards

Guard는 일종의 전제조건이라고 볼 수 있다. 몇개의 조건들이 유효하지 않다면 전이를 막는다. Parallel states의 예시에서 changed에서 unchanged로 가기 위해서는 invalid 상태여야 한다는 조건이 지켜져야 한다고 해보자. 즉, valid 상태여야 unchanged 상태로 갈 수 있다. 이런 경우 전이에 조건을 명시할 수 있다.

![statecharts_guards](https://statecharts.dev/valid-invalid-enabled-disabled-changed-unchanged-parallel-guarded.svg)

조건이 추가됐지만, 상태의 수는 동일하다. State explosion을 막을 수 있다.

## 구현

### Statechart

Tracker는 크롬 확장 프로그램의 background에서 실행되기 때문에 상태관리에 오류가 없도록 해야한다. 상태를 예측가능하게 관리하기 위해서 유한 상태 기계와 statechart을 적용했다.

<img width="990" alt="Tracker_statechart" src="https://user-images.githubusercontent.com/33976823/207529974-353ade91-9593-449d-b1b5-0657864a8f3c.png"/>

네모 박스는 상태를 의미하고, 둥근 박스는 이벤트를 의미한다. `GRADING` 상태는 내부적으로 `PROCESSING/IDLE` 상태를 가지게 했다. 채점 중에 사용자가 다른 화면으로 이동하거나 그 화면 자체를 종료했을 때 발생할 수 있는 문제점을 차단하기 위함이다.
`after 500ms`라고 표시됐지만, 실제로는 2초 정도로 조정할 생각이다.

### 인터페이스

Tracker로부터 상태, 컨텍스트(e.g. 플랫폼, 문제번호, 코드 등)를 받을 수 있어야 하고, Tracker에게 이벤트를 보낼 수 있어야 한다.

Statechart와 필요한 기능을 토대로 아래와 같이 타입과 인터페이스를 작성했다.

```ts
enum trackerState {
  PENDING = 'PENDING',
  'GRADING.PROCESSING' = 'GRADING.PROCESSING',
  'GRADING.IDLE' = 'GRADING.IDLE',
  DONE = 'DONE',
}
enum trackerEventType {
  START = 'START',
  FAIL = 'FAIL',
  SUCCESS = 'SUCCESS',
  SCORE = 'SCORE',
  AFTER = 'AFTER',
}
type trackerContext = {
  platform: string;
  problemId: string;
  code: string;
  memory: number;
  time: number;
};
type trackerAction = ((context: trackerContext) => void)[];
type trackerEvent = {
  type: trackerEventType;
  payload?: Partial<trackerContext>;
};

export { trackerState, trackerEventType };

export type { trackerContext, trackerAction, trackerEvent };

export default interface iTracker {
  readonly state: trackerState;
  readonly context: trackerContext;
  send: (event: trackerEvent) => void;
}
```

"PROCESSING/IDLE"을 "GRADING.\*" 형식으로 표현했다. 객체나 `Map` 자료형으로 계층을 표현할 수도 있었겠지만, 계층을 해석하기 위한 코드 작성의 오버헤드가 너무 크다고 생각했다. Tracker를 구현하는거지 유한 상태 기계와 statechart를 구현하는게 아니니까. 그리고 `trackerAction`을 추가로 정의했는데, `DONE` 상태가 됐을 때 실행할 effect를 tracker의 파라미터로 주입하기 위한 용도다.

Tracker의 인터페이스인 send 메서드로 이벤트를 보내면 현재 상태와 이벤트에 따라 상태를 전이하고 컨텍스트를 업데이트한다.

### Statechart 표현

Statechart는 `Map`으로 표현했다. 현재 상태에서 유효한 이벤트만 실행시키기 적합한 자료구조라고 생각했다.

```ts
const stateChart = new Map<trackerState, Map<trackerEventType, trackerState>>([
  [
    trackerState.PENDING,
    new Map<trackerEventType, trackerState>([
      [trackerEventType.START, trackerState['GRADING.PROCESSING']],
    ]),
  ],
  [
    trackerState['GRADING.PROCESSING'],
    new Map<trackerEventType, trackerState>([
      [trackerEventType.AFTER, trackerState['GRADING.IDLE']],
      [trackerEventType.START, trackerState['GRADING.PROCESSING']],
      [trackerEventType.SCORE, trackerState['GRADING.PROCESSING']],
      [trackerEventType.FAIL, trackerState.PENDING],
      [trackerEventType.SUCCESS, trackerState.DONE],
    ]),
  ],
  [
    trackerState['GRADING.IDLE'],
    new Map<trackerEventType, trackerState>([
      [trackerEventType.AFTER, trackerState.PENDING],
      [trackerEventType.START, trackerState['GRADING.PROCESSING']],
      [trackerEventType.SCORE, trackerState['GRADING.PROCESSING']],
      [trackerEventType.FAIL, trackerState.PENDING],
      [trackerEventType.SUCCESS, trackerState.DONE],
    ]),
  ],
  [
    trackerState.DONE,
    new Map<trackerEventType, trackerState>([
      [trackerEventType.AFTER, trackerState.PENDING],
    ]),
  ],
]);
```

복잡해보이지만 실제로 읽어보면 그다지 복잡하지 않다. 상태에 따른 이벤트들과, 이벤트가 발생했을 때 전이할 상태를 나타낸다.

### createTrackerFSM

위 내용들을 바탕으로 실제 기능들을 구현한 함수가 `createTrackerFSM`이다. 가장 핵심이 되는 함수인 `transition`만 보면 될 것 같다.

```ts
const createTrackerFSM = (
  actions?: Map<trackerState, trackerAction>,
): iTracker => {
  let state: trackerState = trackerState.PENDING;
  let context: trackerContext = { ...initialContext };
  let afterTimer: null | number = null;

  function clearTimer() {
    if (afterTimer) {
      clearTimeout(afterTimer);
      afterTimer = null;
    }
  }

  /**
   * 현재 상태와 이벤트 타입에 따라 Tracker의 상태를 변경한다.
   * 1. 이전에 등록된 after를 제거한다.
   * 2. 다음 상태가 after 이벤트를 처리한다면 after 타이머를 시작한다.
   * 3. 상태를 다음 상태로 전이한다.
   * 4. 다음 상태가 가지는 action들을 실행한다.
   */
  function transition(event: trackerEvent) {
    const nextState = stateChart.get(state)?.get(event.type);

    if (nextState === undefined) {
      throw new Error(
        `Invalid event type '${event.type}' emitted on state '${state}'`,
      );
    }

    // 이전에 등록된 after를 초기화한다.
    // 다음 상태에 after 이벤트가 존재하면 after Timer를 실행한다.
    clearTimer();
    if (stateChart.get(nextState)?.has(trackerEventType.AFTER)) {
      afterTimer = setTimeout(
        () => transition({ type: trackerEventType.AFTER }),
        2000,
      );
    }

    // 현재 상태와 이벤트에 따라 context를 업데이트한다.
    updateContext(event);

    // 상태를 다음 상태로 전이한다.
    state = nextState;

    // 다음 상태에 등록된 action들을 실행한다.
    if (actions) {
      actions.get(nextState)?.forEach((action) => action(context));
    }
  }

  // ...

  return {
    get state() {
      return state;
    },
    get context() {
      return { ...context };
    },
    send: transition,
  };
};
```

Transition이 발생하면 먼저 이전에 등록된 after를 제거한다.
다른 상태로 전이했는데 이전 상태의 `AFTER` 이벤트가 발생하면 곤란하다.
그리고 다음 상태에 after가 존재하면 `AFTER` 이벤트의 타이머를 시작한다. 시간은 2초로 통일했다.
다음으로 현재 상태와 이벤트에 따라 컨텍스트를 업데이트하고 다음 상태로 전이하면 된다.
Action들은 제일 마지막에 실행시켜 업데이트된 컨텍스트 내용을 반영할 수 있게 했다.

## 참조

- xState
- [Wiki - 유한 상태 기계](https://ko.wikipedia.org/wiki/%EC%9C%A0%ED%95%9C_%EC%83%81%ED%83%9C_%EA%B8%B0%EA%B3%84)
- [Kakao FE - 자바스크립트로 만든 유한 상태 기계 XState](https://fe-developers.kakaoent.com/2022/220922-make-cart-with-xstate/)
- https://statecharts.dev/
