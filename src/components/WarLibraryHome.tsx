import type { CampaignKey } from "../App";

type WarEntry = {
  id: Exclude<CampaignKey, "home">;
  title: string;
  era: "古代战争" | "现代战争";
  period: string;
  description: string;
};

const wars: WarEntry[] = [
  {
    id: "alexander",
    title: "亚历山大大帝征服史",
    era: "古代战争",
    period: "公元前336-前323",
    description: "马其顿继位、渡海入亚、高加米拉、中亚与印度河极限。"
  },
  {
    id: "punic",
    title: "罗马与迦太基：三次布匿战争史",
    era: "古代战争",
    period: "公元前264-前146",
    description: "西西里、汉尼拔越岭、坎尼、扎马与迦太基陷落。"
  },
  {
    id: "qin",
    title: "大秦统一中国战史",
    era: "古代战争",
    period: "公元前230-前221",
    description: "灭韩、破赵、灭魏楚燕齐，完成战国统一。"
  },
  {
    id: "gaixia",
    title: "韩信十面埋伏：垓下之战",
    era: "古代战争",
    period: "公元前202",
    description: "沱河高地、十面合围、四面楚歌与项羽突围。"
  },
  {
    id: "caesar",
    title: "凯撒大帝战争史",
    era: "古代战争",
    period: "公元前58-前44",
    description: "高卢战争、卢比孔、法萨卢斯、埃及、北非与共和国终局。"
  },
  {
    id: "crusades",
    title: "十字军东征",
    era: "古代战争",
    period: "1095-1291",
    description: "克莱蒙号召、耶路撒冷、哈丁、君士坦丁堡与阿卡陷落。"
  },
  {
    id: "mongol",
    title: "蒙古帝国征服史",
    era: "古代战争",
    period: "1206-1279",
    description: "草原统一、金与花剌子模、巴格达、南宋和崖山。"
  },
  {
    id: "napoleonic",
    title: "拿破仑争战史",
    era: "现代战争",
    period: "1796-1815",
    description: "从意大利战役到埃及、中欧、俄国、莱比锡与滑铁卢。"
  },
  {
    id: "tsushima",
    title: "日俄对马海战",
    era: "现代战争",
    period: "1905",
    description: "对马海峡内俄舰北上、东乡转向、T字炮战、夜战与残部投降。"
  },
  {
    id: "midway",
    title: "中途岛海空战",
    era: "现代战争",
    period: "1942",
    description: "中途岛、南云机动部队、三艘美航母、鱼雷机和俯冲轰炸波次。"
  },
  {
    id: "france",
    title: "1940 德法战役",
    era: "现代战争",
    period: "1940",
    description: "阿登突击、色当突破、敦刻尔克撤离与法国陷落。"
  },
  {
    id: "eastern",
    title: "1941-1945 苏德战争全景",
    era: "现代战争",
    period: "1941-1945",
    description: "巴巴罗萨、莫斯科、斯大林格勒、库尔斯克与柏林。"
  },
  {
    id: "pacific",
    title: "日美太平洋战争战史",
    era: "现代战争",
    period: "1941-1945",
    description: "珍珠港、中途岛、瓜岛、马里亚纳、莱特湾到东京湾。"
  },
  {
    id: "korean",
    title: "抗美援朝战争",
    era: "现代战争",
    period: "1950-1953",
    description: "南进、釜山、仁川、志愿军入朝、长津湖、上甘岭与停战。"
  },
  {
    id: "gulf",
    title: "1991年第一次海湾战争",
    era: "现代战争",
    period: "1990-1991",
    description: "伊拉克入侵科威特、沙漠盾牌、沙漠风暴与百小时地面战。"
  }
];

type WarLibraryHomeProps = {
  onOpen: (campaign: Exclude<CampaignKey, "home">) => void;
};

export function WarLibraryHome({ onOpen }: WarLibraryHomeProps) {
  const ancientWars = wars.filter((war) => war.era === "古代战争");
  const modernWars = wars.filter((war) => war.era === "现代战争");

  return (
    <main className="library-home" data-testid="war-library-home">
      <section className="book-cover">
        <div className="book-spine" />
        <div className="illumination illumination-left" />
        <div className="illumination illumination-right" />
        <p className="eyebrow">Codex Bellorum / 战争动画藏书馆</p>
        <h1>战争动画藏书馆</h1>
        <p className="hero-lede">
          以拿破仑时代为分界：拿破仑及其后的战争归入现代战争，更早的战争归入古代战争。每部动画控制在 5 分钟，保留播放、暂停、回放和时间轴拖拽。
        </p>
      </section>

      <section className="war-shelves">
        <WarShelf title="古代战争" subtitle="拿破仑以前的战争" wars={ancientWars} onOpen={onOpen} />
        <WarShelf title="现代战争" subtitle="拿破仑时代及其后的战争" wars={modernWars} onOpen={onOpen} />
      </section>
    </main>
  );
}

function WarShelf({
  onOpen,
  subtitle,
  title,
  wars
}: {
  onOpen: (campaign: Exclude<CampaignKey, "home">) => void;
  subtitle: string;
  title: string;
  wars: WarEntry[];
}) {
  return (
    <article className="war-shelf">
      <div className="section-heading">
        <div>
          <p className="label">{subtitle}</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="war-card-grid">
        {wars.map((war) => (
          <button key={war.id} type="button" className="war-card" onClick={() => onOpen(war.id)} data-testid={`open-${war.id}`}>
            <span>{war.period}</span>
            <strong>{war.title}</strong>
            <small>{war.description}</small>
          </button>
        ))}
      </div>
    </article>
  );
}
