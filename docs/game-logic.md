# VibeChess Game Rules

## Overview

VibeChess is a team-based chess game where players collaborate to make moves. This document outlines the core game rules and flow.

## Table of Contents

- [Lobby Setup](#lobby-setup)
- [Team Formation](#team-formation)
- [Game Start](#game-start)
- [Gameplay](#gameplay)
- [Player Management](#player-management)
- [Leadership & Succession Rules](#leadership--succession-rules)

## Lobby Setup

### Lobby Creation

1. **Player creates lobby** → Automatically becomes **Captain of White Team**
2. **Prompted to set team name** (e.g., "Team Thunder")
3. **Lobby owner** has control over game settings (for MVP: minimal settings)

### First Joiner

1. **First player to join** → Automatically becomes **Captain of Black Team**
2. **Prompted to set team name** (e.g., "Team Lightning")

## Team Formation

### Joining Teams

1. **New players see team selection screen** with current team names:

   ```
   Join Team Thunder (White) - 3/6 players
   Join Team Lightning (Black) - 2/6 players
   ```

2. **Team capacity enforcement**:
   - If a team is full, join button is **greyed out**
   - Players can only join available teams

### Team Management

- **Any captain** can change their team name at any time
- **Lobby owner** can reassign Captain of Black Team (but not White - that's always the owner)
- **Lobby owner** controls all game settings
- **Player list sorting**: Captains are automatically sorted to the top of their team lists

## Game Start

### Start Requirements

- **Exactly 2 captains required** (one per team) - game cannot start without both
- **No maximum player requirement** - game can start with just 2 people
- **Only lobby owner** can start the game

### Piece Assignment

When game starts:

- Each player is assigned specific chess pieces
- **Unassigned pieces** are controlled by the team captain
- Captains can move any piece on their side

## Gameplay

### Move Process

**Two-Step Move System:**

1. **Captain selects piece** → Which piece will move this turn
2. **Player/Captain chooses move** → How that piece will move

### Move Authority

1. **Assigned pieces**:
   - Captain selects the piece
   - Assigned player chooses the move (10 seconds)
   - If player timer expires → Captain chooses move (10 seconds)
2. **Unassigned pieces**:
   - Captain selects the piece
   - Captain chooses the move (10 seconds)

### Timer System

**Move Timers:**

- **Player move decision**: 10 seconds
- **Captain backup decision**: 10 seconds
- **Auto-move**: Random legal move if all timers expire

**Timer Flow:**

```
Captain selects piece → Player has 10s → Captain has 10s → Random move
                    (if assigned)      (if timer expires)   (if timer expires)
```

### Team Coordination

- Players can discuss moves via team chat
- Captain has **final piece selection** authority
- Real-time highlighting shows selected piece and whose move decision it is

## Player Management

### Leadership Succession

1. **Lobby owner leaves** → Next player in White team list becomes new lobby owner and White captain
2. **White captain leaves (mid-game)** → Next White team player becomes captain
3. **Black captain leaves** → Next Black team player becomes captain
4. **Automatic sorting**: Captains are always displayed at the top of their team lists

### Disconnections

1. **Player disconnects** → Their pieces become **captain-controlled**
2. **Player reconnects** → Automatically regains control of their pieces (if still alive)
3. **Captain disconnects** → Next team member becomes captain (succession rules above)

### Mid-Game Rules

- **Piece ownership** is persistent (pieces "remember" their assigned player)
- **Dead pieces** cannot be reassigned
- **Reconnected players** only get their original pieces back
- **Captain succession** happens immediately when needed

### Game End Conditions

- **Team elimination**: If either team has **0 players**, the game immediately ends
- **Opponent team wins** by default when a team is completely empty
- **Standard chess endings**: Checkmate, stalemate, resignation, etc.

## Leadership & Succession Rules

**Captain Requirements:**

- **Exactly 2 captains** must exist at all times (one per team)
- Game cannot start or continue without both captains

**Succession Order:**

1. **Lobby Owner Leaves** → Next player in White team list becomes lobby owner + White captain
2. **Captain Leaves (Any Time)** → Next player in that team becomes captain
3. **Automatic Promotion** → No manual assignment needed, happens immediately

**Display Rules:**

- Captains are **always sorted to top** of their team lists
- This ensures consistent succession order (next in list = next captain)

---

## Quick Reference

**Lobby Owner Powers:**

- Create team name (White)
- Change game settings
- Reassign Black team captain
- Start game

**Captain Powers:**

- Change own team name
- Control unassigned pieces
- Make final move decisions

**Player Powers:**

- Control assigned pieces
- Participate in team chat
- Suggest moves
