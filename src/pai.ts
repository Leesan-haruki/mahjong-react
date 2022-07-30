export type Pai = {
	name: string,
	kind: 'm' | 'p' | 's' | 'z',
	num: number,
	yaku: boolean,
	max: number,
	shuntsuAble: boolean,
	filename: string,
}

export type GamePai = {
	unique: number
	kind: Pai
}

export const allPaiNum:number = 136;
export const tehaiNum:number = 13;
export const wanpaiNum:number = 14;

export const allPai:Pai[] = [
	{ name: 'm1', kind: 'm', num: 1, yaku:false, max: 4, shuntsuAble: true, filename: '1m.gif' },
	{ name: 'm2', kind: 'm', num: 2, yaku:false, max: 4, shuntsuAble: true, filename: '2m.gif' },
	{ name: 'm3', kind: 'm', num: 3, yaku:false, max: 4, shuntsuAble: true, filename: '3m.gif' },
	{ name: 'm4', kind: 'm', num: 4, yaku:false, max: 4, shuntsuAble: true, filename: '4m.gif' },
	{ name: 'm5', kind: 'm', num: 5, yaku:false, max: 4, shuntsuAble: true, filename: '5m.gif' },
	{ name: 'm6', kind: 'm', num: 6, yaku:false, max: 4, shuntsuAble: true, filename: '6m.gif' },
	{ name: 'm7', kind: 'm', num: 7, yaku:false, max: 4, shuntsuAble: true, filename: '7m.gif' },
	{ name: 'm8', kind: 'm', num: 8, yaku:false, max: 4, shuntsuAble: true, filename: '8m.gif' },
	{ name: 'm9', kind: 'm', num: 9, yaku:false, max: 4, shuntsuAble: true, filename: '9m.gif' },

	{ name: 'p1', kind: 'p', num: 1, yaku:false, max: 4, shuntsuAble: true, filename: '1p.gif' },
	{ name: 'p2', kind: 'p', num: 2, yaku:false, max: 4, shuntsuAble: true, filename: '2p.gif' },
	{ name: 'p3', kind: 'p', num: 3, yaku:false, max: 4, shuntsuAble: true, filename: '3p.gif' },
	{ name: 'p4', kind: 'p', num: 4, yaku:false, max: 4, shuntsuAble: true, filename: '4p.gif' },
	{ name: 'p5', kind: 'p', num: 5, yaku:false, max: 4, shuntsuAble: true, filename: '5p.gif' },
	{ name: 'p6', kind: 'p', num: 6, yaku:false, max: 4, shuntsuAble: true, filename: '6p.gif' },
	{ name: 'p7', kind: 'p', num: 7, yaku:false, max: 4, shuntsuAble: true, filename: '7p.gif' },
	{ name: 'p8', kind: 'p', num: 8, yaku:false, max: 4, shuntsuAble: true, filename: '8p.gif' },
	{ name: 'p9', kind: 'p', num: 9, yaku:false, max: 4, shuntsuAble: true, filename: '9p.gif' },

	{ name: 's1', kind: 's', num: 1, yaku:false, max: 4, shuntsuAble: true, filename: '1s.gif' },
	{ name: 's2', kind: 's', num: 2, yaku:false, max: 4, shuntsuAble: true, filename: '2s.gif' },
	{ name: 's3', kind: 's', num: 3, yaku:false, max: 4, shuntsuAble: true, filename: '3s.gif' },
	{ name: 's4', kind: 's', num: 4, yaku:false, max: 4, shuntsuAble: true, filename: '4s.gif' },
	{ name: 's5', kind: 's', num: 5, yaku:false, max: 4, shuntsuAble: true, filename: '5s.gif' },
	{ name: 's6', kind: 's', num: 6, yaku:false, max: 4, shuntsuAble: true, filename: '6s.gif' },
	{ name: 's7', kind: 's', num: 7, yaku:false, max: 4, shuntsuAble: true, filename: '7s.gif' },
	{ name: 's8', kind: 's', num: 8, yaku:false, max: 4, shuntsuAble: true, filename: '8s.gif' },
	{ name: 's9', kind: 's', num: 9, yaku:false, max: 4, shuntsuAble: true, filename: '9s.gif' },

	{ name: 'w1', kind: 'z', num: 1, yaku:false, max: 4, shuntsuAble: false, filename: 'ton.gif' },
	{ name: 'w2', kind: 'z', num: 2, yaku:false, max: 4, shuntsuAble: false, filename: 'nan.gif' },
	{ name: 'w3', kind: 'z', num: 3, yaku:false, max: 4, shuntsuAble: false, filename: 'sha.gif' },
	{ name: 'w4', kind: 'z', num: 4, yaku:false, max: 4, shuntsuAble: false, filename: 'pei.gif' },
	
	{ name: 'd1', kind: 'z', num: 7, yaku:true, max: 4, shuntsuAble: false, filename: 'haku.gif' },
	{ name: 'd2', kind: 'z', num: 8, yaku:true, max: 4, shuntsuAble: false, filename: 'hatsu.gif' },
	{ name: 'd3', kind: 'z', num: 9, yaku:true, max: 4, shuntsuAble: false, filename: 'chun.gif' },
]

export const getPaiFromName = (name: string): Pai => {
	const allPaiName = allPai.map(pai => pai.name);
	const idx = allPaiName.indexOf(name);
	return allPai[idx];
}

export const sortTehai = (tehai:GamePai[]): GamePai[] => {
  tehai.sort((a, b) => {
    if(allPai.indexOf(a.kind) < allPai.indexOf(b.kind)){
      return -1;
    } else {
      return 1;
    }
  })
  return tehai;
}
