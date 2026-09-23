import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const scale = [1, 2, 3, 4, 5] as const;

type Question = { id: number; text: string };
type ScoreItem = { key: string; label: string; score: number };

const questions: Question[] = [
  { id: 1, text: 'أستطيع التعبير عن أفكاري بالكلام أو الكتابة بسهولة.' },
  { id: 2, text: 'أتذكر الكلمات والمعاني والمعلومات المكتوبة بصورة جيدة.' },
  { id: 3, text: 'أحب حل المسائل والألغاز واكتشاف العلاقات بين الأشياء.' },
  { id: 4, text: 'أحب ترتيب المعلومات في خطوات ومقارنة الأشياء ببعضها.' },
  { id: 5, text: 'أفهم المعلومة أسرع عندما أراها في صورة أو خريطة أو رسم.' },
  { id: 6, text: 'أتذكر الأشكال والأماكن والصور والتفاصيل البصرية بسهولة.' },
  { id: 7, text: 'أحب أن أتعلم عن طريق الحركة والتجربة والعمل بيدي.' },
  { id: 8, text: 'أفهم المهمة بشكل أفضل عندما أجرب تنفيذها بنفسي.' },
  { id: 9, text: 'أنتبه بسهولة إلى الأصوات والإيقاع والنغم.' },
  { id: 10, text: 'يسهل عليّ تذكر بعض المعلومات عندما أربطها بصوت أو إيقاع.' },
  { id: 11, text: 'أفهم مشاعر الآخرين وأستطيع العمل معهم بصورة جيدة.' },
  { id: 12, text: 'أستمتع بشرح ما تعلمته لزميل أو مساعدته على الفهم.' },
  { id: 13, text: 'أعرف الأشياء التي أجيدها والأشياء التي أحتاج إلى تحسينها.' },
  { id: 14, text: 'أستطيع أن أضع لنفسي هدفًا وأتابع تقدمي فيه.' },
  { id: 15, text: 'أحب ملاحظة الحيوانات والنباتات والبيئة وتصنيف الأشياء من حولي.' },
  { id: 16, text: 'أفهم بعض الأفكار بصورة أفضل عندما أربطها بالطبيعة والحياة من حولي.' },
  { id: 17, text: 'الصور والإنفوجرافيك والخرائط تساعدني كثيرًا على الفهم.' },
  { id: 18, text: 'الاستماع إلى الشرح والحوار يساعدني كثيرًا على الفهم.' },
  { id: 19, text: 'القراءة وكتابة الملاحظات بنفسي تساعدني على التعلم.' },
  { id: 20, text: 'الألعاب والتجارب والأنشطة العملية تجعلني أفهم بصورة أفضل.' },
  { id: 21, text: 'المناقشة والعمل مع زملائي يساعدانني على اكتشاف أفكار جديدة.' },
  { id: 22, text: 'أحيانًا أفهم وأركز أكثر عندما أتعلم وحدي في مكان هادئ.' },
  { id: 23, text: 'أستطيع التركيز على مهمة تعليمية حتى أنهي جزءًا واضحًا منها.' },
  { id: 24, text: 'عندما أتعلم معلومة جديدة أحاول ربطها بشيء أعرفه من قبل.' },
  { id: 25, text: 'إذا لم أفهم بطريقة معينة، أجرب طريقة أخرى مثل صورة أو مثال أو سؤال أو تجربة.' },
  { id: 26, text: 'بعد انتهاء الدرس أستطيع تحديد ما فهمته وما الذي أحتاج إلى مراجعته.' },
  { id: 27, text: 'أحب طرح الأسئلة والبحث عندما أقابل شيئًا لا أعرفه.' },
  { id: 28, text: 'عندما يكون السؤال صعبًا أحاول أكثر من مرة قبل أن أتركه.' },
  { id: 29, text: 'أستطيع البدء في واجبي أو مهمتي دون الحاجة إلى تذكير مستمر.' },
  { id: 30, text: 'عندما أخطئ أحاول معرفة سبب الخطأ واستخدامه لتحسين إجابتي التالية.' },
];

const intelligenceGroups = [
  { key: 'linguistic', label: 'القدرة اللغوية', ids: [1, 2] },
  { key: 'logical', label: 'القدرة المنطقية', ids: [3, 4] },
  { key: 'visual', label: 'القدرة البصرية المكانية', ids: [5, 6] },
  { key: 'kinesthetic', label: 'التعلم الحركي والتجريبي', ids: [7, 8] },
  { key: 'musical', label: 'الحس السمعي والإيقاعي', ids: [9, 10] },
  { key: 'social', label: 'التعلم الاجتماعي', ids: [11, 12] },
  { key: 'intrapersonal', label: 'معرفة الذات', ids: [13, 14] },
  { key: 'naturalistic', label: 'الربط بالطبيعة والتصنيف', ids: [15, 16] },
];

