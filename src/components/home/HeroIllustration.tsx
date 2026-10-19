/**
 * Ilustrações em SVG inline do Hero (sem imagens externas).
 * Cores vêm das escalas do tema (navy/teal/sand) para manter a identidade visual.
 */

const INK = '#243b53' // navy-800
const SKIN = {
  deep: '#5c3a1e',
  brown: '#8d5524',
  tan: '#c68642',
  light: '#e0ac69',
  fair: '#f1c27d',
} as const

type HairStyle = 'short' | 'long' | 'bun' | 'curly'

interface PersonProps {
  x: number
  y: number
  shirt: string
  skin: string
  hair?: string
  hairStyle?: HairStyle
  scale?: number
  /** Espelha a figura (olhando para a esquerda) */
  flip?: boolean
  pose?: 'rest' | 'reach' | 'wave' | 'carry'
  apron?: boolean
}

/** Figura humana simples; os pés ficam em (x, y). */
function Person({
  x,
  y,
  shirt,
  skin,
  hair = '#102a43',
  hairStyle = 'short',
  scale = 1,
  flip = false,
  pose = 'rest',
  apron = false,
}: PersonProps) {
  const arm =
    pose === 'reach'
      ? 'M4 -25 L14 -21'
      : pose === 'wave'
        ? 'M5 -27 L10 -40'
        : pose === 'carry'
          ? 'M4 -25 L12 -20'
          : 'M5 -26 L7.5 -16'

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      {hairStyle === 'long' && <rect x={-7} y={-40} width={7} height={13} rx={3.5} fill={hair} />}
      <path d="M-3 -14 L-4.5 0 M3 -14 L4.5 0" stroke={INK} strokeWidth={4.2} strokeLinecap="round" />
      <rect x={-7.5} y={-31} width={15} height={19} rx={6.5} fill={shirt} />
      {apron && <rect x={-4.5} y={-26} width={9} height={13} rx={2} fill="#ffffff" opacity={0.92} />}
      <path d={arm} stroke={skin} strokeWidth={3.6} strokeLinecap="round" />
      {pose === 'carry' && (
        <g>
          <rect x={6} y={-30} width={13} height={11} rx={1.5} fill="#efe6d6" stroke="#9fb3c8" strokeWidth={1} />
          <path d="M6 -26 H19" stroke="#c9b89a" strokeWidth={1.4} />
        </g>
      )}
      <circle cx={0} cy={-37} r={6.2} fill={skin} />
      {hairStyle === 'curly' ? (
        <path
          d="M-6.6 -37 a3 3 0 0 1 2 -5 a3 3 0 0 1 4.6 -2 a3 3 0 0 1 4.6 2 a3 3 0 0 1 2 5 c-4 -2.2 -9 -2.2 -13.2 0Z"
          fill={hair}
        />
      ) : (
        <path d="M-6.4 -37 a6.4 6.4 0 0 1 12.8 0 c-3 -2.4 -8 -2.6 -12.8 0Z" fill={hair} />
      )}
      {hairStyle === 'bun' && <circle cx={-4} cy={-43.5} r={3.2} fill={hair} />}
    </g>
  )
}

