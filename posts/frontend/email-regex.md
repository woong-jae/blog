---
title: "이메일 정규표현식 만들기"
date: "2023-11-19 15:04"
---

최근에 이메일 정규표현식을 만들 일이 있었는데요, 0부터 시작해서 만든 과정을 공유드릴까 합니다.

**이메일 정규표현식에는 정답이 없습니다.**

이메일 표준을 정규표현식으로 완벽하게 표현할 수 없을 뿐만 아니라, 기능의 스펙이나 사용환경에 따라서 달라지기 때문입니다.
표준을 읽고 구현하는 기능에 따라 튜닝할 수 있는 능력이 필요합니다.

## RFC

표준을 찾을 때 가장 먼저 봐야하는게 **RFC**라고 생각합니다.

Request For Comments, 일명 RFC 문서는 인터넷을 개발하는 데에 있어서 필요한 절차나 기술을 적어놓은 문서입니다.
미국의 국제 인터넷 표준화기구인 IETF에서 제공 및 관리하고 있습니다.

**인터넷의 표준을 문서화한 것**이죠.

RFC 문서를 보면 'Status'가 적혀있습니다. 문서의 상태를 나타내는데요, 뜻은 아래와 같습니다.

- Informational: 일반적인 정보 전달을 목적으로 하는 정보성 문서
- Experimental: 표준 트랙에 있지 않는 실험적 표준 제안
- Historic: 역사적인 면에서 중요한 의미를 가지나, 최신 규격의 등장이나 다른 이유로 쓸모 없어진 규격
- Standard: 표준 문서로 인정받은 상태
  - Proposed standard: 기술적 오류가 없는 완전한 표준 문서로 인정받은 첫 단계
  - Draft standard: 적어도 2개 이상의 다른 코드로 구현 및 상호운영에 대한 충분한 필드구현이 됐으나, 더 많은 테스트가 필요함
  - Internet standard: 실제 표준안으로써 절대적으로 필요하며 안정적으로 동작하는 것이 확인됐고 성공적으로 구현되어 사용되고 있음

### RFC5322

RFC5322는 메일 본문, 헤더, 첨부파일을 비롯한 이메일 메시지의 올바른 형식을 정의하는 인터넷 표준입니다.

RFC5322 문서의 section 3.4를 보면 이메일 포맷에 대한 표준을 확인할 수 있습니다.

문서을 읽어보면 이메일 주소는 `{local-part}@{domain}`으로 구성된다고 합니다.

Local-part는 '큰따옴표로 묶였는지 여부'로 크게 두 가지로 나눌 수 있습니다.
큰따옴표로 묶이지 않았다면, 아래 ASCII 문자들이 모두 허용됩니다.

- `A-Z`, `a-z`
- `0-9`
- `` !#$%&'*+-/=?^_`{|}~ ``
- 처음이나 마지막 문자로 오지 않고, 연속적으로 나타나지 않는 `.`

문서에서는 해당 문자로 구성된 덩어리들을 'dot-atom'으로 표현하고 있습니다.

큰따옴표로 묶였다면 내부 문자열에 다른 규칙이 적용되는데,
대부분 구현체들이 적용하지 않고(경험적으로) 제가 구현할 기능의 스펙에는 필요없기 때문에 고려하지 않았습니다.

### RFC6543

RFC5322를 보면 ASCII 문자만 취급하기 때문에 유니코드를 처리하지 못합니다. 저는 한글 도메인 과 같이 유니코드가 있는 경우도 처리할 수 있어야 했습니다.

그래서 찾아본 결과 RFC6543에서 국제화 대응과 관련된 내용을 확인할 수 있었습니다.

RFC6543의 section 3.1을 보면 RFC5322의 규칙을 UTF-8로 확장해서 국제화에 대응할 수 있게하는 내용을 확인할 수 있습니다.

위에서 허용되는 문자들에 유니코드를 추가하면 되겠죠?

### RFC1035

이제는 도메인 규칙을 살펴봐야겠네요.
RFC1035의 section 2.3.1에 도메인 규칙이 정의된 것을 확인할 수 있습니다.

정리해보면 아래와 같습니다.

- 알파벳: a-z / A-Z (대소문자 구분 안함)
- 아라비아 숫자 : 0~9
- 특수기호 : 하이픈 (-)
  - 하이픈 (-)은 처음과 끝에 올 수 없음
  - 하이픈 (-)은 연속으로 사용 불가
- 2자 이상 ~ 63자 이하

도메인도 알파벳만 처리하기 때문에 유니코드를 허용하게 했습니다.

## 정규 표현식

자 이제 조사한 내용을 정규 표현식으로 녹여내기만 하면 됩니다.

제가 만든 정규식은 아래와 같습니다.

```js
const mailRegex =
  /([a-zA-Z0-9!#$%&'*+/=?^_`{|}~\p{L}]+([\.-][a-zA-Z0-9!#$%&'*+/=?^_`{|}~\p{L}]+)*)@([a-zA-Z0-9\p{L}]+)([\.-][a-zA-Z0-9\p{L}]+)+/gu;
```

제대로 읽어보면 해석한 표준과 조금 다르다고 생각할 수도 있는데요, 맞습니다ㅎㅎ;

기존에 있는 이메일 정규 표현식에서 처리되는 것이면 기왕이면 처리될 수 있도록 해야했기 때문에 여러 문자열을 테스트해보면서 튜닝했기 때문입니다.
표준을 기준으로 구현을 하되 주어진 스펙에 따라 변경을 하게 됐습니다.

저는 브라우저에서 이메일을 하이라이팅해 링크를 걸기 위해서 정규표현식을 사용했기 때문에 패턴 매칭이 엄청 엄격할 필요는 없어서 가능한 구현이였던 같기도 하네요.

서버에서는 정규표현식 뿐만 아니라 다양한 케이스에 대응하기 위해 추가적인 검사를 당연히 진행해야 합니다.

## 마치며

이메일 정규표현식 정의하는 과정을 정리해봤습니다.

참고하셔서 각자 서비스에 맞는 이메일 정규표현식을 구현하는데 도움이 됐으면 좋겠습니다.

## 참고

- [RFC란?](https://net-study.club/entry/RFC-Request-for-Comments%EB%9E%80-RFC%EC%9D%98-%EC%97%AD%EC%82%AC-RFC-%EC%A2%85%EB%A5%98-RFC-%ED%91%9C%EC%A4%80%ED%99%94-%EC%A0%88%EC%B0%A8)
- [Section 3.4.1 of RFC5322](https://datatracker.ietf.org/doc/html/rfc5322#autoid-25)
- [Section 3.1 of RFC6543](https://datatracker.ietf.org/doc/html/rfc6532#section-3.1)
- [Section 2.3.1 of RFC1035](https://datatracker.ietf.org/doc/html/rfc1035#section-2.3.1)