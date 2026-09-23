import { useMemo, useState } from 'react';
import type { LessonAssistantGuide } from '../data/lesson-support';

interface GuidedLessonAssistantProps {
  guide: LessonAssistantGuide;
}

type Mode = 'explain' | 'example' | 'mistake' | 'quiz' | null;

const modeLabels: Array<{ id: Exclude<Mode, null>; label: string; helper: string }> = [
  { id: 'explain', label: 'مش فاهم الفكرة', helper: 'شرح مبسط خطوة بخطوة' },
  { id: 'example', label: 'اديني مثال', helper: 'مثال جديد يثبت الفكرة' },
  { id: 'mistake', label: 'إيه الخطأ الشائع؟', helper: 'خطأ متكرر وتصحيحه' },
  { id: 'quiz', label: 'اختبرني بسرعة', helper: 'سؤال واحد وتغذية راجعة' },
];

export function GuidedLessonAssistant({ guide }: GuidedLessonAssistantProps) {
  const [mode, setMode] = useState<Mode>(null);
  const [topicIndex, setTopicIndex] = useState(0);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [showSimpler, setShowSimpler] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const topic = useMemo(() => guide.topics[topicIndex] ?? guide.topics[0], [guide.topics, topicIndex]);
  const selectedIsCorrect = selectedOption === guide.quickQuestion.correctIndex;

  const chooseMode = (nextMode: Exclude<Mode, null>) => {
    setMode(nextMode);
    setShowSimpler(false);
setUnderstood(false);
    setSelectedOption(null);
    setExampleIndex(0);
  };

  const chooseTopic = (index: number) => {
    setTopicIndex(index);
    setShowSimpler(false);
    setUnderstood(false);
    setExampleIndex(0);
  };

  return (
    <div className="guided-assistant">
      <div className="guided-assistant__welcome">
        <span className="guided-assistant__avatar" aria-hidden="true">✦</span>
        <div>
          <p className="guided-assistant__eyebrow">مساعد شرح موجّه</p>
          <h3>أنا معاك في درس «{guide.lessonTitle}»</h3>
          <p>{guide.intro}</p>
        </div>
      </div>

      <div className="guided-assistant__actions" aria-label="اختيارات المساعدة">
        {modeLabels.map((item) => (
          <button
            aria-pressed={mode === item.id}
            className={`guided-assistant__action${mode === item.id ? ' is-active' : ''}`}
            key={item.id}
            onClick={() => chooseMode(item.id)}
            type="button"
          >
            <strong>{item.label}</strong>
            <span>{item.helper}</span>
          </button>
        ))}
      </div>

      {mode && mode !== 'quiz' && (
        <div className="guided-assistant__topic-picker">
          <p>اختار النقطة اللي محتاجها:</p>
          <div className="guided-assistant__chips">
            {guide.topics.map((item, index) => (
              <button
                aria-pressed={topicIndex === index}
                className={topicIndex === index ? 'is-active' : ''}
                key={item.id}
                onClick={() => chooseTopic(index)}
                type="button"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'explain' && topic && (
        <div className="guided-assistant__response" aria-live="polite">
          <p className="guided-assistant__speaker">خلينا نفهمها ببساطة 👇</p>
          <h4>{topic.title}</h4>
          <p>{showSimpler ? topic.simpleExplanation : topic.explanation}</p>
          <div className="guided-assistant__response-actions">
            <button onClick={() => setUnderstood(true)} type="button">👍 فهمت</button>
            <button onClick={() => { setShowSimpler(true); setUnderstood(false); }} type="button">🔄 محتاج شرح أبسط</button>
          </div>
          {understood && (
            <p className="guided-assistant__success">ممتاز 👌 لو عايز تثبت الفكرة أكتر، جرّب «اديني مثال» أو «اختبرني بسرعة».</p>
          )}
        </div>
      )}

      {mode === 'example' && topic && (
        <div className="guided-assistant__response" aria-live="polite">
          <p className="guided-assistant__speaker">تعال نجرب مثالًا 👇</p>
          <h4>{topic.title}</h4>
          <p>{topic.examples[exampleIndex % topic.examples.length]}</p>
          {topic.examples.length > 1 && (
            <button
              className="guided-assistant__secondary-button"
              onClick={() => setExampleIndex((current) => current + 1)}
              type="button"
            >
              هات مثال كمان
            </button>
          )}
        </div>
      )}

      {mode === 'mistake' && topic && (
        <div className="guided-assistant__response guided-assistant__response--warning" aria-live="polite">
          <p className="guided-assistant__speaker">خلي بالك من الغلطة دي ⚠️</p>
          <p><strong>الخطأ:</strong> {topic.commonMistake.wrong}</p>
          <p><strong>الصواب:</strong> {topic.commonMistake.correction}</p>
          {topic.commonMistake.reason && <p><strong>ليه؟</strong> {topic.commonMistake.reason}</p>}
        </div>
      )}

      {mode === 'quiz' && (
        <div className="guided-assistant__response guided-assistant__quiz" aria-live="polite">
          <p className="guided-assistant__speaker">يلا أشوف فهمت ولا لأ 😄</p>
          <h4>{guide.quickQuestion.question}</h4>
          <div className="guided-assistant__options">
            {guide.quickQuestion.options.map((option, index) => {
              const chosen = selectedOption === index;
              const correct = index === guide.quickQuestion.correctIndex;
              const stateClass = selectedOption === null
                ? ''
                : correct
                  ? ' is-correct'
                  : chosen
                    ? ' is-wrong'
                    : '';
              return (
                <button
                  aria-pressed={chosen}
                  className={stateClass}
                  key={`${option}-${index}`}
                  onClick={() => setSelectedOption(index)}
                  type="button"
                >
                  {option}
                </button>
              );
            })}
          </div>
          {selectedOption !== null && (
            <div className={selectedIsCorrect ? 'guided-assistant__success' : 'guided-assistant__feedback'}>
              <p>{selectedIsCorrect ? guide.quickQuestion.correctFeedback : guide.quickQuestion.incorrectFeedback}</p>
              {!selectedIsCorrect && guide.quickQuestion.hint && <p><strong>تلميح:</strong> {guide.quickQuestion.hint}</p>}
              {!selectedIsCorrect && (
                <button className="guided-assistant__secondary-button" onClick={() => setSelectedOption(null)} type="button">
                  جرّب مرة تانية
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {!mode && (
        <p className="guided-assistant__hint">ابدأ باختيار نوع المساعدة من الأربع بطاقات اللي فوق.</p>
      )}

      <p className="guided-assistant__note">المحتوى هنا مُعدّ ومراجع داخل الدرس؛ المساعد لا يجيب عن أسئلة مفتوحة خارج المحتوى.</p>
    </div>
  );
}
