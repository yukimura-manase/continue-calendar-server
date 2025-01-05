import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { env } from "hono/adapter";

export const calendarRouter = new Hono();

/**
 * 選択されたカレンダーと、そのカレンダーに紐づく継続日付の一覧を取得する。
 */
calendarRouter.post("/", async (context) => {
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(context);
  // Req.userId を取得
  const { userId, goalId } = await context.req.json<{
    userId: string;
    goalId: string;
  }>();

  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: DATABASE_URL,
        },
      },
    });

    // 特定Userの継続目標に紐づくカレンダーを取得する。
    const calendar = await prisma.calendar.findFirstOrThrow({
      where: { userId, goalId },
    });

    // カレンダーに紐づく継続日付を取得する。
    const continueDates = await prisma.calendarDate.findMany({
      where: { calendarId: calendar.calendarId },
    });

    return context.json({
      calendar,
      continueDates,
    });
  } catch (e) {
    return context.text("Internal Server Error", 500);
  }
});

/**
 * 選択されたカレンダーの継続日付を新規作成 or 削除する。(Toggle)
 *
 * - 成功した場合は、{ isCompleted: true } を返す。
 */
calendarRouter.post("/toggle", async (context) => {
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
    const { userId, calendarId, date } = await context.req.json<{
      userId: string;
      calendarId: string;
      date: Date; // 日付 (yyyy-MM-dd)
    }>();

    // パラメータの簡易バリデーション（必要に応じてしっかりとしたチェックを入れる）
    if (!userId || !calendarId || !date) {
      return context.text("Missing parameters", 400);
    }

    // すでにその日付が登録されているかどうかを確認する。
    const existingRecord = await prisma.calendarDate.findFirst({
      where: { calendarId, date: new Date(date) },
    });

    // その日付が登録されていたら、削除する。
    if (existingRecord) {
      await prisma.calendarDate.delete({
        where: { calendarDateId: existingRecord.calendarDateId },
      });

      return context.json({ isCompleted: true });
    }

    // その日付が登録されていなかったら、新規登録する。
    await prisma.calendarDate.create({
      data: {
        calendarId,
        date: new Date(date),
      },
    });
    return context.json({ isCompleted: true });
  } catch (e) {
    return context.text("Internal Server Error", 500);
  }
});
