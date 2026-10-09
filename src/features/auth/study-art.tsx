import { BookOpen, FileText, Play, Sparkles } from "lucide-react";
import { useI18n } from "../../i18n/context";

export function StudyArt() {
  const { language } = useI18n();
  const ar = language === "ar";
  return (
    <div className="study-art" aria-hidden="true">
      <div className="study-orbit" />
      <svg className="study-scene" viewBox="0 0 520 350" fill="none">
        <ellipse cx="260" cy="316" rx="208" ry="19" fill="#091a31" fillOpacity=".35" />
        <rect x="77" y="102" width="365" height="203" rx="20" fill="#e8ecff" />
        <rect x="90" y="115" width="339" height="174" rx="12" fill="#fff" />
        <rect x="90" y="115" width="339" height="32" rx="12" fill="#dfe4ff" />
        <circle cx="108" cy="131" r="4" fill="#7365ed" /><circle cx="122" cy="131" r="4" fill="#36c9d6" /><circle cx="136" cy="131" r="4" fill="#ffbf69" />
        <rect x="107" y="160" width="178" height="110" rx="10" fill="#5145dc" />
        <circle cx="196" cy="215" r="26" fill="#fff" fillOpacity=".2" />
        <path d="M190 202L210 215L190 228V202Z" fill="white" />
        <rect x="301" y="164" width="105" height="9" rx="4" fill="#b6bfe0" />
        <rect x="301" y="184" width="76" height="7" rx="3" fill="#e0e5f4" />
        <rect x="301" y="210" width="105" height="25" rx="7" fill="#eaf9f8" />
        <rect x="312" y="220" width="71" height="5" rx="2" fill="#28aaa4" />
        <rect x="301" y="248" width="92" height="7" rx="3" fill="#e0e5f4" />
        <path d="M57 305H462L478 315C481 318 478 324 472 324H49C43 324 40 318 44 315L57 305Z" fill="#b9c3e7" />
        <path d="M227 305H295L289 313H233L227 305Z" fill="#8c9ccb" />
        <rect x="348" y="284" width="95" height="15" rx="4" fill="#22bdca" />
        <rect x="360" y="269" width="91" height="15" rx="4" fill="#ffbd72" />
        <path d="M62 276C22 250 25 204 48 192C68 210 76 242 62 276Z" fill="#3bc4b0" />
        <path d="M64 279C91 252 91 222 75 212C58 230 54 255 64 279Z" fill="#85e0ca" />
        <path d="M47 276H79L73 312H54L47 276Z" fill="#f4c5a5" />
        <path d="M246 70L291 49L335 70L291 90L246 70Z" fill="#ffcb80" />
        <path d="M266 80V96C281 107 302 107 316 96V80L291 92L266 80Z" fill="#e6a955" />
        <path d="M333 72V99" stroke="#ffcb80" strokeWidth="4" strokeLinecap="round" />
        <path d="M129 74V57M121 65H137M399 70V53M391 61H407" stroke="#9fafff" strokeWidth="3" strokeLinecap="round" />
        <g className="study-student">
          <ellipse cx="401" cy="329" rx="53" ry="10" fill="#091a31" fillOpacity=".3" />
          <path d="M373 261L379 317H399L400 264Z" fill="#26345b" />
          <path d="M400 264L410 316H429L427 254Z" fill="#354570" />
          <path d="M378 313H398V327H367C365 319 371 314 378 313Z" fill="#eef1ff" />
          <path d="M410 313H430L439 327H410Z" fill="#eef1ff" />
          <path d="M386 179C366 182 358 203 361 225L370 272C387 280 413 278 430 267L427 213C426 190 414 180 403 179Z" fill="#32c5ba" />
          <path d="M393 184L400 218L408 184" stroke="#b0f3e9" strokeWidth="3" strokeLinecap="round" />
          <path d="M381 194C374 210 362 221 344 225" stroke="#32c5ba" strokeWidth="19" strokeLinecap="round" />
          <path d="M344 225L327 216" stroke="#edb28d" strokeWidth="12" strokeLinecap="round" />
          <path d="M417 194L441 224L420 245" stroke="#32c5ba" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="390" y="223" width="33" height="47" rx="5" transform="rotate(-12 390 223)" fill="#ffcf86" />
          <path d="M398 230L411 227M399 237L414 234" stroke="#d49a4e" strokeWidth="2" strokeLinecap="round" />
          <path d="M420 245L410 248" stroke="#edb28d" strokeWidth="11" strokeLinecap="round" />
          <rect x="390" y="167" width="18" height="23" rx="7" fill="#edb28d" />
          <ellipse cx="398" cy="147" rx="25" ry="30" fill="#f3c5a4" />
          <path d="M373 148C364 126 373 109 395 111C419 104 432 125 421 147L416 128C400 135 388 126 381 132L378 149Z" fill="#253453" />
          <circle cx="388" cy="148" r="2" fill="#253453" /><circle cx="407" cy="148" r="2" fill="#253453" />
          <path d="M393 159C397 162 401 162 405 158" stroke="#b9735e" strokeWidth="2" strokeLinecap="round" />
          <path d="M379 145H393V154H379ZM402 145H416V154H402ZM393 148H402" stroke="#354570" strokeWidth="2" strokeLinejoin="round" />
        </g>
      </svg>
      <div className="study-float study-float-video"><span><Play size={19} fill="currentColor" /></span><div><strong>{ar ? "محاضراتك في مكان واحد" : "Your lectures, together"}</strong><small>{ar ? "شاهد وتعلّم وقت ما تحب" : "Learn at your own pace"}</small></div></div>
      <div className="study-float study-float-notes"><span><FileText size={21} /></span><strong>{ar ? "ملخصات تساعدك تراجع" : "Notes for your next exam"}</strong></div>
      <div className="study-spark"><Sparkles size={22} /></div>
      <div className="study-book"><BookOpen size={25} /></div>
    </div>
  );
}
