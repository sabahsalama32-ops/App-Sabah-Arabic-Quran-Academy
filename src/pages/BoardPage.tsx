import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Tool = 'pen' | 'highlighter' | 'eraser' | 'laser';
type Background = 'white' | 'warm' | 'dark' | 'grid' | 'graph';

const WIDTH = 1600;
const HEIGHT = 900;
const DB_NAME = 'teacher-app-board';
const STORE = 'boards';
const KEY = 'default';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveLocal(dataUrl: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ dataUrl, updatedAt: new Date().toISOString() }, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function loadLocal(): Promise<string | null> {
  const db = await openDb();
  const value = await new Promise<{ dataUrl?: string } | undefined>((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return value?.dataUrl ?? null;
}

function secondsLabel(total: number) {
  const m = Math.floor(Math.max(0, total) / 60);
  const s = Math.max(0, total) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function BoardPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<string[]>([]);
  const futureRef = useRef<string[]>([]);
  const saveTimerRef = useRef<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const projectInputRef = useRef<HTMLInputElement | null>(null);

  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#111111');
  const [width, setWidth] = useState(6);
  const [background, setBackground] = useState<Background>('white');
  const [saveStatus, setSaveStatus] = useState('سبورة جديدة');
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerValue, setTimerValue] = useState(180);
  const [timerRunning, setTimerRunning] = useState(false);
  const [rewards, setRewards] = useState(0);
  const [reinforcement, setReinforcement] = useState<string | null>(null);
  const [spotlight, setSpotlight] = useState(false);
  const [curtain, setCurtain] = useState(false);
  const [curtainHeight, setCurtainHeight] = useState(45);
  const [ruler, setRuler] = useState(false);
  const [protractor, setProtractor] = useState(false);
  const [calculator, setCalculator] = useState(false);
  const [calc, setCalc] = useState('0');
  const [fullscreen, setFullscreen] = useState(false);

  const canvas = () => canvasRef.current;
  const ctx = () => canvas()?.getContext('2d') ?? null;

  const fillBackground = (kind = background) => {
    const c = canvas();
    const context = ctx();
    if (!c || !context) return;
    context.save();
    context.globalCompositeOperation = 'destination-over';
    context.fillStyle = kind === 'dark' ? '#16211B' : kind === 'warm' ? '#FBF8F0' : '#FFFFFF';
    context.fillRect(0, 0, WIDTH, HEIGHT);
    if (kind === 'grid' || kind === 'graph') {
      const step = kind === 'grid' ? 80 : 40;
      context.strokeStyle = kind === 'graph' ? '#D7DEE8' : '#E5E7EB';
      context.lineWidth = 1;
      for (let x = step; x < WIDTH; x += step) {
        context.beginPath(); context.moveTo(x, 0); context.lineTo(x, HEIGHT); context.stroke();
      }
      for (let y = step; y < HEIGHT; y += step) {
        context.beginPath(); context.moveTo(0, y); context.lineTo(WIDTH, y); context.stroke();
      }
    }
    context.restore();
  };

  const snapshot = () => canvas()?.toDataURL('image/png') ?? '';
  const pushHistory = () => {
    const snap = snapshot();
    if (snap) historyRef.current = [...historyRef.current.slice(-49), snap];
    futureRef.current = [];
  };

  const restore = (dataUrl: string) => {
    const c = canvas();
    const context = ctx();
    if (!c || !context) return;
    const img = new Image();
    img.onload = () => {
      context.clearRect(0, 0, WIDTH, HEIGHT);
      context.drawImage(img, 0, 0, WIDTH, HEIGHT);
    };
    img.src = dataUrl;
  };

  const scheduleSave = () => {
    setSaveStatus('غير محفوظ');
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(async () => {
      try {
        await saveLocal(snapshot());
        setSaveStatus('محفوظ محليًا');
      } catch {
        setSaveStatus('تعذر الحفظ المحلي — نزّل نسخة يدويًا');
      }
    }, 700);
  };

  useEffect(() => {
    const c = canvas();
    if (!c) return;
    const context = c.getContext('2d');
    if (!context) return;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    fillBackground('white');
    loadLocal().then((saved) => saved ? restore(saved) : null).catch(() => null);
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setTimerValue((current) => {
        if (current <= 1) {
          setTimerRunning(false);
          setReinforcement('انتهى الوقت!');
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  useEffect(() => {
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => document.removeEventListener('fullscreenchange', onFullscreen);
  }, []);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (WIDTH / rect.width),
      y: (event.clientY - rect.top) * (HEIGHT / rect.height),
    };
  };

  const down = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === 'laser') return;
    pushHistory();
    drawingRef.current = true;
    lastPointRef.current = point(event);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const p = point(event);
    if (tool === 'laser') {
      const wrap = wrapRef.current;
      if (wrap) {
        wrap.style.setProperty('--laser-x', `${(p.x / WIDTH) * 100}%`);
        wrap.style.setProperty('--laser-y', `${(p.y / HEIGHT) * 100}%`);
      }
      return;
    }
    if (!drawingRef.current || !lastPointRef.current) return;
    const context = ctx();
    if (!context) return;

    context.save();
    if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
      context.lineWidth = Math.max(18, width * 4);
      context.strokeStyle = '#000';
    } else {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = color;
      context.lineWidth = tool === 'highlighter' ? width * 3 : width;
      context.globalAlpha = tool === 'highlighter' ? 0.25 : 1;
    }
    context.beginPath();
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    context.lineTo(p.x, p.y);
    context.stroke();
    context.restore();
    lastPointRef.current = p;
  };

  const up = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    fillBackground();
    scheduleSave();
  };

  const undo = () => {
    const previous = historyRef.current.pop();
    if (!previous) return;
    const current = snapshot();
    if (current) futureRef.current.unshift(current);
    restore(previous);
    scheduleSave();
  };

  const redo = () => {
    const next = futureRef.current.shift();
    if (!next) return;
    const current = snapshot();
    if (current) historyRef.current.push(current);
    restore(next);
    scheduleSave();
  };

  const changeBackground = (next: Background) => {
    pushHistory();
    setBackground(next);
    const c = canvas();
    const context = ctx();
    if (!c || !context) return;
    const current = snapshot();
    context.clearRect(0, 0, WIDTH, HEIGHT);
    setTimeout(() => {
      fillBackground(next);
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0, WIDTH, HEIGHT);
        fillBackground(next);
        scheduleSave();
      };
      img.src = current;
    }, 0);
  };

  const clearBoard = () => {
    if (!window.confirm('هل تريد مسح السبورة؟ يمكنك التراجع بعد ذلك.')) return;
    pushHistory();
    const context = ctx();
    if (!context) return;
    context.clearRect(0, 0, WIDTH, HEIGHT);
    fillBackground();
    scheduleSave();
  };

  const addText = () => {
    const value = window.prompt('اكتب النص الذي تريد إضافته:');
    if (!value?.trim()) return;
    pushHistory();
    const context = ctx();
    if (!context) return;
    context.save();
    context.fillStyle = color;
    context.font = 'bold 54px Arial';
    context.textAlign = 'center';
    context.direction = 'rtl';
    context.fillText(value.trim(), WIDTH / 2, HEIGHT / 2);
    context.restore();
    scheduleSave();
  };

  const addShape = (kind: 'rect' | 'circle' | 'arrow') => {
    pushHistory();
    const context = ctx();
    if (!context) return;
    context.save();
    context.strokeStyle = color;
    context.lineWidth = Math.max(4, width);
    if (kind === 'rect') context.strokeRect(WIDTH / 2 - 180, HEIGHT / 2 - 100, 360, 200);
    if (kind === 'circle') {
      context.beginPath();
      context.arc(WIDTH / 2, HEIGHT / 2, 120, 0, Math.PI * 2);
      context.stroke();
    }
    if (kind === 'arrow') {
      const x1 = WIDTH / 2 - 220, y1 = HEIGHT / 2, x2 = WIDTH / 2 + 220, y2 = HEIGHT / 2;
      context.beginPath(); context.moveTo(x1, y1); context.lineTo(x2, y2); context.stroke();
      context.beginPath(); context.moveTo(x2, y2); context.lineTo(x2 - 45, y2 - 30); context.lineTo(x2 - 45, y2 + 30); context.closePath(); context.fillStyle = color; context.fill();
    }
    context.restore();
    scheduleSave();
  };

  const addImage = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 15 * 1024 * 1024) {
      window.alert('الصورة كبيرة جدًا. استخدم صورة أقل من 15MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        pushHistory();
        const context = ctx();
        if (!context) return;
        const ratio = Math.min(1, 650 / img.width, 430 / img.height);
        const w = img.width * ratio, h = img.height * ratio;
        context.drawImage(img, (WIDTH - w) / 2, (HEIGHT - h) / 2, w, h);
        scheduleSave();
      };
      img.src = String(reader.result ?? '');
    };
    reader.readAsDataURL(file);
  };

  const exportPng = () => {
    const c = canvas();
    if (!c) return;
    const link = document.createElement('a');
    link.href = c.toDataURL('image/png');
    link.download = 'سبورتي.png';
    link.click();
  };
