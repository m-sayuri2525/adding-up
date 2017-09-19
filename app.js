'use strict';

//ファイルからデータを読み取る

const fs = require('fs');             // fs(ファイルを扱うモジュール)と、
const readline = require('readline'); //readline(１行ずつ読み込むモジュール)の呼び出し

const rs = fs.ReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });

const map = new Map(); // key: 都道府県 value: 集計データのオブジェクト

// ファイルからデータを抜き出す（2010 年と 2015 年のデータから「集計年」「都道府県」「15〜19歳の人口」を抜き出す）

rl.on('line', (lineString) => {           // line イベントが発生したときの、処理
  const columns = lineString.split(',');  // ,で分割すして、colums 配列へ
  const year = parseInt(columns[0]);      // parseInt は、文字列を数値に変換する関数
  const prefecture = columns[2];
  const popu = parseInt(columns[7]);

  if (year === 2010 || year === 2015) {     // ２０１０年と２０１５年に絞り込む

    let value = map.get(prefecture);    //　都道府県のバリューを取得
    if (!value) {     // 初期値となる、バリューにオブジェクトを代入する
      value = {
        p10: 0,   // ２０１０年の人口
        p15: 0,   // ２０１５年の人口
        change: null  // 変化率
      };
    }

    if (year === 2010) {
      value.p10 += popu;
    }
    if (year === 2015) {
      value.p15 += popu;
    }
    map.set(prefecture, value);   // 同じ県のデータが来れば、連装配列に保存していく

  }

});   // 'line' のときのイベントはここまで。

rl.resume();  // ストリームに流し始める処理

//  変化率の計算
rl.on('close', () => {  // close イベントの時の処理
  for (let pair of map) {   //  for-of 構文
    const value = pair[1];  // 集計したオブジェクト｛p10: ,p15: ,vahnge: ｝;で囲んだもの
    value.change = value.p15 / value.p10;   // value の、change プロパティーに変化率を代入
  }

  const rankingArray = Array.from(map).sort((p1, p2) => {   // 変化率ごとに並び替える
    return p2[1].change - p1[1].change;
  });

  const rankingStrings = rankingArray.map((p) => {  // 「Map の キーと値が要素になった配列を要素 p として受け取り、それを文字列に変換する」処理
    return p[0] + ': ' + p[1].p10 + '=>' + p[1].p15 + ' 変化率:' + p[1].change;
  });
  console.log(rankingStrings);
});


