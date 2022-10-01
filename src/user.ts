import internal from 'stream'
import { GamePai, Pai, Tehai } from './pai'

export type User = {
	user_id: number,
	tehai: Tehai,
	fuuro: GamePai[],
	river: GamePai[],
	machi: Pai[],
	pon: Pai[],
	tii: Pai[],
	ron_waiting: boolean,
	pon_waiting: boolean,
	tii_waiting: boolean,
	now_tii: GamePai[]
}

export type KyokuState = {
	activeUser: number,
	tsumo_num: number,
	finish: boolean,
	suspend: boolean,
	waiting_actions: number,
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

export const isTiiUser = (pai: Pai, tii_list: Pai[], now_user: number, old_user: number): boolean => {
	if((now_user - old_user + 4) % 4 !== 1) return false;
	if(tii_list.indexOf(pai) !== -1) return true;
	return false;
}
