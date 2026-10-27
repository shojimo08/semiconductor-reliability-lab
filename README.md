# Semiconductor Reliability Lab

An interactive, multilingual educational application for exploring Weibull-distributed component lifetimes, reproducible Monte Carlo simulation, survival analysis, and conditional failure probability.

This project is an **illustrative statistical reliability simulation**. It is not a physically calibrated chip model, semiconductor fabrication tool, yield predictor, field-reliability qualification system, or ASML equipment predictor.

Languages: English · 繁體中文（台灣） · 日本語

## Overview

The application connects analytical reliability functions with one finite, seeded population of abstract component tiles. Users can adjust Weibull shape `β`, scale `η`, population size `N`, seed, and simulation time; inspect deterministic sampled component lifetimes; and compare theoretical survival with empirical survival.

The applied-mathematics module derives the relationship between probability density, survival, hazard, and cumulative hazard. It also compares the conditional interval risk of a new component with that of a component already known to have survived to age `t₀`.

## Live Demo

Deployment pending verification. A public URL will be added only after the Vercel deployment and all three language variants are checked.

## Screenshots

No screenshots are committed yet. Screenshots will be added only after they are generated from and visually verified against a production build.

## Mathematical Model

For independent, identically distributed lifetimes `Tᵢ ~ Weibull(β, η)`, with `β>0`, `η>0`, and `t≥0`:

```text
CDF:               F(t) = 1 - exp(-(t/η)^β)
Survival:          R(t) = exp(-(t/η)^β)
Hazard:            h(t) = (β/η)(t/η)^(β-1), t > 0
Cumulative hazard: H(t) = (t/η)^β
Relationship:      R(t) = exp(-H(t))
```

Because `R′(t)=-f(t)` and `h(t)=f(t)/R(t)`, it follows that `R′(t)=-h(t)R(t)`. The hazard is not evaluated at exactly zero; for `β<1` it diverges as `t→0+`.

Conditional failure probability for a component known to have survived to age `t₀` is:

```text
P(t₀ < T ≤ t₀+Δ | T > t₀)
= 1 - R(t₀+Δ)/R(t₀)
= 1 - exp(-[((t₀+Δ)/η)^β - (t₀/η)^β])
```

The implementation evaluates the cumulative-hazard increment in the log domain to remain bounded for extreme valid inputs.

### Seeded inverse-CDF sampling

With deterministic `Uᵢ` in the open interval `(0,1)`:

```text
Eᵢ = -ln(1-Uᵢ)
Tᵢ = η Eᵢ^(1/β)
```

The fixed seed and `N` determine the base draws `Eᵢ`. Changing time only reclassifies the same lifetimes; changing `β` or `η` transforms the same base draws. Only changing the seed, changing `N`, or pressing Resample creates a new random population.

## Key Features

- English, Traditional Chinese (`zh-TW`), and Japanese interface with persistent manual selection.
- Interactive abstract 3D component array with orbit, zoom, status colors, and component inspector.
- Seeded, reproducible Monte Carlo lifetimes.
- Theoretical and empirical survival curves.
- Reliability, CDF, hazard, failed count, and surviving count readouts.
- Conditional failure analysis for age `t₀` and future interval `Δ`.
- Exponential, Weibull, and Gompertz assumption comparison.
- Responsive desktop, tablet, and mobile layouts.
- Visible assumptions and limitations in every supported language.

## Technology Stack

- React 19 and TypeScript
- Vite
- Three.js, React Three Fiber, and Drei
- Accessible SVG charts
- Dependency-free typed internationalization context
- Node.js built-in test runner with TypeScript stripping

## Architecture

```text
src/math/          pure probability, reliability, PRNG, and tests
src/sim/           deterministic component records and chart series
src/i18n/          typed dictionaries, locale resolution, context, tests
src/components/    controls, charts, 3D scene, explanations, language UI
src/App.tsx        simulation state and page composition
```

Language state lives in a context above `App`, so switching language rerenders labels without remounting or changing simulation, time, selected component, or random draws. The selected locale is stored in `localStorage`; first-time and unsupported locales resolve to English.

## Getting Started

Requirements: Node.js 24 or newer for the configured TypeScript test command, plus npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

Production build:

```bash
npm run build
npm run preview
```

The Vercel settings are standard Vite defaults:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

No rewrite configuration is required because the application has no client-side routes.

## Automated Tests

```bash
npm test
npm run lint
npm run build
```

The suite covers Weibull identities and edge cases, inverse-CDF determinism, non-resampling on time changes, monotone empirical survival, Monte Carlo convergence, cumulative hazard, conditional failure probability, exponential memorylessness, extreme input handling, translation-key completeness, English fallback, notation preservation, and simulation-state preservation across translation lookup.

## Assumptions

- Component lifetimes are IID Weibull samples.
- Scale `η` and time use arbitrary simulation units.
- Tile position is illustrative and has no spatial statistical meaning.
- Exponential, Weibull, and Gompertz comparisons demonstrate different hazard assumptions; they are not fitted models.
- Conditional failure calculations use survival to `t₀` as the only conditioning information.

## Limitations

- No semiconductor device physics, fabrication process, equipment dynamics, common-cause failure, repair, censoring, confidence intervals, or field calibration.
- No claim that Weibull is universal for semiconductor failure modes.
- No prediction of yield, hardware reliability, safety, maintenance intervals, or ASML equipment failures.
- Finite-sample empirical curves contain expected random variation.
- The visualization is an abstract package and is not physically accurate geometry.

## Academic Integrity / AI-Assisted Development

Mathematical modeling, requirements, validation criteria, interpretation, and design direction are student-led. AI-assisted coding and review were used during implementation. The student remains responsible for understanding the derivations, auditing the source, validating behavior, explaining assumptions, and presenting limitations. AI output is not evidence of physical or engineering validity.

## 中文摘要

本專案是多語言的 Weibull 可靠度教育模擬，結合固定種子的 Monte Carlo 元件壽命、存活函數、危險率、累積危險與條件失效機率。它不是經物理校正的晶片、製程設備或 ASML 設備預測工具；時間均為任意模擬單位。

## 日本語概要

本プロジェクトは、シード付き Monte Carlo 部品寿命、生存関数、ハザード率、累積ハザード、条件付き故障確率を扱う多言語の Weibull 信頼性教育シミュレーションです。物理較正済みチップ、製造装置、ASML 装置の予測ツールではなく、時間は任意のシミュレーション単位です。

## Author and License

Author: Shoji (`@shojimo08`)

Released under the [MIT License](LICENSE).
