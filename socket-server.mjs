import { Server } from "socket.io";
import { createServer } from "http";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'yks_yildizi.db');
const db = new Database(dbPath);

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("Kullanıcı bağlandı:", socket.id);

  socket.on("join-room", ({ roomId, user }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    
    const roomUsers = rooms.get(roomId);
    roomUsers.set(socket.id, {
      ...user,
      socketId: socket.id,
      timerState: 'paused',
      timeLeft: 25 * 60
    });

    try {
      // Upsert into room_participants so the Next.js API can read it
      db.prepare(`
        INSERT INTO room_participants (room_id, user_id, joined_at, last_active) 
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(room_id, user_id) DO UPDATE SET last_active = CURRENT_TIMESTAMP
      `).run(roomId, user.id);
    } catch(e) { console.error("DB Error:", e.message) }

    io.to(roomId).emit("room-users", Array.from(roomUsers.values()));
    
    socket.to(roomId).emit("new-message", {
      id: Date.now().toString(),
      sender: "Sistem",
      text: `${user.username} odaya katıldı!`,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });
  });

  socket.on("send-message", ({ roomId, message }) => {
    io.to(roomId).emit("new-message", message);
  });

  socket.on("update-timer", ({ roomId, timerState, timeLeft }) => {
    const roomUsers = rooms.get(roomId);
    if (roomUsers && roomUsers.has(socket.id)) {
      const user = roomUsers.get(socket.id);
      user.timerState = timerState;
      user.timeLeft = timeLeft;
      io.to(roomId).emit("room-users", Array.from(roomUsers.values()));
      
      try {
        db.prepare('UPDATE room_participants SET last_active = CURRENT_TIMESTAMP WHERE user_id = ? AND room_id = ?').run(user.id, roomId);
      } catch(e) {}
    }
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id && rooms.has(roomId)) {
        const roomUsers = rooms.get(roomId);
        const user = roomUsers.get(socket.id);
        
        if (user) {
          roomUsers.delete(socket.id);
          io.to(roomId).emit("room-users", Array.from(roomUsers.values()));
          io.to(roomId).emit("new-message", {
            id: Date.now().toString(),
            sender: "Sistem",
            text: `${user.username} odadan ayrıldı.`,
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            isSystem: true
          });
          
          try {
            db.prepare('DELETE FROM room_participants WHERE user_id = ? AND room_id = ?').run(user.id, roomId);
          } catch(e) {}
        }
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı ayrıldı:", socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO Sunucusu http://localhost:${PORT} adresinde çalışıyor`);
});

// --- DUELLO (ARENA) MANTIĞI ---
const duelQueue = [];
const activeDuels = new Map();

io.on("connection", (socket) => {
  
  socket.on("join-duel-queue", ({ user }) => {
    // Check if user is already in a duel
    let existingDuelId = null;
    for (const [dId, duel] of activeDuels.entries()) {
      if (duel.p1.id === user.id || (duel.p2 && duel.p2.id === user.id)) {
        existingDuelId = dId;
        break;
      }
    }

    if (existingDuelId) {
      socket.emit("duel-start", { duelId: existingDuelId });
      return;
    }

    // Matchmaking
    if (duelQueue.length > 0) {
      const opponent = duelQueue.shift();
      if (opponent.socket.id === socket.id) return; // Same user
      
      const duelId = `duel-${Date.now()}`;
      
      const duelState = {
        id: duelId,
        p1: opponent.user,
        p2: user,
        p1Socket: opponent.socket.id,
        p2Socket: socket.id,
        round: 1,
        p1Score: 0,
        p2Score: 0,
        questions: getFiveRandomQuestions(),
        status: 'starting'
      };
      
      activeDuels.set(duelId, duelState);
      
      opponent.socket.join(duelId);
      socket.join(duelId);
      
      io.to(duelId).emit("duel-start", { duelId, state: duelState });
      
      // Start Countdown
      setTimeout(() => {
        duelState.status = 'active';
        io.to(duelId).emit("duel-update", duelState);
      }, 3000);
      
    } else {
      duelQueue.push({ socket, user });
      socket.emit("duel-waiting");
      
      // Bot Fallback (If no one joins in 5 seconds)
      setTimeout(() => {
        const queueIndex = duelQueue.findIndex(q => q.socket.id === socket.id);
        if (queueIndex !== -1) {
          duelQueue.splice(queueIndex, 1);
          
          const duelId = `duel-bot-${Date.now()}`;
          const botUser = { id: 'bot-1', username: 'AstraBot', league: 'Şampiyon' };
          
          const duelState = {
            id: duelId,
            p1: user,
            p2: botUser,
            p1Socket: socket.id,
            p2Socket: 'bot',
            round: 1,
            p1Score: 0,
            p2Score: 0,
            questions: getFiveRandomQuestions(),
            status: 'starting',
            isBot: true
          };
          
          activeDuels.set(duelId, duelState);
          socket.join(duelId);
          socket.emit("duel-start", { duelId, state: duelState });
          
          setTimeout(() => {
            duelState.status = 'active';
            io.to(duelId).emit("duel-update", duelState);
            simulateBotAnswers(duelId);
          }, 3000);
        }
      }, 5000);
    }
  });

  socket.on("duel-answer", ({ duelId, userId, answerIndex, timeTakenMs }) => {
    const duel = activeDuels.get(duelId);
    if (!duel) return;
    
    const currentQ = duel.questions[duel.round - 1];
    const isCorrect = currentQ.options[answerIndex] === currentQ.correct;
    const score = isCorrect ? Math.max(10, 100 - Math.floor(timeTakenMs / 100)) : 0;
    
    if (duel.p1.id === userId) duel.p1Score += score;
    else if (duel.p2.id === userId) duel.p2Score += score;
    
    io.to(duelId).emit("duel-player-answered", { userId, isCorrect, score });
    
    // Check if both answered
    // (Simplified logic: in a real app, track individual answers)
  });
});

function getFiveRandomQuestions() {
  // Same mock questions for socket
  return [
    { text: 'Aşağıdakilerden hangisi asal sayıdır?', options: ['9', '15', '21', '23', '27'], correct: '23' },
    { text: 'Dünyanın uydusu aşağıdakilerden hangisidir?', options: ['Güneş', 'Mars', 'Ay', 'Venüs', 'Jüpiter'], correct: 'Ay' },
    // ... just mock 5
  ];
}

function simulateBotAnswers(duelId) {
  // bot logic here
}
