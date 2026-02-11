import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCalendarClient } from "@/services/calendarClient";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).accessToken) {
        return NextResponse.json(
            { message: "로그인이 만료됐어요. 다시 로그인해주세요." },
            { status: 401 }
        );
    }

    try {
        const calendar = getCalendarClient((session as any).accessToken);
        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: "startTime",
        });

        const events = response.data.items?.map((event) => ({
            id: event.id,
            summary: event.summary,
            start: event.start,
            end: event.end,
            location: event.location,
            htmlLink: event.htmlLink,
        })) || [];

        return NextResponse.json(events);
    } catch (error: any) {
        console.error("Calendar API Error:", error);
        return NextResponse.json(
            { message: "일정을 불러오는 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