function WheelchairUser({ x, y, shirt, skin, flip = false }: { x: number; y: number; shirt: string; skin: string; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -0.85 : 0.85} 0.85)`}>
      <path
        d="M-8 -30 L-6 -14 L10 -14 L12 -5"
        stroke={INK}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x={-6} y={-34} width={13} height={19} rx={6} fill={shirt} />
      <path
        d="M2 -16 L11 -16 L11 -7"
        stroke="#334e68"
        strokeWidth={4.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M4 -28 L12 -21" stroke={skin} strokeWidth={3.6} strokeLinecap="round" />
      <circle cx={-1} cy={-10} r={10} fill="none" stroke={INK} strokeWidth={2.6} />
      <circle cx={-1} cy={-10} r={1.8} fill={INK} />
      <circle cx={12} cy={-3} r={3} fill="none" stroke={INK} strokeWidth={2.2} />
      <circle cx={0.5} cy={-40} r={6.2} fill={skin} />
      <path d="M-5.9 -40 a6.4 6.4 0 0 1 12.8 0 c-3 -2.4 -8 -2.6 -12.8 0Z" fill="#334e68" />
    </g>
  )
}

function Dog({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -0.9 : 0.9} 0.9)`}>
      <path d="M-12 -9 Q-17 -14 -15 -18" stroke="#8d5524" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <path d="M-9 -4 V0 M-4 -4 V0 M3 -4 V0 M7 -4 V0" stroke="#5c3a1e" strokeWidth={2.4} strokeLinecap="round" />
      <rect x={-12} y={-11} width={22} height={9} rx={4.5} fill="#8d5524" />
      <circle cx={11} cy={-13} r={5} fill="#8d5524" />
      <circle cx={15.5} cy={-12.5} r={1.4} fill={INK} />
      <path d="M9 -17 L7 -11" stroke="#5c3a1e" strokeWidth={3} strokeLinecap="round" />
    </g>
  )
}

interface HouseProps {
  x: number
  y: number
  w: number
  h: number
  wall: string
  roof: string
}

function House({ x, y, w, h, wall, roof }: HouseProps) {
  const top = y - h
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} fill={wall} />
      <path
        d={`M${x - 3} ${top + 1} L${x + w / 2} ${top - w * 0.42} L${x + w + 3} ${top + 1}Z`}
        fill={roof}
        stroke={roof}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <rect x={x + w * 0.16} y={top + h * 0.24} width={w * 0.24} height={w * 0.22} rx={1.5} fill="#fef3c7" />
      <rect x={x + w * 0.58} y={y - h * 0.56} width={w * 0.24} height={h * 0.56} rx={1.5} fill="#334e68" />
    </g>
  )
}

/** Quaresmeira da Mata Atlântica, comum na serra de Petrópolis. Base do tronco em (x, y). */
function MataTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-1.8} y={-44} width={3.6} height={44} rx={1.4} fill="#5c3a1e" />
      <circle cx={-11} cy={-46} r={11} fill="#115e59" />
      <circle cx={11} cy={-46} r={11} fill="#115e59" />
      <circle cx={0} cy={-56} r={15} fill="#134e4a" />
      <g fill="#a78bfa">
        <circle cx={-6} cy={-62} r={2.4} />
        <circle cx={6} cy={-58} r={2.2} />
        <circle cx={-14} cy={-48} r={2} />
        <circle cx={13} cy={-47} r={2.2} />
        <circle cx={1} cy={-48} r={1.8} />
      </g>
    </g>
  )
}

/** Hortênsias, a flor símbolo de Petrópolis. Base em (x, y). */
function Hydrangea({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={-7} cy={-3} rx={7} ry={3.5} transform="rotate(-20 -7 -3)" fill="#179286" />
      <ellipse cx={7} cy={-3} rx={7} ry={3.5} transform="rotate(20 7 -3)" fill="#179286" />
      <circle cx={-6} cy={-10} r={6} fill="#93c5fd" />
      <circle cx={6} cy={-10} r={6} fill="#a5b4fc" />
      <circle cx={0} cy={-15} r={6.5} fill="#c4b5fd" />
      <g fill="#ffffff" opacity={0.55}>
        <circle cx={-7} cy={-11} r={1.1} />
        <circle cx={5} cy={-11} r={1.1} />
        <circle cx={0} cy={-17} r={1.1} />
      </g>
    </g>
  )
}

function RoundTree({ x, y, r, color = '#179286' }: { x: number; y: number; r: number; color?: string }) {
  return (
    <g>
      <rect x={x - 2} y={y - r} width={4} height={r} rx={1.5} fill="#5c3a1e" />
      <circle cx={x} cy={y - r * 1.5} r={r} fill={color} />
      <circle cx={x - r * 0.35} cy={y - r * 1.75} r={r * 0.45} fill="#ffffff" opacity={0.14} />
    </g>
  )
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#ffffff">
      <circle cx={14} cy={8} r={13} />
      <circle cx={34} cy={2} r={17} />
      <circle cx={54} cy={9} r={12} />
      <rect x={2} y={8} width={64} height={13} rx={6.5} />
    </g>
  )
}

