# Telemetry Decision Template

Status: decision template only

This template does not implement telemetry. It does not collect data, write
events, add tracking, change runtime behavior, create storage, or publish a
telemetry policy.

## Purpose

Record a future telemetry decision before any telemetry design or
implementation is approved.

## Proposed Telemetry Signals

- `<signal>`
- `<purpose>`
- `<collection boundary>`

## Data Classification

- Classification: `<anonymous | pseudonymous | sensitive | forbidden>`
- Personal data risk: `<pending>`
- Secret/config risk: `<pending>`

## Opt-In / Opt-Out Strategy

- Default posture: `<off unless approved>`
- Opt-in design: `<pending>`
- Opt-out design: `<pending>`

## Retention

- Retention period: `<pending>`
- Deletion policy: `<pending>`
- Review owner: `<pending>`

## Redaction

- Redaction rules: `<pending>`
- Denied fields: `<secrets, tokens, prompts, provider output, config values>`

## User Notice

- Notice location: `<pending>`
- Required wording: `<pending>`

## Storage Location

- Candidate storage: `<pending>`
- Access boundary: `<pending>`

## Access Control

- Allowed roles: `<pending>`
- Audit expectation: `<pending>`

## Risk Review

- Privacy risk: `<pending>`
- Operational risk: `<pending>`
- Release risk: `<pending>`

## Approval Status

- Reviewer: `<pending>`
- Status: `<draft | pending | approved in later phase>`

## Decision

`<defer | reject | approve future design only>`

## Non-Goals

- No telemetry implementation.
- No runtime instrumentation.
- No data collection.
- No storage creation.
- No provider/network calls.
- No production, security, or compliance guarantee.
