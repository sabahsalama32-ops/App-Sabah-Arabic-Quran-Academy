import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import lesson01Data from '../src/data/lessons/lesson-01.json';
import { LessonAccordion } from '../src/components/LessonAccordion';
import type { LessonContent } from '../src/types/content';

const emptyLesson = lesson01Data as LessonContent;

describe('سلوك أكورديون الدرس', () => {
  it('يفتح قسم أهم النقاط افتراضيًا عند خلو الأقسام ويعرض الأقسام التسعة', () => {
    render(<LessonAccordion lesson={emptyLesson} />);
    const explanation = screen.getByRole('button', { name: /أهم النقاط الرئيسة بالدرس/ });
    const assistant = screen.getByRole('button', { name: /اسألني وأنا هشرح لك/ });

    expect(explanation.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('button')).toHaveLength(9);

    fireEvent.click(assistant);
    expect(explanation.getAttribute('aria-expanded')).toBe('false');
    expect(assistant.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('لم يُضف مساعد شرح موجّه لهذا الدرس بعد.')).toBeTruthy();
  });

  it('يفتح أول قسم به محتوى تلقائيًا', () => {
    const lessonWithActivity = {
      ...emptyLesson,
      activities: [
        {
          id: 'test-activity',
          title: 'نشاط تجريبي',
          url: 'https://example.com/activity',
          format: 'نشاط',
        },
      ],
    } as LessonContent;

    render(<LessonAccordion lesson={lessonWithActivity} />);
    const activities = screen.getByRole('button', { name: /الأنشطة والألعاب التعليمية/ });
    expect(activities.getAttribute('aria-expanded')).toBe('true');
  });

  it('يعرض الحالة الفارغة للواجبات في القالب النظيف', () => {
    render(<LessonAccordion lesson={emptyLesson} />);
    fireEvent.click(screen.getByRole('button', { name: /الواجبات \/ الاختبارات/ }));
    expect(screen.getByText('لم تُضف واجبات أو اختبارات لهذا الدرس بعد.')).toBeTruthy();
  });
});
