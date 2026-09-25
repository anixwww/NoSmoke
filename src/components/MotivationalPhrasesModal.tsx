import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Sparkles, 
  Layers, 
  Heart, 
  Quote, 
  Zap, 
  Bookmark, 
  ChevronRight, 
  ChevronLeft,
  RotateCw,
  Clock,
  Pin
} from 'lucide-react';

export type MotivationStyle = 'quote' | 'card' | 'neon' | 'kraft' | 'ticker';

interface MotivationalPhrasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  reasons: string[];
  onSaveReasons: (newReasons: string[]) => void;
  currentStyle: MotivationStyle;
  onStyleChange: (style: MotivationStyle) => void;
  autoRotate: boolean;
  onAutoRotateChange: (autoRotate: boolean) => void;
  accent?: string;
}

const PRESET_CATEGORIES = [
  {
    name: "🫁 Здоров'я та тіло",
    phrases: [
      'Дихати на повні груди без задишки та кашлю',
      'Зберегти здорове серце, судини та нормальний тиск',
      'Повернути чистий смак їжі та свіжий подих',
      'Повна регенерація клітин і довголіття без токсинів',
      'Глибокий сон та заряд бадьорості зранку'
    ]
  },
  {
    name: '👨‍👩‍👧 Сім’я та близькі',
    phrases: [
      'Бути здоровим прикладом сили для своїх дітей',
      'Захистити рідних від пасивного куріння і запаху',
      'Прожити довгі щасливі роки поруч із коханими',
      'Обіймати близьких без запаху тютюнового диму'
    ]
  },
  {
    name: '💰 Фінанси та свобода',
    phrases: [
      'Заощадити кошти на власні великі мрії та подорожі',
      'Гроші більше не згорають у попільничці',
      'Повна фінансова свобода від тютюнових корпорацій'
    ]
  },
  {
    name: '⚡ Внутрішня сила',
    phrases: [
      'Я контролюю своє життя, а не нікотинова звичка',
      'Справжня сила — це свідомий вибір бути вільним',
      'Кожен подоланий позив робить мене сильнішим та впевненішим',
      'Мій спокій та радість не залежать від сигарети'
    ]
  },
  {
    name: '🐺 Цитати Джейсона Стетхема',
    phrases: [
      'Краще дихати на повні груди, ніж платити за власний дим. Затям.',
      'Якщо вовк не курить, значить димлять його вороги.',
      'Курити може кожен слабак. А кинути — тільки той, у кого сталевий характер.',
      'Потягнуло на перекур? Відіжмися 20 разів і нагадай собі, хто тут бос.',
      'Нікотин думав, що зламає мене. Але він не знав, з ким звʼязався.',
      'Не бійся ламати звички. Бійся, коли звички ламають тебе.',
      'Ти або тримаєш слово перед собою, або пускаєш дим в очі іншим.',
      'Справжній хижак обирає свободу, а не попільничку.'
    ]
  }
];

const STYLE_OPTIONS: { id: MotivationStyle; title: string; desc: string; icon: any }[] = [
  {
    id: 'quote',
    title: 'Лаконічна цитата',
    desc: 'Класичний мінімалізм з витонченими лапками',
    icon: Quote
  },
  {
    id: 'card',
    title: 'Картка-банер',
    desc: 'Стильна рамка з акцентним градієнтом та бейджем',
    icon: Bookmark
  },
  {
    id: 'neon',
    title: 'Неоновий амулет',
    desc: 'Кібер-акцент з індикатором номера та контуром',
    icon: Zap
  },
  {
    id: 'kraft',
    title: 'Стікер сили',
    desc: 'Затишна записка-нагадування з піктограмою шпильки',
    icon: Pin
  },
  {
    id: 'ticker',
    title: 'Слайдер-тикер',
    desc: 'Компактний інтерактивний перемикач із навігацією',
    icon: Layers
  }
];

