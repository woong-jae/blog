---
title: '번들 분석으로 CRA 성능 개선하기'
date: '2022-10-04'
---

## 문제점

![algong-lighthouse-performance](https://user-images.githubusercontent.com/33976823/193708185-3162c46f-1726-4a9c-8dd2-09eefd32e7dd.png)

기능 구현이 거의 완료된 SPA의 메인화면을 lighthouse로 분석했다. 그 결과 largest contentful paint(LCP)와 total blocking time이 안좋다는 것을 알 수 있었다.

LCP가 저하되는 원인은 느린 서버 응답시간, 자바스크립트와 css 렌더 블로킹, 느린 리소스 로딩 시간, 클라이언트 측 렌더링이 있다. 이 중에서도 클라이언트 측 렌더링이 현재 가장 큰 원인이라고 판단했다. SPA의 커다란 자바스크립트 번들을 최적화한다면 의미있는 성능 향상을 얻을 수 있을 것 같았다.

클라이언트 측 렌더링을 최적화하기 위해 다음 사항들을 고려할 수 있다.

- 중요 JavaScript 최소화: JavaScript 축소, 사용하지 않는 JavaScript 지연 등으로 최적화 할 수 있다.
- 서버측 렌더링 사용: Next.js와 같은 프레임워크를 사용해 주요 콘텐츠를 서버에서 렌더링하도록 하는 방법을 사용할 수 있지만, 대규모 코드 변경이 필요해 고려하지 않았다.

JavaScript 최소화를 위해 먼저 번들 분석을 했다.

### 해결기

'webpack-bundle-analyzer' 플러그인을 사용하면 빌드된 번들을 분석할 수 있다. 앱을 CRA로 만들어서 `eject` 없이 사용하기 위해 `cra-bundle-analyzer`를 사용했다.

결과는 다음과 같았다.

![bundle-before](https://user-images.githubusercontent.com/33976823/193708285-e50685e5-667d-4214-ada5-66d36917d136.png)

메인이 무려 5.3MB나 된다. 그 중 `@codemirror`란 라이브러리가 거의 1MB를 차지하고 있었다. 메인화면에서는 사용하지도 않는 라이브러리인데 말이다.

main을 좀 더 가볍게 하기위해 code splitting을 했다. Codemirror를 사용하는 페이지들을 `lazy`와 `Suspense`를 사용해 필요할때만 불러오는 것이다.

```tsx
// ...
const Solve = lazy(() => import("./components/pages/Solve"));
const Solution = lazy(() => import("./components/pages/Solution"));
// ...
function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<Suspense fallback={<Loading />}>
					{...}
				</Suspense>
			</BrowserRouter>
		</QueryClientProvider>
	);
}
```

이것만 변경하고 다시 확인해봤다. 결과는 놀라웠다.

![bundle-after](https://user-images.githubusercontent.com/33976823/193708288-c0fd4d0a-15fd-4119-9b28-c79d44f2028d.png)
![algong-lighthouse-performance-after](https://user-images.githubusercontent.com/33976823/193708294-a63e6f4e-0824-430e-b4de-ee30cc2caa36.png)

main의 크기를 2.2MB로 거의 절반으로 줄일 수 있었다. LCP와 블락킹 타임도 개선된 것을 확인할 수 있다.

## 참조

- [최대 콘텐츠풀 페인트 최적화](https://web.dev/optimize-lcp/#reduce-javascript-blocking-time)
