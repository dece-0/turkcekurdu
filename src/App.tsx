import React, { useState, useEffect, useRef } from "react";

// --- TYPES ---
export interface Opt {
  id: number;
  word?: string;
  char?: string;
  used: boolean;
  locked?: boolean;
  isWrong?: boolean;
}

export interface QuestionProps {
  question: any;
  target?: string;
  distractors?: string[];
  onComplete: (success?: boolean) => void;
  onWrongAnswer?: () => void;
}

export interface Pair {
  matchId: number;
  left: string;
  right: string;
  uniqueId: string;
}

export interface GenericMatchProps {
  pairs: Pair[];
  onComplete: (success?: boolean) => void;
  onWrongAnswer?: () => void;
}

export interface LessonScreenProps {
  questions: any[];
  onComplete: (success: boolean) => void;
  onWrongAnswer?: () => void;
}

export interface AdminPanelProps {
  onClose: () => void;
}

export interface DialogPart {
  text: string;
  blankIdx: number | null;
}

export interface DialogLine {
  speaker: string;
  parts: DialogPart[];
}

import {
  BookOpen,
  Home,
  Star,
  X,
  Zap,
  Crown,
  ChevronDown,
  Check,
  Database,
  PlusCircle,
  Save,
  Loader,
  LogIn,
  User,
  Lock,
  Info,
  Volume2,
  RefreshCw,
  AudioLines
} from "lucide-react";

// --- SES MOTORU (TTS) ---
export const speakText = (text: string, speakerName: string = "", onStart: (() => void) | null = null, onEnd: (() => void) | null = null) => {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }
  
  window.speechSynthesis.cancel(); 
  
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = 'tr-TR';
  msg.rate = 0.9; 

  const femaleNames = ["ayşe", "ayse", "hilal", "kiraz", "vanessa", "zeynep", "elif", "fatma", "deniz", "aylin", "gül", "selin", "anne", "kız", "kadın"];
  const maleNames = ["ali", "ömer", "ahmet", "mehmet", "akın", "can", "mert", "burak", "emre", "hakan", "kemal", "baba", "oğul", "adam", "erkek"];
  
  let preferredGender = null;
  if (speakerName) {
     const lowerName = speakerName.toLowerCase().trim();
     const words = lowerName.split(/[\s,.'":]+/);
     if (words.some(w => femaleNames.includes(w))) preferredGender = "female";
     if (words.some(w => maleNames.includes(w))) preferredGender = "male";
  }

  const setVoiceAndSpeak = () => {
      window.speechSynthesis.onvoiceschanged = null;
      const voices = window.speechSynthesis.getVoices();
      const trVoices = voices.filter(v => v.lang.includes('tr'));
      
      if (trVoices.length > 0) {
          let selectedVoice = null;
          if (preferredGender === "female") {
              selectedVoice = trVoices.find(v => 
                  v.name.toLowerCase().includes('female') || 
                  v.name.toLowerCase().includes('yelda') || 
                  v.name.toLowerCase().includes('google türkçe') ||
                  v.name.toLowerCase().includes('zeynep')
              ) || trVoices.find(v => !v.name.toLowerCase().includes('male') && !v.name.toLowerCase().includes('tolga'));
          } else if (preferredGender === "male") {
              selectedVoice = trVoices.find(v => 
                  v.name.toLowerCase().includes('male') || 
                  v.name.toLowerCase().includes('tolga') ||
                  v.name.toLowerCase().includes('ahmet')
              ) || trVoices.find(v => !v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('yelda'));
          }
          msg.voice = selectedVoice || trVoices[0];
      }
      
      if (onStart) msg.onstart = onStart;
      if (onEnd) msg.onend = onEnd;

      window.speechSynthesis.speak(msg);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
  } else {
      setVoiceAndSpeak();
  }
};

// CSV Parse Fonksiyonu
const parseCSV = (str: string): Record<string, string>[] => {
  const arr: any[][] = [];
  let quote = false;
  let row = 0, col = 0;
  for (let c = 0; c < str.length; c++) {
    let cc = str[c], nc = str[c+1];
    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || '';
    if (cc === '"' && quote && nc === '"') { arr[row][col] += cc; ++c; continue; }
    if (cc === '"') { quote = !quote; continue; }
    if (cc === ',' && !quote) { ++col; continue; }
    if (cc === '\r' && nc === '\n' && !quote) { ++row; col = 0; ++c; continue; }
    if (cc === '\n' && !quote) { ++row; col = 0; continue; }
    if (cc === '\r' && !quote) { ++row; col = 0; continue; }
    arr[row][col] += cc;
  }
  if (arr.length === 0) return [];
  
  const headers = arr[0].map(h => {
      let s = h.trim();
      s = s.replace(/Ş/g, 'S').replace(/ş/g, 's')
           .replace(/I/g, 'I').replace(/ı/g, 'i')
           .replace(/İ/g, 'I')
           .replace(/Ç/g, 'C').replace(/ç/g, 'c')
           .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
           .replace(/Ö/g, 'O').replace(/ö/g, 'o')
           .replace(/Ü/g, 'U').replace(/ü/g, 'u');
      return s.replace(/[^a-zA-Z0-9]/g, '');
  });
  
  const data: Record<string, string>[] = [];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i].length === 1 && arr[i][0] === "") continue;
    let obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = arr[i][j] ? arr[i][j].trim() : "";
    }
    data.push(obj);
  }
  return data;
};

const LoginScreen: React.FC<{ onLogin: (u: string, p: string) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 items-center justify-center p-6 animate-fadeIn">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <BookOpen size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-800">Türkçe Kurdu</h1>
          <p className="text-gray-400 mt-2 font-medium">Öğrenmeye başlamak için giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Kullanıcı Adı" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-bold px-12 py-4 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-all"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="password" 
              placeholder="Şifre" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-bold px-12 py-4 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-all"
              required
            />
          </div>
          <button type="submit" className="w-full bg-teal-500 text-white font-black text-lg py-4 rounded-xl shadow-lg hover:bg-teal-600 active:scale-95 transition-all flex items-center justify-center">
            <LogIn className="mr-2" size={24} /> GİRİŞ YAP
          </button>
          <button type="button" onClick={() => alert("Kayıt olma özelliği çok yakında eklenecektir.")} className="w-full bg-white border-2 border-gray-200 text-gray-400 font-black text-lg py-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center mt-3">
            KAYIT OL
          </button>
        </form>
      </div>
    </div>
  );
};

