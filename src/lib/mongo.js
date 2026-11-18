import { MongoClient } from "mongodb";

// MongoDB is optional: it stores a free-form activity feed (who did what).
// If MONGODB_URI is not set, everything here quietly does nothing.
const g = globalThis;

function collection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  g.__stagehandMongo ??= new MongoClient(uri, { serverSelectionTimeoutMS: 3000 }).connect();
  return g.__stagehandMongo.then((c) =>
    c
      .db(process.env.MONGODB_DB || "concert_deployment_logs")
      .collection(process.env.MONGODB_COLLECTION || "activity_logs")
  );
}

// Fire-and-forget: a Mongo outage must never break a MySQL write.
export function logActivity(session, action, entity, entityId, details = {}) {
  const col = collection();
  if (!col) return;
  col
    .then((c) =>
      c.insertOne({
        actor: { username: session?.username, role: session?.role },
        action,
        entity,
        entityId,
        details,
        at: new Date(),
      })
    )
    .catch((e) => console.error("Mongo activity log failed:", e.message));
}

export async function recentActivity(limit = 50) {
  const col = collection();
  if (!col) return { configured: false, items: [] };
  const c = await col;
  const docs = await c.find({}).sort({ _id: -1 }).limit(limit).toArray();
  return { configured: true, items: docs.map((d) => ({ ...d, _id: String(d._id) })) };
}
