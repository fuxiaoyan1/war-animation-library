import { useEffect, useState } from "react";
import { AlexanderConquestsAnimation } from "./components/AlexanderConquestsAnimation";
import { AtlanticConvoyBattleAnimation } from "./components/AtlanticConvoyBattleAnimation";
import { BattleOfBritainAnimation } from "./components/BattleOfBritainAnimation";
import { BattleFranceAnimation } from "./components/BattleFranceAnimation";
import { BigWeekAirBattleAnimation } from "./components/BigWeekAirBattleAnimation";
import { BismarckSeaAirBattleAnimation } from "./components/BismarckSeaAirBattleAnimation";
import { CannaeBattleAnimation } from "./components/CannaeBattleAnimation";
import { CaesarWarsAnimation } from "./components/CaesarWarsAnimation";
import { CrusadesAnimation } from "./components/CrusadesAnimation";
import { EasternFrontAnimation } from "./components/EasternFrontAnimation";
import { GulfWarAnimation } from "./components/GulfWarAnimation";
import { GaixiaAmbushAnimation } from "./components/GaixiaAmbushAnimation";
import { GuadalcanalNavalBattleAnimation } from "./components/GuadalcanalNavalBattleAnimation";
import { JutlandBattleAnimation } from "./components/JutlandBattleAnimation";
import { KoreanWarAnimation } from "./components/KoreanWarAnimation";
import { MidwayBattleAnimation } from "./components/MidwayBattleAnimation";
import { MongolEmpireAnimation } from "./components/MongolEmpireAnimation";
import { NapoleonicWarsAnimation } from "./components/NapoleonicWarsAnimation";
import { NianzhuangBattleAnimation } from "./components/NianzhuangBattleAnimation";
import { PacificWarAnimation } from "./components/PacificWarAnimation";
import { PunicWarsAnimation } from "./components/PunicWarsAnimation";
import { QinUnificationAnimation } from "./components/QinUnificationAnimation";
import { TrafalgarBattleAnimation } from "./components/TrafalgarBattleAnimation";
import { TsushimaBattleAnimation } from "./components/TsushimaBattleAnimation";
import { WarLibraryHome } from "./components/WarLibraryHome";
import "./styles.css";

export type CampaignKey =
  | "home"
  | "france"
  | "eastern"
  | "korean"
  | "nianzhuang"
  | "napoleonic"
  | "punic"
  | "crusades"
  | "mongol"
  | "qin"
  | "alexander"
  | "cannae"
  | "caesar"
  | "britain-air"
  | "atlantic-convoy"
  | "big-week"
  | "bismarck-sea"
  | "trafalgar"
  | "tsushima"
  | "jutland"
  | "midway"
  | "guadalcanal"
  | "pacific"
  | "gulf"
  | "gaixia";

type SunziMottoBannerProps = {
  isHome: boolean;
  onReturnHome: () => void;
};