/** Coração centralizado em (0, 0) */
const HEART_PATH = 'M0 6 C-8 0 -8 -7 -3.5 -7.5 C-1.5 -7.7 0 -6 0 -4.5 C0 -6 1.5 -7.7 3.5 -7.5 C8 -7 8 0 0 6Z'

/** Altura do arco da ponte em x (curva quadrática simétrica M150 330 Q300 150 450 330). */
function archY(x: number) {
  const t = (x - 150) / 300
  return 330 - 360 * t * (1 - t)
}

const HANGERS = [200, 225, 250, 275, 300, 325, 350, 375, 400]
const RAIL_POSTS = [125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475]

interface SceneProps {
  className?: string
  label: string
}

/**
 * Cena principal: uma ponte em arco sobre o rio liga dois bairros.
 * Pessoas atravessam e se encontram no meio — a metáfora do Pontes.
 */
export function HeroScene({ className, label }: SceneProps) {
  return (
    <svg viewBox="0 0 600 480" role="img" aria-label={label} className={className} focusable="false">
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8f2ea" />
          <stop offset="0.55" stopColor="#effcf9" />
          <stop offset="1" stopColor="#fdfbf7" />
        </linearGradient>
        <linearGradient id="hero-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5d8aa3" />
          <stop offset="1" stopColor="#243b53" />
        </linearGradient>
        <radialGradient id="hero-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Céu, sol e nuvens */}
      <rect width="600" height="480" fill="url(#hero-sky)" />
      <circle cx="505" cy="96" r="78" fill="url(#hero-sun)" />
      <circle cx="505" cy="96" r="34" fill="#fef3c7" />
      <Cloud x={62} y={92} s={0.95} />
      <Cloud x={330} y={60} s={0.7} />
      <path d="M390 150 q6 -6 12 0 q6 -6 12 0" stroke="#486581" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M424 132 q4 -4 8 0 q4 -4 8 0" stroke="#486581" strokeWidth={1.8} fill="none" strokeLinecap="round" />

      {/* Serra ao fundo */}
      <path
        d="M0 230 C30 214 52 186 80 182 C104 178 118 204 140 200 C166 196 176 160 204 156 C232 152 246 192 272 196 C300 200 318 176 346 172 C376 168 392 200 420 204 C446 208 462 178 492 176 C520 174 548 206 600 214 V264 H0Z"
        fill="#829ab1"
        opacity={0.35}
      />
      <path
        d="M0 248 C40 236 70 222 104 224 C140 226 160 244 196 240 C236 236 250 218 290 220 C330 222 350 242 390 240 C430 238 452 224 492 226 C530 228 566 242 600 246 V264 H0Z"
        fill="#9fb3c8"
        opacity={0.45}
      />

      {/* Horizonte: Catedral São Pedro de Alcântara, Palácio de Cristal e casario */}
      <g fill="#9fb3c8" opacity={0.55}>
        <rect x="40" y="224" width="22" height="40" rx="2" />
        <rect x="66" y="208" width="18" height="56" rx="2" />
        <rect x="160" y="230" width="26" height="34" rx="2" />
        <rect x="372" y="218" width="20" height="46" rx="2" />
        <rect x="396" y="232" width="28" height="32" rx="2" />
        <rect x="540" y="226" width="24" height="38" rx="2" />
        {/* Catedral São Pedro de Alcântara: nave e torre neogótica */}
        <rect x="450" y="216" width="34" height="48" rx="1" />
        <path d="M448 218 L467 202 L486 218Z" />
        <rect x="460" y="176" width="14" height="42" />
        <path d="M459 177 L467 136 L475 177Z" />
        <path d="M457 178 L459 168 L461 178Z M473 178 L475 168 L477 178Z" />
        {/* Palácio de Cristal */}
        <rect x="270" y="228" width="60" height="36" />
        <path d="M266 230 L300 208 L334 230Z" />
        <rect x="292" y="200" width="16" height="9" />
        <path d="M290 202 L300 194 L310 202Z" />
      </g>
      <path
        d="M282 230 V262 M294 226 V262 M306 226 V262 M318 230 V262 M270 245 H330 M467 186 V198 M467 226 V262"
        stroke="#ffffff"
        strokeWidth={1.2}
        opacity={0.6}
      />
      <circle cx="467" cy="192" r="3.2" fill="#ffffff" opacity={0.6} />

      {/* Colinas */}
      <path
        d="M0 258 C70 238 150 246 220 256 C280 264 330 262 380 254 C450 242 530 240 600 252 V320 H0Z"
        fill="#95e3d5"
        opacity={0.75}
      />

      {/* Rio, reflexos e ondulações */}
      <rect x="0" y="290" width="600" height="190" fill="url(#hero-water)" />
      <path d="M150 330 Q300 510 450 330" stroke="#ffffff" strokeWidth={6} fill="none" opacity={0.16} />
      <rect x="182" y="300" width="236" height="5" rx="2.5" fill="#ffffff" opacity={0.12} />
      <g stroke="#ffffff" strokeLinecap="round" opacity={0.35} strokeWidth={2.4}>
        <path d="M232 356 H262" />
        <path d="M318 348 H352" />
        <path d="M262 384 H300" />
        <path d="M336 410 H372" />
        <path d="M226 432 H258" />
        <path d="M290 456 H332" />
      </g>

      {/* Margem esquerda */}
      <path d="M0 286 C70 282 135 286 178 296 C204 330 200 420 186 480 H0Z" fill="#5ccbbb" />
      <path d="M0 392 C55 380 120 386 168 404 L160 480 H0Z" fill="#2fae9f" />
      <House x={14} y={287} w={38} h={30} wall="#ffffff" roof="#0f766e" />
      <House x={62} y={286} w={30} h={24} wall="#f8f3ea" roof="#334e68" />
      <MataTree x={104} y={290} s={0.9} />

      {/* Margem direita */}
      <path d="M600 286 C530 282 465 286 422 296 C396 330 400 420 414 480 H600Z" fill="#5ccbbb" />
      <path d="M600 392 C545 380 480 386 432 404 L440 480 H600Z" fill="#2fae9f" />
      <House x={500} y={287} w={32} h={26} wall="#ffffff" roof="#179286" />
      {/* Centro comunitário com coração na fachada */}
      <g>
        <rect x="540" y="252" width="52" height="35" fill="#f8f3ea" />
        <path d="M536 253 L566 232 L596 253Z" fill="#243b53" stroke="#243b53" strokeWidth={2} strokeLinejoin="round" />
        <circle cx="566" cy="264" r="8" fill="#ffffff" />
        <path d={HEART_PATH} transform="translate(566 264) scale(0.8)" fill="#f97066" />
        <rect x="560" y="275" width="12" height="12" rx="1.5" fill="#334e68" />
        <path d="M546 232 V252" stroke="#334e68" strokeWidth={1.6} />
        <path d="M546 232 L558 236 L546 240Z" fill="#2fae9f" />
      </g>

      {/* Ponte */}
      <rect x="137" y="324" width="26" height="14" rx="2" fill="#334e68" />
      <rect x="437" y="324" width="26" height="14" rx="2" fill="#334e68" />
      <path d="M150 330 Q300 150 450 330" stroke="#0f766e" strokeWidth={11} fill="none" strokeLinecap="round" />
      <path d="M150 330 Q300 150 450 330" stroke="#2fae9f" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <g stroke="#486581" strokeWidth={2}>
        {HANGERS.map((x) => (
          <path key={x} d={`M${x} ${archY(x) + 4} V288`} />
        ))}
      </g>
      <g stroke="#334e68" strokeWidth={2} strokeLinecap="round">
        <path d="M112 279 H488" strokeWidth={2.4} />
        {RAIL_POSTS.map((x) => (
          <path key={x} d={`M${x} 279 V288`} />
        ))}
      </g>
      <rect x="110" y="287" width="380" height="9" rx="3" fill="#243b53" />

      {/* Pessoas atravessando e se encontrando no meio */}
      <Person x={208} y={288} scale={0.85} shirt="#0f766e" skin={SKIN.tan} hairStyle="short" />
      <Person x={240} y={288} scale={0.85} shirt="#334e68" skin={SKIN.fair} hair="#5c3a1e" hairStyle="long" pose="carry" />
      <Person x={286} y={288} scale={0.85} shirt="#2fae9f" skin={SKIN.deep} hairStyle="curly" pose="reach" />
      <Person x={314} y={288} scale={0.85} shirt="#486581" skin={SKIN.light} hair="#243b53" hairStyle="bun" pose="reach" flip />
      <WheelchairUser x={356} y={288} shirt="#179286" skin={SKIN.brown} flip />
      <Person x={394} y={288} scale={0.85} shirt="#102a43" skin={SKIN.fair} hair="#8d5524" pose="rest" flip />
      <Dog x={420} y={288} flip />

      {/* Balão com coração acima do encontro */}
      <g transform="translate(300 206)">
        <path d="M-5 13 L0 22 L5 13Z" fill="#ffffff" />
        <circle r="16" fill="#ffffff" />
        <g data-hero="heart">
          <path d={HEART_PATH} fill="#f97066" transform="scale(1.05)" />
        </g>
      </g>

      {/* Primeiro plano */}
      <RoundTree x={40} y={420} r={22} color="#0f766e" />
      <RoundTree x={86} y={432} r={15} color="#179286" />
      <Person x={130} y={420} scale={1.05} shirt="#334e68" skin={SKIN.brown} hairStyle="short" pose="wave" />
      <RoundTree x={560} y={424} r={24} color="#0f766e" />
      <MataTree x={500} y={436} s={1.05} />
      <Hydrangea x={98} y={452} s={1.1} />
      <Hydrangea x={530} y={454} />
      <Hydrangea x={466} y={300} s={0.8} />
      <g fill="#ffffff">
        <circle cx="22" cy="452" r="2.4" />
        <circle cx="64" cy="462" r="2" />
        <circle cx="150" cy="458" r="2.2" />
        <circle cx="468" cy="456" r="2.2" />
        <circle cx="584" cy="462" r="2.4" />
      </g>
      <g fill="#fde68a">
        <circle cx="34" cy="464" r="2" />
        <circle cx="112" cy="452" r="2.2" />
        <circle cx="530" cy="462" r="2" />
      </g>
    </svg>
  )
}

