"use client";

import { useState, useEffect, useCallback } from "react";

interface VoiceInputProps {
    onTranscript: (text: string) => void;
}

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
    const [isSupported, setIsSupported] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.lang = "ko-KR";
        recognitionInstance.interimResults = false;
        recognitionInstance.continuous = false;

        recognitionInstance.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
            setIsListening(false);
        };

        recognitionInstance.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

        recognitionInstance.onend = () => {
            setIsListening(false);
        };

        setRecognition(recognitionInstance);
    }, [onTranscript]);

    const toggleListening = useCallback(() => {
        if (isListening) {
            recognition?.stop();
            setIsListening(false);
        } else {
            recognition?.start();
            setIsListening(true);
        }
    }, [isListening, recognition]);

    if (!isSupported) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                이 브라우저는 음성 인식을 지원하지 않아요. 텍스트 입력을 사용해주세요.
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3 w-full">
            <button
                onClick={toggleListening}
                className={`w-full h-14 flex items-center justify-center gap-3 rounded-xl font-semibold text-lg transition-all shadow-md ${isListening
                        ? "bg-red-500 text-white animate-pulse shadow-red-200"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                    }`}
            >
                <span>{isListening ? "🛑" : "🎤"}</span>
                {isListening ? "듣는 중...(중지)" : "음성으로 입력하기"}
            </button>
            {isListening && (
                <p className="text-sm text-gray-500 italic">지금 말씀해 주세요...</p>
            )}
        </div>
    );
}
