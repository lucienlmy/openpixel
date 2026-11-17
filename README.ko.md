<div align="center">

[中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

<a href="https://ma1902056219-coder.github.io/openpixel/"><img src="docs/assets/banner.ko.gif" alt="OpenPixel — 픽셀 세계를 나만의 작품으로." width="100%"></a>

# OpenPixel

**픽셀 세계를 나만의 작품으로.**

연못의 물결부터 은하 충돌까지, 브라우저에서 실시간으로 그리는 31개의 픽셀 실험입니다.

<img src="docs/assets/badge-works.ko.svg" alt="작품"> <img src="docs/assets/badge-runtime.ko.svg" alt="실행"> <img src="docs/assets/badge-license.ko.svg" alt="라이선스">

[작품 모음 다운로드](https://github.com/ma1902056219-coder/openpixel/archive/refs/heads/main.zip) · [작품 목록](#gallery) · [로컬에서 실행하기](#start) · [수정 가이드](docs/guide.ko.md)


**[▶ 모든 작품 온라인 체험](https://ma1902056219-coder.github.io/openpixel/)**

</div>

## 움직이는 모습부터 살펴보세요

<div align="center">
<img src="docs/assets/showcase.gif" alt="실제 실행 화면: 물결, 물고기 떼, 은하 충돌" width="850">
</div>

실제로 실행한 작품 화면입니다. 31개 작품을 온라인으로 체험하거나 소스를 다운로드해 나만의 작품으로 바꿔 보세요.

- **직접 만져보기:** 비단잉어에게 먹이를 주고, 자기장을 움직이고, 성에를 닦고, 모래에 무늬를 남겨 보세요.
- **변화 관찰하기:** 위성은 고리가 되고, 물고기는 돌고래를 피하며, 별의 궤적은 긴 꼬리를 만듭니다.
- **장면 속으로 들어가기:** 보스 전투, 노을 속 드라이브, 퍼즐을 맞추면 움직이는 마을.
- **소스 수정하기:** 작품마다 독립 폴더, 소스 코드, 설명을 제공합니다. 빌드나 AI API가 필요하지 않습니다.

## 두 번째 공개 · 직접 바꿔 볼 다섯 실험

쇳물 불꽃부터 민들레 씨앗까지. 각 폴더를 독립 실행할 수 있으며 편집 가능한 코드와 조작 설명이 있습니다.

<table>
<tr>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/iron-flower/"><img src="works/iron-flower/poster.webp" alt="쇳물 꽃불" width="100%"><br><strong>쇳물 꽃불</strong></a><br><sub>쇳물을 쳐 올려 마을을 비추는 금빛 불꽃을 만듭니다.</sub><br><a href="works/iron-flower/source.js">소스 보기</a> · <a href="docs/works.ko.md#iron-flower">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/watercolor/"><img src="works/watercolor/poster.webp" alt="수채화 번짐" width="100%"><br><strong>수채화 번짐</strong></a><br><sub>젖은 종이에서 물감이 퍼지고 섞이는 모습을 그립니다.</sub><br><a href="works/watercolor/source.js">소스 보기</a> · <a href="docs/works.ko.md#watercolor">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/coral-reef/"><img src="works/coral-reef/poster.webp" alt="산호초" width="100%"><br><strong>산호초</strong></a><br><sub>산호를 건드리거나 물살을 만들면 작은 바닷속 세계가 반응합니다.</sub><br><a href="works/coral-reef/source.js">소스 보기</a> · <a href="docs/works.ko.md#coral-reef">조작 안내</a></td>
</tr>
<tr>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/dandelion/"><img src="works/dandelion/poster.webp" alt="민들레" width="100%"><br><strong>민들레</strong></a><br><sub>씨앗을 날리고 땅에 떨어진 씨앗이 새로 자라는 모습을 봅니다.</sub><br><a href="works/dandelion/source.js">소스 보기</a> · <a href="docs/works.ko.md#dandelion">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/kaleidoscope/"><img src="works/kaleidoscope/poster.webp" alt="만화경" width="100%"><br><strong>만화경</strong></a><br><sub>통을 돌릴 때마다 색 조각이 새로운 대칭 무늬를 만듭니다.</sub><br><a href="works/kaleidoscope/source.js">소스 보기</a> · <a href="docs/works.ko.md#kaleidoscope">조작 안내</a></td>
<td width="33%"></td>
</tr>
</table>

<a id="start"></a>

## 로컬에서 실행하기

1. [작품 모음을 다운로드하고 압축을 풀거나](https://github.com/ma1902056219-coder/openpixel/archive/refs/heads/main.zip) 저장소를 clone 합니다.
2. 루트의 `index.html` 또는 `works/<작품명>/index.html`을 엽니다.
3. 데모를 본 뒤 각 페이지의 조작 안내에 따라 직접 움직여 보세요.

브라우저가 로컬 파일을 제한한다면 로컬 서버를 실행하세요.

```bash
git clone https://github.com/ma1902056219-coder/openpixel.git
cd openpixel
python -m http.server 8080 --bind 127.0.0.1
```

[로컬 작품 모음](http://127.0.0.1:8080)을 여세요. 종료하려면 터미널에서 `Ctrl+C`를 누릅니다.

README, 수정 가이드, 작품 조작 안내는 네 가지 언어로 제공됩니다. 작품 내 UI와 소스 주석은 주로 중국어입니다. 키보드와 마우스를 사용하는 데스크톱 브라우저를 권장하며, 터치 지원은 작품마다 다릅니다.

<a id="gallery"></a>

## 작품 목록

카드를 클릭하면 브라우저에서 바로 체험할 수 있습니다. 조작 안내와 소스도 제공하며, 다운로드해 오프라인으로 실행할 수도 있습니다.

### 상호작용과 질감

<table>
<tr>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/night-pond/"><img src="works/night-pond/poster.webp" alt="밤의 연못" width="100%"><br><strong>밤의 연못</strong></a><br><sub>물결로 반사상을 흔들고 비단잉어에게 먹이를 주세요.</sub><br><a href="works/night-pond/source.js">소스 보기</a> · <a href="docs/works.ko.md#night-pond">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/plasma-globe/"><img src="works/plasma-globe/poster.webp" alt="플라즈마 볼" width="100%"><br><strong>플라즈마 볼</strong></a><br><sub>전기 아크를 손끝으로 모아 움직여 보세요.</sub><br><a href="works/plasma-globe/source.js">소스 보기</a> · <a href="docs/works.ko.md#plasma-globe">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/chladni-plate/"><img src="works/chladni-plate/poster.webp" alt="클라드니 판" width="100%"><br><strong>클라드니 판</strong></a><br><sub>진동에 따라 모래가 다양한 무늬로 모입니다.</sub><br><a href="works/chladni-plate/source.js">소스 보기</a> · <a href="docs/works.ko.md#chladni-plate">조작 안내</a></td>
</tr>
<tr>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/ferrofluid/"><img src="works/ferrofluid/poster.webp" alt="자성유체" width="100%"><br><strong>자성유체</strong></a><br><sub>자기장을 움직여 액체의 뾰족한 형태와 반사를 바꿉니다.</sub><br><a href="works/ferrofluid/source.js">소스 보기</a> · <a href="docs/works.ko.md#ferrofluid">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/cracking-ice/"><img src="works/cracking-ice/poster.webp" alt="갈라지는 얼음" width="100%"><br><strong>갈라지는 얼음</strong></a><br><sub>힘을 가하면 얼어붙은 표면에 균열이 퍼집니다.</sub><br><a href="works/cracking-ice/source.js">소스 보기</a> · <a href="docs/works.ko.md#cracking-ice">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/frost-window/"><img src="works/frost-window/poster.webp" alt="성에 낀 창" width="100%"><br><strong>성에 낀 창</strong></a><br><sub>성에를 닦아 내고 다시 자라는 모습을 관찰하세요.</sub><br><a href="works/frost-window/source.js">소스 보기</a> · <a href="docs/works.ko.md#frost-window">조작 안내</a></td>
</tr>
<tr>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/zen-garden/"><img src="works/zen-garden/poster.webp" alt="젠 가든" width="100%"><br><strong>젠 가든</strong></a><br><sub>모래에 무늬를 남기고 시간대와 날씨를 바꿉니다.</sub><br><a href="works/zen-garden/source.js">소스 보기</a> · <a href="docs/works.ko.md#zen-garden">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/pottery/"><img src="works/pottery/poster.webp" alt="물레 빚기" width="100%"><br><strong>물레 빚기</strong></a><br><sub>돌아가는 물레 위에서 흙의 형태를 만듭니다.</sub><br><a href="works/pottery/source.js">소스 보기</a> · <a href="docs/works.ko.md#pottery">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/kintsugi/"><img src="works/kintsugi/poster.webp" alt="긴츠기" width="100%"><br><strong>긴츠기</strong></a><br><sub>깨진 도자기를 맞추고 옻칠, 금가루, 연마를 진행합니다.</sub><br><a href="works/kintsugi/source.js">소스 보기</a> · <a href="docs/works.ko.md#kintsugi">조작 안내</a></td>
</tr>
<tr>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/light-painting/"><img src="works/light-painting/poster.webp" alt="라이트 페인팅" width="100%"><br><strong>라이트 페인팅</strong></a><br><sub>빛의 궤적을 겹쳐 소용돌이와 빛의 층을 만듭니다.</sub><br><a href="works/light-painting/source.js">소스 보기</a> · <a href="docs/works.ko.md#light-painting">조작 안내</a></td>
<td width="33%"></td>
<td width="33%"></td>
</tr>
</table>

### 자연과 우주

<table>
<tr>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/sardine-storm/"><img src="works/sardine-storm/poster.webp" alt="정어리 폭풍" width="100%"><br><strong>정어리 폭풍</strong></a><br><sub>소용돌이치는 물고기 떼 사이로 돌고래를 움직여 보세요.</sub><br><a href="works/sardine-storm/source.js">소스 보기</a> · <a href="docs/works.ko.md#sardine-storm">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/jellyfish/"><img src="works/jellyfish/poster.webp" alt="해파리" width="100%"><br><strong>해파리</strong></a><br><sub>반투명한 몸과 부드러운 촉수, 연달아 퍼지는 빛.</sub><br><a href="works/jellyfish/source.js">소스 보기</a> · <a href="docs/works.ko.md#jellyfish">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/saturn-rings/"><img src="works/saturn-rings/poster.webp" alt="토성의 고리" width="100%"><br><strong>토성의 고리</strong></a><br><sub>위성을 던져 넣고 부서져 고리가 되는 모습을 관찰하세요.</sub><br><a href="works/saturn-rings/source.js">소스 보기</a> · <a href="docs/works.ko.md#saturn-rings">조작 안내</a></td>
</tr>
<tr>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/galaxy-collision/"><img src="works/galaxy-collision/poster.webp" alt="은하 충돌" width="100%"><br><strong>은하 충돌</strong></a><br><sub>두 은하가 만나며 별의 궤적이 긴 꼬리를 만듭니다.</sub><br><a href="works/galaxy-collision/source.js">소스 보기</a> · <a href="docs/works.ko.md#galaxy-collision">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/black-hole/"><img src="works/black-hole/poster.webp" alt="블랙홀" width="100%"><br><strong>블랙홀</strong></a><br><sub>강착 원반과 렌즈 효과, 움직이는 별빛.</sub><br><a href="works/black-hole/source.js">소스 보기</a> · <a href="docs/works.ko.md#black-hole">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/solar-limb/"><img src="works/solar-limb/poster.webp" alt="태양의 가장자리" width="100%"><br><strong>태양의 가장자리</strong></a><br><sub>홍염, 태양의 쌀알무늬, 크기 비교용 지구.</sub><br><a href="works/solar-limb/source.js">소스 보기</a> · <a href="docs/works.ko.md#solar-limb">조작 안내</a></td>
</tr>
<tr>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/aurora/"><img src="works/aurora/poster.webp" alt="오로라" width="100%"><br><strong>오로라</strong></a><br><sub>설산과 오두막, 수면 위로 흔들리는 빛의 커튼.</sub><br><a href="works/aurora/source.js">소스 보기</a> · <a href="docs/works.ko.md#aurora">조작 안내</a></td>
<td width="33%"></td>
<td width="33%"></td>
</tr>
</table>

### 공간과 착시

<table>
<tr>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/endless-window/"><img src="works/endless-window/poster.webp" alt="끝없는 창" width="100%"><br><strong>끝없는 창</strong></a><br><sub>여섯 겹의 세계가 이어져 처음 풍경으로 돌아옵니다.</sub><br><a href="works/endless-window/source.js">소스 보기</a> · <a href="docs/works.ko.md#endless-window">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/penrose-tower/"><img src="works/penrose-tower/poster.webp" alt="끝없이 오르는 탑" width="100%"><br><strong>끝없이 오르는 탑</strong></a><br><sub>시점을 돌려 불가능한 계단의 구조를 확인하세요.</sub><br><a href="works/penrose-tower/source.js">소스 보기</a> · <a href="docs/works.ko.md#penrose-tower">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/living-jigsaw/"><img src="works/living-jigsaw/poster.webp" alt="살아 움직이는 퍼즐" width="100%"><br><strong>살아 움직이는 퍼즐</strong></a><br><sub>맞춰진 조각이 움직이고 마지막 조각이 놓이면 버스가 출발합니다.</sub><br><a href="works/living-jigsaw/source.js">소스 보기</a> · <a href="docs/works.ko.md#living-jigsaw">조작 안내</a></td>
</tr>
<tr>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/ocean-in-a-tank/"><img src="works/ocean-in-a-tank/poster.webp" alt="어항 속 바다" width="100%"><br><strong>어항 속 바다</strong></a><br><sub>책상 위 작은 어항 속에 훨씬 넓은 바다가 숨어 있습니다.</sub><br><a href="works/ocean-in-a-tank/source.js">소스 보기</a> · <a href="docs/works.ko.md#ocean-in-a-tank">조작 안내</a></td>
<td width="33%"></td>
<td width="33%"></td>
</tr>
</table>

### 플레이 가능한 장면

<table>
<tr>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/crown-knight/"><img src="works/crown-knight/poster.webp" alt="왕관을 잃은 기사" width="100%"><br><strong>왕관을 잃은 기사</strong></a><br><sub>회피, 경직, 카메라 전환이 있는 보스 전투.</sub><br><a href="works/crown-knight/source.js">소스 보기</a> · <a href="docs/works.ko.md#crown-knight">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/sunset-loop/"><img src="works/sunset-loop/poster.webp" alt="노을 순환도로" width="100%"><br><strong>노을 순환도로</strong></a><br><sub>차량 뒤에서 바라보며 노을을 향해 달립니다.</sub><br><a href="works/sunset-loop/source.js">소스 보기</a> · <a href="docs/works.ko.md#sunset-loop">조작 안내</a></td>
<td width="33%"></td>
</tr>
</table>

### 픽셀 풍경

<table>
<tr>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/thousand-li/"><img src="works/thousand-li/poster.webp" alt="천리강산" width="100%"><br><strong>천리강산</strong></a><br><sub>청록 산수화가 움직이는 두루마리로 펼쳐집니다.</sub><br><a href="works/thousand-li/source.js">소스 보기</a> · <a href="docs/works.ko.md#thousand-li">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/rainbow-bridge/"><img src="works/rainbow-bridge/poster.webp" alt="청명상하도 · 무지개다리" width="100%"><br><strong>청명상하도 · 무지개다리</strong></a><br><sub>배, 노점, 행인이 오가는 작은 두루마리 풍경.</sub><br><a href="works/rainbow-bridge/source.js">소스 보기</a> · <a href="docs/works.ko.md#rainbow-bridge">조작 안내</a></td>
<td width="33%" valign="top"><a href="https://ma1902056219-coder.github.io/openpixel/works/rose-window/"><img src="works/rose-window/poster.webp" alt="고딕 장미창" width="100%"><br><strong>고딕 장미창</strong></a><br><sub>스테인드글라스의 빛이 성당 바닥을 천천히 움직입니다.</sub><br><a href="works/rose-window/source.js">소스 보기</a> · <a href="docs/works.ko.md#rose-window">조작 안내</a></td>
</tr>
</table>

## 나만의 버전으로 바꾸기

작품 폴더 전체를 복사하고 `source.js`를 수정한 뒤 실행 페이지를 새로고침하세요. 먼저 색상이나 수치 하나만 바꾸고 데모와 수동 조작을 모두 확인하는 것이 좋습니다.

원본 프로젝트는 Claude의 도움을 받아 프로그래밍했습니다. 폴더 전체와 구체적인 요청을 GPT, Gemini 등 코딩 도우미에게 전달해 수정할 수도 있습니다. 변경 후에는 반드시 직접 실행해 확인하세요. 예시는 [수정 가이드](docs/guide.ko.md)에 있습니다.

```text
source.js를 읽고 초기화, 프레임별 갱신, 그리기 함수를 찾아주세요.
기존 조작을 유지하면서 밤 풍경의 색상을 노을 색상으로 바꿔주세요.
변경 위치를 먼저 설명하고 외부 이미지, 서비스, 의존성은 추가하지 마세요.
```

## 파일 구성

각 `works/<slug>/` 폴더에는 `index.html`, `source.js`, 읽기 전용 `source.html`, `poster.webp`, 중국어 `README.md`, `LICENSE`가 있습니다. [한국어 작품 조작 안내](docs/works.ko.md)에서 각 작품의 사용법을 확인할 수 있습니다. 폴더 하나만 복사해 사용할 수 있도록 공통 실행 코드도 각 작품에 포함했습니다.

픽셀 아트와 작은 플레이 실험을 모은 프로젝트입니다. 전투와 운전은 단순화된 프로토타입 규칙을 사용합니다. 시스템 글꼴과 무작위 요소 때문에 실행할 때마다 일부 화면이 달라질 수 있습니다.

## 업데이트와 참여

두 차례 공개로 현재 총 31개 작품을 제공합니다. 새로운 효과도 비정기적으로 공개할 예정입니다. 조작성, 시각 효과, 성능 개선을 환영합니다. 문제를 제보할 때는 작품명, 브라우저, 재현 단계를 적어주세요. Pull Request에는 변경 내용과 데모·수동 조작 확인 결과를 함께 적어주세요. 원문 참여 안내는 [CONTRIBUTING.md](CONTRIBUTING.md)에 있습니다.

## 제작자와 라이선스

**喵老弟 [@MarkMFFF](https://x.com/MarkMFFF)**가 정리하고 관리합니다. X에서 작품 데모, 제작 과정, 다음 공개 소식을 볼 수 있습니다.

코드는 [MIT License](LICENSE)로 공개합니다. 재사용 시 저작권 표시와 라이선스 문구를 유지해주세요. 스타일 참고는 상업용 게임이나 브랜드와의 제휴를 뜻하지 않습니다. 원본 파일 해시와 정리 기록은 [SOURCE_NOTES.md](SOURCE_NOTES.md)에 있습니다.
