import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { env } from "hono/adapter";

export const goalRouter = new Hono();

// 継続目標の一覧取得 Post /goals UserId
goalRouter.post("/", async (context) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(context);
  // Req.userId を取得
  const { userId } = await context.req.json<{
    userId: string;
  }>();

  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: DATABASE_URL,
        },
      },
    });

    // 特定Userの継続目標の一覧を取得
    const goals = await prisma.goal.findMany({
      where: { userId },
    });
    return context.json(goals);
  } catch (e) {
    return context.text("Internal Server Error", 500);
  }
});

// 継続目標の新規登録, PUT /goals
goalRouter.put("/", async (context) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(context);

  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: DATABASE_URL,
        },
      },
    });

    // リクエストボディの取り出し
    const { userId, title } = await context.req.json<{
      userId: string;
      title: string;
    }>();

    // パラメータの簡易バリデーション（必要に応じてしっかりとしたチェックを入れる）
    if (!userId || !title) {
      return context.text("Missing parameters", 400);
    }

    // 継続目標の新規登録
    const newGoal = await prisma.goal.create({
      data: {
        userId,
        title,
      },
    });

    // カレンダーもセットで作成する。
    const newCalendar = await prisma.calendar.create({
      data: {
        userId,
        goalId: newGoal.goalId,
        title: newGoal.title,
      },
    });

    return context.json({ goal: newGoal, calendar: newCalendar });
  } catch (e) {
    return context.text("Internal Server Error", 500);
  }
});
