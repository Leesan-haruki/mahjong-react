import { GamePai, Pai, Tehai, getPaiFromName } from './pai'

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

const isMentsu1 = (counter3: paiCounter[]): boolean => {
	let returnFlag: boolean = false;

	const [shuntsu1, flag_s] = isShuntsu(counter3);
	if(flag_s) returnFlag = true;
	const [kotsu1, flag_k] = isKotsu(counter3);
	if(flag_k) returnFlag = true;

	return returnFlag;
}

const isMentsu2 = (counter6: paiCounter[]): boolean => {
	let returnFlag: boolean = false;

	const [shuntsu1Counter3, flag_s] = isShuntsu(counter6);
	if(flag_s && isMentsu1(shuntsu1Counter3)) returnFlag = true;
	const [kotsu1Counter3, flag_k] = isKotsu(counter6);
	if(flag_k && isMentsu1(kotsu1Counter3)) returnFlag = true;

	return returnFlag;
}

const isMentsu3 = (counter9: paiCounter[]): boolean => {
	let returnFlag: boolean = false;

	const [shuntsu1Counter6, flag_s] = isShuntsu(counter9);
	if(flag_s && isMentsu2(shuntsu1Counter6)) returnFlag = true;
	const [kotsu1Counter6, flag_k] = isShuntsu(counter9);
	if(flag_k && isMentsu2(kotsu1Counter6)) returnFlag = true;

	return returnFlag;
}

const isMentsu4 = (counter12: paiCounter[]): boolean => {
	let returnFlag: boolean = false;

	const [shuntsu1Counter9, flag_s] = isShuntsu(counter12);
	if(flag_s && isMentsu3(shuntsu1Counter9)) returnFlag = true;
	const [kotsu1Counter9, flag_k] = isKotsu(counter12);
	if(flag_k && isMentsu3(kotsu1Counter9)) returnFlag = true;

	return returnFlag;
}

// 対子も含む
const isMentsu0Tatsu1 = (counter2: paiCounter[]) => {
	let machi_info: Machi_info[] = [];
	// まず対子から
	for(let i = 0; i<counter2.length; i++){
		const [toitsu1, flag_to] = isToitsu(counter2, i);
		if(flag_to) machi_info.push({machi: "shabo", pai: counter2[i].pai})
	}

	// 次に塔子
	for(let i = 0; i<counter2.length; i++){
		for(let j = i+1; j<counter2.length; j++){
			const [tatsu1, flag_ta, machi, machi_pai] = isTatsu(counter2, i, j);
			if(flag_ta && machi !== "") machi_pai.forEach(machi_p => {machi_info.push({machi: machi, pai: machi_p})});
		}
	}
	return machi_info;
}

// 対子も含む
const isMentsu1Tatsu1 = (counter5: paiCounter[]) => {
	let machi_info: Machi_info[] = [];
	// まず対子から
	for(let i = 0; i<counter5.length; i++){
		const [toitsu1Counter3, flag_to] = isToitsu(counter5, i);
		if(flag_to){
			if(isMentsu1(toitsu1Counter3)){
				machi_info.push({machi: "shabo", pai: counter5[i].pai})
			}
		}
	}

	// 次に塔子
	for(let i = 0; i < counter5.length; i++){
		for(let j = i+1; j < counter5.length; j++){
			const [tatsu1Counter3, flag_ta, machi, machi_pai] = isTatsu(counter5, i, j);
			if(flag_ta && machi !== ""){
				if(isMentsu1(tatsu1Counter3)){
					machi_pai.forEach(machi_p => {machi_info.push({machi: machi, pai: machi_p})});
				}
			}
		}
	}
	return machi_info;
}

// 対子も含む
const isMentsu2Tatsu1 = (counter8: paiCounter[]) => {
	let machi_info: Machi_info[] = [];
	// まず対子から
	for(let i = 0; i<counter8.length; i++){
		const [toitsu1Counter6, flag_to] = isToitsu(counter8, i);
		if(flag_to){
			if(isMentsu2(toitsu1Counter6)){
				machi_info.push({machi: "shabo", pai: counter8[i].pai})
			}
		}
	}

	// 次に塔子
	for(let i = 0; i<counter8.length; i++){
		for(let j = i+1; j<counter8.length; j++){
			const [tatsu1Counter6, flag_ta, machi, machi_pai] = isTatsu(counter8, i, j);
			if(flag_ta && machi !== ""){
				if(isMentsu2(tatsu1Counter6)){
					machi_pai.forEach(machi_p => {machi_info.push({machi: machi, pai: machi_p})});
				}
			}
		}
	}
	return machi_info;
}

