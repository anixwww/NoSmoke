import React from 'react';
import { Calendar, AlertTriangle, X } from 'lucide-react';

interface SetupModalProps {
  initialDateMs: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (dateMs: number) => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  initialDateMs,
  isOpen,
  onClose,
  onSave
}) => {
  const toLocalInput = (ms: number) => {
    const d = new Date(ms);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [dateStr, setDateStr] = React.useState(toLocalInput(initialDateMs));
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setDateStr(toLocalInput(initialDateMs));
    setError('');
  }, [initialDateMs, isOpen]);

  if (!isOpen) return null;

  const handleSetNow = () => {
    setDateStr(toLocalInput(Date.now()));
    setError('');
  };

  const handleSave = () => {
    if (!dateStr) {
      setError('Оберіть дату й час.');
      return;
    }
    const ms = new Date(dateStr).getTime();
    if (!isFinite(ms)) {
      setError('Некоректний формат дати.');
      return;
    }
    if (ms > Date.now() + 60000) {
      setError('Дата не може бути в майбутньому.');
      return;
    }
    onSave(ms);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#E9F1EE] dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-3xl p-5 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1E8A69]" />
            <h3 className="text-base font-bold text-[#12302B] dark:text-[#f4f4f5]">
              Коли ви кинули курити?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-[#55726B] hover:text-[#12302B] p-1"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-4">
          Від цієї миті розраховується час регенерації органів, врятовані гроші та зернятка дерев.
        </p>

        <div className="mb-4">
          <input
            type="datetime-local"
            value={dateStr}
            max={toLocalInput(Date.now())}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full text-sm p-3 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5] focus:outline-none focus:border-[#1E8A69]"
          />
          {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSetNow}
            className="py-2.5 px-3 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5] hover:bg-white/50 cursor-pointer"
          >
            Зараз
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 bg-[#1E8A69] hover:bg-[#187558] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            Зберегти дату
          </button>
        </div>
      </div>
    </div>
  );
};

interface RelapseModalProps {
  isOpen: boolean;
  currentStart: number;
  onClose: () => void;
  onConfirmRelapse: (whenMs: number, note: string) => void;
}

export const RelapseModal: React.FC<RelapseModalProps> = ({
  isOpen,
  currentStart,
  onClose,
  onConfirmRelapse
}) => {
  const toLocalInput = (ms: number) => {
    const d = new Date(ms);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [dateStr, setDateStr] = React.useState(toLocalInput(Date.now()));
  const [note, setNote] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setDateStr(toLocalInput(Date.now()));
    setNote('');
    setError('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const ms = new Date(dateStr).getTime();
    if (!isFinite(ms)) {
      setError('Вкажіть точний час зриву.');
      return;
    }
    if (ms <= currentStart) {
      setError('Час має бути пізнішим за початок поточної серії.');
      return;
    }
    onConfirmRelapse(ms, note.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#E9F1EE] dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-3xl p-5 max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-2 text-[#A33A2C] dark:text-[#F08C7D] mb-2">
          <AlertTriangle className="w-5 h-5 flex-none" />
          <h3 className="text-base font-bold">Зрив трапляється</h3>
        </div>

        <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-4 leading-relaxed">
          Це не стирає вашого досвіду! Пройдений шлях назавжди збережеться в історії як успішна серія, а нова почнеться просто зараз.
        </p>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-[#55726B] dark:text-[#8FAAA3] mb-1">
              Коли це сталося:
            </label>
            <input
              type="datetime-local"
              value={dateStr}
              max={toLocalInput(Date.now())}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full text-xs p-2.5 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] rounded-xl text-[#12302B] dark:text-[#f4f4f5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#55726B] dark:text-[#8FAAA3] mb-1">
              Що спровокувало? (за бажанням)
            </label>
            <textarea
              rows={2}
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Стрес на роботі, алкоголь, вечірка..."
              className="w-full text-xs p-2.5 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] rounded-xl text-[#12302B] dark:text-[#f4f4f5] resize-none"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#B7CDC6] rounded-xl text-xs font-semibold text-[#55726B]"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 bg-[#A33A2C] text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Почати нову серію
          </button>
        </div>
      </div>
    </div>
  );
};
