"use client";

import { EventDraft } from "@/services/nlpParser";

interface EventPreviewCardProps {
    draft: EventDraft;
    onChange: (patch: Partial<EventDraft>) => void;
}

export default function EventPreviewCard({ draft, onChange }: EventPreviewCardProps) {
    const isValid = new Date(draft.startISO) < new Date(draft.endISO);

    // Helper to convert ISO to datetime-local format (YYYY-MM-DDTHH:mm)
    const toLocalISO = (iso: string) => {
        const d = new Date(iso);
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        return localISOTime;
    };

    const handleDateChange = (field: "startISO" | "endISO", value: string) => {
        const isoString = new Date(value).toISOString();
        onChange({ [field]: isoString });
    };

    return (
        <div className="w-full p-6 bg-blue-50 border border-blue-100 rounded-2xl space-y-4 shadow-inner">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📅</span>
                <h3 className="font-bold text-blue-900">일정 미리보기</h3>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1 ml-1">일정 제목</label>
                    <input
                        type="text"
                        value={draft.title}
                        onChange={(e) => onChange({ title: e.target.value })}
                        className="w-full p-3 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-blue-700 mb-1 ml-1">시작 시간</label>
                        <input
                            type="datetime-local"
                            value={toLocalISO(draft.startISO)}
                            onChange={(e) => handleDateChange("startISO", e.target.value)}
                            className="w-full p-3 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-blue-700 mb-1 ml-1">종료 시간</label>
                        <input
                            type="datetime-local"
                            value={toLocalISO(draft.endISO)}
                            onChange={(e) => handleDateChange("endISO", e.target.value)}
                            className="w-full p-3 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1 ml-1">장소 (선택)</label>
                    <input
                        type="text"
                        value={draft.location || ""}
                        onChange={(e) => onChange({ location: e.target.value })}
                        placeholder="장소를 입력하세요"
                        className="w-full p-3 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {!isValid && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                    ⚠️ 종료 시간이 시작 시간보다 늦어야 해요.
                </p>
            )}
        </div>
    );
}
