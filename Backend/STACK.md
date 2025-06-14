# VibeChess Backend Technology Stack

## MVP Stack

### **ASP.NET Core 8 Web API**

- **Purpose**: REST API endpoints and SignalR hub hosting
- **Why**: High performance, cross-platform, excellent SignalR integration
- **Usage**: Game logic, lobby management, real-time communication

### **SignalR**

- **Purpose**: Real-time bidirectional communication
- **Why**: Perfect for live chess games, instant updates, low latency
- **Usage**:
  - Player connections and disconnections
  - Live move broadcasting
  - Lobby updates and chat
  - Game state synchronization
  - Timer countdown updates

### **Redis**

- **Purpose**: In-memory data store and caching
- **Why**: Ultra-fast read/write, perfect for real-time game state
- **Usage**:
  - **Game State Storage**: Current FEN, player assignments, turn info
  - **Lobby Management**: Active lobbies, room codes, player lists
  - **Session Management**: Connection IDs, player mappings
  - **Caching**: Frequently accessed data
  - **SignalR Backplane**: Scale SignalR across multiple servers (future)

## Future Expansion

### **PostgreSQL**

- **Purpose**: Persistent data storage
- **Why**: ACID compliance, excellent JSON support, scalable
- **Usage**:
  - **Game History**: Complete game records, move history
  - **Player Statistics**: Win/loss records, ratings
  - **Analytics**: Game duration, popular moves, player behavior
  - **User Management**: Accounts, preferences (when authentication added)

## Architecture Flow

```
Frontend (React/Vite)
    ↕ WebSocket (SignalR)
ASP.NET Core Web API
    ↕ In-Memory Cache
Redis (Game State)
    ↕ Persistence (Future)
PostgreSQL (History)
```

## MVP Data Flow

1. **Player joins lobby** → Store in Redis
2. **Game starts** → Convert lobby to active game in Redis
3. **Moves made** → Update Redis game state, broadcast via SignalR
4. **Game ends** → Keep final state in Redis (cleanup later)

## Benefits of This Stack

### **Performance**

- **Redis**: Sub-millisecond response times
- **SignalR**: WebSocket connections for real-time updates
- **In-Memory**: No database I/O during active gameplay

### **Scalability**

- **Redis**: Handle thousands of concurrent games
- **SignalR**: Efficient connection management
- **Stateless API**: Easy horizontal scaling

### **Development Speed**

- **Redis**: Simple key-value operations
- **SignalR**: Built-in real-time features
- **No ORM complexity**: Direct Redis operations for MVP

## Implementation Notes

### **Redis Key Structure**

```
lobby:{roomCode} → Lobby object
game:{gameId} → Game state
player:{connectionId} → Player info
active-games → Set of active game IDs
```

### **SignalR Groups**

```
lobby-{roomCode} → All players in lobby
game-{gameId} → All players in active game
captain-{gameId} → Captain-only notifications
```

## Concurrent User Management

### **Connection Handling**

- **WebSocket Connections**: Each player maintains a persistent SignalR connection
- **Connection Mapping**: Redis stores `conn:{connectionId} → playerId` mapping
- **Heartbeat System**: Regular ping/pong to detect disconnections
- **Reconnection Support**: Players can rejoin with same player ID, update connection ID

### **Lag and Disconnection Handling**

#### **Player Disconnects During Turn**

```
1. Player's turn starts → 10-second timer begins
2. Player disconnects → Timer continues running
3. Timer expires → Server picks random legal move automatically
4. Game continues → Other players see "auto-move" indicator
5. Player reconnects → Rejoins game, sees current state
```

#### **Captain Disconnects (Captain Mode)**

```
1. Captain needs to select piece → Timer starts
2. Captain disconnects → Server auto-selects random moveable piece
3. Selected player makes move → Game continues normally
4. Captain reconnects → Sees current game state, can resume choosing pieces
```

#### **Connection State Management**

```csharp
// Redis stores connection states
conn:{connectionId} → playerId
player-connection:{playerId} → current connectionId
disconnected-players:{gameId} → Set of temporarily disconnected player IDs
```

### **Concurrent Game Scaling**

- **Redis Clustering**: Distribute games across Redis nodes
- **SignalR Backplane**: Redis enables multiple server instances
- **Stateless Design**: Any server can handle any request
- **Load Balancing**: Sticky sessions not required

## Move Ordering and Synchronization

### **Why Timestamp is Critical**

#### **Race Condition Prevention**

```
Scenario: Player makes move just as timer expires
1. Player clicks move at 9.99 seconds
2. Server auto-move triggers at 10.00 seconds
3. Both moves arrive at server simultaneously
4. Timestamp determines which move is valid
```

#### **Move Ordering in Game History**

```csharp
// Moves stored with precise timestamps
var moves = await redis.ListGetAllAsync($"game:{gameId}:moves");
var orderedMoves = moves
    .Select(m => JsonSerializer.Deserialize<RedisMove>(m))
    .OrderBy(m => m.Timestamp)  // ← Critical for replay accuracy
    .ToList();
```

#### **Network Latency Compensation**

```
1. Player makes move → Timestamp recorded on server (not client)
2. Server processes move → Updates game state immediately
3. Broadcast to all players → Everyone sees synchronized state
4. Late packets ignored → Timestamp prevents out-of-order issues
```

### **Real-Time Synchronization Flow**

```
1. Move submitted → Server validates + timestamps
2. Redis updated → Game state + move history
3. SignalR broadcast → All players receive update simultaneously
4. Client validation → Ensure move sequence matches server
```

### **Conflict Resolution**

- **Server Authority**: Server timestamp is source of truth
- **Client Prediction**: UI shows immediate feedback, corrects if needed
- **Rollback Support**: Invalid moves trigger state refresh from server

## Performance at Scale

### **Concurrent Games Capacity**

- **Target**: 1000+ simultaneous games
- **Per Game**: ~10-32 players average
- **Total Players**: 10,000+ concurrent users
- **Redis Memory**: ~100MB for 1000 active games
- **SignalR Connections**: Scales to 100,000+ with Redis backplane

This stack provides excellent performance for real-time chess gameplay while keeping the MVP simple and focused.