// 対子も含む
const isMentsu3Tatsu1 = (counter11: paiCounter[]) => {
	let machi_info: Machi_info[] = [];
	// まず対子から
	for(let i = 0; i<counter11.length; i++){
		const [toitsu1Counter9, flag_to] = isToitsu(counter11, i);
		if(flag_to){
			if(isMentsu3(toitsu1Counter9)){
				machi_info.push({machi: "shabo", pai: counter11[i].pai})
			}
		}
	}

	// 次に塔子
	for(let i = 0; i<counter11.length; i++){
		for(let j = i+1; j<counter11.length; j++){
			const [tatsu1Counter9, flag_ta, machi, machi_pai] = isTatsu(counter11, i, j);
			if(flag_ta && machi !== ""){
				if(isMentsu3(tatsu1Counter9)){
					machi_pai.forEach(machi_p => {machi_info.push({machi: machi, pai: machi_p})});
				}
			}
		}
	}
	return machi_info;
}

export const isTenpai = (menzen_tehai: GamePai[]): Pai[] => {
	const pai_counter: paiCounter[] = createCounter(menzen_tehai);

	const machi_set = new Set<Pai>();
	for(let i = 0; i < pai_counter.length; i++){
		if(pai_counter[i].count === 1){
			const counterMinus1 = delete_n(pai_counter, pai_counter[i], 1);
			if(menzen_tehai.length === 13 && isMentsu4(counterMinus1)) {
				machi_set.add(pai_counter[i].pai);
			}
			if(menzen_tehai.length === 10 && isMentsu3(counterMinus1)) {
				machi_set.add(pai_counter[i].pai);
			}
			if(menzen_tehai.length === 7 && isMentsu2(counterMinus1)) {
				machi_set.add(pai_counter[i].pai);
			}
			if(menzen_tehai.length === 4 && isMentsu1(counterMinus1)) {
				machi_set.add(pai_counter[i].pai);
			}
		}
		else if(pai_counter[i].count === 2 || pai_counter[i].count === 4){
			const counterMinus2 = delete_n(pai_counter, pai_counter[i], 2);
			let machi_info: Machi_info[] = [];
			if(menzen_tehai.length === 13) machi_info = isMentsu3Tatsu1(counterMinus2);
			else if(menzen_tehai.length === 10) machi_info = isMentsu2Tatsu1(counterMinus2);
			else if(menzen_tehai.length === 7) machi_info = isMentsu1Tatsu1(counterMinus2);
			else if(menzen_tehai.length === 4) machi_info = isMentsu0Tatsu1(counterMinus2);
			machi_info.forEach(e => {machi_set.add(e.pai)});
		}
		else if(pai_counter[i].count === 3){
			const counterMinus1 = delete_n(pai_counter, pai_counter[i], 1);
			if(menzen_tehai.length === 13 && isMentsu4(counterMinus1)) {
				machi_set.add(pai_counter[i].pai);
			}
			if(menzen_tehai.length === 10 && isMentsu3(counterMinus1)) {
				machi_set.add(pai_counter[i].pai);
			}
			if(menzen_tehai.length === 7 && isMentsu2(counterMinus1)) {
				machi_set.add(pai_counter[i].pai);
			}
			if(menzen_tehai.length === 4 && isMentsu1(counterMinus1)) {
				machi_set.add(pai_counter[i].pai);
			}
			
			const counterMinus2 = delete_n(pai_counter, pai_counter[i], 2);
			let machi_info: Machi_info[] = [];
			if(menzen_tehai.length === 13) machi_info = isMentsu3Tatsu1(counterMinus2);
			else if(menzen_tehai.length === 10) machi_info = isMentsu2Tatsu1(counterMinus2);
			else if(menzen_tehai.length === 7) machi_info = isMentsu1Tatsu1(counterMinus2);
			else if(menzen_tehai.length === 4) machi_info = isMentsu0Tatsu1(counterMinus2);
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

export const ponList = (game_tehai: GamePai[]): Pai[] => {
	const pai_counter: paiCounter[] = createCounter(game_tehai);

	const pon_list: Pai[] = [];
	for(let i = 0; i < pai_counter.length; i++){
		if(pai_counter[i].count === 2 || pai_counter[i].count === 3){
			pon_list.push(pai_counter[i].pai);
		}
	}
	return pon_list;
}

const createCounter = (game_tehai: GamePai[]): paiCounter[] => {
	const tehai: Pai[] = game_tehai.map(p => p.kind);
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
	return pai_counter;
}
