# Design direction — Data Centre Energy Analytics

## Series role

Project 01 of the **Daniel Santos Infrastructure Analytics Series**. The site must feel like one member of a coherent research product family while preserving this project's subject-specific identity.

## Audience

Recruiters, data/energy professionals, infrastructure practitioners and technically curious readers. The interface must support two reading speeds:

1. a two-minute executive scan;
2. a detailed evidence/methodology review.

## Single job

How has data-centre growth changed Ireland’s electricity demand, and what could continued growth mean through 2035?

## Visual system

- Background: `#06111B`
- Deep surface: `#0B1A26`
- Primary text: `#F2F7FA`
- Muted text: `#91A6B5`
- Project accent: `#3DDC97`
- Evidence green: `#7ED8A4`
- Constraint amber: `#F3B45D`
- Risk coral: `#F27668`

Typography is a disciplined system sans for narrative, with monospace reserved for project numbers, evidence labels, units and provenance.

## Signature

A demand-growth trajectory: measured history on the left, uncertainty and system implications on the right.

## Information architecture

Every project follows the same mental model:

`Question → Evidence → Analysis → Finding → Limitations → Sources → Next project`.

The shared series ribbon and five-project navigator are persistent family elements. Project-specific story sections remain independent.

## Interaction contract

- Core narrative remains readable without JavaScript.
- Interactive charts enhance understanding; they never hide the conclusion.
- Keyboard focus must be visible.
- Motion respects `prefers-reduced-motion`.
- Mobile layouts preserve reading order and never require horizontal page scrolling.
- Methodology and source links must remain available from the page, not only from GitHub.