function SunziMottoBanner({ isHome, onReturnHome }: SunziMottoBannerProps) {
  return (
    <aside className="sunzi-motto-banner" aria-label="孙子兵法题铭" data-testid="sunzi-motto-banner">
      <svg className="sunzi-book-icon" viewBox="0 0 96 96" role="img" aria-label="孙子兵法古籍图标" data-testid="sunzi-book-icon">
        <title>孙子兵法古籍图标</title>
        <defs>
          <linearGradient id="sunziBookCover" x1="14" x2="84" y1="8" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a86931" />
            <stop offset="0.45" stopColor="#6f351c" />
            <stop offset="1" stopColor="#2f1710" />
          </linearGradient>
          <linearGradient id="sunziBookPage" x1="24" x2="84" y1="14" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f1d99e" />
            <stop offset="0.55" stopColor="#c99852" />
            <stop offset="1" stopColor="#8c5c2b" />
          </linearGradient>
          <radialGradient id="sunziBookGlow" cx="0" cy="0" r="1" gradientTransform="matrix(42 36 -38 44 38 22)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffe3a1" stopOpacity="0.74" />
            <stop offset="1" stopColor="#ffe3a1" stopOpacity="0" />
          </radialGradient>
          <filter id="sunziBookShadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#160907" floodOpacity="0.42" />
          </filter>
        </defs>
        <g filter="url(#sunziBookShadow)">
          <path
            d="M17 18c0-6 5-10 11-8l44 12c5 1 8 5 8 10v45c0 5-4 8-9 7L28 73c-6-2-11 2-11 8V18Z"
            fill="url(#sunziBookPage)"
          />
          <path
            d="M17 17c0-5 5-9 10-8l43 11c5 1 9 6 9 11v39c0 5-5 9-10 7L27 66c-5-1-10 3-10 8V17Z"
            fill="url(#sunziBookCover)"
          />
          <path d="M27 9v57c-6-1-10 3-10 8V18c0-6 5-10 10-9Z" fill="#3f1c13" />
          <path d="M35 24l28 7v29l-28-7V24Z" fill="#d7af69" stroke="#3b1d12" strokeWidth="1.6" />
          <path d="M39 29l19 5M39 37l19 5M39 45l19 5" stroke="#5b2c18" strokeLinecap="round" strokeWidth="1.5" />
          <path d="M69 25c5 2 8 5 9 10v33c-3-3-6-5-9-6V25Z" fill="#22100d" opacity="0.55" />
          <path d="M17 17c0-5 5-9 10-8l43 11c5 1 9 6 9 11v39c0 5-5 9-10 7L27 66c-5-1-10 3-10 8V17Z" fill="url(#sunziBookGlow)" />
          <text
            x="49"
            y="44"
            fill="#2f130b"
            fontFamily="LiSu, STLiti, Weibei SC, Kaiti SC, Songti SC, serif"
            fontSize="12"
            fontWeight="800"
            letterSpacing="2"
            textAnchor="middle"
            transform="rotate(13 49 44)"
          >
            兵法
          </text>
          <circle cx="66" cy="61" r="8" fill="#8c1e18" opacity="0.9" />
          <path d="M61 61h10M66 56v10" stroke="#e4b870" strokeLinecap="round" strokeWidth="1.2" />
        </g>
      </svg>
      <div className="sunzi-motto-copy">
        <p className="sunzi-motto-source">《孙子兵法·始计第一》</p>
        <p className="sunzi-motto-text" data-testid="sunzi-seal-script-text">
          孫子曰：兵者，國之大事，死生之地，存亡之道，不可不察也。
        </p>
      </div>
      {!isHome && (
        <button type="button" className="return-home-button" data-testid="return-home" onClick={onReturnHome} aria-label="返回战争动画首页">
          返回首页
        </button>
      )}
    </aside>
  );
}

function App() {
  const [campaign, setCampaign] = useState<CampaignKey>("home");

  useEffect(() => {
    window.scrollTo({ left: 0, top: 0 });
  }, [campaign]);

  return (
    <>
      <SunziMottoBanner isHome={campaign === "home"} onReturnHome={() => setCampaign("home")} />
      {campaign === "home" && <WarLibraryHome onOpen={setCampaign} />}
      {campaign === "alexander" && <AlexanderConquestsAnimation />}
      {campaign === "britain-air" && <BattleOfBritainAnimation />}
      {campaign === "big-week" && <BigWeekAirBattleAnimation />}
      {campaign === "bismarck-sea" && <BismarckSeaAirBattleAnimation />}
      {campaign === "atlantic-convoy" && <AtlanticConvoyBattleAnimation />}
      {campaign === "cannae" && <CannaeBattleAnimation />}
      {campaign === "caesar" && <CaesarWarsAnimation />}
      {campaign === "crusades" && <CrusadesAnimation />}
      {campaign === "eastern" && <EasternFrontAnimation />}
      {campaign === "france" && <BattleFranceAnimation />}
      {campaign === "gulf" && <GulfWarAnimation />}
      {campaign === "gaixia" && <GaixiaAmbushAnimation />}
      {campaign === "guadalcanal" && <GuadalcanalNavalBattleAnimation />}
      {campaign === "jutland" && <JutlandBattleAnimation />}
      {campaign === "korean" && <KoreanWarAnimation />}
      {campaign === "midway" && <MidwayBattleAnimation />}
      {campaign === "mongol" && <MongolEmpireAnimation />}
      {campaign === "napoleonic" && <NapoleonicWarsAnimation />}
      {campaign === "nianzhuang" && <NianzhuangBattleAnimation />}
      {campaign === "pacific" && <PacificWarAnimation />}
      {campaign === "punic" && <PunicWarsAnimation />}
      {campaign === "qin" && <QinUnificationAnimation />}
      {campaign === "trafalgar" && <TrafalgarBattleAnimation />}
      {campaign === "tsushima" && <TsushimaBattleAnimation />}
    </>
  );
}

export default App;
