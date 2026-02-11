import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCalendarClient } from "@/services/calendarClient";

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).accessToken) {
        return NextResponse.json(
            { message: "로그인이 만료됐어요. 다시 로그인해주세요." },
            { status: 401 }
        );
    }

    try {
        const { eventId, patch } = await req.json();
        if (!eventId) {
            return NextResponse.json({ message: "Event ID가 필요합니다." }, { status: 400 });
        }

        const calendar = getCalendarClient((session as any).accessToken);
        const requestBody: any = {};
        if (patch.title) requestBody.summary = patch.title;
        if (patch.startISO) requestBody.start = { dateTime: patch.startISO };
        if (patch.endISO) requestBody.end = { dateTime: patch.endISO };
        if (patch.location !== undefined) requestBody.location = patch.location;

        const response = await calendar.events.patch({
            calendarId: "primary",
            eventId,
            requestBody,
        });

        return NextResponse.json({
            id: response.data.id,
            htmlLink: response.data.htmlLink,
        });
    } catch (error: any) {
        console.error("Calendar Update Error:", error);
        return NextResponse.json(
            { message: "일정을 수정하지 못했어요. 다시 시도해주세요." },
            { status: 500 }
        );
    }
}
