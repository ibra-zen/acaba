import { initDb, getDb, run, saveDb } from './database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const languages = ['de', 'fr', 'es', 'zh', 'ru'];

// Soru verisi
const generateQuestions = () => {
  const qList = [];

  // Dikkat Soruları
  qList.push({ type: 'attention', diff: 'easy', cat: 1, tr: 'Bu cümledeki harf sayısını say: BU CÜMLE', en: 'Count the letters: THIS PHRASE', optsTr: ['7','8','9','10'], optsEn: ['9','10','11','12'], corrIdx: 2 });
  qList.push({ type: 'attention', diff: 'medium', cat: 1, tr: 'KIRMIZI kelimesi hangi renkle yazılmış? (Mavi renkli düşünün)', en: 'What color is RED written in? (imagine blue)', optsTr: ['Kırmızı','Mavi','Yeşil','Sarı'], optsEn: ['Red','Blue','Green','Yellow'], corrIdx: 1 });
  qList.push({ type: 'attention', diff: 'hard', cat: 1, tr: 'Hangi sayı diğerlerinden farklıdır? 23, 34, 45, 56, 68', en: 'Which number is different? 23, 34, 45, 56, 68', optsTr: ['23','34','56','68'], optsEn: ['23','34','56','68'], corrIdx: 3 });
  qList.push({ type: 'attention', diff: 'easy', cat: 1, tr: 'Aşağıdakilerden hangisi bir meyve değildir?', en: 'Which is not a fruit?', optsTr: ['Elma','Armut','Masa','Çilek'], optsEn: ['Apple','Pear','Table','Strawberry'], corrIdx: 2 });
  qList.push({ type: 'attention', diff: 'medium', cat: 1, tr: '"Güneş doğudan batar, batıdan doğar." Bu cümle doğru mu?', en: '"The sun sets in the east, rises in the west." True?', optsTr: ['Evet','Hayır','Yarı','Emin değilim'], optsEn: ['Yes','No','Partly','Not sure'], corrIdx: 1 });

  // Ters Mantık
  qList.push({ type: 'reverse_logic', diff: 'easy', cat: 2, tr: 'Yanlış olanı seç: 2+2=4, 3+3=6, 4+4=9, 5+5=10', en: 'Select wrong: 2+2=4, 3+3=6, 4+4=9, 5+5=10', optsTr: ['2+2=4','3+3=6','4+4=9','5+5=10'], optsEn: ['2+2=4','3+3=6','4+4=9','5+5=10'], corrIdx: 2 });
  qList.push({ type: 'reverse_logic', diff: 'medium', cat: 2, tr: '1 kg demir mi ağır, 1 kg pamuk mu?', en: '1kg iron or 1kg cotton, which is heavier?', optsTr: ['Demir','Pamuk','İkisi eşit','Tartmak lazım'], optsEn: ['Iron','Cotton','Equal','Need scale'], corrIdx: 2 });
  qList.push({ type: 'reverse_logic', diff: 'hard', cat: 2, tr: 'En küçük çift sayıyı seç, 3\'ten büyük olsun: 2,4,6,8', en: 'Smallest even > 3: 2,4,6,8', optsTr: ['2','4','6','8'], optsEn: ['2','4','6','8'], corrIdx: 1 });
  qList.push({ type: 'reverse_logic', diff: 'medium', cat: 2, tr: 'Bana YANLIŞ cevap ver: Türkiye\'nin başkenti neresi?', en: 'Give the WRONG answer: Capital of Turkey?', optsTr: ['Ankara','İstanbul','İzmir','Bursa'], optsEn: ['Ankara','Istanbul','Izmir','Bursa'], corrIdx: 1 });
  qList.push({ type: 'reverse_logic', diff: 'easy', cat: 2, tr: 'Aşağıya gitmek için hangi butona basarsın?', en: 'To go down, press?', optsTr: ['Yukarı ↑','Aşağı ↓','Sağ →','Sol ←'], optsEn: ['Up ↑','Down ↓','Right →','Left ←'], corrIdx: 0 });

  // Hafıza
  qList.push({ type: 'memory', diff: 'easy', cat: 3, tr: 'Bir otobüste 10 kişi var. 3 indi, 5 bindi. Kaç kişi var?', en: '10 on bus, 3 off, 5 on. How many?', optsTr: ['8','10','12','15'], optsEn: ['8','10','12','15'], corrIdx: 2 });
  qList.push({ type: 'memory', diff: 'medium', cat: 3, tr: 'Şifre: 1453. Şifreyi gir.', en: 'Password: 1453. Enter it.', optsTr: ['1543','1453','1345','1435'], optsEn: ['1543','1453','1345','1435'], corrIdx: 1 });
  qList.push({ type: 'memory', diff: 'easy', cat: 3, tr: 'Sırayı hatırla: Kırmızı, Mavi, Yeşil. 2. renk neydi?', en: 'Sequence: Red, Blue, Green. 2nd?', optsTr: ['Kırmızı','Mavi','Yeşil','Sarı'], optsEn: ['Red','Blue','Green','Yellow'], corrIdx: 1 });
  qList.push({ type: 'memory', diff: 'hard', cat: 3, tr: 'Dünkü sorunun cevabı neydi?', en: 'What was yesterday\'s answer?', optsTr: ['Elma','Armut','Muz','Bilmiyorum'], optsEn: ['Apple','Pear','Banana','I don\'t know'], corrIdx: 3 });
  qList.push({ type: 'memory', diff: 'medium', cat: 3, tr: '🍎🚗🐱🧠🍕 — 3. emoji neydi?', en: '🍎🚗🐱🧠🍕 — What was 3rd?', optsTr: ['🍎','🚗','🐱','🧠'], optsEn: ['🍎','🚗','🐱','🧠'], corrIdx: 2 });

  // Sabır & Refleks
  qList.push({ type: 'patience', diff: 'hard', cat: 5, tr: '5 saniye bekle, hiçbir şeye dokunma', en: 'Wait 5 seconds, touch nothing', optsTr: ['Hemen bas','Bekle','Buraya dokun','Zıpla'], optsEn: ['Press now','Wait','Touch here','Jump'], corrIdx: 1 });
  qList.push({ type: 'reflex', diff: 'easy', cat: 4, tr: 'Yeşil ışık yanınca hemen bas!', en: 'Press immediately when green!', optsTr: ['Bas','Dur','Bekle','Kaç'], optsEn: ['Press','Stop','Wait','Run'], corrIdx: 0 });
  qList.push({ type: 'patience', diff: 'medium', cat: 5, tr: '3 saniye boyunca ekrana dokunma!', en: 'Don\'t touch screen for 3 seconds!', optsTr: ['Tamam','Dayanamam','Hemen basayım','Deneyeyim'], optsEn: ['OK','Can\'t wait','Press now','Let\'s try'], corrIdx: 0 });

  // Genel Kültür (Aldatıcı)
  qList.push({ type: 'multiple_choice', diff: 'easy', cat: 6, tr: 'Türkiye\'nin plaka kodu 34 olan şehri?', en: 'Turkish city with plate 34?', optsTr: ['Ankara','İzmir','İstanbul','Bursa'], optsEn: ['Ankara','Izmir','Istanbul','Bursa'], corrIdx: 2 });
  qList.push({ type: 'multiple_choice', diff: 'medium', cat: 6, tr: 'Su molekülünde kaç hidrojen atomu var?', en: 'H atoms in water?', optsTr: ['1','2','3','4'], optsEn: ['1','2','3','4'], corrIdx: 1 });
  qList.push({ type: 'multiple_choice', diff: 'hard', cat: 6, tr: 'Türkiye kaç kıtada yer alır?', en: 'How many continents is Turkey on?', optsTr: ['1','2','3','4'], optsEn: ['1','2','3','4'], corrIdx: 1 });
  qList.push({ type: 'attention', diff: 'medium', cat: 1, tr: 'Bu cümlede kaç hata var: "Ben türkçe iyi biliyorum."', en: 'How many errors: "I speak good english."', optsTr: ['0','1','2','3'], optsEn: ['0','1','2','3'], corrIdx: 2 });
  qList.push({ type: 'reverse_logic', diff: 'easy', cat: 2, tr: 'Hangisi daha büyük: 0.5 mi, 0.09 mu?', en: 'Which is bigger: 0.5 or 0.09?', optsTr: ['0.09','0.5','Eşit','İkisi de sıfır'], optsEn: ['0.09','0.5','Equal','Both zero'], corrIdx: 1 });
  qList.push({ type: 'attention', diff: 'hard', cat: 1, tr: 'Ocak ayında 28 gün vardır. Diğer aylarda kaç gün vardır?', en: 'Jan has 28 days. Other months?', optsTr: ['Yok, hepsinde 28\'den fazla','28, 29, 30 ya da 31','Sadece 30 ve 31','Bilmiyorum'], optsEn: ['None have only 28','28, 29, 30 or 31','Only 30 and 31','I don\'t know'], corrIdx: 1 });

  return qList;
};

