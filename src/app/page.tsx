"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import EventList from "@/components/EventList";
import VoiceInput from "@/components/VoiceInput";
import TextInput from "@/components/TextInput";
import EventPreviewCard from "@/components/EventPreviewCard";
import { parseToDraft, EventDraft } from "@/services/nlpParser";

export default function Home() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // Sprint 3 States
  const [rawText, setRawText] = useState("");
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchEvents = async () => {
    if (!session) return;
    setIsFetching(true);
    setError(null);
    try {
      const response = await fetch("/api/calendar/list");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "일정을 불러오지 못했습니다.");
      }
      const data = await response.json();
      setEvents(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleParse = useCallback((input: string) => {
    const result = parseToDraft(input);
    if (result.error) {
      setParseError(result.error);
      setDraft(null);
    } else if (result.draft) {
      setDraft(result.draft);
      setParseError(null);
    }
  }, []);

  const handleSave = async () => {
    if (!draft || !session) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/calendar/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
      });
      if (!res.ok) throw new Error("저장에 실패했습니다.");
      setDraft(null);
      setRawText("");
      fetchEvents();
      alert("캘린더에 저장했어요 ✅");
    } catch (e) {
      alert("캘린더에 저장하지 못했어요. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchEvents();
    }
  }, [session]);

  const handleSignIn = async () => {
    try {
      setError(null);
      const result = await signIn("google");
      if (result?.error) {
        setError("로그인에 실패했어요. 다시 시도해주세요.");
      }
    } catch (e) {
      setError("로그인에 실패했어요. 다시 시도해주세요.");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <p className="text-xl font-semibold">로그인 중…</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="z-10 w-full max-w-md items-center justify-center text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Antigravity</h1>

        {session ? (
          <div className="space-y-8">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-600 text-sm">로그인된 계정</p>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-red-500 hover:underline"
                >
                  로그아웃
                </button>
              </div>
              <p className="text-gray-900 font-medium">{session.user?.email}</p>
            </div>

            {/* Sprint 3: Input Section */}
            <div className="space-y-4">
              <div className="flex p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setInputMode("voice")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${inputMode === "voice" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"
                    }`}
                >
                  음성 입력
                </button>
                <button
                  onClick={() => setInputMode("text")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${inputMode === "text" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"
                    }`}
                >
                  텍스트 입력
                </button>
              </div>

              {inputMode === "voice" ? (
                <VoiceInput
                  onTranscript={(text) => {
                    setRawText(text);
                    handleParse(text);
                  }}
                />
              ) : (
                <TextInput
                  value={rawText}
                  onChange={setRawText}
                  onParse={() => handleParse(rawText)}
                />
              )}

              {parseError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm text-red-600">💡 {parseError}</p>
                </div>
              )}

              {draft && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <EventPreviewCard
                    draft={draft}
                    onChange={(patch) => setDraft({ ...draft, ...patch })}
                  />
                  <button
                    onClick={handleSave}
                    disabled={isSaving || new Date(draft.startISO) >= new Date(draft.endISO)}
                    className={`w-full h-14 rounded-xl font-bold text-lg transition-all ${isSaving || new Date(draft.startISO) >= new Date(draft.endISO)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100"
                      }`}
                  >
                    {isSaving ? "저장 중..." : "이대로 저장하기"}
                  </button>
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-gray-100">
              {isFetching ? (
                <div className="py-10">
                  <p className="text-gray-500 animate-pulse">일정 불러오는 중…</p>
                </div>
              ) : error ? (
                <div className="py-10 space-y-4">
                  <p className="text-red-500">{error}</p>
                  <button
                    onClick={fetchEvents}
                    className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    재시도
                  </button>
                </div>
              ) : (
                <EventList events={events} onChanged={fetchEvents} />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-gray-600">구글 계정으로 로그인하여 시작하세요.</p>

            <button
              onClick={handleSignIn}
              className="flex items-center justify-center w-full h-12 px-6 text-gray-700 transition-colors duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:shadow-outline font-medium text-lg shadow-sm"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              Google로 로그인
            </button>

            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
