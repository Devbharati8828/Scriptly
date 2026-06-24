import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// ─── POST /api/ai/chat ─────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Fetch user context from DB
    const [users] = await pool.query('SELECT name FROM User WHERE id = ?', [userId]);
    const [meds] = await pool.query(
      'SELECT brandName, genericName, dosage, frequency, pillCount, status FROM Medication WHERE userId = ?',
      [userId]
    );
    const [refills] = await pool.query(
      `SELECT r.status, r.requestedAt, m.brandName 
       FROM RefillRequest r 
       JOIN Medication m ON r.medicationId = m.id 
       WHERE r.userId = ?
       ORDER BY r.requestedAt DESC LIMIT 5`,
      [userId]
    );
    const [doses] = await pool.query(
      `SELECT dl.takenAt, m.brandName 
       FROM DoseLog dl 
       JOIN Medication m ON dl.medicationId = m.id 
       WHERE dl.userId = ?
       ORDER BY dl.takenAt DESC LIMIT 5`,
      [userId]
    );

    const userName = users[0]?.name?.split(' ')[0] || 'there';
    const msg = message.toLowerCase().trim();

    // Build contextual response
    let reply = '';

    // — Greetings —
    if (/^(hi|hello|hey|hola|good morning|good evening|good afternoon|what's up|sup)/.test(msg)) {
      reply = `Hi ${userName}! 👋 I'm your Scriptly AI Health Assistant. I can help you with:\n\n• Your medication schedule and pill counts\n• Refill status and requests\n• Dose adherence history\n• General medication questions\n\nWhat would you like to know today?`;
    }

    // — Medication list —
    else if (/\b(medication|medicine|med|pills|prescription|drug)\b/.test(msg) && /\b(list|show|what|all|my)\b/.test(msg)) {
      if (meds.length === 0) {
        reply = `You don't have any medications added yet, ${userName}. Head to the **Medications** tab to add your first prescription.`;
      } else {
        const medList = meds.map((m) => {
          const statusIcon = m.status === 'ACTIVE' ? '✅' : m.status === 'LOW_SUPPLY' ? '⚠️' : '🔄';
          return `${statusIcon} **${m.brandName}** (${m.genericName || m.brandName}) — ${m.dosage}, ${m.frequency}, ${m.pillCount} pills left`;
        }).join('\n');
        reply = `Here are your current medications, ${userName}:\n\n${medList}\n\n💡 Tip: Tap ⋯ on any medication card to request a refill or edit the schedule.`;
      }
    }

    // — Low supply / refill soon —
    else if (/\b(low|running out|almost|soon|few pills|refill|need)\b/.test(msg)) {
      const lowMeds = meds.filter((m) => m.status === 'LOW_SUPPLY' || m.status === 'PENDING_REFILL' || m.pillCount <= 10);
      if (lowMeds.length === 0) {
        reply = `Great news! 🎉 All your medications are well-stocked right now, ${userName}. No immediate refills needed.`;
      } else {
        const lowList = lowMeds.map((m) => `⚠️ **${m.brandName}** — only ${m.pillCount} pills remaining`).join('\n');
        reply = `You should refill these medications soon, ${userName}:\n\n${lowList}\n\n➡️ Go to **My Medications** and click "Request Refill" to submit a refill request.`;
      }
    }

    // — Refill status —
    else if (/\b(refill|refills|pending|submitted|requested)\b/.test(msg)) {
      if (refills.length === 0) {
        reply = `No refill requests found, ${userName}. You can request a refill from the **Medications** tab by clicking ⋯ next to any medication.`;
      } else {
        const refillList = refills.map((r) => {
          const date = new Date(r.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const statusIcon = r.status === 'pending' ? '🕐' : r.status === 'approved' ? '✅' : '❌';
          return `${statusIcon} **${r.brandName}** — ${r.status} (requested ${date})`;
        }).join('\n');
        reply = `Here are your recent refill requests, ${userName}:\n\n${refillList}`;
      }
    }

    // — Dose history / adherence —
    else if (/\b(dose|doses|took|taken|adherence|history|logged|track)\b/.test(msg)) {
      if (doses.length === 0) {
        reply = `No dose logs found yet, ${userName}. You can log a dose from the **Dashboard** by clicking "Take Dose" on your medication card.`;
      } else {
        const doseList = doses.map((d) => {
          const date = new Date(d.takenAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          return `✅ **${d.brandName}** — taken at ${date}`;
        }).join('\n');
        reply = `Your recent dose history, ${userName}:\n\n${doseList}\n\n🏆 Great job staying consistent with your medications!`;
      }
    }

    // — Pill count specific —
    else if (/\b(how many|count|remaining|left|pills|tablets)\b/.test(msg)) {
      if (meds.length === 0) {
        reply = `No medications found, ${userName}. Add your prescriptions in the **Medications** tab.`;
      } else {
        const countList = meds.map((m) => {
          const icon = m.pillCount > 10 ? '🟢' : m.pillCount > 5 ? '🟡' : '🔴';
          return `${icon} **${m.brandName}**: ${m.pillCount} pills remaining`;
        }).join('\n');
        reply = `Here's your current pill inventory, ${userName}:\n\n${countList}`;
      }
    }

    // — Help —
    else if (/\b(help|what can you|how can you|capabilities|can you)\b/.test(msg)) {
      reply = `I'm your **Scriptly AI Health Assistant** 🤖. Here's what I can help with:\n\n📋 **"Show my medications"** — view your full medication list\n⚠️ **"What needs a refill?"** — see low-stock medications\n🔄 **"Refill status"** — check pending refill requests\n📅 **"Dose history"** — see recent dose logs\n💊 **"How many pills do I have?"** — see pill counts\n\nJust ask me anything about your health routine!`;
    }

    // — Thanks —
    else if (/\b(thanks|thank you|ty|thx|great|awesome|perfect)\b/.test(msg)) {
      reply = `You're welcome, ${userName}! 😊 I'm always here if you need help managing your medications. Stay healthy! 💊`;
    }

    // — Goodbye —
    else if (/\b(bye|goodbye|see you|cya|later)\b/.test(msg)) {
      reply = `Take care, ${userName}! 👋 Remember to take your medications on time. Come back anytime!`;
    }

    // — Default intelligent fallback —
    else {
      const medNames = meds.map((m) => m.brandName).join(', ') || 'none yet';
      reply = `I'm here to help with your medication management, ${userName}. 😊\n\nYou currently have these medications: **${medNames}**.\n\nYou can ask me:\n• "Show my medications"\n• "What needs a refill?"\n• "Refill status"\n• "Dose history"\n• "How many pills do I have?"\n\nWhat would you like to know?`;
    }

    res.json({ reply });
  } catch (error) {
    console.error('[POST /api/ai/chat]', error);
    res.status(500).json({ error: 'AI assistant is temporarily unavailable.' });
  }
});

export default router;
