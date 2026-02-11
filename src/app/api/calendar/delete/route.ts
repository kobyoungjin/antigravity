import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCalendarClient } from "@/services/calendarClient";

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).accessToken) {
        return NextResponse.json(
            { message: "로그인이 만료됐어요. 다시 로그인해주세요." },
            { status: 401 }
        );
    }

    try {
        const { eventId } = await req.json();
        if (!eventId) {
            return NextResponse.json({ message: "Event ID가 필요합니다." }, { status: 400 });
        }

        const calendar = getCalendarClient((session as any).accessToken);
        await calendar.events.delete({
            calendarId: "primary",
            eventId,
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("Calendar Delete Error:", error);
        return NextResponse.json(
            { message: "일정을 삭제하지 못했어요. 다시 시도해주세요." },
            { status: 500 }
        );
    }
}
