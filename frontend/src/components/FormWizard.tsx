"use client";

import { useState, useEffect } from "react";
import { questions, Question } from "@/lib/questions";
import { useRouter } from "next/navigation";

interface FormState {
    employeeName: string;
    department: string;
    subject: string;
    description: string;
    answers: Record<string, string | string[]>;
    currentValue?: string;
    targetValue?: string;
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function FormWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0); // 0: Info, 1-8: Questions, 9: Result
    const [formData, setFormData] = useState<FormState>({
        employeeName: "",
        department: "",
        subject: "",
        description: "",
        answers: {},
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ text: string; priority: string } | null>(null);

    const handleStart = () => setCurrentStep(1);

    const handleAnswer = (questionId: string, value: string, type: string) => {
        setFormData((prev) => {
            const currentAnswers = { ...prev.answers };

            if (type === "radio") {
                currentAnswers[questionId] = value;
            } else {
                const currentArr = (currentAnswers[questionId] as string[]) || [];
                if (currentArr.includes(value)) {
                    currentAnswers[questionId] = currentArr.filter((v) => v !== value);
                } else {
                    currentAnswers[questionId] = [...currentArr, value];
                }
            }
            return { ...prev, answers: currentAnswers };
        });
    };

    const calculateResult = () => {
        const { answers, currentValue, targetValue } = formData;

        // Safety checks
        const v1 = (answers["v1"] as string) || "...";
        const v2 = ((answers["v2"] as string[]) || []).join(" ve ");
        const v3 = (answers["v3"] as string) || "...";
        const v4 = ((answers["v4"] as string[]) || []).join(", ");
        const v5 = (answers["v5"] as string) || "...";
        const v6 = (answers["v6"] as string) || "...";

        let numberText = ` ${v5} göstergesini iyileştirmek`;
        if (v5 !== "Musteri geri bildirimi" && v5 !== "Denetim sonucu" && v5 !== "Uyum durumu") {
            if (currentValue && targetValue) {
                numberText = ` ${v5} değerini ${currentValue} seviyesinden ${targetValue} seviyesine getirmek`;
            }
        }

        const subjectPrefix = formData.subject ? `${formData.subject} kapsamında; ` : "";
        const text = `${subjectPrefix}${v3} alanında, ${v2} konularıyla ilgili ${v1.toLowerCase()} çalışmaları yapılarak; sürecin ${v4} hale getirilmesi ve ${v6.toLowerCase()}${numberText} hedeflenmektedir.`;

        // Priority Calc
        const risks = (answers["v8"] as string[]) || [];
        let priority = "ORTA";
        if (risks.includes("Etki yok")) {
            priority = "DÜŞÜK";
        } else if (risks.length >= 2 || risks.includes("Musteri kaybi") || risks.includes("Yasal risk")) {
            priority = "YÜKSEK";
        }

        return { text, priority };
    };

    const handleNext = () => {
        if (currentStep < 8) {
            setCurrentStep((prev) => prev + 1);
        } else {
            // Finish
            const res = calculateResult();
            setResult(res);
            setCurrentStep(9);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep((prev) => prev - 1);
    };

    const submitForm = async () => {
        if (!result) return;
        setIsSubmitting(true);
        try {
            // Convert answers to array fo API
            const responses = Object.entries(formData.answers).map(([key, val]) => ({
                questionKey: key,
                answer: val
            }));

            const body = {
                employeeName: formData.employeeName,
                Department: formData.department,
                subject: formData.subject,
                description: formData.description,
                priority: result.priority,
                resultText: result.text,
                currentValue: formData.currentValue,
                targetValue: formData.targetValue,
                responses
            };

            const res = await fetch(`${API_URL}/api/forms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('Failed');
            alert('Form basariyla kaydedildi!');
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert('Bir hata olustu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 0: Welcome / Info
    if (currentStep === 0) {
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-center mb-6">
                    <img src="/ozunlu_logo.jpg" alt="Özünlü Logo" className="h-16 object-contain" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                    Stratejik Amaç Belirleme
                </h1>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Bu form, departman hedeflerinizi şirket stratejilerimiz ile uyumlu, ölçülebilir ve takip edilebilir
                    bir formatta tanımlamamıza yardımcı olmak için tasarlanmıştır.
                </p>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Konu (Amacın Başlığı)</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-black"
                            placeholder="Örn: Üretim Verimliliği"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adınız Soyadınız</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-black"
                            placeholder="Örn: Ahmet Yılmaz"
                            value={formData.employeeName}
                            onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Departman</label>
                        <input
                            type="text"
                            placeholder="Örn: Üretim Planlama"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Konuyu Detaylandır <span className="text-gray-400 font-normal">(Opsiyonel)</span>
                        </label>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-black resize-none"
                            placeholder="Konu hakkında ek açıklama ekleyebilirsiniz..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>
                </div>

                <button
                    onClick={handleStart}
                    disabled={!formData.employeeName || !formData.department || !formData.subject}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Formu Başlat
                </button>
            </div>
        );
    }

    // Step 9: Result
    if (currentStep === 9 && result) {
        return (
            <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-2xl border border-gray-100 animate-in zoom-in duration-300">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Oluşturulan Stratejik Amaç</h2>
                <div className={`inline-block px-4 py-2 rounded-lg text-sm font-bold mb-6 ${result.priority === 'YÜKSEK' ? 'bg-red-100 text-red-700' :
                    result.priority === 'ORTA' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                    ÖNCELİK: {result.priority}
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-lg leading-relaxed text-slate-800 font-medium mb-8">
                    {result.text}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setCurrentStep(8)}
                        className="flex-1 py-3 px-6 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition font-medium"
                    >
                        Düzenle
                    </button>
                    <button
                        onClick={submitForm}
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-6 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition font-medium disabled:opacity-70"
                    >
                        {isSubmitting ? 'Kaydediliyor...' : 'Onayla ve Gönder'}
                    </button>
                </div>
            </div>
        );
    }

    // Steps 1-8
    const currentQuestion = questions.find(q => q.step === currentStep);
    if (!currentQuestion) return null;

    const currentAns = formData.answers[currentQuestion.id];

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    <span>Adım {currentStep} / 8</span>
                    <span>{Math.round((currentStep / 8) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${(currentStep / 8) * 100}%` }}
                    />
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 min-h-[400px] flex flex-col relative overflow-hidden">
                <h3 className="text-xl font-bold text-gray-800 mb-8 leading-snug">
                    {currentQuestion.question}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {currentQuestion.options?.map((opt) => {
                        const isSelected = currentQuestion.type === 'radio'
                            ? currentAns === opt.value
                            : (currentAns as string[] || []).includes(opt.value);

                        return (
                            <label
                                key={opt.value}
                                className={`
                                relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                ${isSelected
                                        ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-200'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }
                            `}
                            >
                                <input
                                    type={currentQuestion.type}
                                    name={currentQuestion.id}
                                    value={opt.value}
                                    checked={isSelected}
                                    onChange={() => handleAnswer(currentQuestion.id, opt.value, currentQuestion.type)}
                                    className="mr-3 w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                    {opt.label}
                                </span>
                            </label>
                        );
                    })}
                </div>

                {/* Step 5 Special Inputs */}
                {currentQuestion.hasDetails &&
                    currentAns &&
                    !['Musteri geri bildirimi', 'Denetim sonucu', 'Uyum durumu'].includes(currentAns as string) && (
                        <div className="mb-8 p-6 bg-amber-50 rounded-xl border border-amber-200 animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-amber-800 uppercase mb-2">Mevcut Değer</label>
                                    <input
                                        type="text"
                                        placeholder="0"
                                        value={formData.currentValue || ''}
                                        onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                                        className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white text-black"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-amber-800 uppercase mb-2">Hedef Değer</label>
                                    <input
                                        type="text"
                                        placeholder="100"
                                        value={formData.targetValue || ''}
                                        onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                                        className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white text-black"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                <div className="mt-auto flex justify-between pt-6 border-t border-gray-100">
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 text-gray-500 font-medium hover:text-gray-800 transition"
                    >
                        Geri
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!currentAns || (Array.isArray(currentAns) && currentAns.length === 0)}
                        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {currentStep === 8 ? 'Sonucu Gör' : 'Devam Et'}
                    </button>
                </div>
            </div>
        </div>
    );
}
