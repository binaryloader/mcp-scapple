[English](../../../README.md) | **한국어** | [日本語](../ja/README.md)

# mcp-scapple

[![npm version](https://img.shields.io/npm/v/@binaryloader/mcp-scapple)](https://www.npmjs.com/package/@binaryloader/mcp-scapple)

[Scapple](https://www.literatureandlatte.com/scapple/overview)(.scap) 파일을 읽고, 쓰고, 렌더링하기 위한 MCP(Model Context Protocol) 서버이다. Scapple은 Literature & Latte가 만든 브레인스토밍 도구이며 다이어그램을 XML 형식으로 저장한다. 이 서버는 AI 어시스턴트가 Scapple 파일을 직접 다룰 수 있게 해준다.

## Features

- **read-scapple**: .scap 파일을 노트, 배경 도형, 노트 스타일, 연결 정보가 담긴 구조화된 JSON으로 파싱한다
- **write-scapple**: 구조화된 노트 데이터로부터 .scap 파일을 생성하며 양방향 연결을 자동으로 관리한다
- **text-to-scapple**: 들여쓰기 텍스트, 불릿 목록, 번호 목록을 Scapple 다이어그램으로 변환하며 자동 레이아웃과 선택적 테마 렌더링을 지원한다
- **scapple-to-image**: .scap 파일을 PNG로 렌더링하며 배경, 색상, 폰트, 그림자, 패턴 등 전체 테마를 지원한다

## Examples

자연어로 다이어그램을 만들고 렌더링할 수 있다.

> "디자인, 백엔드, 테스트 가지를 가진 모바일 앱 개발 브레인스토밍 다이어그램을 만들어줘"

![Default theme](../../../examples/example-default.png)

> "그 다이어그램을 다크 테마로 렌더링해줘 - 네이비 배경, 점 패턴, 그림자 없음"

![Dark theme](../../../examples/example-dark.png)

### Theme Options

`scapple-to-image`와 `text-to-scapple` 도구는 선택 파라미터 `theme`을 받으며 다음 속성을 지원한다. 모든 속성은 선택 사항이다. 생략하면 `.scap` 파일의 설정 값을 먼저 사용하고 그래도 없으면 아래 기본값을 사용한다.

#### Canvas

| 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `backgroundColor` | string | `#ffffff` | 캔버스 배경색(hex) |
| `backgroundPattern` | string | `none` | 패턴 종류: `none`, `dots`, `grid`, `lines` |
| `patternColor` | string | `#cccccc` | 패턴 색상(hex) |

#### Notes

| 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `strokeColor` | string | `#cccccc` | 노트 테두리 색상(hex) |
| `strokeWidth` | number | `1` | 노트 테두리 두께 |
| `borderRadius` | number | `8` | 둥근 노트 모서리 반경 |
| `shadowColor` | string | `#00000033` | 그림자 색상(알파 포함 hex) |
| `shadowEnabled` | boolean | `true` | 그림자 활성/비활성 |
| `defaultFill` | string | `none` | 기본 노트 채움색(hex) |
| `defaultBorder` | string | `None` | 기본 테두리 스타일: `Rounded`, `Square`, `Cloud`, `None` |

#### Text

| 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `defaultFont` | string | `Helvetica` | 기본 폰트 패밀리 |
| `defaultFontSize` | number | `12` | 기본 폰트 크기 |
| `defaultTextColor` | string | `#000000` | 기본 텍스트 색상(hex) |
| `defaultAlignment` | string | `Center` | 기본 텍스트 정렬: `Left`, `Center`, `Right` |
| `noteXPadding` | number | `8` | 노트 내부 가로 패딩 |

#### Connections

| 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `lineColor` | string | `#666666` | 연결선 색상(hex) |
| `lineWidth` | number | `1` | 연결선 두께 |
| `arrowColor` | string | `#666666` | 화살표 색상(hex) |

### Scapple File Settings

`.scap` 파일을 렌더링할 때 다음 설정 값이 파일에서 읽혀 테마 기본값으로 사용된다(명시적 `theme` 파라미터가 있으면 그쪽이 우선한다).

- `BackgroundColor` → `backgroundColor`
- `DefaultTextColor` → `defaultTextColor`
- `DefaultFont`(UISettings) → `defaultFont`
- `NoteXPadding`(UISettings) → `noteXPadding`

노트별 외형 설정(테두리 색, 두께, 텍스트 색, 채움, 폰트, 굵게/기울임)은 항상 테마 기본값보다 우선 적용된다.

## Components

| 경로 | 설명 |
|---|---|
| `src/index.ts` | MCP 서버 진입점 |
| `src/types.ts` | TypeScript 타입 정의 |
| `src/errors.ts` | 커스텀 에러 클래스 계층 |
| `src/lib/parser.ts` | .scap XML을 ScappleDocument로 변환하는 파서 |
| `src/lib/builder.ts` | ScappleDocument를 .scap XML로 만드는 빌더 |
| `src/lib/renderer.ts` | SVG/PNG 렌더링 파이프라인 |
| `src/lib/layout.ts` | 텍스트를 다이어그램으로 변환하는 자동 레이아웃 |
| `src/lib/svg/` | SVG 생성 모듈(도형, 연결, 텍스트, defs) |
| `src/tools/` | MCP 도구 핸들러 |
| `examples/` | 렌더링 샘플 |

## Requirements

- Node.js 18+
- npm

## Usage

### Configure in Claude Code

```bash
claude mcp add --transport stdio --scope user scapple -- npx -y @binaryloader/mcp-scapple
```

### Tool Usage

**read-scapple** - Scapple 파일 읽기:
```
filePath: "/path/to/diagram.scap"
```

**write-scapple** - Scapple 파일 생성:
```
filePath: "/path/to/output.scap"
document: { notes: [{ x: 100, y: 100, text: "Hello" }] }
```

**text-to-scapple** - 텍스트를 다이어그램으로 변환:
```
text: "Root Topic\n  Branch A\n    Leaf 1\n  Branch B"
filePath: "/path/to/output.scap"
renderImage: true
```

**scapple-to-image** - PNG로 렌더링:
```
filePath: "/path/to/diagram.scap"
scale: 2
theme: { backgroundColor: "#1a1a2e", backgroundPattern: "dots", shadowEnabled: false }
```

## License

This project is licensed under the MIT License - see the [LICENSE](../../../LICENSE) file for details.
