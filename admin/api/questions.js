export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const questions = [
    {
      "priority": 1,
      "type": "attention",
      "difficulty": "easy",
      "translations": {
        "tr": { "text": "Şu an ekranındaki bu testi oynuyor musun?", "options": ["Evet", "Hayır", "Uykudayım", "Bilmiyorum"], "correctIndex": 0, "explanation": "Testi oynadığına göre cevap Evet!" },
        "en": { "text": "Are you playing this test on your screen right now?", "options": ["Yes", "No", "Asleep", "Don't know"], "correctIndex": 0, "explanation": "Since you are playing, the answer is Yes!" },
        "ar": { "text": "هل تلعب هذا الاختبار على شاشتك الآن؟", "options": ["نعم", "لا", "نائم", "لا أعلم"], "correctIndex": 0, "explanation": "بما أنك تلعب الآن، فالإجابة هي نعم!" }
      }
    },
    {
      "priority": 1,
      "type": "attention",
      "difficulty": "easy",
      "translations": {
        "tr": { "text": "Aşağı gitmek için asansörde hangi düğmeye basarsın?", "options": ["Yukarı ↑", "Aşağı ↓", "Sağ →", "Sol ←"], "correctIndex": 1, "explanation": "Aşağı gitmek için Aşağı butonuna basılır!" },
        "en": { "text": "Which button do you press in an elevator to go down?", "options": ["Up ↑", "Down ↓", "Right →", "Left ←"], "correctIndex": 1, "explanation": "Press Down to go down!" },
        "ar": { "text": "أيها الضغط في المصعد للنزول إلى الأسفل؟", "options": ["أعلى ↑", "أسفل ↓", "يمين →", "يسار ←"], "correctIndex": 1, "explanation": "اضغط أسفل للنزول!" }
      }
    },
    {
      "priority": 1,
      "type": "attention",
      "difficulty": "easy",
      "translations": {
        "tr": { "text": "KIRMIZI kelimesi MAVİ renkle yazılırsa ne okutulur?", "options": ["Kırmızı", "Mavi", "Yeşil", "Sarı"], "correctIndex": 0, "explanation": "Yazı rengine bakma! Kelime KIRMIZI okutulur." },
        "en": { "text": "If the word RED is written in BLUE ink, what does it read?", "options": ["Red", "Blue", "Green", "Yellow"], "correctIndex": 0, "explanation": "Don't look at ink color! The word reads RED." },
        "ar": { "text": "إذا كُتبت كلمة أحمر باللون الأزرق، فماذا تُقرأ؟", "options": ["أحمر", "أزرق", "أخضر", "أصفر"], "correctIndex": 0, "explanation": "لا تنظر للون! الكلمة تُقرأ أحمر." }
      }
    }
  ];

  return res.status(200).json(questions);
}
