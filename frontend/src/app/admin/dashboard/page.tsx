"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { questions } from "@/lib/questions";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

interface AnalyticsData {
    stats: Record<string, Record<string, number>>;
    priorityCounts: { priority: string; _count: { priority: number } }[];
    totalCount: number;
}

interface FormRecord {
    id: string;
    createdAt: string;
    employeeName: string;
    department: string;
    subject: string;
    priority: string;
    resultText: string;
    responses?: { questionKey: string; answer: any }[];
    currentValue?: string;
    targetValue?: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [period, setPeriod] = useState("all");
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [forms, setForms] = useState<FormRecord[]>([]);
    const [selectedForm, setSelectedForm] = useState<FormRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resAnalytics, resForms] = await Promise.all([
                fetch(`${API_URL}/api/analytics?period=${period}`),
                fetch(`${API_URL}/api/forms?limit=50&include=responses`),
            ]);

            const analytics = await resAnalytics.json();
            const formsData = await resForms.json();

            setData(analytics);
            setForms(formsData.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        document.cookie = "admin_session=; path=/; max-age=0";
        router.push("/admin");
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    if (loading && !data) return <div className="p-10 text-center">Yükleniyor...</div>;

    // Prepare Charts Data

    // 1. Priority Pie Chart
    const priorityLabels = data?.priorityCounts.map(p => p.priority) || [];
    const priorityValues = data?.priorityCounts.map(p => p._count.priority) || [];

    const pieData = {
        labels: priorityLabels,
        datasets: [
            {
                data: priorityValues,
                backgroundColor: [
                    "#2ecc71", // Düşük - Green
                    "#f39c12", // Orta - Orange
                    "#e74c3c", // Yüksek - Red
                ],
                borderWidth: 1,
            },
        ],
    };

    // 2. Questions Bar Charts (Example: Step 1 - Goal Type)
    const getChartData = (qId: string) => {
        const qData = data?.stats[qId] || {};
        return {
            labels: Object.keys(qData),
            datasets: [
                {
                    label: 'Cevap Sayısı',
                    data: Object.values(qData),
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Yönetici Paneli</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">Hoşgeldiniz, Ufuk Özünlü</div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-50 text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-red-100 transition"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">

                {/* Controls */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Genel Bakış</h2>
                    <div className="bg-white rounded-lg shadow-sm border p-1 inline-flex">
                        {['day', 'week', 'month', 'all'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition ${period === p ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {p === 'day' ? 'Günlük' : p === 'week' ? 'Haftalık' : p === 'month' ? 'Aylık' : 'Tümü'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 font-medium uppercase">Toplam Form</div>
                        <div className="text-3xl font-bold text-gray-900 mt-2">{data?.totalCount}</div>
                    </div>
                    {/* Can add more summary cards here */}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Priority Distribution */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-700 mb-6">Öncelik Dağılımı</h3>
                        <div className="h-64 flex justify-center">
                            <Pie data={pieData} />
                        </div>
                    </div>

                    {/* Goal Type Distribution */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-700 mb-6">Temel Amaç Dağılımı (Soru 1)</h3>
                        <div className="h-64">
                            <Bar
                                data={getChartData('v1')}
                                options={{ responsive: true, maintainAspectRatio: false }}
                            />
                        </div>
                    </div>

                    {/* Impact Area Distribution */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-700 mb-6">Etki Alanı (Soru 7)</h3>
                        <div className="h-64">
                            <Bar
                                data={getChartData('v7')}
                                options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y' }}
                            />
                        </div>
                    </div>

                    {/* Topic Distribution */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-700 mb-6">İlgili Konular (Soru 2)</h3>
                        <div className="h-64">
                            <Bar
                                data={getChartData('v2')}
                                options={{ responsive: true, maintainAspectRatio: false }}
                            />
                        </div>
                    </div>
                </div>

                {/* Recent Forms List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Son Gönderilen Formlar</h3>
                        <button
                            onClick={fetchData}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Yenile
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Tarih</th>
                                    <th className="px-6 py-4 font-semibold">Konu</th>
                                    <th className="px-6 py-4 font-semibold">Personel / Departman</th>
                                    <th className="px-6 py-4 font-semibold">Öncelik</th>
                                    <th className="px-6 py-4 font-semibold w-1/2">Sonuç Metni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {forms.map((form) => (
                                    <tr
                                        key={form.id}
                                        className="hover:bg-blue-50 transition cursor-pointer"
                                        onClick={() => setSelectedForm(form)}
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                            {new Date(form.createdAt).toLocaleString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">{form.subject || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{form.employeeName}</div>
                                            <div className="text-xs text-gray-500">{form.department}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${form.priority === 'YÜKSEK' ? 'bg-red-100 text-red-700' :
                                                form.priority === 'ORTA' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {form.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="max-h-24 overflow-y-auto custom-scrollbar pr-2">
                                                {form.resultText}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {forms.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            Henüz kayıt bulunmamaktadır.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* Detail Modal */}
                {selectedForm && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Form Detayı</h2>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {new Date(selectedForm.createdAt).toLocaleString('tr-TR')}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedForm(null); }}
                                    className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Scrollable Modal Content */}
                            <div className="p-8 overflow-y-auto flex-1">
                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Çalışan</label>
                                        <div className="text-gray-900 font-medium text-lg">{selectedForm.employeeName}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Departman</label>
                                        <div className="text-gray-900 font-medium text-lg">{selectedForm.department}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Konu</label>
                                        <div className="text-gray-900 font-medium text-lg">{selectedForm.subject || '-'}</div>
                                    </div>
                                </div>

                                {/* Result Box */}
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase mb-3 flex justify-between items-center">
                                        <span>Oluşturulan Amaç</span>
                                        <span className={`px-3 py-1 rounded-full text-xs ${selectedForm.priority === 'YÜKSEK' ? 'bg-red-100 text-red-700' :
                                            selectedForm.priority === 'ORTA' ? 'bg-orange-100 text-orange-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            {selectedForm.priority}
                                        </span>
                                    </h3>
                                    <div className="text-lg leading-relaxed text-slate-800 font-medium">
                                        {selectedForm.resultText}
                                    </div>
                                </div>

                                {/* Q&A List */}
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Soru ve Cevaplar</h3>
                                    <div className="space-y-4">
                                        {selectedForm.responses?.map((resp: any, i: number) => {
                                            const q = questions.find(q => q.id === resp.questionKey);
                                            let answerDisplay = resp.answer;
                                            try {
                                                // If answer is JSON string array
                                                if (typeof resp.answer === 'string' && resp.answer.startsWith('[')) {
                                                    answerDisplay = JSON.parse(resp.answer).join(', ');
                                                }
                                            } catch (e) { }

                                            return (
                                                <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                    <div className="text-sm font-semibold text-blue-900 mb-2">
                                                        {q ? `${q.step}. ${q.question}` : resp.questionKey}
                                                    </div>
                                                    <div className="text-gray-700 font-medium">
                                                        {answerDisplay}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div >
    );
}
