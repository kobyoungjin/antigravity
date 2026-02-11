import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCalendarClient } from "@/services/calendarClient";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).accessToken) {
        return NextResponse.json(
            { message: "로그인이 만료됐어요. 다시 로그인해주세요." },
            { status: 401 }
        );
    }

    try {
        const { draft } = await req.json();
        if (!draft.title || !draft.startISO || !draft.endISO) {
            return NextResponse.json(
                { message: "필수 입력 정보가 누락되었습니다." },
                { status: 400 }
            );
        }

        const calendar = getCalendarClient((session as any).accessToken);
        const response = await calendar.events.insert({
            calendarId: "primary",
            requestBody: {
                summary: draft.title,
                start: { dateTime: draft.startISO },
                end: { dateTime: draft.endISO },
                location: draft.location,
            },
        });

        return NextResponse.json({
            id: response.data.id,
            htmlLink: response.data.htmlLink,
        });
    } catch (error: any) {
        console.error("Calendar Create Error:", error);
        return NextResponse.json(
            { message: "캘린더에 저장하지 못했어요. 다시 시도해주세요." },
            { status: 500 }
        );
    }
}
