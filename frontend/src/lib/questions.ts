export type QuestionType = 'radio' | 'checkbox' | 'input' | 'number';

export interface Option {
    label: string;
    value: string;
    effect?: 'positive' | 'negative' | 'neutral'; // For risk analysis if needed
}

export interface Question {
    id: string; // v1, v2 etc.
    step: number;
    question: string;
    type: QuestionType;
    options?: Option[];
    hasDetails?: boolean; // For step 5 target/current value
}

export const questions: Question[] = [
    {
        id: 'v1',
        step: 1,
        question: '1. Bu calismanin temel amaci hangisidir?',
        type: 'radio',
        options: [
            { label: 'Mevcut durumu korumak', value: 'Mevcut durumu korumak' },
            { label: 'Iyilestirmek', value: 'Iyilestirmek' },
            { label: 'Buyutmek', value: 'Buyutmek' },
            { label: 'Azaltmak', value: 'Azaltmak' },
            { label: 'Standardize etmek', value: 'Standardize etmek' },
            { label: 'Yeni bir sey olusturmak', value: 'Yeni bir sey olusturmak' },
            { label: 'Sorun cozmek', value: 'Sorun cozmek' },
            { label: 'Risk azaltmak', value: 'Risk azaltmak' },
        ],
    },
    {
        id: 'v2',
        step: 2,
        question: '2. Bu amac hangi ana konu ile ilgilidir?',
        type: 'checkbox',
        options: [
            { label: 'Urun', value: 'Urun' },
            { label: 'Surec', value: 'Surec' },
            { label: 'Maliyet', value: 'Maliyet' },
            { label: 'Kalite', value: 'Kalite' },
            { label: 'Zaman', value: 'Zaman' },
            { label: 'Insan / Yetkinlik', value: 'Insan' },
            { label: 'Musteri', value: 'Musteri' },
            { label: 'Tedarikci', value: 'Tedarikci' },
            { label: 'Guvenlik', value: 'Guvenlik' },
            { label: 'Mevzuat / Standart', value: 'Standart' },
        ],
    },
    {
        id: 'v3',
        step: 3,
        question: '3. Bu amac hangi alanda sonuc uretmelidir?',
        type: 'radio',
        options: [
            { label: 'Tum sirket', value: 'Tum sirket' },
            { label: 'Belirli bir fabrika', value: 'Belirli bir fabrika' },
            { label: 'Belirli bir bolum', value: 'Belirli bir bolum' },
            { label: 'Belirli bir surec', value: 'Belirli bir surec' },
            { label: 'Belirli bir urun grubu', value: 'Belirli bir urun grubu' },
            { label: 'Belirli bir proje', value: 'Belirli bir proje' },
        ],
    },
    {
        id: 'v4',
        step: 4,
        question: '4. Bu amac gerceklestiginde hangisi farkli olacak?',
        type: 'checkbox',
        options: [
            { label: 'Daha hizli', value: 'daha hizli' },
            { label: 'Daha ucuz', value: 'daha ucuz' },
            { label: 'Daha kaliteli', value: 'daha kaliteli' },
            { label: 'Daha az hata', value: 'daha az hatali' },
            { label: 'Daha standart', value: 'daha standart' },
            { label: 'Daha guvenli', value: 'daha guvenli' },
            { label: 'Daha olculebilir', value: 'daha olculebilir' },
            { label: 'Daha ongörülebilir', value: 'daha ongörülebilir' },
        ],
    },
    {
        id: 'v5',
        step: 5,
        question: '5. Bu amacin gerceklestigini hangi gostergeyle anlayacagiz?',
        type: 'radio',
        hasDetails: true,
        options: [
            { label: 'Oran (%)', value: 'Oran (%)' },
            { label: 'Sure (dakika/saat/gun)', value: 'Sure' },
            { label: 'Adet', value: 'Adet' },
            { label: 'Maliyet (TL/EUR/USD)', value: 'Maliyet' },
            { label: 'Hata sayisi', value: 'Hata sayisi' },
            { label: 'Musteri geri bildirimi', value: 'Musteri geri bildirimi' },
            { label: 'Denetim sonucu', value: 'Denetim sonucu' },
            { label: 'Standart uyum durumu', value: 'Uyum durumu' },
        ],
    },
    {
        id: 'v6',
        step: 6,
        question: '6. Bu amac hangi zaman diliminde gerceklesmelidir?',
        type: 'radio',
        options: [
            { label: '1 ay icinde', value: '1 ay icinde' },
            { label: '3 ay icinde', value: '3 ay icinde' },
            { label: '6 ay icinde', value: '6 ay icinde' },
            { label: '1 yil icinde', value: '1 yil icinde' },
            { label: 'Surekli (periyodik takip)', value: 'Surekli' },
        ],
    },
    {
        id: 'v7',
        step: 7,
        question: '7. Bu amac en cok kimi etkiler?',
        type: 'checkbox',
        options: [
            { label: 'Uretim', value: 'Uretim' },
            { label: 'Kalite', value: 'Kalite' },
            { label: 'Satis', value: 'Satis' },
            { label: 'Musteri', value: 'Musteri' },
            { label: 'Ust yonetim', value: 'Ust yonetim' },
            { label: 'Calisanlar', value: 'Calisanlar' },
            { label: 'Tedarikciler', value: 'Tedarikciler' },
            { label: 'Denetciler', value: 'Denetciler' },
        ],
    },
    {
        id: 'v8',
        step: 8,
        question: '8. Bu amac gerceklestirilmezse hangisi olur?',
        type: 'checkbox',
        options: [
            { label: 'Maliyet artar', value: 'Maliyet artar' },
            { label: 'Zaman kaybi devam eder', value: 'Zaman kaybi' },
            { label: 'Kalite riski olusur', value: 'Kalite riski' },
            { label: 'Musteri kaybi olur', value: 'Musteri kaybi' },
            { label: 'Yasal risk olusur', value: 'Yasal risk' },
            { label: 'Rekabet gucu azalir', value: 'Rekabet kaybi' },
            { label: 'Hicbir kritik etkisi yok', value: 'Etki yok' },
        ],
    },
];