interface PhotoProps {
  className?: string
  label: string
}

/** "Foto" ilustrada: mutirão de plantio de mudas. */
export function HeroPhotoPlanting({ className, label }: PhotoProps) {
  return (
    <svg viewBox="0 0 200 150" role="img" aria-label={label} className={className} focusable="false">
      <defs>
        <linearGradient id="hero-photo-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8f2ea" />
          <stop offset="1" stopColor="#effcf9" />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill="url(#hero-photo-sky)" />
      <circle cx="166" cy="30" r="15" fill="#fef3c7" />
      <Cloud x={18} y={22} s={0.55} />
      <path d="M0 104 C60 95 140 97 200 103 V150 H0Z" fill="#5ccbbb" />
      <path d="M0 128 C70 120 130 124 200 130 V150 H0Z" fill="#2fae9f" />
      <MataTree x={184} y={106} s={0.7} />
      <Hydrangea x={22} y={112} s={0.8} />
      {/* Muda */}
      <ellipse cx="102" cy="113" rx="17" ry="5" fill="#8d5524" />
      <path d="M102 112 V86" stroke="#115e59" strokeWidth={3} strokeLinecap="round" />
      <ellipse cx="94" cy="92" rx="8" ry="4" transform="rotate(-30 94 92)" fill="#179286" />
      <ellipse cx="110" cy="88" rx="8" ry="4" transform="rotate(25 110 88)" fill="#0f766e" />
      <ellipse cx="102" cy="82" rx="4" ry="7" fill="#2fae9f" />
      <Person x={64} y={122} scale={1.7} shirt="#0f766e" skin={SKIN.brown} hairStyle="curly" pose="reach" />
      <Person x={142} y={122} scale={1.7} shirt="#334e68" skin={SKIN.fair} hair="#8d5524" hairStyle="long" pose="reach" flip />
      {/* Regador */}
      <g transform="translate(114 70)">
        <rect x="-2" y="0" width="14" height="11" rx="2" fill="#486581" />
        <path d="M-2 3 L-10 -3" stroke="#486581" strokeWidth={2.6} strokeLinecap="round" />
        <path d="M2 0 Q5 -6 9 0" stroke="#486581" strokeWidth={2} fill="none" />
      </g>
      <g fill="#5d8aa3">
        <circle cx="104" cy="70" r="1.4" />
        <circle cx="101" cy="75" r="1.4" />
        <circle cx="106" cy="77" r="1.2" />
      </g>
    </svg>
  )
}