// Ana seed fonksiyonu
const runSeed = async () => {
  try {
    // Veritabanını başlat
    await initDb();
    const db = await getDb();

    console.log('🌱 Seed işlemi başlıyor...');

    // 1. Admin kullanıcısı
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@idiot.com';
    const adminPass = process.env.ADMIN_PASSWORD || 'Admin123!';
    const hashedPass = bcrypt.hashSync(adminPass, 10);
    const adminId = uuidv4();

    // Mevcut admin varsa ekme
    const existingAdmin = db.exec(`SELECT id FROM admin_users WHERE email = '${adminEmail}'`);
    if (!existingAdmin.length || !existingAdmin[0].values.length) {
      run('INSERT INTO admin_users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [adminId, adminEmail, hashedPass, 'superadmin']);
      console.log(`✅ Admin kullanıcısı oluşturuldu: ${adminEmail}`);
    } else {
      console.log('ℹ️  Admin kullanıcısı zaten mevcut.');
    }

    // 2. Kategoriler
    const cats = [
      { id: 1, tr: 'Dikkat', en: 'Attention', icon: '👀' },
      { id: 2, tr: 'Mantık', en: 'Logic', icon: '🔢' },
      { id: 3, tr: 'Hafıza', en: 'Memory', icon: '🧠' },
      { id: 4, tr: 'Refleks', en: 'Reflex', icon: '⚡' },
      { id: 5, tr: 'Sabır', en: 'Patience', icon: '🕐' },
      { id: 6, tr: 'Genel', en: 'General', icon: '📚' },
    ];

    cats.forEach(c => {
      const exists = db.exec(`SELECT id FROM categories WHERE id = ${c.id}`);
      if (!exists.length || !exists[0].values.length) {
        run('INSERT INTO categories (name_tr, name_en, name_de, name_fr, name_es, name_zh, name_ru, icon) VALUES (?,?,?,?,?,?,?,?)',
          [c.tr, c.en, c.en, c.en, c.en, c.en, c.en, c.icon]);
      }
    });
    console.log('✅ Kategoriler oluşturuldu.');

    // 3. Sorular
    const qList = generateQuestions();
    let addedCount = 0;

    for (const q of qList) {
      // Soruyu ekle
      run('INSERT INTO questions (question_type, difficulty, category_id, status, created_by) VALUES (?, ?, ?, ?, ?)',
        [q.type, q.diff, q.cat, 'active', adminId]);
      
      // Son eklenen sorunun ID'sini al
      const result = db.exec('SELECT last_insert_rowid() as id');
      const qId = result[0].values[0][0] as number;

      // Türkçe çeviri
      run('INSERT INTO question_translations (question_id, language_code, question_text, status) VALUES (?, ?, ?, ?)',
        [qId, 'tr', q.tr, 'ready']);
      // İngilizce çeviri
      run('INSERT INTO question_translations (question_id, language_code, question_text, status) VALUES (?, ?, ?, ?)',
        [qId, 'en', q.en, 'ready']);
      // Eksik diller
      for (const lang of languages) {
        run('INSERT INTO question_translations (question_id, language_code, status) VALUES (?, ?, ?)',
          [qId, lang, 'missing']);
      }

      // Türkçe seçenekler
      q.optsTr.forEach((optText: string, optIdx: number) => {
        run('INSERT INTO question_options (question_id, language_code, option_key, option_text, is_correct) VALUES (?, ?, ?, ?, ?)',
          [qId, 'tr', `opt_${optIdx}`, optText, optIdx === q.corrIdx ? 1 : 0]);
      });
      // İngilizce seçenekler
      q.optsEn.forEach((optText: string, optIdx: number) => {
        run('INSERT INTO question_options (question_id, language_code, option_key, option_text, is_correct) VALUES (?, ?, ?, ?, ?)',
          [qId, 'en', `opt_${optIdx}`, optText, optIdx === q.corrIdx ? 1 : 0]);
      });
      addedCount++;
    }
    console.log(`✅ ${addedCount} adet soru eklendi.`);

    // 4. Başarımlar
    const achs = [
      { key: 'first_blood', tr: 'İlk Kurban', en: 'First Blood', descTr: 'İlk soruyu yanlış cevapla', descEn: 'Answer first wrong', type: 'wrong_answer', val: 1, icon: '🐣' },
      { key: 'warmup', tr: 'Isındın', en: 'Warming Up', descTr: '10 soru çöz', descEn: 'Solve 10 questions', type: 'total_played', val: 10, icon: '🔥' },
      { key: 'brain_open', tr: 'Beyin Açıldı', en: 'Brain Unlocked', descTr: '50 seri', descEn: '50 streak', type: 'streak', val: 50, icon: '🧠' },
      { key: 'eagle_eye', tr: 'Dikkatli Gözler', en: 'Eagle Eye', descTr: 'Dikkat soruları 10 doğru', descEn: '10 attention correct', type: 'category_correct', val: 10, icon: '👀' },
      { key: 'patient', tr: 'Sabırlı İnsan', en: 'Patient Human', descTr: 'Sabır testini geç', descEn: 'Pass patience test', type: 'specific_type', val: 1, icon: '🕐' },
      { key: 'again', tr: 'Yine mi?', en: 'Again?', descTr: 'Aynı soruyu 3 kez yanlış', descEn: 'Wrong same question 3x', type: 'repeat_wrong', val: 3, icon: '🤦' },
      { key: 'legend', tr: 'Efsane', en: 'Legend', descTr: '100 seri', descEn: '100 streak', type: 'streak', val: 100, icon: '👑' },
      { key: 'fast_reflex', tr: 'Şimşek', en: 'Lightning', descTr: '1 sn altında cevap', descEn: 'Answer in <1s', type: 'speed', val: 1, icon: '⚡' },
      { key: 'slowpoke', tr: 'Kaplumbağa', en: 'Slowpoke', descTr: '1 dk bekle', descEn: 'Wait 1min', type: 'slow', val: 60, icon: '🐢' },
      { key: 'perfectionist', tr: 'Mükemmeliyetçi', en: 'Perfectionist', descTr: '%100 başarı', descEn: '100% score', type: 'perfect_game', val: 1, icon: '💯' },
    ];

    for (const a of achs) {
      const exists = db.exec(`SELECT id FROM achievements WHERE key = '${a.key}'`);
      if (!exists.length || !exists[0].values.length) {
        run('INSERT INTO achievements (key, icon, name_tr, name_en, description_tr, description_en, condition_type, condition_value) VALUES (?,?,?,?,?,?,?,?)',
          [a.key, a.icon, a.tr, a.en, a.descTr, a.descEn, a.type, a.val]);
      }
    }
    console.log('✅ 10 adet başarım rozeti eklendi.');

    // Diske kaydet
    saveDb();
    console.log('🎉 Seed işlemi başarıyla tamamlandı!');
    console.log(`🔑 Admin giriş bilgileri → E-posta: ${adminEmail} | Şifre: ${adminPass}`);

  } catch (error) {
    console.error('❌ Seed hatası:', error);
    process.exit(1);
  }
};

runSeed();
