import { GamePai, Pai } from './pai'

export type User = {
	userId: number,
	tehai: GamePai[],
	river: GamePai[]
	machi: Pai[]
}

export type KyokuState = {
	activeUser: number,
	tsumo_num: number,
	finish: boolean
	ron_waiting: boolean[]
}

export const wind: string[] = ['東', '南', '西', '北']

export const isRonUser = (pai: Pai, machi: Pai[], river: Pai[]): boolean => {
	if(machi.indexOf(pai) != -1){
		if(river.indexOf(pai) === -1){
			return true;
		}
	}
	return false;
}
