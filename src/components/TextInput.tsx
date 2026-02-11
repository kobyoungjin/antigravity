"use client";

interface TextInputProps {
    value: string;
    onChange: (text: string) => void;
    onParse: () => void;
}

export default function TextInput({ value, onChange, onParse }: TextInputProps) {
    return (
        <div className="flex flex-col gap-3 w-full">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="예: 내일 오후 3시 치과 1시간"
                className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-800"
            />
            <button
                onClick={onParse}
                className="w-full h-12 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition-colors shadow-sm"
            >
                일정 분석하기
            </button>
        </div>
    );
}