/** "Foto" ilustrada: cozinha solidária servindo marmitas. */
export function HeroPhotoKitchen({ className, label }: PhotoProps) {
  return (
    <svg viewBox="0 0 200 150" role="img" aria-label={label} className={className} focusable="false">
      <defs>
        <linearGradient id="hero-photo-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdfbf7" />
          <stop offset="1" stopColor="#efe6d6" />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill="url(#hero-photo-wall)" />
      {/* Janela */}
      <rect x="14" y="14" width="46" height="36" rx="4" fill="#c8f2ea" />
      <path d="M37 14 V50 M14 32 H60" stroke="#ffffff" strokeWidth={2.4} />
      {/* Bandeirolas */}
      <path d="M78 16 Q130 30 192 14" stroke="#9fb3c8" strokeWidth={1.2} fill="none" />
      <g>
        <path d="M92 20 L98 31 L104 22Z" fill="#2fae9f" />
        <path d="M116 24 L122 35 L128 25Z" fill="#f97066" />
        <path d="M140 24 L146 35 L152 24Z" fill="#334e68" />
        <path d="M164 21 L170 32 L176 20Z" fill="#2fae9f" />
      </g>
      <Person x={66} y={138} scale={1.75} shirt="#0f766e" skin={SKIN.light} hair="#243b53" hairStyle="bun" pose="reach" apron />
      <Person x={138} y={138} scale={1.75} shirt="#486581" skin={SKIN.deep} hairStyle="short" pose="reach" apron flip />
      {/* Mesa */}
      <rect x="6" y="104" width="188" height="46" fill="#334e68" />
      <rect x="2" y="100" width="196" height="8" rx="2" fill="#486581" />
      {/* Panela com vapor */}
      <g stroke="#bcccdc" strokeWidth={2} fill="none" strokeLinecap="round">
        <path d="M94 66 q-4 -6 0 -12 q4 -6 0 -12" />
        <path d="M104 64 q-4 -6 0 -12 q4 -6 0 -12" />
        <path d="M114 66 q-4 -6 0 -12 q4 -6 0 -12" />
      </g>
      <rect x="84" y="76" width="40" height="26" rx="5" fill="#829ab1" />
      <rect x="80" y="72" width="48" height="6" rx="3" fill="#627d98" />
      <path d="M80 84 H74 M128 84 H134" stroke="#627d98" strokeWidth={3} strokeLinecap="round" />
      {/* Marmitas */}
      <g fill="#ffffff" stroke="#d9e2ec" strokeWidth={1}>
        <rect x="20" y="88" width="30" height="12" rx="2" />
        <rect x="22" y="76" width="26" height="12" rx="2" />
        <rect x="150" y="88" width="30" height="12" rx="2" />
      </g>
      <path d="M20 92 H50 M22 80 H48 M150 92 H180" stroke="#2fae9f" strokeWidth={1.6} />
    </svg>
  )
}
