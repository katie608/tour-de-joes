# Trader Joe's Scavenger Hunt — App Specification (v3)
## Overview
A mobile-first web app for a one-day scavenger hunt where teams complete challenges to earn points, then spend those points to claim Trader Joe's store locations. The team controlling the most stores at game end wins, with unspent points as tiebreaker.

## Authentication & Accounts
### Team accounts

Any user can self-register a new team with a name and optional password — no invite code, no approval
Everyone on the same team shares one account, usable across multiple devices simultaneously
Sessions persist via stored token — no re-login required on return visits

### Admin account

Single hardcoded account (e.g. admin / hardcoded password), pre-seeded in the database
Admin has access to a management panel (see below)


## Data Model
Teams: name, optional password, unspent points total
Challenges: title, description, point value, media required (yes/no), repeatable (yes/no), repeat limit (if repeatable)
Stores: name, address/location label, added_by
Completions: team, challenge, timestamp, media S3 URL (if applicable)
Store deposits: store, team, points deposited

## Pages & Features
### 1. Challenges Page

Flat list of all challenges, sorted by: incomplete first (in their default order), completed at the bottom
Completed one-time challenges are crossed out and pushed to the bottom
Repeatable challenges show a completion counter (e.g. "3 / 5") — once the limit is reached they are also crossed out and pushed to the bottom
Tapping a challenge opens a detail view with full description, point value, repeat limit (if applicable), and a Submit button (disabled once fully completed)

### 2. Submission Flow

For media challenges: photo/video upload + submit
For non-media challenges: confirm/submit button only
On submit:

Media uploaded to AWS S3: folder named after the challenge, file named {teamname}_{timestamp}.{ext}
Team's unspent point total incremented immediately (self-reported)
Completion recorded; repeat count incremented if repeatable



### 3. Leaderboard / Store Page

List of all stores in play
Each store shows: controlling team (if any) and the points gap to overtake
Tapping a store opens a Store Claim view:

Shows all teams' deposited points at that store
Input to deposit points (deducted from unspent total, added to store)
Teams only need to exceed the current leader by 1 point to take control
Incremental deposits allowed — teams can return and add more



### 4. Media Feed Page

Shows the most recent media uploads across all teams, in reverse chronological order
Each item shows: thumbnail/preview, team name, challenge name, timestamp
Filterable by team and/or by challenge (filters can be combined)
Tapping an item opens the full photo/video

### 5. Add a Store

Available to all logged-in users
Simple form: store name + address/label
Newly added stores are immediately in play

### 6. Team Status Bar (persistent)

Visible across all pages
Shows: team name, unspent points, stores currently controlled

### 7. Final Scores View

Always accessible
Ranked by stores controlled, tiebroken by unspent points
Highlights the leading team

### 8. Admin Panel

Accessible only to the admin account
Delete a store — removes it and all associated deposit records
Delete a team — removes the team, their completions, and their deposits
Soft confirmation prompt before any delete


## Backend & Infrastructure

Hosting: AWS
Database: PostgreSQL (via RDS) or DynamoDB
File Storage: AWS S3 — one folder per challenge, files named {teamname}_{timestamp}.{ext}
API: REST, Node/Express backend
Auth: Session tokens stored in localStorage
Real-time updates: Polling every 30–60 seconds for leaderboard/store state


## Out of Scope

GPS/location verification
Multi-event history or resets
Push notifications
Admin challenge/store management in-app (challenges pre-seeded, stores addable by all users)