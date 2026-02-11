import { useState } from "react";

interface Event {
    id: string;
    summary: string;
    start: {
        dateTime?: string;
        date?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
    };
    location?: string;
    htmlLink?: string;
}

interface EventListProps {
    events: Event[];
    onChanged: () => void;
}

export default function EventList({ events, onChanged }: EventListProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    const formatTime = (timeInfo: { dateTime?: string; date?: string }) => {
        if (timeInfo.dateTime) {
            return new Date(timeInfo.dateTime).toLocaleString();
        }
        return timeInfo.date || "시간 정보 없음";
    };

    const handleDelete = async (eventId: string) => {
        if (!confirm("이 일정을 삭제하시겠습니까?")) return;
        try {
            const res = await fetch("/api/calendar/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId }),
            });
            if (!res.ok) throw new Error();
            onChanged();
        } catch (e) {
            alert("일정을 삭제하지 못했어요. 다시 시도해주세요.");
        }
    };

    const startEdit = (event: Event) => {
        setEditingId(event.id);
        setEditTitle(event.summary || "");
    };

    const handleUpdate = async (eventId: string) => {
        try {
            const res = await fetch("/api/calendar/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId, patch: { title: editTitle } }),
            });
            if (!res.ok) throw new Error();
            setEditingId(null);
            onChanged();
        } catch (e) {
            alert("일정을 수정하지 못했어요. 다시 시도해주세요.");
        }
    };

    if (events.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">다가오는 일정이 없어요.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 w-full text-left">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 px-2">다가오는 일정</h2>
            {events.map((event) => (
                <div
                    key={event.id}
                    className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                >
                    <div className="flex justify-between items-start">
                        {editingId === event.id ? (
                            <div className="flex-1 flex gap-2">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="flex-1 p-1 border border-blue-300 rounded outline-none"
                                    autoFocus
                                />
                                <button
                                    onClick={() => handleUpdate(event.id)}
                                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                                >
                                    저장
                                </button>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                                >
                                    취소
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {event.summary || "제목 없음"}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEdit(event)}
                                        className="text-xs text-gray-400 hover:text-blue-500"
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="text-xs text-gray-400 hover:text-red-500"
                                    >
                                        삭제
                                    </button>
                                    {event.htmlLink && (
                                        <a
                                            href={event.htmlLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-500 hover:underline"
                                        >
                                            상세보기
                                        </a>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600 flex items-center">
                            <span className="mr-2">🕒</span>
                            {formatTime(event.start)} ~ {formatTime(event.end)}
                        </p>
                        {event.location && (
                            <p className="text-sm text-gray-500 flex items-center">
                                <span className="mr-2">📍</span>
                                {event.location}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