const GenericFillBlank: React.FC<QuestionProps> = ({ question, target = "", distractors = [], onComplete, onWrongAnswer }) => {
  const [selectedOpts, setSelectedOpts] = useState<(Opt | null)[]>([]);
  const [options, setOptions] = useState<Opt[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [parts, setParts] = useState<string[]>([]);
  const [btnState, setBtnState] = useState('check');

  useEffect(() => {
    const normalizedQ = question.replace(/\.\.\./g, "{blank}");
    const qParts = normalizedQ.split("{blank}");
    setParts(qParts);
    const blanksCount = qParts.length - 1;

    const targets = target.split(",").map(s => s.trim());
    let opts = [...targets, ...distractors];
    const shuffled = opts.sort(() => Math.random() - 0.5).map((word, id) => ({ id, word, used: false }));
    
    setOptions(shuffled);
    setSelectedOpts(Array(blanksCount).fill(null));
    setFeedback(null);
    setBtnState('check');
    
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
  }, [question, target, distractors]);

  const handleOptClick = (opt: Opt) => {
    if (opt.used || btnState !== 'check' || feedback === 'error') return;
    speakText(opt.word); 
    
    const firstEmptyIdx = selectedOpts.findIndex(x => x === null);
    if (firstEmptyIdx === -1) return;
    
    const newSel = [...selectedOpts];
    newSel[firstEmptyIdx] = opt;
    setSelectedOpts(newSel);
    
    const newOpts = [...options];
    newOpts.find(o => o.id === opt.id).used = true;
    setOptions(newOpts);
  };

  const handleBlankClick = (idx: number) => {
    const opt = selectedOpts[idx];
    if (!opt || opt.locked || btnState !== 'check' || feedback === 'error') return;
    
    const newSel = [...selectedOpts];
    newSel[idx] = null;
    setSelectedOpts(newSel);
    
    const newOpts = [...options];
    newOpts.find(o => o.id === opt.id).used = false;
    setOptions(newOpts);
  };

  const checkAnswer = () => {
    const targets = target.split(",").map(s => s.trim());
    let allCorrect = true;
    let newSel = [...selectedOpts];

    newSel = newSel.map((opt, idx) => {
        if (!opt) {
            allCorrect = false;
            return null;
        }
        if (opt.word === targets[idx]) {
            return { ...opt, locked: true }; 
        } else {
            allCorrect = false;
            return { ...opt, isWrong: true };
        }
    });

    setSelectedOpts(newSel);

    if (allCorrect) {
      setBtnState('awesome');
      setFeedback(null);
      
      const normalizedQ = question.replace(/\.\.\./g, "{blank}");
      let bCount = 0;
      const fullSentence = normalizedQ.replace(/\{blank\}/g, () => targets[bCount++]);
      speakText(fullSentence);

      setTimeout(() => setBtnState('continue'), 2000);
    } else {
      if (onWrongAnswer) onWrongAnswer();
      setFeedback("error");
      setTimeout(() => {
        setFeedback(null);
        setSelectedOpts(currentSel => {
          const nextSel = [...currentSel];
          setOptions(currentOpts => {
              const updatedOpts = [...currentOpts];
              nextSel.forEach((o) => {
                  if (o && o.isWrong) {
                      const poolIdx = updatedOpts.findIndex(poolOpt => poolOpt.id === o.id);
                      if(poolIdx > -1) updatedOpts[poolIdx] = { ...updatedOpts[poolIdx], used: false };
                  }
              });
              return updatedOpts;
          });
          return nextSel.map(o => (o && o.isWrong) ? null : o);
        });
      }, 1500);
    }
  };

  const isAllFilled = selectedOpts.length > 0 && selectedOpts.every(x => x !== null);

  return (
    <div className="flex flex-col h-full items-center p-6 bg-slate-50">
      <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-8">Boşluğu Doldur</h3>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 w-full text-center text-xl font-medium leading-relaxed mb-10">
        {parts.map((part, idx) => {
          const isLocked = selectedOpts[idx]?.locked;
          const isWrong = selectedOpts[idx]?.isWrong;
          const boxStyle = isLocked ? 'border-green-600 bg-green-100/80 text-green-800' 
                         : isWrong ? 'border-red-600 bg-red-100 text-red-800 animate-shake'
                         : selectedOpts[idx] ? 'border-teal-600 bg-teal-100/50 text-teal-800' 
                         : 'border-gray-400 text-transparent';

          return (
          <React.Fragment key={idx}>
            {part}
            {idx < parts.length - 1 && (
              <span 
                onClick={() => handleBlankClick(idx)}
                className={`inline-flex items-center justify-center min-w-[60px] min-h-[30px] border-b-4 mx-1 px-2 text-center font-bold transition-all align-middle rounded-t-lg ${(!isLocked && !isWrong && selectedOpts[idx]) ? 'cursor-pointer' : ''} ${boxStyle}`}>
                {selectedOpts[idx] ? selectedOpts[idx].word : "____"}
              </span>
            )}
          </React.Fragment>
        )})}
      </div>

      <div className="flex flex-wrap justify-center w-full gap-3 mt-auto mb-6">
        {options.map((opt) => (
          <button 
            key={opt.id} 
            onClick={() => handleOptClick(opt)}
            disabled={opt.used}
            className={`py-3 px-5 rounded-xl border-2 font-bold text-lg transition-all ${opt.used ? 'bg-gray-100 border-gray-200 text-gray-300 opacity-50' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95'}`}
          >
            {opt.word}
          </button>
        ))}
      </div>

      <button 
        onClick={(btnState === 'continue' || btnState === 'awesome') ? onComplete : checkAnswer}
        disabled={!isAllFilled && btnState === 'check'}
        className={`w-full py-4 rounded-xl font-black text-lg transition-all ${(!isAllFilled && btnState === 'check') ? 'bg-gray-200 text-gray-400' : (btnState === 'awesome' || btnState === 'continue') ? 'bg-green-500 text-white shadow-lg active:scale-95' : feedback === 'error' ? 'bg-red-500 text-white animate-shake' : 'bg-teal-500 text-white shadow-lg active:scale-95'}`}
      >
        {btnState === 'awesome' ? 'HARİKA!' : btnState === 'continue' ? 'DEVAM ET ➔' : feedback === 'error' ? 'YANLIŞ' : 'KONTROL ET'}
      </button>
    </div>
  );
};

const GenericDialogue: React.FC<QuestionProps> = ({ question, target = "", distractors = [], onComplete, onWrongAnswer }) => {
  const [selectedOpts, setSelectedOpts] = useState<(Opt | null)[]>([]);
  const [options, setOptions] = useState<Opt[]>([]);
  const [btnState, setBtnState] = useState('filling'); // 'filling', 'awesome', 'continue'
  const [playingLine, setPlayingLine] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const targets = React.useMemo(() => target.split(",").map(s => s.trim()), [target]);

  // Metni isimlerden arındırma ve yapılandırma
  const parsedLines = React.useMemo(() => {
      const normalizedQ = question.replace(/\.\.\./g, "{blank}");
      const rawLines = normalizedQ.split(/\n|\|/).map(s => s.trim()).filter(s => s);
      
      return rawLines.map(line => {
          const match = line.match(/^([A-Za-zÇŞĞÜÖİçşğüöı\s]+):\s*(.*)/);
          if (match) {
              return { speaker: match[1].trim(), text: match[2].trim() };
          }
          return { speaker: "Kişi", text: line };
      });
  }, [question]);

  const renderedLines = React.useMemo<DialogLine[]>(() => {
      let bIdx = 0;
      return parsedLines.map(lineObj => {
          const parts = lineObj.text.split("{blank}");
          return {
              speaker: lineObj.speaker,
              parts: parts.map((part, pIdx) => {
                  const isLast = pIdx === parts.length - 1;
                  return { text: part, blankIdx: isLast ? null : bIdx++ };
              })
          };
      });
  }, [parsedLines]);

  const getAudioGender = (speakerName: string) => {
      const femaleNames = ["ayşe", "ayse", "hilal", "kiraz", "vanessa", "zeynep", "elif", "fatma", "deniz", "aylin", "gül", "selin", "anne", "kız", "kadın"];
      const maleNames = ["ali", "ömer", "ahmet", "mehmet", "akın", "can", "mert", "burak", "emre", "hakan", "kemal", "baba", "oğul", "adam", "erkek"];
      const lowerName = speakerName.toLowerCase().trim();
      const words = lowerName.split(/[\s,.'":]+/);
      if (words.some(w => femaleNames.includes(w))) return "female";
      if (words.some(w => maleNames.includes(w))) return "male";
      return null;
  };

  // Ses zinciri motoru
  const playLineAudio = (lineIdx: number, onEndCallback: (() => void) | null = null, currentSelections: (Opt | null)[] | null = null) => {
      if (lineIdx >= renderedLines.length) return;
      
      const lineData = renderedLines[lineIdx];
      let textToRead = "";
      
      // Her zaman target ile doldurup okur.
      lineData.parts.forEach((p: DialogPart) => {
          textToRead += p.text;
          if (p.blankIdx !== null) {
              textToRead += targets[p.blankIdx] || "";
          }
      });

      speakText(textToRead, lineData.speaker, 
          () => {
             setPlayingLine(lineIdx);
          }, 
          () => {
             setPlayingLine(null);
             if (onEndCallback) onEndCallback();
          }
      );
  };

  const playSequence = (idx: number, currentSel: (Opt | null)[] | null = null) => {
      if (idx >= renderedLines.length) return;
      
      const selectionsToUse = currentSel || selectedOpts;
      const lineHasUnsolved = renderedLines[idx].parts.some((p: DialogPart) => 
          p.blankIdx !== null && (!selectionsToUse[p.blankIdx] || !selectionsToUse[p.blankIdx]!.locked)
      );
      
      if (lineHasUnsolved) return; // Kullanıcının çözmediği satırda dur.

      playLineAudio(idx, () => {
          playSequence(idx + 1, currentSel);
      }, currentSel);
  };

  useEffect(() => {
    const blanksCount = parsedLines.reduce((acc, curr) => acc + curr.text.split("{blank}").length - 1, 0);
    let opts = [...targets, ...distractors];
    const shuffled = opts.sort(() => Math.random() - 0.5).map((word, id) => ({ id, word, used: false }));
    
    setOptions(shuffled);
    setSelectedOpts(Array(blanksCount).fill(null));
    setBtnState('filling');
    
    // Uygulama açıldığında sesi yükle ve zinciri başlat
    const timer = setTimeout(() => {
        if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
        if (parsedLines.length > 0) {
            playSequence(0, Array(blanksCount).fill(null));
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [question, target, distractors]);

  // Otomatik yumuşak kaydırma
  useEffect(() => {
      let targetLine = playingLine;
      if (targetLine === null) {
          targetLine = renderedLines.findIndex(line => 
              line.parts.some(p => p.blankIdx !== null && (!selectedOpts[p.blankIdx] || !selectedOpts[p.blankIdx].locked))
          );
      }
      // If all lines are filled, scroll to the last line
      if (targetLine === -1 && renderedLines.length > 0) {
          targetLine = renderedLines.length - 1;
      }
      
      if (targetLine !== null && targetLine !== -1 && lineRefs.current[targetLine]) {
          lineRefs.current[targetLine].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }, [selectedOpts, playingLine, renderedLines]);

  const handleOptClick = (opt: Opt) => {
    if (opt.used) return;

    const firstEmptyIdx = selectedOpts.findIndex(x => x === null || x?.isWrong);
    if (firstEmptyIdx === -1) return;

    const targetWord = targets[firstEmptyIdx];

    if (opt.word === targetWord) {
        // DOĞRU
        const newSel = [...selectedOpts];
        newSel[firstEmptyIdx] = { ...opt, locked: true, isWrong: false };
        setSelectedOpts(newSel);

        const newOpts = [...options];
        newOpts.find(o => o.id === opt.id).used = true;
        setOptions(newOpts);

        const isAllDone = newSel.every(x => x && x.locked);
        if (isAllDone) {
            setBtnState('awesome');
            setTimeout(() => setBtnState('continue'), 2000);
            
            const currentLineIdx = renderedLines.findIndex(line => line.parts.some((p: DialogPart) => p.blankIdx === firstEmptyIdx));
            setTimeout(() => playSequence(currentLineIdx, newSel), 300);
            return;
        }

        const currentLineIdx = renderedLines.findIndex(line => line.parts.some((p: DialogPart) => p.blankIdx === firstEmptyIdx));
        const lineData = renderedLines[currentLineIdx];
        
        const allBlanksInLineLocked = lineData.parts.every((p: DialogPart) => {
            if (p.blankIdx === null) return true;
            return newSel[p.blankIdx] && newSel[p.blankIdx]!.locked;
        });

        if (allBlanksInLineLocked) {
            setTimeout(() => playSequence(currentLineIdx, newSel), 300);
        }

    } else {
        // YANLIŞ
        if (onWrongAnswer) onWrongAnswer();
        speakText(opt.word || ""); 
        
        const newSel = [...selectedOpts];
        newSel[firstEmptyIdx] = { ...opt, isWrong: true };
        setSelectedOpts(newSel);

        setOptions(currentOpts => {
            const updated = [...currentOpts];
            updated.find(o => o.id === opt.id).used = true;
            return updated;
        });

        setTimeout(() => {
            setSelectedOpts(currentSel => {
                const nextSel = [...currentSel];
                if (nextSel[firstEmptyIdx] && nextSel[firstEmptyIdx].isWrong) {
                    nextSel[firstEmptyIdx] = null;
                }
                return nextSel;
            });
            setOptions(currentOpts => {
                const updated = [...currentOpts];
                const optIndex = updated.findIndex(o => o.id === opt.id);
                if (optIndex > -1) updated[optIndex].used = false;
                return updated;
            });
        }, 800);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full items-center p-6 bg-slate-50 overflow-hidden relative">
      <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-6 shrink-0">Diyaloğu Tamamla</h3>
      
      <div ref={containerRef} className="w-full flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-4 pr-2">

        {renderedLines.map((lineData, lineIdx) => {
          const isLeft = lineIdx % 2 === 0;
          const gender = getAudioGender(lineData.speaker);
          const avatar = gender === "female" ? "👩" : gender === "male" ? "👨" : "👤";

          return (
            <div key={lineIdx} ref={el => lineRefs.current[lineIdx] = el} className={`flex items-end ${isLeft ? 'justify-start' : 'justify-end'} w-full relative mb-4`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full bg-gray-200 border border-white shadow-sm flex items-center justify-center text-base shrink-0 z-10 ${isLeft ? 'mr-2 order-1' : 'ml-2 order-2'}`}>
                    {avatar}
                </div>

                {/* Konuşma Balonu */}
                <div className={`flex flex-col max-w-[70%] relative ${isLeft ? 'order-2 items-start' : 'order-1 items-end'}`}>
                   <span className={`text-[9px] font-bold text-gray-400 mb-1 mx-1`}>
                       {lineData.speaker}
                   </span>
                   <div className={`p-3 shadow-sm text-sm font-medium leading-relaxed relative transition-all duration-300 ${playingLine === lineIdx ? (isLeft ? 'bg-teal-50 border-2 border-teal-400 rounded-xl rounded-bl-sm text-gray-900 scale-[1.02] z-20 shadow-md' : 'bg-teal-100 border-2 border-teal-400 rounded-xl rounded-br-sm text-teal-900 scale-[1.02] z-20 shadow-md') : (isLeft ? 'bg-white border border-gray-200 rounded-xl rounded-bl-sm text-gray-800' : 'bg-teal-50 border border-teal-100 rounded-xl rounded-br-sm text-teal-900')}`}>
                     {lineData.parts.map((partObj, pIdx) => {
                        const bIdx = partObj.blankIdx;
                        const isLocked = bIdx !== null && selectedOpts[bIdx]?.locked;
                        const isWrong = bIdx !== null && selectedOpts[bIdx]?.isWrong;
                        const boxStyle = isLocked ? 'border-green-500 bg-green-100 text-green-800' 
                                       : isWrong ? 'border-red-500 bg-red-100 text-red-800 animate-shake'
                                       : selectedOpts[bIdx] ? 'border-teal-500 bg-teal-100 text-teal-800' 
                                       : 'border-gray-400 text-transparent';

                        return (
                        <React.Fragment key={pIdx}>
                          {partObj.text}
                          {bIdx !== null && (
                            <span className={`inline-flex items-center justify-center min-w-[50px] min-h-[24px] border-b-2 mx-1 px-1 text-center font-bold align-middle rounded-t-md ${boxStyle}`}>
                              {selectedOpts[bIdx] ? selectedOpts[bIdx].word : "____"}
                            </span>
                          )}
                        </React.Fragment>
                      )})}
                   </div>
                </div>

                {/* Ses Butonu */}
                <div className={`flex items-center shrink-0 ${isLeft ? 'order-3 ml-1' : 'order-0 mr-1'}`}>
                    <button onClick={() => playLineAudio(lineIdx)} className={`p-1.5 rounded-full transition-colors ${playingLine === lineIdx ? 'text-teal-600 bg-teal-100' : 'text-gray-400 hover:text-teal-500'}`}>
                        <Volume2 size={16} />
                    </button>
                </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-2 mb-4 w-full shrink-0 min-h-[50px]">
        {options.map((opt) => (
          <button 
            key={opt.id} 
            onClick={() => handleOptClick(opt)}
            className={`py-3 px-5 rounded-xl border-2 font-bold transition-all ${opt.used ? 'hidden absolute' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95'}`}
          >
            {opt.word}
          </button>
        ))}
      </div>

      <button 
        onClick={onComplete}
        className={`w-full py-4 rounded-xl font-black text-lg transition-all ${btnState === 'awesome' || btnState === 'continue' ? 'bg-green-500 text-white shadow-lg active:scale-95' : 'bg-gray-200 text-gray-400 opacity-0 pointer-events-none'}`}
      >
        {btnState === 'awesome' ? 'HARİKA!' : 'DEVAM ET ➔'}
      </button>
    </div>
  );
};

const GenericSpellComponent: React.FC<QuestionProps> = ({ question, target = "", onComplete, onWrongAnswer }) => {
  const [selectedLetters, setSelectedLetters] = useState<(Opt | null)[]>([]);
  const [availableLetters, setAvailableLetters] = useState<Opt[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [btnState, setBtnState] = useState('check');

  const cleanTarget = target ? target.replace(/\s+/g, "").toLocaleUpperCase("tr-TR") : "";

  useEffect(() => {
    if(!cleanTarget) return;
    let letters = cleanTarget.split("");
    const alphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";
    for (let i = 0; i < 3; i++) letters.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    const shuffled = letters.sort(() => Math.random() - 0.5).map((char, id) => ({ id, char, used: false }));
    setAvailableLetters(shuffled);
    setSelectedLetters(Array(cleanTarget.length).fill(null));
    setFeedback(null);
    setBtnState('check');
  }, [target, cleanTarget]);

  const handleAvailableClick = (item: Opt) => {
    if (item.used || btnState !== 'check') return;
    const firstEmptyIdx = selectedLetters.findIndex((x) => x === null);
    if (firstEmptyIdx === -1) return;
    const newSelected = [...selectedLetters];
    newSelected[firstEmptyIdx] = item;
    setSelectedLetters(newSelected);
    const newAvail = [...availableLetters];
    newAvail.find((x) => x.id === item.id).used = true;
    setAvailableLetters(newAvail);
    setFeedback(null);
  };

  const handleSelectedClick = (item: Opt | null, idx: number) => {
    if (!item || btnState !== 'check') return;
    const newSelected = [...selectedLetters];
    newSelected[idx] = null;
    setSelectedLetters(newSelected);
    const newAvail = [...availableLetters];
    newAvail.find((x) => x.id === item.id).used = false;
    setAvailableLetters(newAvail);
    setFeedback(null);
  };

  const checkAnswer = () => {
    const typed = selectedLetters.map((x) => x ? x.char : "").join("");
    if (typed === cleanTarget) {
        setBtnState('awesome');
        setFeedback(null);
        speakText(target); 
        setTimeout(() => setBtnState('continue'), 2000);
    } else {
        if (onWrongAnswer) onWrongAnswer();
        setFeedback("Hatalı kelime.");
    }
  };

  const isAllFilled = selectedLetters.length > 0 && selectedLetters.every((x) => x !== null);

  return (
    <div className="flex-1 flex flex-col items-center justify-start w-full">
      <div className="text-xl font-bold text-teal-700 mb-8 bg-white px-6 py-4 rounded-2xl shadow-sm border border-teal-100 w-full flex items-center justify-center min-h-[100px] text-center">
        {question}
      </div>
      <div className="flex flex-wrap justify-center items-center gap-2 mb-8 w-full">
        {selectedLetters.map((item, idx) => {
          const isFilled = item !== null;
          const boxClass = (isFilled && feedback) ? "bg-red-100 border-red-500 text-red-600 animate-shake" : isFilled ? "bg-teal-500 border-teal-700 text-white shadow-md" : "bg-white border-gray-300";
          return (
            <div key={idx} onClick={() => handleSelectedClick(item, idx)} className={`w-10 h-12 border-b-4 rounded-xl flex items-center justify-center text-xl font-bold cursor-pointer transition-all ${boxClass}`}>
              {item ? item.char : ""}
            </div>
          );
        })}
      </div>
      
      <div className="flex flex-wrap justify-center gap-3 mt-auto mb-6 w-full max-w-xs">
        {availableLetters.map((item) => (
          <button key={item.id} onClick={() => handleAvailableClick(item)} disabled={item.used} className={`w-12 h-14 rounded-xl text-xl font-bold border-b-4 transition-all ${item.used ? "bg-gray-200 border-gray-200 text-gray-300 opacity-50" : "bg-white border-gray-300 text-gray-700 shadow-sm active:translate-y-1"}`}>
            {item.char}
          </button>
        ))}
      </div>

      <button 
        onClick={(btnState === 'continue' || btnState === 'awesome') ? onComplete : checkAnswer}
        disabled={!isAllFilled && btnState === 'check'}
        className={`w-full py-4 rounded-xl font-black text-lg transition-all ${(!isAllFilled && btnState === 'check') ? 'bg-gray-200 text-gray-400' : (btnState === 'awesome' || btnState === 'continue') ? 'bg-green-500 text-white shadow-lg active:scale-95' : feedback ? 'bg-red-500 text-white animate-shake' : 'bg-teal-500 text-white shadow-lg active:scale-95'}`}
      >
        {btnState === 'awesome' ? 'HARİKA!' : btnState === 'continue' ? 'DEVAM ET ➔' : feedback ? 'YANLIŞ' : 'KONTROL ET'}
      </button>
    </div>
  );
};

const GenericMatchComponent: React.FC<GenericMatchProps> = ({ pairs, onComplete, onWrongAnswer }) => {
  const [matches, setMatches] = useState<string[]>([]);
  const [selLeft, setSelLeft] = useState<Pair | null>(null);
  const [selRight, setSelRight] = useState<Pair | null>(null);
  const [errorLeft, setErrorLeft] = useState<string | null>(null);
  const [errorRight, setErrorRight] = useState<string | null>(null);
  const [shufLeft, setShufLeft] = useState<Pair[]>([]);
  const [shufRight, setShufRight] = useState<Pair[]>([]);
  const [btnState, setBtnState] = useState('check');

  useEffect(() => {
    if(pairs.length === 0) return;
    setShufLeft([...pairs].sort(() => Math.random() - 0.5));
    setShufRight([...pairs].sort(() => Math.random() - 0.5));
    setBtnState('check');
    setMatches([]); 
  }, [pairs]);

  useEffect(() => {
    if (selLeft && selRight) {
      if (selLeft.matchId === selRight.matchId) {
        
        speakText(selRight.right); 
        
        setMatches((p) => {
          const newMatches = [...p, selLeft.uniqueId, selRight.uniqueId];
          if (newMatches.length === pairs.length * 2) {
            setBtnState('awesome');
            setTimeout(() => setBtnState('continue'), 2000);
          }
          return newMatches;
        });
        setSelLeft(null); setSelRight(null);
      } else {
        if (onWrongAnswer) onWrongAnswer();
        setErrorLeft(selLeft.uniqueId);
        setErrorRight(selRight.uniqueId);
        setTimeout(() => { 
          setSelLeft(null); setSelRight(null); 
          setErrorLeft(null); setErrorRight(null);
        }, 800);
      }
    }
  }, [selLeft, selRight, pairs.length]);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative p-6">
      <h3 className="font-bold text-gray-500 uppercase tracking-widest text-sm text-center mb-4 mt-4">Kelimeleri Eşleştir</h3>
      <div className="flex-1 flex justify-between gap-4 mt-6">
        <div className="flex flex-col gap-3 w-1/2">
          {shufLeft.map((item, i) => {
            const isMatched = matches.includes(item.uniqueId);
            const isSelected = selLeft?.uniqueId === item.uniqueId;
            const isError = errorLeft === item.uniqueId;
            let btnClass = "bg-white border-gray-200 text-gray-700";
            if (isMatched) btnClass = "opacity-40 pointer-events-none bg-gray-100 border-gray-200 text-gray-400";
            else if (isError) btnClass = "bg-red-100 border-red-500 text-red-700 animate-shake";
            else if (isSelected) btnClass = "border-teal-500 bg-teal-50 scale-105 shadow-md text-teal-700";
            
            return (
              <button key={`l-${i}`} onClick={() => { if(!isMatched && !errorLeft){ setSelLeft(item); speakText(item.left); } }} className={`p-3 rounded-xl border-2 font-bold text-lg h-16 flex items-center justify-center transition-all ${btnClass}`}>
                {item.left}
              </button>
            )
          })}
        </div>
        <div className="flex flex-col gap-3 w-1/2">
          {shufRight.map((item, i) => {
            const isMatched = matches.includes(item.uniqueId);
            const isSelected = selRight?.uniqueId === item.uniqueId;
            const isError = errorRight === item.uniqueId;
            let btnClass = "bg-white border-gray-200 text-gray-700";
            if (isMatched) btnClass = "opacity-40 pointer-events-none bg-gray-100 border-gray-200 text-gray-400";
            else if (isError) btnClass = "bg-red-100 border-red-500 text-red-700 animate-shake";
            else if (isSelected) btnClass = "border-teal-500 bg-teal-50 scale-105 shadow-md text-teal-700";
            
            return (
              <button key={`r-${i}`} onClick={() => { if(!isMatched && !errorRight) { setSelRight(item); speakText(item.right); } }} className={`p-3 rounded-xl border-2 font-bold text-sm h-16 flex items-center justify-center text-center transition-all ${btnClass}`}>
                {item.right}
              </button>
            )
          })}
        </div>
      </div>
      
      <button 
        onClick={(btnState === 'continue' || btnState === 'awesome') ? onComplete : undefined}
        disabled={btnState === 'check'}
        className={`w-full mt-6 py-4 rounded-xl font-black text-lg transition-all ${btnState !== 'check' ? 'bg-green-500 text-white shadow-lg active:scale-95' : 'bg-gray-200 text-gray-400 opacity-0 pointer-events-none'}`}
      >
        {btnState === 'awesome' ? 'HARİKA!' : 'DEVAM ET ➔'}
      </button>
    </div>
  );
}

const LessonScreen: React.FC<LessonScreenProps> = ({ questions, onComplete, onWrongAnswer }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center bg-slate-50">
        <Database size={64} className="text-gray-300 mb-4" />
        <p className="text-gray-500 font-bold mb-6">Bu bölümde henüz soru yok!</p>
        <button onClick={() => onComplete(false)} className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold shadow-lg">Geri Dön</button>
      </div>
    );
  }

  const q = questions[currentIndex];
  const nextQ = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(c => c + 1);
    else onComplete(true);
  };

  if (q.type === "spell") {
    return (
      <div key={currentIndex} className="flex flex-col h-full bg-slate-50 relative p-6">
        <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs text-center mb-4 mt-2">Kelimeyi Yaz ({currentIndex + 1}/{questions.length})</h3>
        <GenericSpellComponent question={<div className="text-center"><div className="text-6xl mb-2 drop-shadow-md">{q.img}</div>{q.q}</div>} target={q.t} onComplete={nextQ} onWrongAnswer={onWrongAnswer} />
      </div>
    );
  }

  if (q.type === "boslukDoldurma") {
    return <GenericFillBlank key={currentIndex} question={q.q} target={q.t} distractors={q.distractors} onComplete={nextQ} onWrongAnswer={onWrongAnswer} />;
  }

  if (q.type === "diyalog") {
    return <GenericDialogue key={currentIndex} question={q.q} target={q.t} distractors={q.distractors} onComplete={nextQ} onWrongAnswer={onWrongAnswer} />;
  }

  if (q.type === "match") {
    return <GenericMatchComponent key={currentIndex} pairs={q.pairs} onComplete={nextQ} onWrongAnswer={onWrongAnswer} />;
  }

  return null;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [level, setLevel] = useState("A1");
  const [unit, setUnit] = useState("1");
  const [lesson, setLesson] = useState("101");
  const [questionType, setQuestionType] = useState("KelimeYazma");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [media, setMedia] = useState("");
  const [distractors, setDistractors] = useState("");
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSave = async () => {
    setSaveStatus("loading");
    const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

    const isInfo = questionType === "Bilgi";
    const payload = {
      level, 
      unit, 
      lesson: isInfo ? "-" : lesson, 
      questionType, 
      question, 
      answer: isInfo ? "-" : answer, 
      media: isInfo ? "-" : media, 
      distractors: isInfo ? "-" : distractors
    };

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.result === "success") {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 2000);
        setQuestion(""); setAnswer(""); setMedia(""); setDistractors("");
      } else {
        throw new Error("Kayıt başarısız");
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
      setSaveStatus("error");
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden animate-fadeIn">
      <div className="bg-indigo-600 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2"><Database size={24} /><h2 className="text-xl font-bold">İçerik Stüdyosu</h2></div>
        <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h3 className="font-bold text-indigo-800 text-sm uppercase tracking-wider mb-2 flex items-center"><BookOpen size={16} className="mr-2"/> Nereye Eklenecek?</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-bold ml-1">Seviye</label>
              <select value={level} onChange={(e)=>setLevel(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:border-indigo-500">
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold ml-1">Ünite</label>
              <input type="number" value={unit} onChange={(e)=>setUnit(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:border-indigo-500" placeholder="1" />
            </div>
            {questionType !== "Bilgi" && (
              <div>
                <label className="text-xs text-gray-500 font-bold ml-1">Ders ID</label>
                <input type="number" value={lesson} onChange={(e)=>setLesson(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:border-indigo-500" placeholder="Örn: 101" />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h3 className="font-bold text-indigo-800 text-sm uppercase tracking-wider mb-2 flex items-center"><PlusCircle size={16} className="mr-2"/> Soru Detayları</h3>
          
          <div>
            <label className="text-xs text-gray-500 font-bold ml-1">İçerik Tipi</label>
            <select value={questionType} onChange={(e)=>setQuestionType(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:border-indigo-500">
              <option value="KelimeYazma">Kelime Yazma (Harf Dizme)</option>
              <option value="Eslestirme">Eşleştirme</option>
              <option value="BoslukDoldurma">Boşluk Doldurma (Cümle)</option>
              <option value="Diyalog">Diyalog Tamamlama</option>
              <option value="Bilgi">Ünite Bilgisi (Rehber Ekler)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-bold ml-1">{questionType === "Bilgi" ? "Ünite Gramer / Bilgi Notu" : "Soru Metni (Boşluklar için ... yazın)"}</label>
            <textarea value={question} onChange={(e)=>setQuestion(e.target.value)} rows={questionType === "Bilgi" ? "6" : "3"} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 outline-none focus:border-indigo-500 resize-none" placeholder={questionType === "Bilgi" ? "Bu ünitede geçmiş zaman işlenmektedir..." : "Örn:\nAli: Nereye gidiyorsun?\nAyşe: Okula ..." }></textarea>
          </div>

          {questionType !== "Bilgi" && (
            <>
              <div>
                <label className="text-xs text-gray-500 font-bold ml-1">Doğru Cevap (Çoklu boşluklar için araya virgül koyun)</label>
                <input type="text" value={answer} onChange={(e)=>setAnswer(e.target.value)} className="w-full p-3 bg-green-50 border border-green-200 rounded-xl font-bold text-green-800 outline-none focus:border-green-500" placeholder="Örn: gidiyorum, döndü" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-bold ml-1">Görsel (Emoji)</label>
                  <input type="text" value={media} onChange={(e)=>setMedia(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-indigo-500" placeholder="Örn: 🏫" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold ml-1">Çeldiriciler (Virgülle)</label>
                  <input type="text" value={distractors} onChange={(e)=>setDistractors(e.target.value)} disabled={questionType === "KelimeYazma" || questionType === "Eslestirme"} className={`w-full p-3 border rounded-xl text-gray-700 outline-none focus:border-indigo-500 ${questionType === "KelimeYazma" || questionType === "Eslestirme" ? "bg-gray-200 border-gray-200 opacity-50" : "bg-gray-50 border-gray-200"}`} placeholder="Örn: geliyorum, döndüm" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <button 
          onClick={handleSave} 
          disabled={!question || (questionType !== "Bilgi" && !answer) || saveStatus === "loading"}
          className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center transition-all ${(!question || (questionType !== "Bilgi" && !answer)) ? "bg-gray-200 text-gray-400 cursor-not-allowed" : saveStatus === "loading" ? "bg-indigo-400 text-white" : saveStatus === "success" ? "bg-green-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg active:scale-95"}`}
        >
          {saveStatus === "loading" ? <span className="animate-pulse">Kaydediliyor...</span> : saveStatus === "success" ? <><Check className="mr-2"/> Kaydedildi!</> : <><Save className="mr-2"/> {"Excel'e Kaydet"}</>}
        </button>
      </div>
    </div>
  );
};

const ProfileScreen: React.FC<{ userXP: number, userHearts: number, isAdmin: boolean, openAdminPanel: () => void, onRefillHearts: () => void }> = ({ userXP, userHearts, isAdmin, openAdminPanel, onRefillHearts }) => (
  <div className="p-6 space-y-6">
    <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center space-x-4">
      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold">
        <User size={32} />
      </div>
      <div>
        <h3 className="font-bold text-lg">{isAdmin ? "Öğretmen" : "Öğrenci"}</h3>
        <p className="text-gray-400 text-sm">2026</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-xl border text-center">
        <Star className="mx-auto text-yellow-400 mb-2" />
        <span className="text-2xl font-black block">{userXP}</span>
        <span className="text-xs text-gray-400">Toplam Puan</span>
      </div>
      <div className="bg-white p-4 rounded-xl border text-center relative overflow-hidden">
        <Zap className="mx-auto text-rose-500 mb-2" />
        <span className="text-2xl font-black block">{userHearts}</span>
        <span className="text-xs text-gray-400">Can Hakkı</span>
        {userHearts < 5 && (
            <button onClick={onRefillHearts} className="mt-3 w-full bg-rose-100 text-rose-600 font-bold py-2 rounded-lg text-xs hover:bg-rose-200">
                Can Yenile
            </button>
        )}
      </div>
    </div>

    {isAdmin && (
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 mt-10">
        <Database className="text-indigo-500" size={32} />
        <div className="text-center">
          <h4 className="font-bold text-indigo-900">İçerik Yönetimi</h4>
          <p className="text-xs text-indigo-600">Soru eklemek ve düzenlemek için</p>
        </div>
        <button onClick={openAdminPanel} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all">
          Öğretmen Paneli (Admin)
        </button>
      </div>
    )}
  </div>
);

const RoadmapScreen = ({ units, unitInfoMap, completedLevels, onStart, expandedUnitId, onToggleUnit, openGuideModal, fetchDatabase }) => (
  <div className="flex flex-col items-center p-6">
    {units.length === 0 ? (
      <div className="py-10 text-center w-full mt-10 space-y-6">
        <div className="opacity-50">
          <Crown size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="font-bold text-gray-500 uppercase tracking-widest">HENÜZ İÇERİK YOK</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
          <p className="text-sm text-yellow-800 mb-3 font-medium">
            Yeni eklediğiniz soruların buraya yansıması Google'ın önbellek sistemi nedeniyle <b>3-4 dakika</b> sürebilir. Lütfen bekleyip tekrar deneyin.
          </p>
          <button onClick={fetchDatabase} className="w-full bg-yellow-400 text-yellow-900 py-3 rounded-xl font-bold flex items-center justify-center shadow-sm">
            <RefreshCw size={18} className="mr-2" /> Verileri Yenile
          </button>
        </div>
      </div>
    ) : (
      units.map((unit) => {
        const colorClass = unit.color.bg;
        const borderClass = unit.color.border;
        const guideText = unitInfoMap[unit.id];

        return (
          <div key={unit.id} className="w-full mb-6">
            <div className={`p-4 rounded-2xl flex justify-between items-center text-white shadow-lg cursor-pointer hover:opacity-90 transition-all ${colorClass}`}>
              <div onClick={() => onToggleUnit(unit.id)} className="flex items-center space-x-3 flex-1">
                <ChevronDown className={`transition-transform ${expandedUnitId === unit.id ? 'rotate-180' : ''}`} /> 
                <h3 className="font-bold">{unit.title}</h3>
              </div>
              {/* Bilgi Butonu */}
              {guideText && (
                <button onClick={(e) => { e.stopPropagation(); openGuideModal(guideText, unit.title); }} className="p-2 bg-white/20 rounded-full hover:bg-white/30 ml-2">
                  <Info size={20} />
                </button>
              )}
            </div>
            
            {expandedUnitId === unit.id && (
              <div className="flex flex-col items-center mt-6">
                {unit.levels.map((l, i) => {
                  const off = [0, 60, 0, -60][i % 4];
                  const done = completedLevels.includes(l.id);
                  const btnClass = done ? "bg-yellow-400 border-yellow-600 text-white" : `${colorClass} ${borderClass} text-white shadow-lg hover:brightness-110`;

                  return (
                    <div key={l.id} className="relative mb-8" style={{ transform: `translateX(${off}px)` }}>
                      <button onClick={() => onStart(l.id, l.unitId)} className={`w-20 h-16 rounded-2xl flex items-center justify-center text-3xl border-b-4 active:border-b-0 active:translate-y-1 ${btnClass}`}>
                        {done ? <Star fill="white" size={28} /> : <span className="text-2xl drop-shadow-sm">⭐</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })
    )}
  </div>
);

const NavButton = ({ icon: Icon, label, isActive, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center transition-colors ${isActive ? `text-teal-500` : "text-gray-400"}`}>
    <Icon size={24} />
    <span className="text-[10px] font-bold mt-1">{label}</span>
  </button>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [activeTab, setActiveTab] = useState("home");
  const [userXP, setUserXP] = useState(() => parseInt(localStorage.getItem('userXP') || '0'));
  const [userHearts, setUserHearts] = useState(() => parseInt(localStorage.getItem('userHearts') || '5'));
  
  useEffect(() => {
    localStorage.setItem('userXP', userXP.toString());
  }, [userXP]);

  useEffect(() => {
    localStorage.setItem('userHearts', userHearts.toString());
  }, [userHearts]);

  const handleWrongAnswer = () => {
    setUserHearts(h => Math.max(0, h - 1));
  };

  const refillHearts = () => {
    setUserHearts(5);
  };

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isLessonMode, setIsLessonMode] = useState(false);
  
  // Veritabanı State'leri
  const [database, setDatabase] = useState([]);
  const [unitInfoMap, setUnitInfoMap] = useState({});
  const [isLoadingDB, setIsLoadingDB] = useState(false);
  const [currentProficiency, setCurrentProficiency] = useState("A1");
  const [expandedUnitId, setExpandedUnitId] = useState(null);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [lessonQuestions, setLessonQuestions] = useState([]);
  const [currentLevelId, setCurrentLevelId] = useState(null);
  
  // Bilgi Modalı State'i
  const [guideModal, setGuideModal] = useState({ isOpen: false, text: "", title: "" });

  const handleLogin = (user, pass) => {
    const ADMIN_USER = import.meta.env.VITE_ADMIN_USER;
    const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS;

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    setIsLoggedIn(true);
    fetchDatabase();
  };

  const fetchDatabase = async () => {
    setIsLoadingDB(true);
    const baseUrl = import.meta.env.VITE_GOOGLE_CSV_URL || "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6wgR0dXvQcSmg60AqzkNOQK5DOPYn761l8Dv0MOYhpiN3xJ0X3Uwtu7SWS9iXznrGKC9AH0PVv9kE/pub?output=csv";
    const CSV_URL = `${baseUrl}&t=${new Date().getTime()}`;
    
    try {
      const response = await fetch(CSV_URL);
      const csvText = await response.text();
      const data = parseCSV(csvText);
      
      const infoRows = data.filter(row => row.SoruTipi && row.SoruTipi.replace(/\s+/g, '').toLowerCase() === "bilgi" && row.Seviye && row.Unite);
      const newInfoMap = {};
      infoRows.forEach(row => {
        newInfoMap[`${row.Seviye}_${row.Unite}`] = row.Soru;
      });
      setUnitInfoMap(newInfoMap);

      const validRows = data.filter(row => row.Seviye && row.Unite && row.DersID && row.SoruTipi && row.SoruTipi.replace(/\s+/g, '').toLowerCase() !== "bilgi");
      setDatabase(validRows);
      setIsLoadingDB(false);
      
      if(validRows.length > 0) {
          const firstUnit = validRows.find(r => String(r.Seviye).trim() === currentProficiency)?.Unite;
          if(firstUnit) setExpandedUnitId(firstUnit);
      }
    } catch (err) {
      console.error("CSV okuma hatası:", err);
      setIsLoadingDB(false);
    }
  };

  const handleAdminClose = () => {
    setShowAdminPanel(false);
    fetchDatabase();
  };

  const getDynamicUnits = () => {
    const currentLevelData = database.filter(row => String(row.Seviye).trim() === currentProficiency);
    const unitsMap = {};
    
    currentLevelData.forEach(row => {
      if(!unitsMap[row.Unite]) unitsMap[row.Unite] = new Set();
      unitsMap[row.Unite].add(row.DersID);
    });

    const colors = [
      { bg: "bg-teal-500", border: "border-teal-700" },
      { bg: "bg-orange-500", border: "border-orange-700" },
      { bg: "bg-emerald-500", border: "border-emerald-700" },
      { bg: "bg-purple-500", border: "border-purple-700" },
      { bg: "bg-blue-500", border: "border-blue-700" },
      { bg: "bg-rose-500", border: "border-rose-700" }
    ];
    
    return Object.keys(unitsMap).sort((a,b) => Number(a)-Number(b)).map((unitNum, i) => {
      return {
        id: unitNum,
        title: `Ünite ${unitNum}`,
        color: colors[i % colors.length],
        levels: Array.from(unitsMap[unitNum]).sort((a,b) => Number(a)-Number(b)).map(dersId => ({
          id: dersId,
          unitId: unitNum
        }))
      };
    });
  };

  const handleStartLevel = (lessonId: any, unitId: any) => {
    if (userHearts <= 0) {
      alert("Canınız bitti! Profil sayfasından canlarınızı yenilemeniz gerekiyor.");
      return;
    }

    const safeLessonId = String(lessonId);
    const safeUnitId = String(unitId);

    const rawQs = database.filter(r => 
      String(r.DersID) === safeLessonId && 
      String(r.Seviye).trim() === currentProficiency && 
      String(r.Unite) === safeUnitId
    );
    
    let formattedQs = [];
    let matchPairs = [];

    rawQs.forEach(row => {
        const rawType = String(row.SoruTipi || '').toLowerCase().replace(/\s+/g, '')
              .replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ç/g, 'c')
              .replace(/ğ/g, 'g').replace(/ö/g, 'o').replace(/ü/g, 'u');

        let distractorsArr = row.Celdiriciler ? String(row.Celdiriciler).split(",").map(s => s.trim()).filter(Boolean) : [];
        
        if (rawType.includes("kelimeyazma") || rawType.includes("kelime")) {
            formattedQs.push({ type: "spell", q: row.Soru, t: row.Cevap, img: row.Medya });
        } else if (rawType.includes("boslukdoldurma") || rawType.includes("bosluk")) {
            formattedQs.push({ type: "boslukDoldurma", q: row.Soru, t: row.Cevap, distractors: distractorsArr });
        } else if (rawType.includes("diyalog")) {
            formattedQs.push({ type: "diyalog", q: row.Soru, t: row.Cevap, distractors: distractorsArr });
        } else if (rawType.includes("eslestirme") || rawType.includes("eslestir")) {
            matchPairs.push({ matchId: matchPairs.length, left: row.Cevap || row.Medya || row.Celdiriciler, right: row.Soru });
        }
    });

    if (matchPairs.length > 0) {
        const matchChunks = [];
        for (let i = 0; i < matchPairs.length; i += 5) {
            let chunk = matchPairs.slice(i, i + 5);
            
            let fallbackIndex = 0;
            while (chunk.length < 5) {
                const randomPair = matchPairs[fallbackIndex % matchPairs.length];
                chunk.push({ 
                    ...randomPair
                });
                fallbackIndex++;
            }
            
            chunk = chunk.map(c => ({ ...c, uniqueId: Math.random().toString(36).substr(2, 9) }));
            matchChunks.push({ type: "match", pairs: chunk });
        }
        formattedQs = [...matchChunks, ...formattedQs];
    }

    setLessonQuestions(formattedQs);
    setCurrentLevelId(lessonId);
    setIsLessonMode(true);
  };

  const handleLessonComplete = (success) => {
    if (success && currentLevelId && !completedLevels.includes(currentLevelId)) {
        setCompletedLevels([...completedLevels, currentLevelId]);
        setUserXP(p => p + 50);
    }
    setIsLessonMode(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-200 font-sans">
        <div className="w-full max-w-md h-[850px] bg-slate-50 shadow-2xl overflow-hidden relative sm:rounded-3xl border border-gray-300">
           <LoginScreen onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  const dynamicUnits = getDynamicUnits();

  const mappedUnitInfo = {};
  Object.keys(unitInfoMap).forEach(key => {
    if (key.startsWith(currentProficiency + "_")) {
      const unitNum = key.split("_")[1];
      mappedUnitInfo[unitNum] = unitInfoMap[key];
    }
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200 font-sans">
      <div className="w-full max-w-md h-[850px] bg-slate-50 shadow-2xl overflow-hidden relative flex flex-col sm:rounded-3xl border border-gray-300">
        
        {showAdminPanel && <AdminPanel onClose={handleAdminClose} />}

        {guideModal.isOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-fadeIn" onClick={() => setGuideModal({isOpen: false})}>
            <div className="bg-white rounded-3xl p-6 w-full max-h-[80%] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4 text-teal-600">{guideModal.title} Rehberi</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">{guideModal.text}</p>
              <button onClick={() => setGuideModal({isOpen: false})} className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold mt-6 active:scale-95">Anladım</button>
            </div>
          </div>
        )}

        {!isLessonMode && (
          <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 p-4 pt-6 h-16 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🇹🇷</span>
              <span className="font-bold text-teal-600">Türkçe Kurdu</span>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-1 font-bold text-rose-500"><Zap size={20} fill="currentColor" /> {userHearts}</div>
              <div className="flex items-center space-x-1 font-bold text-yellow-500"><Star size={20} fill="currentColor" /> {userXP}</div>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto pb-24 z-10 relative custom-scrollbar">
          {isLoadingDB && !isLessonMode && (
             <div className="flex flex-col items-center justify-center h-full text-teal-500 space-y-4">
               <Loader size={48} className="animate-spin" />
               <p className="font-bold text-gray-500">İçerikler yükleniyor...</p>
             </div>
          )}

          {!isLoadingDB && activeTab === "home" && !isLessonMode && (
             <>
               <div className="bg-white border-b border-gray-100 flex overflow-x-auto sticky top-0 z-20 shadow-sm custom-scrollbar">
                 {["A1", "A2", "B1", "B2", "C1"].map((lvl) => (
                   <button key={lvl} onClick={() => { setCurrentProficiency(lvl); setExpandedUnitId(null); }} className={`py-4 px-6 font-bold transition-colors text-center shrink-0 ${currentProficiency === lvl ? `text-teal-600 border-b-4 border-teal-500` : "text-gray-400"}`}>
                     {lvl}
                   </button>
                 ))}
               </div>
               <RoadmapScreen 
                 units={dynamicUnits} 
                 unitInfoMap={mappedUnitInfo}
                 completedLevels={completedLevels} 
                 onStart={handleStartLevel} 
                 expandedUnitId={expandedUnitId} 
                 onToggleUnit={(id) => setExpandedUnitId(expandedUnitId === id ? null : id)} 
                 openGuideModal={(text, title) => setGuideModal({isOpen: true, text, title})}
                 fetchDatabase={fetchDatabase}
               />
             </>
          )}

          {!isLoadingDB && activeTab === "profile" && !isLessonMode && (
            <ProfileScreen userXP={userXP} userHearts={userHearts} isAdmin={isAdmin} openAdminPanel={() => setShowAdminPanel(true)} onRefillHearts={refillHearts} />
          )}
          
          {isLessonMode && (
            <div className="absolute inset-0 bg-white z-40 flex flex-col">
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                 <button onClick={() => setIsLessonMode(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
                 <div className="w-8"></div>
              </div>
              <div className="flex-1 flex flex-col overflow-hidden">
                {userHearts > 0 ? (
                  <LessonScreen questions={lessonQuestions} onComplete={handleLessonComplete} onWrongAnswer={handleWrongAnswer} />
                ) : (
                  <div className="flex flex-col h-full items-center justify-center p-6 text-center bg-slate-50">
                      <Zap size={64} className="text-rose-300 mb-4" />
                      <h2 className="text-2xl font-black text-slate-800 mb-2">Canın Bitti!</h2>
                      <p className="text-slate-500 font-medium mb-6">Öğrenmeye devam etmek için Profil sayfasından can yenileyin.</p>
                      <button onClick={() => setIsLessonMode(false)} className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95">Yola Dön</button>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>

        {!isLessonMode && (
          <nav className="absolute bottom-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-200 flex justify-around py-3 pb-6 z-20">
            <NavButton icon={Home} label="Yol" isActive={activeTab === "home"} onClick={() => setActiveTab("home")} />
            <NavButton icon={User} label="Profil" isActive={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
          </nav>
        )}
      </div>
    </div>
  );
}