const exportProject = () => {
    const blob = new Blob([JSON.stringify({ schemaVersion: 1, image: snapshot(), background }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'سبورتي.utbboard';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importProject = async (file?: File) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as { schemaVersion?: number; image?: string; background?: Background };
      if (data.schemaVersion !== 1 || !data.image?.startsWith('data:image/')) throw new Error('bad');
      pushHistory();
      setBackground(data.background ?? 'white');
      restore(data.image);
      scheduleSave();
    } catch {
      window.alert('تعذر فتح الملف. اختر ملف .utbboard صالحًا.');
    }
  };

  const showPraise = (message: string) => {
    setRewards((value) => value + 1);
    setReinforcement(message);
    setTimeout(() => setReinforcement(null), 2500);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await wrapRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      window.alert('ملء الشاشة غير متاح في هذا المتصفح.');
    }
  };

  const calcPress = (value: string) => {
    if (value === 'C') return setCalc('0');
    if (value === '=') {
      try {
        const safe = calc.replace(/×/g, '*').replace(/÷/g, '/');
        if (!/^[0-9+\-*/.() ]+$/.test(safe)) throw new Error('bad');
        const match = safe.match(/^(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)$/);
        if (!match) throw new Error('bad');
        const a = Number(match[1]);
        const b = Number(match[3]);
        const op = match[2];
        const result = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : b === 0 ? NaN : a / b;
        setCalc(Number.isFinite(result) ? String(Number(result.toFixed(8))) : 'خطأ');
      } catch {
        setCalc('خطأ');
      }
      return;
    }
    setCalc((current) => current === '0' || current === 'خطأ' ? value : current + value);
  };

  return (
    <main className="board-page">
      <div className="board-app" ref={wrapRef}>
        <header className="board-header">
          <div>
            <button className="board-back" onClick={() => navigate('/')} type="button">العودة للرئيسية</button>
            <h1 id="page-title" tabIndex={-1}>السبورة التعليمية</h1>
            <small>{saveStatus}</small>
          </div>
          <div className="board-header-actions">
            <button onClick={undo} type="button">تراجع</button>
            <button onClick={redo} type="button">إعادة</button>
            <button onClick={toggleFullscreen} type="button">{fullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة'}</button>
          </div>
        </header>

        <div className="board-toolbar" role="toolbar" aria-label="أدوات السبورة">
          <button className={tool === 'pen' ? 'is-active' : ''} onClick={() => setTool('pen')} type="button">قلم</button>
          <button className={tool === 'highlighter' ? 'is-active' : ''} onClick={() => setTool('highlighter')} type="button">تمييز</button>
          <button className={tool === 'eraser' ? 'is-active' : ''} onClick={() => setTool('eraser')} type="button">ممحاة</button>
          <button className={tool === 'laser' ? 'is-active' : ''} onClick={() => setTool('laser')} type="button">ليزر</button>
          <label>اللون <input aria-label="لون القلم" type="color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
          <select aria-label="سماكة القلم" value={width} onChange={(e) => setWidth(Number(e.target.value))}>
            <option value={3}>رفيع</option><option value={6}>متوسط</option><option value={12}>سميك</option>
          </select>
          <button onClick={addText} type="button">نص</button>
          <button onClick={() => addShape('rect')} type="button">مستطيل</button>
          <button onClick={() => addShape('circle')} type="button">دائرة</button>
          <button onClick={() => addShape('arrow')} type="button">سهم</button>
          <button onClick={() => imageInputRef.current?.click()} type="button">صورة</button>
          <input hidden ref={imageInputRef} type="file" accept="image/*" onChange={(e) => addImage(e.target.files?.[0])} />
        </div>

        <div className="board-teaching-strip" aria-label="أدوات الشرح">
          <button className={timerOpen ? 'is-active' : ''} onClick={() => setTimerOpen((v) => !v)} type="button">المؤقت</button>
          <button onClick={() => showPraise('أحسنت! استمر بهذا التركيز.')} type="button">تشجيع ⭐ {rewards}</button>
          <button className={spotlight ? 'is-active' : ''} onClick={() => setSpotlight((v) => !v)} type="button">تركيز</button>
          <button className={curtain ? 'is-active' : ''} onClick={() => setCurtain((v) => !v)} type="button">ستارة</button>
          <button className={ruler ? 'is-active' : ''} onClick={() => setRuler((v) => !v)} type="button">مسطرة</button>
          <button className={protractor ? 'is-active' : ''} onClick={() => setProtractor((v) => !v)} type="button">منقلة</button>
          <button className={calculator ? 'is-active' : ''} onClick={() => setCalculator((v) => !v)} type="button">حاسبة</button>
          <select aria-label="خلفية السبورة" value={background} onChange={(e) => changeBackground(e.target.value as Background)}>
            <option value="white">أبيض</option><option value="warm">فاتح دافئ</option><option value="dark">داكن</option><option value="grid">شبكة</option><option value="graph">ورق بياني</option>
          </select>
          <button onClick={exportPng} type="button">PNG</button>
          <button onClick={exportProject} type="button">حفظ ملف</button>
          <button onClick={() => projectInputRef.current?.click()} type="button">فتح ملف</button>
          <input hidden ref={projectInputRef} type="file" accept=".utbboard,application/json" onChange={(e) => importProject(e.target.files?.[0])} />
          <button className="board-danger" onClick={clearBoard} type="button">مسح</button>
        </div>

        <div className={`board-canvas-wrap${tool === 'laser' ? ' is-laser' : ''}`}>
          <canvas
            aria-label="مساحة السبورة التعليمية"
            height={HEIGHT}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            ref={canvasRef}
            width={WIDTH}
          />
          {tool === 'laser' && <span className="board-laser-dot" aria-hidden="true" />}
          {spotlight && <div className="board-spotlight" aria-hidden="true" />}
          {curtain && (
            <div className="board-curtain" style={{ height: `${curtainHeight}%` }}>
              <label>تحكم في الستارة
                <input min="10" max="90" type="range" value={curtainHeight} onChange={(e) => setCurtainHeight(Number(e.target.value))} />
              </label>
            </div>
          )}
          {ruler && <div className="board-ruler" aria-label="مسطرة">0&nbsp;&nbsp;1&nbsp;&nbsp;2&nbsp;&nbsp;3&nbsp;&nbsp;4&nbsp;&nbsp;5&nbsp;&nbsp;6&nbsp;&nbsp;7&nbsp;&nbsp;8&nbsp;&nbsp;9&nbsp;&nbsp;10</div>}
          {protractor && <div className="board-protractor" aria-label="منقلة"><span>180°</span><b>90°</b><span>0°</span></div>}
        </div>

        {timerOpen && (
          <section className="board-floating-panel board-timer" aria-label="المؤقت">
            <b>{secondsLabel(timerValue)}</b>
            <div>
              {[60, 180, 300, 600].map((seconds) => <button key={seconds} onClick={() => { setTimerValue(seconds); setTimerRunning(false); }} type="button">{seconds / 60} د</button>)}
            </div>
            <div>
              <button onClick={() => setTimerRunning((v) => !v)} type="button">{timerRunning ? 'إيقاف' : 'ابدأ'}</button>
              <button onClick={() => { setTimerRunning(false); setTimerValue(180); }} type="button">إعادة</button>
            </div>
          </section>
        )}

        {calculator && (
          <section className="board-floating-panel board-calculator" aria-label="الآلة الحاسبة">
            <output>{calc}</output>
            <div className="calc-grid">
              {['7','8','9','÷','4','5','6','×','1','2','3','-','0','.','=','+','C'].map((key) => (
                <button key={key} onClick={() => calcPress(key)} type="button">{key}</button>
              ))}
            </div>
          </section>
        )}

        {reinforcement && <div className="board-praise" role="status">{reinforcement}</div>}
      </div>
    </main>
  );
}