const learningPreferences = [
  { key: 'visual', label: 'التعلم البصري', ids: [17] },
  { key: 'auditory', label: 'الاستماع والحوار', ids: [18] },
  { key: 'readwrite', label: 'القراءة والكتابة', ids: [19] },
  { key: 'practice', label: 'التعلم العملي والتجريبي', ids: [20] },
  { key: 'collaborative', label: 'التعلم التعاوني', ids: [21] },
  { key: 'solo', label: 'التعلم الفردي الهادئ', ids: [22] },
];

const studySkills = [
  { key: 'focus', label: 'التركيز وإنهاء المهمة', ids: [23] },
  { key: 'connection', label: 'ربط الجديد بما تعرفه', ids: [24] },
  { key: 'flexibility', label: 'المرونة وتغيير طريقة التعلم', ids: [25] },
  { key: 'metacognition', label: 'مراجعة فهمك بنفسك', ids: [26] },
];

const habits = [
  { key: 'curiosity', label: 'الفضول وطرح الأسئلة', ids: [27] },
  { key: 'persistence', label: 'المثابرة أمام الصعوبة', ids: [28] },
  { key: 'independence', label: 'الاستقلالية وبدء المهمة', ids: [29] },
  { key: 'errorlearning', label: 'التعلم من الخطأ', ids: [30] },
];

const preferenceAdvice: Record<string, string[]> = {
  visual: ['حوّل الدرس إلى خريطة أو رسم.', 'استخدم لونين أو ثلاثة لتمييز العلاقات.', 'ارسم الفكرة من الذاكرة بعد مشاهدتها.'],
  auditory: ['اشرح الفكرة بصوتك.', 'اسمع جزءًا قصيرًا ثم لخّصه.', 'حوّل النقاط إلى أسئلة وأجب بصوت مرتفع.'],
  readwrite: ['اكتب ملخصًا بلغتك.', 'حوّل العناوين إلى أسئلة.', 'استخدم بطاقات سؤال وجواب.'],
  practice: ['ابدأ بمثال أو تجربة.', 'طبّق القاعدة على مثال جديد.', 'اجعل كل جلسة تنتهي بمهمة عملية.'],
  collaborative: ['اشرح لزميل بعد أن تحاول وحدك.', 'ناقش سؤالًا صعبًا.', 'استخدم: أشرح — اسأل — أصحح.'],
  solo: ['خصص جلسات هادئة قصيرة.', 'اكتب هدف الجلسة.', 'راجع نفسك ثم اطلب المساعدة فيما تعثر.'],
};

function scoreGroups(groups: Array<{ key: string; label: string; ids: number[] }>, answers: Record<number, number>): ScoreItem[] {
  return groups.map((group) => ({
    key: group.key,
    label: group.label,
    score: group.ids.reduce((sum, id) => sum + (answers[id] ?? 0), 0) / group.ids.length,
  })).sort((a, b) => b.score - a.score);
}

function scoreLabel(score: number) {
  if (score >= 4) return 'نقطة قوة واضحة';
  if (score >= 3) return 'مستوى جيد قابل للتطوير';
  return 'مساحة مناسبة للتدريب';
}

