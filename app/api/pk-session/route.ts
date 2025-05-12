import { NextRequest, NextResponse } from "next/server";

let useRedis = false;
let redis: any = null;
const EXPIRY_SECONDS = 30 * 60; // 30分钟
const EXPIRY_MS = EXPIRY_SECONDS * 1000;

// 尝试初始化 Redis
import Redis from "ioredis";

if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL);
    useRedis = true;
  } catch (err) {
    console.warn("Redis 初始化失败，使用内存存储", err);
    useRedis = false;
  }
}

// 内存存储，仅开发环境使用
const store: Record<string, { data: any; created: number }> = {};

// 定时清理内存
if (!useRedis) {
  setInterval(() => {
    const now = Date.now();
    for (const id in store) {
      if (now - store[id].created > EXPIRY_MS) {
        delete store[id];
      }
    }
  }, 5 * 60 * 1000);
}

// POST /api/pk-session 存储参数，返回 id
// POST /api/pk-session?action=get 获取参数
import { z } from "zod";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("action") === "get") {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (useRedis) {
      const dataStr = await redis.get(id);
      if (!dataStr) {
        return NextResponse.json(
          { error: "expired or not found" },
          { status: 410 }
        );
      }
      return NextResponse.json(JSON.parse(dataStr));
    } else {
      const record = store[id];
      if (!record) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (Date.now() - record.created > EXPIRY_MS) {
        delete store[id];
        return NextResponse.json({ error: "expired" }, { status: 410 });
      }
      return NextResponse.json(record.data);
    }
  } else {
    const body = await request.json();
    // 使用zod进行参数校验
    // 复用GeneratePKParams参数结构
    const noteSchema = z.object({
      total: z.number(),
      tap: z.number(),
      hold: z.number(),
      slide: z.number(),
      touch: z.number(),
      break: z.number(),
    });
    const songDifficultySchema = z.object({
      type: z.string(),
      difficulty: z.number(),
      level: z.string(),
      level_value: z.number(),
      note_designer: z.string(),
      version: z.number(),
      note: noteSchema,
    });
    const difficultySchema = z.object({
      standard: z.array(songDifficultySchema),
      dx: z.array(songDifficultySchema),
      utage: z.array(songDifficultySchema).optional(),
    });
    const songSchema = z.object({
      id: z.number(),
      title: z.string(),
      artist: z.string(),
      genre: z.string(),
      bpm: z.number(),
      map: z.string(),
      version: z.number(),
      right: z.string(),
      disabled: z.boolean(),
      difficulties: difficultySchema,
    });

    const userMusicDetailSchema = z
      .object({
        achievement: z.number(),
        scoreRank: z.number(),
        level: z.number(),
        playCount: z.number(),
        syncStatus: z.number(),
        comboStatus: z.number(),
        deluxscoreMax: z.number(),
      })
      .passthrough();
    const userDataSchema = z.object({
      userName: z.string(),
      iconId: z.number(),
      userMusicDetail: userMusicDetailSchema,
    });

    const schema = z.object({
      musicId: z.number(),
      musicLevel: z.number(),
      isDX: z.boolean(),
      userId1Data: userDataSchema,
      userId2Data: userDataSchema,
      musicData: songSchema.optional(),
    });
    const parseResult = schema.safeParse(body);
    if (!parseResult.success) {
      // 格式化zod错误信息，便于客户端直接展示
      const errors = parseResult.error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      return NextResponse.json(
        { code: 1, message: "参数错误", errors },
        { status: 200 }
      );
    }
    const data = parseResult.data;
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    if (useRedis) {
      await redis.setex(id, EXPIRY_SECONDS, JSON.stringify(data));
    } else {
      store[id] = { data, created: Date.now() };
    }
    return NextResponse.json({ code: 0, id });
  }
}