export const MotivationalPhrasesModal: React.FC<MotivationalPhrasesModalProps> = ({
  isOpen,
  onClose,
  reasons,
  onSaveReasons,
  currentStyle,
  onStyleChange,
  autoRotate,
  onAutoRotateChange,
  accent = 'green'
}) => {
  const [phrasesList, setPhrasesList] = useState<string[]>(reasons);
  const [newPhrase, setNewPhrase] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [activeTab, setActiveTab] = useState<'phrases' | 'presets' | 'styles'>('phrases');
  const [previewIdx, setPreviewIdx] = useState(0);

  // Sync on modal open
  React.useEffect(() => {
    if (isOpen) {
      setPhrasesList(reasons);
      setEditingIdx(null);
      setNewPhrase('');
      setPreviewIdx(0);
    }
  }, [isOpen, reasons]);

  if (!isOpen) return null;

  const handleAddPhrase = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (phrasesList.includes(trimmed)) return;
    const updated = [...phrasesList, trimmed];
    setPhrasesList(updated);
    onSaveReasons(updated);
    setNewPhrase('');
  };

  const handleDeletePhrase = (index: number) => {
    if (phrasesList.length <= 1) {
      alert('Залиште щонайменше одну мотиваційну фразу.');
      return;
    }
    const updated = phrasesList.filter((_, i) => i !== index);
    setPhrasesList(updated);
    onSaveReasons(updated);
  };

  const handleStartEdit = (index: number) => {
    setEditingIdx(index);
    setEditingText(phrasesList[index]);
  };

  const handleSaveEdit = () => {
    if (editingIdx === null) return;
    const trimmed = editingText.trim();
    if (!trimmed) return;
    const updated = [...phrasesList];
    updated[editingIdx] = trimmed;
    setPhrasesList(updated);
    onSaveReasons(updated);
    setEditingIdx(null);
  };

  const getAccentText = () => {
    switch (accent) {
      case 'indigo': return 'text-indigo-600 dark:text-indigo-400';
      case 'gray': return 'text-slate-600 dark:text-slate-400';
      case 'amber': return 'text-amber-600 dark:text-amber-400';
      case 'rose': return 'text-rose-600 dark:text-rose-400';
      case 'emerald': return 'text-emerald-600 dark:text-emerald-400';
      case 'teal': return 'text-teal-600 dark:text-teal-400';
      case 'sage': return 'text-stone-600 dark:text-stone-400';
      case 'green':
      default: return 'text-[#1E8A69] dark:text-[#4CC9A0]';
    }
  };

  const getAccentBg = () => {
    switch (accent) {
      case 'indigo': return 'bg-indigo-500/10 dark:bg-indigo-400/15 border-indigo-500/30';
      case 'gray': return 'bg-slate-500/10 dark:bg-slate-400/15 border-slate-500/30';
      case 'amber': return 'bg-amber-500/10 dark:bg-amber-400/15 border-amber-500/30';
      case 'rose': return 'bg-rose-500/10 dark:bg-rose-400/15 border-rose-500/30';
      case 'emerald': return 'bg-emerald-500/10 dark:bg-emerald-400/15 border-emerald-500/30';
      case 'teal': return 'bg-teal-500/10 dark:bg-teal-400/15 border-teal-500/30';
      case 'sage': return 'bg-stone-500/10 dark:bg-stone-400/15 border-stone-500/30';
      case 'green':
      default: return 'bg-[#1E8A69]/10 dark:bg-[#1E8A69]/20 border-emerald-600/30';
    }
  };

  const getAccentBtn = () => {
    switch (accent) {
      case 'indigo': return 'bg-indigo-600 hover:bg-indigo-700 text-white';
      case 'gray': return 'bg-slate-700 hover:bg-slate-800 text-white';
      case 'amber': return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'rose': return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'teal': return 'bg-teal-600 hover:bg-teal-700 text-white';
      case 'sage': return 'bg-stone-600 hover:bg-stone-700 text-white';
      case 'green':
      default: return 'bg-[#1E8A69] hover:bg-[#187558] text-white';
    }
  };

  const previewPhrase = phrasesList[previewIdx % (phrasesList.length || 1)] || 'Ваша сильна причина бути вільним';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-50 dark:bg-[#151518] w-full max-w-lg rounded-3xl border border-slate-200 dark:border-[#2d2d35] p-5 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#2d2d35] flex-none">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl ${getAccentBg()} ${getAccentText()} flex items-center justify-center flex-none`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#f4f4f5]">
                Мотиваційні фрази
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#8FAAA3]">
                Налаштуйте свої причини та оберіть улюблений стиль
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1c1c21] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Bar */}
        <div className="mt-3 p-3 bg-white dark:bg-[#1c1c21] rounded-2xl border border-slate-200 dark:border-[#2d2d35] flex-none shadow-2xs">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-2">
            <span>Живий передперегляд на екрані</span>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <button 
                type="button"
                onClick={() => setPreviewIdx((prev) => (prev - 1 + phrasesList.length) % phrasesList.length)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Попередня"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px]">{previewIdx + 1}/{phrasesList.length}</span>
              <button 
                type="button"
                onClick={() => setPreviewIdx((prev) => (prev + 1) % phrasesList.length)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Наступна"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Render Preview according to style */}
          <div className="min-h-[56px] flex items-center justify-center">
            {currentStyle === 'quote' && (
              <div className="text-center py-1 px-3">
                <p className={`text-xs font-medium text-slate-700 dark:text-[#f4f4f5] italic ${getAccentText()}`}>
                  «{previewPhrase}»
                </p>
                <span className="text-[9px] text-slate-400 block mt-0.5">Клікніть для перегляду</span>
              </div>
            )}

            {currentStyle === 'card' && (
              <div className={`w-full p-2.5 rounded-xl ${getAccentBg()} border flex items-center gap-2.5`}>
                <Bookmark className={`w-4 h-4 ${getAccentText()} flex-none`} />
                <div className="min-w-0 flex-1">
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${getAccentText()} block`}>
                    Моя мотивація
                  </span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {previewPhrase}
                  </p>
                </div>
              </div>
            )}

            {currentStyle === 'neon' && (
              <div className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-left flex items-center justify-between gap-2 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-none" />
                  <p className="text-xs font-mono font-bold text-emerald-300 truncate">
                    {previewPhrase}
                  </p>
                </div>
                <span className="text-[9px] font-mono text-emerald-500/80 px-1.5 py-0.5 rounded bg-emerald-950/60 flex-none">
                  #{previewIdx + 1}
                </span>
              </div>
            )}

            {currentStyle === 'kraft' && (
              <div className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-dashed border-amber-500/40 flex items-center gap-2">
                <span className="text-base flex-none">📌</span>
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 italic truncate flex-1">
                  {previewPhrase}
                </p>
              </div>
            )}

            {currentStyle === 'ticker' && (
              <div className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-[#1e1e24] border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <span className={`text-xs ${getAccentText()} font-bold`}>⚡</span>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate flex-1 text-center">
                  {previewPhrase}
                </p>
                <div className="flex items-center gap-0.5 flex-none">
                  {phrasesList.slice(0, 5).map((_, i) => (
                    <span 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full ${i === previewIdx % phrasesList.length ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-[#2d2d35] mt-3 flex-none">
          <button
            type="button"
            onClick={() => setActiveTab('phrases')}
            className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'phrases'
                ? `border-emerald-500 ${getAccentText()}`
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Мої фрази ({phrasesList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('styles')}
            className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'styles'
                ? `border-emerald-500 ${getAccentText()}`
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Стилі відображення
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? `border-emerald-500 ${getAccentText()}`
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Бібліотека ідей ✨
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {/* TAB 1: PHRASES LIST & EDIT */}
          {activeTab === 'phrases' && (
            <div className="space-y-3">
              {/* Add form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddPhrase(newPhrase);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={newPhrase}
                  onChange={(e) => setNewPhrase(e.target.value)}
                  placeholder="Додайте свою особисту причину..."
                  className="flex-1 bg-white dark:bg-[#1c1c21] border border-slate-200 dark:border-[#2d2d35] rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
                <button
                  type="submit"
                  disabled={!newPhrase.trim()}
                  className={`px-3.5 py-2 ${getAccentBtn()} font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-2xs active:scale-95 disabled:opacity-50`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Додати</span>
                </button>
              </form>

              {/* List */}
              <div className="space-y-2">
                {phrasesList.map((phrase, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#1c1c21] border border-slate-200 dark:border-[#2d2d35] shadow-2xs flex items-center justify-between gap-2"
                  >
                    {editingIdx === idx ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg cursor-pointer"
                          title="Зберегти"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-mono font-bold flex items-center justify-center flex-none">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate">
                            «{phrase}»
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-none">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(idx)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            title="Редагувати"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePhrase(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
                            title="Видалити"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: STYLES SELECTOR */}
          {activeTab === 'styles' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2.5">
                {STYLE_OPTIONS.map((style) => {
                  const Icon = style.icon;
                  const isSelected = currentStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => onStyleChange(style.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? `border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 shadow-xs`
                          : 'border-slate-200 dark:border-[#2d2d35] bg-white dark:bg-[#1c1c21] hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-none ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {style.title}
                          </h4>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5" />
                              <span>Активний</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-[#8FAAA3] truncate">
                          {style.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Auto-rotate toggle */}
              <div className="mt-4 p-3 rounded-2xl bg-white dark:bg-[#1c1c21] border border-slate-200 dark:border-[#2d2d35] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="w-4 h-4 text-emerald-500 flex-none" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Автоперемикання фраз
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Змінювати фразу кожні 15 секунд на екрані
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAutoRotateChange(!autoRotate)}
                  className={`relative inline-flex h-5 w-9 flex-none cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoRotate ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      autoRotate ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PRESETS & INSPIRATION */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Натисніть на будь-яку фразу нижче, щоб миттєво додати її до свого щоденного списку мотивації:
              </p>

              {PRESET_CATEGORIES.map((cat, catIdx) => (
                <div key={catIdx} className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {cat.name}
                  </h4>
                  <div className="space-y-1.5">
                    {cat.phrases.map((phrase, pIdx) => {
                      const isAdded = phrasesList.includes(phrase);
                      return (
                        <div
                          key={pIdx}
                          onClick={() => !isAdded && handleAddPhrase(phrase)}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                            isAdded
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 cursor-default'
                              : 'bg-white dark:bg-[#1c1c21] border-slate-200 dark:border-[#2d2d35] hover:border-emerald-500/50 cursor-pointer active:scale-[0.99]'
                          }`}
                        >
                          <span className="font-medium">«{phrase}»</span>
                          {isAdded ? (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 flex-none">
                              <Check className="w-3 h-3" />
                              <span>Додано</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 flex-none"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Додати</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-[#2d2d35] flex items-center justify-between flex-none">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Всього {phrasesList.length} мотиваційних фраз
          </span>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 ${getAccentBtn()} font-bold rounded-xl text-xs cursor-pointer shadow-xs active:scale-95`}
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
