import { GamePai, Pai, Tehai } from './pai'

export type User = {
	userId: number,
	tehai: Tehai,
	fuuro: GamePai[],
	river: GamePai[],
	machi: Pai[],
	pon: Pai[],
	ron_waiting: boolean,
	pon_waiting: boolean
}

export type KyokuState = {
	activeUser: number,
	tsumo_num: number,
	finish: boolean,
	suspend: boolean,
	userState: User[]
}

export const wind: string[] = ['東', '南', '西', '北']

export const isRonUser = (pai: Pai, machi: Pai[], river: Pai[]): boolean => {
	if(machi.indexOf(pai) !== -1){
		if(river.indexOf(pai) === -1){
			return true;
		}
	}
	return false;
}

export const isPonUser = (pai: Pai, pon_list: Pai[]): boolean => {
	if(pon_list.indexOf(pai) !== -1) return true;
	return false;
}
