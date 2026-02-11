export interface EventDraft {
    title: string;
    startISO: string;
    endISO: string;
    location?: string;
}

export const parseToDraft = (
    input: string,
    now: Date = new Date(),
    tz: string = "Asia/Seoul"
): { draft?: EventDraft; error?: string } => {
    const text = input.trim();
    if (!text) return { error: "입력된 내용이 없습니다." };

    let targetDate = new Date(now);
    let startHour = 0;
    let startMinute = 0;
    let durationMinutes = 60;
    let location: string | undefined;

    // 1. 날짜 파싱
    if (text.includes("오늘")) {
        // targetDate is already now
    } else if (text.includes("내일")) {
        targetDate.setDate(targetDate.getDate() + 1);
    } else if (text.includes("모레")) {
        targetDate.setDate(targetDate.getDate() + 2);
    } else {
        const dateMatch = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/) || text.match(/(\d{1,2})\/(\d{1,2})/);
        if (dateMatch) {
            if (dateMatch.length === 4) {
                targetDate = new Date(parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3]));
            } else {
                targetDate.setMonth(parseInt(dateMatch[1]) - 1);
                targetDate.setDate(parseInt(dateMatch[2]));
            }
        } else {
            return { error: "날짜를 이해하지 못했어요. 예: '오늘', '내일', '2/20'" };
        }
    }

    // 2. 시간 파싱
    const timeMatch = text.match(/(오전|오후)\s*(\d{1,2})시\s*(\d{1,2})?분?/) || text.match(/(\d{1,2}):(\d{1,2})/);
    if (timeMatch) {
        if (timeMatch[1] === "오전" || timeMatch[1] === "오후") {
            startHour = parseInt(timeMatch[2]);
            if (timeMatch[1] === "오후" && startHour < 12) startHour += 12;
            if (timeMatch[1] === "오전" && startHour === 12) startHour = 0;
            startMinute = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
        } else {
            startHour = parseInt(timeMatch[1]);
            startMinute = parseInt(timeMatch[2]);
        }
    } else if (text.match(/(\d{1,2})시\s*반/)) {
        const halfMatch = text.match(/(\d{1,2})시\s*반/);
        startHour = parseInt(halfMatch![1]);
        startMinute = 30;
    } else if (text.match(/(\d{1,2})시/)) {
        const hourOnlyMatch = text.match(/(\d{1,2})시/);
        startHour = parseInt(hourOnlyMatch![1]);
        startMinute = 0;
    } else {
        return { error: "시간을 이해하지 못했어요. 예: '오후 3시', '15:30'" };
    }

    // 3. 기간(Duration) 파싱
    const durationMatch = text.match(/(\d+)\s*시간/) || text.match(/(\d+)\s*분/);
    if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        if (text.includes("시간")) {
            durationMinutes = value * 60;
        } else {
            durationMinutes = value;
        }
    }

    // 4. 장소 파싱
    const locationMatch = text.match(/장소\s*([^\s,]+)/) || text.match(/@\s*([^\s,]+)/);
    if (locationMatch) {
        location = locationMatch[1];
    }

    // 5. 제목 추출 (날짜, 시간, 기간, 장소 관련 키워드 제거)
    let title = text
        .replace(/(오늘|내일|모레)/g, "")
        .replace(/(\d{4}-\d{1,2}-\d{1,2})|(\d{1,2}\/\d{1,2})/g, "")
        .replace(/(오전|오후)\s*\d{1,2}시\s*(\d{1,2}분)?/g, "")
        .replace(/\d{1,2}:\d{1,2}/g, "")
        .replace(/\d{1,2}시\s*반?/g, "")
        .replace(/\d+\s*(시간|분)/g, "")
        .replace(/(장소|@)\s*[^\s,]+/g, "")
        .replace(/\s+/g, " ")
        .trim();

    if (!title) title = "새 일정";

    // 6. ISO 변환
    const start = new Date(targetDate);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + durationMinutes);

    if (start <= now && !text.includes("오늘") && !text.includes("내일") && !text.includes("모레")) {
        // If the parsed time is in the past without explicit relative words, assume next occurrence (simplified)
    }

    if (end <= start) {
        return { error: "종료 시간이 시작 시간보다 늦어야 해요." };
    }

    return {
        draft: {
            title,
            startISO: start.toISOString(),
            endISO: end.toISOString(),
            location,
        },
    };
};
