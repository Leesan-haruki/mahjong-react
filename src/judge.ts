import { GamePai, Pai, getPaiFromName } from './pai'

type Machi = "tanki" | "shabo" | "penchan" | "kanchan" | "ryanmen"

type Machi_info = {
	machi: Machi,
	pai: Pai
}

type paiCounter = {
	pai: Pai,
	count: number
};

const delete_n = (counter: paiCounter[], count: paiCounter, num: number): paiCounter[] => {
	const res: paiCounter[] = [];
	const idx = counter.indexOf(count);
	if(count.count === num){
		for(let i = 0; i < counter.length; i++){
			if(i !== idx){
				res.push(counter[i]);
			}
		}
		return res;
	}
  else{
    for(let i = 0; i < counter.length; i++){
			if(i !== idx){
				res.push(counter[i]);
			}
			else{
				res.push({pai: counter[idx].pai, count: counter[idx].count - num});
			}
    }
    return res;
  }
}

// 先頭3つが順子を成しているならそれを抜いて返す
const isShuntsu = (counter: paiCounter[]): [paiCounter[], boolean] => {
	if(counter.length <= 2) return [counter, false];
	if(counter[0].pai.kind === counter[1].pai.kind && counter[1].pai.kind === counter[2].pai.kind){
		if(counter[0].pai.shuntsuAble){
			if(counter[1].pai.num - counter[0].pai.num === 1 && counter[2].pai.num - counter[1].pai.num === 1){
				let counterMinusShuntsu = delete_n(counter, counter[0], 1);
				counterMinusShuntsu = delete_n(counterMinusShuntsu, counter[1], 1);
				counterMinusShuntsu = delete_n(counterMinusShuntsu, counter[2], 1);
				return [counterMinusShuntsu, true];
				}
			}
	}
	return [counter, false];
}

// 先頭1つが刻子を成しているならそれを抜いて返す
const isKotsu = (counter: paiCounter[]): [paiCounter[], boolean] => {
  if(counter[0].count >= 3){
		let counterMinusKotsu: paiCounter[];
		counterMinusKotsu = delete_n(counter, counter[0], 3);
		return [counterMinusKotsu, true];
  }
  return [counter, false];
}

// n番目が対子ならそれを抜いて返す
const isToitsu = (counter: paiCounter[], idx: number): [paiCounter[], boolean] => {
	if(counter[idx].count >= 2){
		let counterMinusToitsu: paiCounter[];
		counterMinusToitsu = delete_n(counter, counter[idx], 2);
		return [counterMinusToitsu, true];
	}
	return [counter, false];
}

// m番目とn番目が塔子ならそれを抜いて返す
const isTatsu = (counter: paiCounter[], idx1: number, idx2: number): [paiCounter[], boolean, Machi | "", Pai[]] => {
	const pai1 = counter[idx1].pai;
	const pai2 = counter[idx2].pai;
	if(pai2.kind === pai1.kind && pai1.shuntsuAble){
		if(pai2.num - pai1.num === 1){
			if(pai1.num === 1 || pai2.num === 9){  // 辺張
				const counter10 = delete_n(counter, counter[idx1], 1);
				const counter9 = delete_n(counter10, counter[idx2], 1);
				if(pai1.num === 1){
					return [counter9, true, "penchan", [getPaiFromName(pai2.kind + String(pai2.num + 1))]];
				}
				else{
					return [counter9, true, "penchan", [getPaiFromName(pai1.kind + String(pai1.num - 1))]];
				}
			}
			else{  // 両面
				const counter10 = delete_n(counter, counter[idx1], 1);
				const counter9 = delete_n(counter10, counter[idx2], 1);
				const machi = [getPaiFromName(pai1.kind + String(pai1.num - 1)), 
					getPaiFromName(pai2.kind + String(pai2.num + 1))];
				return [counter9, true, "ryanmen", machi];
			}
		}
		else if(pai2.num - pai1.num === 2){  // 嵌張
			const counter10 = delete_n(counter, counter[idx1], 1);
			const counter9 = delete_n(counter10, counter[idx2], 1);
			return [counter9, true, "kanchan", [getPaiFromName(pai1.kind + String(pai1.num + 1))]];
		}
		else{
			return [counter, false, "", []];
		}
	}
	else return [counter, false, "", []];
}

