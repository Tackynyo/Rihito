/**
 * 古文 助動詞データ (data.js)
 * 
 * 【追加・更新方法】
 * 以下の配列 jodoushiData に新しい助動詞オブジェクトを追加するだけで、
 * アプリの一覧および活用表に自動反映されます。
 * 
 * - id: 一意の識別子（アルファベット推奨）
 * - name: 助動詞の原形・名称（例: "る", "らむ", "き"）
 * - connection: 接続（例: "四段・ナ変・ラ変の未然形", "終止形（ラ変は連体形）" など。省略可）
 * - meaning: 主な意味（例: "受身・尊敬・自発・可能"）
 * - type: 活用型（例: "下二段型", "四段型", "特殊型" など。省略可）
 * - conjugation: 活用（未然・連用・終止・連体・已然・命令）
 *   ※活用がない箇所は "〇" または "（〇）" と記述すると、自動的に解答済み（タップ不要）になります。
 */

const jodoushiData = [
  {
    id: "ru",
    name: "る",
    meaning: "受身・尊敬・自発・可能",
    connection: "四段・ナ変・ラ変の未然形",
    type: "下二段型",
    conjugation: {
      mizen: "れ",
      renyou: "れ",
      shuushi: "る",
      rentai: "るる",
      izen: "るれ",
      meirei: "れよ"
    }
  },
  {
    id: "ramu",
    name: "らむ",
    meaning: "現在推量・原因推量・伝聞・婉曲",
    connection: "終止形（ラ変型は連体形）",
    type: "四段型（無活用に近い）",
    conjugation: {
      mizen: "〇",
      renyou: "〇",
      shuushi: "らむ",
      rentai: "らむ",
      izen: "らめ",
      meirei: "〇"
    }
  },
  {
    id: "ki",
    name: "き",
    meaning: "過去（直接体験・自分が見聞きしたこと）",
    connection: "連用形（カ変・サ変は特殊）",
    type: "特殊型",
    conjugation: {
      mizen: "（せ）",
      renyou: "〇",
      shuushi: "き",
      rentai: "し",
      izen: "しか",
      meirei: "〇"
    }
  },
  {
    id: "keri",
    name: "けり",
    meaning: "過去（間接体験・伝聞過去）・詠嘆（〜だなあ）",
    connection: "連用形",
    type: "ラ変型",
    conjugation: {
      mizen: "けら",
      renyou: "〇",
      shuushi: "けり",
      rentai: "ける",
      izen: "けれ",
      meirei: "〇"
    }
  },
  {
    id: "tsu",
    name: "つ",
    meaning: "完了・強意・並列",
    connection: "連用形",
    type: "下二段型",
    conjugation: {
      mizen: "て",
      renyou: "て",
      shuushi: "つ",
      rentai: "つる",
      izen: "つれ",
      meirei: "てよ"
    }
  },
  {
    id: "nu",
    name: "ぬ",
    meaning: "完了・強意・並列",
    connection: "連用形",
    type: "ナ変型",
    conjugation: {
      mizen: "な",
      renyou: "に",
      shuushi: "ぬ",
      rentai: "ぬる",
      izen: "ぬれ",
      meirei: "ね"
    }
  }
];
