/**
 * 古文 助動詞データ (data.js)
 * 
 * 接続ごとの分類構造:
 * ① 未然形接続
 * ② 連用形接続
 * ③ 終止形接続
 * ④ 体言・連体形・一部助詞接続
 * ⑤ その他接続
 */

const connectionCategories = [
  {
    id: "mizen",
    name: "未然形接続",
    description: "動詞などの未然形に接続する助動詞",
    groups: [
      {
        id: "ru_raru",
        title: "る・らる",
        items: [
          {
            id: "ru",
            name: "る",
            type: "下二段型",
            conjugation: {
              kihon: "る",
              mizen: "れ",
              renyou: "れ",
              shuushi: "る",
              rentai: "るる",
              izen: "るれ",
              meirei: "れよ",
              type: "下二段型"
            },
            meanings: [
              { name: "受身", note: "〜される" },
              { name: "尊敬", note: "〜なさる・お〜になる" },
              { name: "自発", note: "自然と〜される・思われる" },
              { name: "可能", note: "〜できる" }
            ]
          },
          {
            id: "raru",
            name: "らる",
            type: "下二段型",
            conjugation: {
              kihon: "らる",
              mizen: "られ",
              renyou: "られ",
              shuushi: "らる",
              rentai: "らるる",
              izen: "らるれ",
              meirei: "られよ",
              type: "下二段型"
            },
            meanings: [
              { name: "受身", note: "〜される" },
              { name: "尊敬", note: "〜なさる・お〜になる" },
              { name: "自発", note: "自然と〜される・思われる" },
              { name: "可能", note: "〜できる" }
            ]
          }
        ]
      },
      {
        id: "su_sasu_shimu_zu",
        title: "す・さす・しむ・ず",
        items: [
          {
            id: "su",
            name: "す",
            type: "下二段型",
            conjugation: {
              kihon: "す",
              mizen: "せ",
              renyou: "せ",
              shuushi: "す",
              rentai: "する",
              izen: "すれ",
              meirei: "せよ",
              type: "下二段型"
            },
            meanings: [
              { name: "使役", note: "〜させる" },
              { name: "尊敬", note: "〜なさる" }
            ]
          },
          {
            id: "sasu",
            name: "さす",
            type: "下二段型",
            conjugation: {
              kihon: "さす",
              mizen: "させ",
              renyou: "させ",
              shuushi: "さす",
              rentai: "さする",
              izen: "さすれ",
              meirei: "させよ",
              type: "下二段型"
            },
            meanings: [
              { name: "使役", note: "〜させる" },
              { name: "尊敬", note: "〜なさる" }
            ]
          },
          {
            id: "shimu",
            name: "しむ",
            type: "下二段型",
            conjugation: {
              kihon: "しむ",
              mizen: "しめ",
              renyou: "しめ",
              shuushi: "しむ",
              rentai: "しむる",
              izen: "しむれ",
              meirei: "しめよ",
              type: "下二段型"
            },
            meanings: [
              { name: "使役", note: "〜させる" },
              { name: "尊敬", note: "〜なさる" }
            ]
          },
          {
            id: "zu",
            name: "ず",
            type: "特殊型",
            conjugation: {
              kihon: "ず",
              mizen: "（ず）・ざら",
              renyou: "ず・ざり",
              shuushi: "ず",
              rentai: "ぬ・ざる",
              izen: "ね・ざれ",
              meirei: "〇・ざれ",
              type: "特殊型"
            },
            meanings: [
              { name: "打消", note: "〜ない" }
            ]
          }
        ]
      },
      {
        id: "mu_muzu_ji",
        title: "む・むず・じ",
        items: [
          {
            id: "mu",
            name: "む",
            type: "四段型",
            conjugation: {
              kihon: "む",
              mizen: "〇",
              renyou: "〇",
              shuushi: "む",
              rentai: "む",
              izen: "め",
              meirei: "〇",
              type: "四段型"
            },
            meanings: [
              { name: "推量", note: "〜だろう" },
              { name: "意志", note: "〜しよう" },
              { name: "勧誘", note: "〜しませんか・〜してほしい" },
              { name: "仮定", note: "もし〜ならば" },
              { name: "婉曲", note: "〜のような" },
              { name: "適当", note: "〜するのがよい" }
            ]
          },
          {
            id: "muzu",
            name: "むず",
            type: "サ変型",
            conjugation: {
              kihon: "むず",
              mizen: "〇",
              renyou: "〇",
              shuushi: "むず",
              rentai: "むずる",
              izen: "むずれ",
              meirei: "〇",
              type: "サ変型"
            },
            meanings: [
              { name: "推量", note: "〜だろう" },
              { name: "意志", note: "〜しよう" },
              { name: "勧誘", note: "〜しませんか・〜してほしい" },
              { name: "仮定", note: "もし〜ならば" },
              { name: "婉曲", note: "〜のような" },
              { name: "適当", note: "〜するのがよい" }
            ]
          },
          {
            id: "ji",
            name: "じ",
            type: "無変化型",
            conjugation: {
              kihon: "じ",
              mizen: "〇",
              renyou: "〇",
              shuushi: "じ",
              rentai: "じ",
              izen: "じ",
              meirei: "〇",
              type: "無変化型"
            },
            meanings: [
              { name: "打消推量", note: "〜ないだろう" },
              { name: "打消意志", note: "〜しないつもりだ" }
            ]
          }
        ]
      },
      {
        id: "mashi_mahoshi",
        title: "まし・まほし",
        items: [
          {
            id: "mashi",
            name: "まし",
            type: "特殊型",
            conjugation: {
              kihon: "まし",
              mizen: "ませ・ましか",
              renyou: "〇",
              shuushi: "まし",
              rentai: "まし",
              izen: "ましか",
              meirei: "〇",
              type: "特殊型"
            },
            meanings: [
              { name: "反実仮想", note: "もし〜なら…だろうに" },
              { name: "ためらいの意志", note: "〜しようかしら" },
              { name: "希望", note: "〜ならいいのに" },
              { name: "推量", note: "〜だろう" }
            ]
          },
          {
            id: "mahoshi",
            name: "まほし",
            type: "ク活用型",
            conjugation: {
              kihon: "まほし",
              mizen: "（まほしく）・まほしから",
              renyou: "まほしく・まほしかり",
              shuushi: "まほし",
              rentai: "まほしき・まほしかる",
              izen: "まほしけれ",
              meirei: "〇",
              type: "ク活用型"
            },
            meanings: [
              { name: "希望", note: "〜したい" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "renyou",
    name: "連用形接続",
    description: "用言などの連用形に接続する助動詞",
    groups: [
      {
        id: "ki_keri",
        title: "き・けり",
        items: [
          {
            id: "ki",
            name: "き",
            type: "特殊型",
            conjugation: {
              kihon: "き",
              mizen: "せ",
              renyou: "〇",
              shuushi: "き",
              rentai: "し",
              izen: "しか",
              meirei: "〇",
              type: "特殊型"
            },
            meanings: [
              { name: "過去", note: "直接体験（〜した）" }
            ]
          },
          {
            id: "keri",
            name: "けり",
            type: "ラ変型",
            conjugation: {
              kihon: "けり",
              mizen: "けら",
              renyou: "〇",
              shuushi: "けり",
              rentai: "ける",
              izen: "けれ",
              meirei: "〇",
              type: "ラ変型"
            },
            meanings: [
              { name: "過去", note: "間接体験・伝聞（〜したそうだ）" },
              { name: "詠嘆", note: "〜だなあ・〜ことよ" }
            ]
          }
        ]
      },
      {
        id: "tsu_nu_tari",
        title: "つ・ぬ・たり",
        items: [
          {
            id: "tsu",
            name: "つ",
            type: "下二段型",
            conjugation: {
              kihon: "つ",
              mizen: "て",
              renyou: "て",
              shuushi: "つ",
              rentai: "つる",
              izen: "つれ",
              meirei: "てよ",
              type: "下二段型"
            },
            meanings: [
              { name: "完了", note: "〜てしまった" },
              { name: "強意", note: "きっと〜・確かに〜" },
              { name: "並列", note: "〜たり〜たり" }
            ]
          },
          {
            id: "nu",
            name: "ぬ",
            type: "ナ変型",
            conjugation: {
              kihon: "ぬ",
              mizen: "な",
              renyou: "に",
              shuushi: "ぬ",
              rentai: "ぬる",
              izen: "ぬれ",
              meirei: "ね",
              type: "ナ変型"
            },
            meanings: [
              { name: "完了", note: "〜てしまった" },
              { name: "強意", note: "きっと〜・確かに〜" },
              { name: "並列", note: "〜たり〜たり" }
            ]
          },
          {
            id: "tari_kanryo",
            name: "たり",
            type: "ラ変型",
            conjugation: {
              kihon: "たり",
              mizen: "たら",
              renyou: "たり",
              shuushi: "たり",
              rentai: "たる",
              izen: "たれ",
              meirei: "たれ",
              type: "ラ変型"
            },
            meanings: [
              { name: "存続", note: "〜ている・〜てある" },
              { name: "完了", note: "〜た・〜てしまった" }
            ]
          }
        ]
      },
      {
        id: "tashi",
        title: "たし",
        items: [
          {
            id: "tashi",
            name: "たし",
            type: "ク活用型",
            conjugation: {
              kihon: "たし",
              mizen: "（たく）・たから",
              renyou: "たく・たかり",
              shuushi: "たし",
              rentai: "たき・たかる",
              izen: "たけれ",
              meirei: "〇",
              type: "ク活用型"
            },
            meanings: [
              { name: "希望", note: "〜たい" }
            ]
          }
        ]
      },
      {
        id: "kemu",
        title: "けむ",
        items: [
          {
            id: "kemu",
            name: "けむ",
            type: "四段型",
            conjugation: {
              kihon: "けむ",
              mizen: "〇",
              renyou: "〇",
              shuushi: "けむ",
              rentai: "けむ",
              izen: "けめ",
              meirei: "〇",
              type: "四段型"
            },
            meanings: [
              { name: "過去推量", note: "〜ただろう" },
              { name: "過去の原因推量", note: "どうして〜たのだろう・〜たからだろう" },
              { name: "過去の伝聞・婉曲", note: "〜たとかいう・〜たような" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "shuushi",
    name: "終止形接続",
    description: "用言などの終止形（ラ変型は連体形）に接続する助動詞",
    groups: [
      {
        id: "ramu",
        title: "らむ",
        items: [
          {
            id: "ramu",
            name: "らむ",
            type: "四段型",
            conjugation: {
              kihon: "らむ",
              mizen: "〇",
              renyou: "〇",
              shuushi: "らむ",
              rentai: "らむ",
              izen: "らめ",
              meirei: "〇",
              type: "四段型"
            },
            meanings: [
              { name: "現在推量", note: "今頃〜しているだろう" },
              { name: "現在の原因推量", note: "どうして〜しているのだろう" },
              { name: "現在の伝聞", note: "〜しているとかいう" },
              { name: "現在の婉曲", note: "〜しているような" }
            ]
          }
        ]
      },
      {
        id: "meri_rashi",
        title: "めり・らし",
        items: [
          {
            id: "meri",
            name: "めり",
            type: "ラ変型",
            conjugation: {
              kihon: "めり",
              mizen: "〇",
              renyou: "めり",
              shuushi: "めり",
              rentai: "める",
              izen: "めれ",
              meirei: "〇",
              type: "ラ変型"
            },
            meanings: [
              { name: "推定", note: "（視覚的）〜ようだ" },
              { name: "婉曲", note: "〜ように見える・〜ようだ" }
            ]
          },
          {
            id: "rashi",
            name: "らし",
            type: "無変化型",
            conjugation: {
              kihon: "らし",
              mizen: "〇",
              renyou: "〇",
              shuushi: "らし",
              rentai: "らし",
              izen: "らし",
              meirei: "〇",
              type: "無変化型"
            },
            meanings: [
              { name: "推定", note: "（客観的根拠）〜らしい" }
            ]
          }
        ]
      },
      {
        id: "beshi_maji",
        title: "べし・まじ",
        items: [
          {
            id: "beshi",
            name: "べし",
            type: "ク活用型",
            conjugation: {
              kihon: "べし",
              mizen: "（べく）・べから",
              renyou: "べく・べかり",
              shuushi: "べし",
              rentai: "べき・べかる",
              izen: "べけれ",
              meirei: "〇",
              type: "ク活用型"
            },
            meanings: [
              { name: "推量", note: "〜だろう" },
              { name: "意志", note: "〜しよう" },
              { name: "可能", note: "〜できる" },
              { name: "当然・義務", note: "〜はずだ・〜べきだ" },
              { name: "命令", note: "〜せよ" },
              { name: "適当", note: "〜するのがよい" }
            ]
          },
          {
            id: "maji",
            name: "まじ",
            type: "シク活用型",
            conjugation: {
              kihon: "まじ",
              mizen: "（まじく）・まじから",
              renyou: "まじく・まじかり",
              shuushi: "まじ",
              rentai: "まじき・まじかる",
              izen: "まじけれ",
              meirei: "〇",
              type: "シク活用型"
            },
            meanings: [
              { name: "打消推量", note: "〜ないだろう" },
              { name: "打消意志", note: "〜しないつもりだ" },
              { name: "不可能", note: "〜できない" },
              { name: "打消当然", note: "〜はずがない" },
              { name: "禁止", note: "〜してはならない" },
              { name: "不適当", note: "〜しないほうがよい" }
            ]
          }
        ]
      },
      {
        id: "nari_denbun",
        title: "なり",
        items: [
          {
            id: "nari_denbun_item",
            name: "なり",
            type: "ラ変型",
            conjugation: {
              kihon: "なり",
              mizen: "〇",
              renyou: "なり",
              shuushi: "なり",
              rentai: "なる",
              izen: "なれ",
              meirei: "〇",
              type: "ラ変型"
            },
            meanings: [
              { name: "伝聞", note: "〜ということだ・〜と聞いている" },
              { name: "推定", note: "（聴覚的）〜ようだ・〜の音がする" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "taigen_rentai",
    name: "体言・連体形・一部助詞接続",
    description: "体言や連体形、助詞に接続する助動詞",
    groups: [
      {
        id: "nari_tari_dantei",
        title: "なり・たり",
        items: [
          {
            id: "nari_dantei",
            name: "なり",
            type: "形容動詞（ナリ）型",
            conjugation: {
              kihon: "なり",
              mizen: "なら",
              renyou: "なり・に",
              shuushi: "なり",
              rentai: "なる",
              izen: "なれ",
              meirei: "なれ",
              type: "形容動詞（ナリ）型"
            },
            meanings: [
              { name: "断定", note: "〜である・〜だ" },
              { name: "存在", note: "〜にある・〜にいる" }
            ]
          },
          {
            id: "tari_dantei",
            name: "たり",
            type: "形容動詞（タリ）型",
            conjugation: {
              kihon: "たり",
              mizen: "たら",
              renyou: "たり・と",
              shuushi: "たり",
              rentai: "たる",
              izen: "たれ",
              meirei: "たれ",
              type: "形容動詞（タリ）型"
            },
            meanings: [
              { name: "断定", note: "〜である・〜だ" }
            ]
          }
        ]
      },
      {
        id: "gotoshi",
        title: "ごとし",
        items: [
          {
            id: "gotoshi_item",
            name: "ごとし",
            type: "ク活用型",
            conjugation: {
              kihon: "ごとし",
              mizen: "〇",
              renyou: "ごとく",
              shuushi: "ごとし",
              rentai: "ごとき",
              izen: "〇",
              meirei: "〇",
              type: "ク活用型"
            },
            meanings: [
              { name: "比喩", note: "〜のようだ" },
              { name: "例示", note: "〜などの" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "others",
    name: "その他接続",
    description: "サ変未然形・四段已然形（サ未四已）に接続する助動詞",
    groups: [
      {
        id: "ri",
        title: "り",
        items: [
          {
            id: "ri_item",
            name: "り",
            type: "ラ変型",
            conjugation: {
              kihon: "り",
              mizen: "ら",
              renyou: "り",
              shuushi: "り",
              rentai: "る",
              izen: "れ",
              meirei: "れ",
              type: "ラ変型"
            },
            meanings: [
              { name: "完了", note: "〜た・〜てしまった" },
              { name: "存続", note: "〜ている・〜てある" }
            ]
          }
        ]
      }
    ]
  }
];