// 順順順、順順刻、順刻順、順刻刻、刻順順、刻順刻、刻刻順、刻刻刻
const isMentsu3 = (counter9: paiCounter[]): boolean => {
  let returnFlag: boolean = false;

  const [shuntsu1Counter6, flag_s] = isShuntsu(counter9);
  if(flag_s){
    const [shuntsu2Counter3, flag_ss] = isShuntsu(shuntsu1Counter6);
    if(flag_ss){
      const [shuntsu3, flag_sss] = isShuntsu(shuntsu2Counter3);
      if(flag_sss) returnFlag = true;
      const [shuntsu2Kotsu1, flag_ssk] = isKotsu(shuntsu2Counter3);
      if(flag_ssk) returnFlag = true;
    }
    const [shuntsu1kotsu1Counter3, flag_sk] = isKotsu(shuntsu1Counter6);
		if(flag_sk){
			const [shuntsu1kotsu1shuntsu1, flag_sks] = isShuntsu(shuntsu1kotsu1Counter3);
			if(flag_sks) returnFlag = true;
			const [shuntsu1Kotsu2, flag_skk] = isKotsu(shuntsu1kotsu1Counter3);
			if(flag_skk) returnFlag = true;
		}
	}
	const [kotsu1Counter6, flag_k] = isKotsu(counter9);
	if(flag_k){
		const [kotsu1shuntsu1Counter3, flag_ks] = isShuntsu(kotsu1Counter6);
		if(flag_ks){
			const [kotsu1shuntsu2, flag_kss] = isShuntsu(kotsu1shuntsu1Counter3);
			if(flag_kss) returnFlag = true;
			const [kotsu1shuntsu1kotsu1, flag_ksk] = isKotsu(kotsu1shuntsu1Counter3);
			if(flag_ksk) returnFlag = true;
		}
		const [kotsu2Counter3, flag_kk] = isKotsu(kotsu1Counter6);
		if(flag_kk){
			const [kotsu2shuntsu1, flag_kks] = isShuntsu(kotsu2Counter3);
			if(flag_kks) returnFlag = true;
			const [kotsu3, flag_kkk] = isKotsu(kotsu2Counter3);
			if(flag_kkk) returnFlag = true;
		}
	}

	return returnFlag;
}

// 対子も含む
const isMentsu3Tatsu1 = (counter: paiCounter[]) => {
	let machi_info: Machi_info[] = [];
	// まず対子から
	for(let i = 0; i<counter.length; i++){
		const [toitsu1Counter9, flag_to] = isToitsu(counter, i);
		if(flag_to){
			if(isMentsu3(toitsu1Counter9)){
				machi_info.push({machi: "shabo", pai: counter[i].pai})
			}
		}
	}

	// 次に塔子
	for(let i = 0; i<counter.length; i++){
		for(let j = i+1; j<counter.length; j++){
			const [tatsu1Counter9, flag_ta, machi, machi_pai] = isTatsu(counter, i, j);
			if(flag_ta && machi !== ""){
				if(isMentsu3(tatsu1Counter9)){
					machi_pai.forEach(machi_p => {machi_info.push({machi: machi, pai: machi_p})});
				}
			}
		}
	}
	return machi_info;
}

const isMentsu4 = (counter: paiCounter[]): boolean => {
	const [shuntsu1Counter9, flag] = isShuntsu(counter);
	if(flag){
		if(isMentsu3(shuntsu1Counter9)) return true;
	}

	const [kotsu1Counter9, flag2] = isKotsu(counter);
	if(flag2){
		if(isMentsu3(kotsu1Counter9)) return true;
	}

	return false;
}

export const isTenpai = (game_tehai: GamePai[]): Pai[] => {
	const tehai = game_tehai.map(p => p.kind);
	const pai_counter: paiCounter[] = [];
	for(const pai of tehai){
		const pai_exist: Pai[] = pai_counter.map(counter => counter.pai);
		const idx: number = pai_exist.indexOf(pai);
		if(idx !== -1){
			pai_counter[idx].count += 1;
		} else {
			pai_counter.push({pai: pai, count: 1});
		}
	}
	// console.log(pai_counter);

	const machi_set = new Set<Pai>();
	for(let i = 0; i < pai_counter.length; i++){
		if(pai_counter[i].count === 1){
			const counter12 = delete_n(pai_counter, pai_counter[i], 1);
			if(isMentsu4(counter12)) {
				machi_set.add(pai_counter[i].pai);
			}
		}
		else if(pai_counter[i].count === 2 || pai_counter[i].count === 4){
			const counter11 = delete_n(pai_counter, pai_counter[i], 2);
			let machi_info = isMentsu3Tatsu1(counter11);
			machi_info.forEach(e => {machi_set.add(e.pai)});
		}
		else if(pai_counter[i].count === 3){
			const counter12 = delete_n(pai_counter, pai_counter[i], 1);
			if(isMentsu4(counter12)) {
				machi_set.add(pai_counter[i].pai);
			}
			const counter11 = delete_n(pai_counter, pai_counter[i], 2);
			let machi_info = isMentsu3Tatsu1(counter11);
			machi_info.forEach(e => {machi_set.add(e.pai)});
		}
		else{
			continue;
		}
	}

	let res: Pai[] = [];
	machi_set.forEach(machi_pai => {res.push(machi_pai)});
	return res;
}