export function LearningProfilePage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const completed = Object.keys(answers).length;
  const intelligence = useMemo(() => scoreGroups(intelligenceGroups, answers), [answers]);
  const preferences = useMemo(() => scoreGroups(learningPreferences, answers), [answers]);
  const skills = useMemo(() => scoreGroups(studySkills, answers), [answers]);
  const learningHabits = useMemo(() => scoreGroups(habits, answers), [answers]);
  const topPreference = preferences[0];

  const submit = () => {
    if (completed !== questions.length) {
      window.alert(`أكمل جميع الأسئلة أولًا. أجبت الآن عن ${completed} من ${questions.length}.`);
      return;
    }
    setShowResult(true);
    window.setTimeout(() => document.getElementById('profile-result')?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  return (
    <main className="learning-profile-page">
      <section className="container learning-profile-hero">
        <div>
          <p className="section-kicker">بصمة تعلمك ليست صندوقًا ثابتًا</p>
          <h1 id="page-title" tabIndex={-1}>اعرف نمطك التعليمي قبل ما تبدأ مذاكرة</h1>
          <p>
            هذا الاستبيان يساعدك على ملاحظة تفضيلاتك ونقاط قوتك وعاداتك الحالية. النتيجة ليست تشخيصًا نفسيًا،
            ولا تعني أن عليك أن تتعلم بطريقة واحدة فقط.
          </p>
          <div className="profile-progress" aria-label={`تمت الإجابة عن ${completed} من 30`}>
            <span style={{ width: `${(completed / questions.length) * 100}%` }} />
          </div>
          <small>{completed} / {questions.length} سؤال</small>
        </div>
        <img alt="رسم توضيحي لبصمة التعلم" src="/assets/learning-profile-hero.svg" />
      </section>

      <section className="container profile-question-list" aria-label="أسئلة بصمة التعلم">
        {questions.map((question) => (
          <article className="profile-question" key={question.id}>
            <div>
              <b>{question.id}</b>
              <p>{question.text}</p>
            </div>
            <div className="profile-scale" role="radiogroup" aria-label={`درجة السؤال ${question.id}`}>
              {scale.map((value) => (
                <button
                  aria-pressed={answers[question.id] === value}
                  className={answers[question.id] === value ? 'is-selected' : ''}
                  key={value}
                  onClick={() => {
                    setAnswers((current) => ({ ...current, [question.id]: value }));
                    setShowResult(false);
                  }}
                  type="button"
                >
                  {value}
                </button>
              ))}
            </div>
          </article>
        ))}

        <div className="profile-submit-wrap">
          <button className="primary-button" onClick={submit} type="button">اعرض بصمة تعلمي</button>
          <span>1 = منخفض نسبيًا &nbsp; • &nbsp; 5 = مرتفع نسبيًا</span>
        </div>
      </section>

      {showResult && (
        <section className="container profile-result" id="profile-result">
          <div className="profile-result-head">
            <p className="section-kicker">النتيجة</p>
            <h2>هذه بصمة تعلمك الحالية</h2>
            <p>استخدمها كبداية للتجريب، وليس كتصنيف نهائي لشخصيتك أو قدرتك.</p>
          </div>

          <div className="profile-result-grid">
            <ResultCard title="أبرز نقاط القوة" items={intelligence.slice(0, 4)} />
            <ResultCard title="تفضيلات التعلم" items={preferences} />
            <ResultCard title="مهارات الدراسة" items={skills} />
            <ResultCard title="عادات التعلم" items={learningHabits} />
          </div>

          <div className="profile-advice">
            <h3>جرّب هذه الطرق هذا الأسبوع</h3>
            <ul>
              {(preferenceAdvice[topPreference?.key] ?? [
                'جرّب أكثر من طريقة للتعلم.',
                'اختبر نفسك بعد كل جزء.',
                'راجع ما نجح معك وعدّله.',
              ]).map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>

          <div className="profile-week-plan">
            <h3>خطة 7 أيام</h3>
            <ol>
              <li><b>اليوم 1:</b> اختر درسًا واحدًا وحدد هدفًا صغيرًا واضحًا.</li>
              <li><b>اليوم 2:</b> استخدم طريقتك الأقوى في فهم نفس الدرس.</li>
              <li><b>اليوم 3:</b> جرّب طريقة مختلفة عن المعتاد.</li>
              <li><b>اليوم 4:</b> اختبر نفسك دون الرجوع للمصدر.</li>
              <li><b>اليوم 5:</b> اشرح الفكرة لشخص آخر أو لنفسك بصوت مرتفع.</li>
              <li><b>اليوم 6:</b> راجع الأخطاء وحدد سبب كل خطأ.</li>
              <li><b>اليوم 7:</b> قيّم ما نجح، وما ستكرره الأسبوع القادم.</li>
            </ol>
          </div>

          <div className="profile-actions">
            <button className="secondary-button" onClick={() => { setShowResult(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} type="button">
              أعد الاستبيان
            </button>
            <Link className="primary-button" to="/curriculum">ابدأ التعلّم من المناهج</Link>
          </div>
        </section>
      )}
    </main>
  );
}

function ResultCard({ title, items }: { title: string; items: ScoreItem[] }) {
  return (
    <article className="profile-result-card">
      <h3>{title}</h3>
      <div className="profile-score-list">
        {items.map((item) => (
          <div key={item.key}>
            <span><b>{item.label}</b><small>{scoreLabel(item.score)}</small></span>
            <strong>{item.score.toFixed(1)} / 5</strong>
          </div>
        ))}
      </div>
    </article>
  );
}
