import React, { useState } from 'react';
import './App.css';

import { GamePai, allPai, allPaiNum, tehaiNum, wanpaiNum, sortTehai } from './pai'
import { User, KyokuState, wind, isRonUser } from './user';
import { isTenpai } from './judge';

const initPaiyama = (): GamePai[] => {
  let arr:number[] = [...Array(allPaiNum)].map((_, i) => i)
  for(let i = 0; i < 100000; i++){
    const swap = Math.floor(Math.random() * arr.length);
    const swap2 = Math.floor(Math.random() * arr.length);
    const tmp = arr[swap2];
    arr[swap2] = arr[swap];
    arr[swap] = tmp;
  }

  let initArr:GamePai[] = [];
  for(let i = 0; i < allPaiNum; i++) {
    let pushPai = allPai[Math.floor(arr[i] / 4)];
    initArr.push({unique: i, kind: pushPai});
  }

  return initArr;
}

const initGame = (paiyama:GamePai[]): User[] => {
  const user1:User = { userId: 0, tehai: paiyama.slice(0, tehaiNum), river: [], machi: [] };
  const user2:User = { userId: 1, tehai: paiyama.slice(tehaiNum, tehaiNum * 2), river: [], machi: [] };
  const user3:User = { userId: 2, tehai: paiyama.slice(tehaiNum * 2, tehaiNum * 3), river: [], machi: [] };
  const user4:User = { userId: 3, tehai: paiyama.slice(tehaiNum * 3, tehaiNum * 4), river: [], machi: [] };

  return [user1, user2, user3, user4];
}

const App:React.FC<{}> = () => {
  const [paiyama, changePaiyama] = useState<GamePai[]>(initPaiyama());
  const [users, changeUsers] = useState<User[]>(initGame(paiyama));
  const [kyokuState, changeKyokuState] = useState<KyokuState>(
    { activeUser: 0, tsumo_num: tehaiNum * 4, finish: false, ron_waiting: [false, false, false, false] }
  );

  // console.log(kyokuState.tsumo_num);
  
  return (
    <>
      { kyokuState.finish ? <h1>流局</h1> : null }
      { users.map((user, i) => {
        return <div>
          <UserField key={ i } user={ user } users={ users } paiyama={ paiyama }
            kyokuState={ kyokuState } changeUsers={ changeUsers } changeKyokuState={ changeKyokuState } />
          </div>
      }) }
      <Wanpai paiyama={ paiyama }/>
    </>
  )
}

const UserField:React.FC<{
  user:User, users:User[], paiyama:GamePai[], kyokuState:KyokuState,
  changeUsers:React.Dispatch<React.SetStateAction<User[]>>,
  changeKyokuState: React.Dispatch<React.SetStateAction<KyokuState>>
}> = ({ user, users, paiyama, kyokuState, changeUsers, changeKyokuState }) => {
  return <>
    <h3>
      { wind[user.userId] }
      { user.machi.length > 0 ? user.machi.map((e, i) => {
        return <img key={ i } src={ `/img/${e.filename}` } alt={ e.name } style={{ "height": "28px" }} /> 
      }) : null }
      { user.machi.indexOf(paiyama[kyokuState.tsumo_num].kind) !== -1 && user.userId === kyokuState.activeUser ? 
        <><button onClick={() => { changeKyokuState({ ...kyokuState, finish: true }) }}>ツモ</button></> : null }
      { kyokuState.ron_waiting[user.userId] ? <>
        <button onClick={() => { changeKyokuState({ ...kyokuState, finish: true }) }}>ロン</button>
        <button onClick={() => { changeKyokuState({ ...kyokuState, ron_waiting: [false, false, false, false] }) }}>
        キャンセル</button></> : null }
    </h3>
    <Handtiles tehai={ sortTehai(user.tehai) } user={ user } users={ users } paiyama={ paiyama } river={ user.river }
      kyokuState = { kyokuState } changeUsers={ changeUsers } changeKyokuState={ changeKyokuState } />
    <span>　　　</span>
    { user.userId === kyokuState.activeUser ? <Tile tile={ paiyama[kyokuState.tsumo_num] } user={ user } users={ users }
      paiyama={ paiyama } kyokuState={ kyokuState } changeUsers={ changeUsers } changeKyokuState={ changeKyokuState } />
      : <img src={`/img/1m.gif`} style={{"visibility": 'hidden'}} alt="fa" /> }
    <span>　　　</span>
    <River tiles={ user.river } />
  </>
}

const Handtiles:React.FC<{
  tehai:GamePai[], user:User, users:User[], paiyama:GamePai[], river:GamePai[],
  kyokuState:KyokuState, changeUsers:React.Dispatch<React.SetStateAction<User[]>>, 
  changeKyokuState: React.Dispatch<React.SetStateAction<KyokuState>>
}> = ({ tehai, user, users, paiyama, kyokuState, changeUsers, changeKyokuState }) => {
  return <>
  {
    tehai.map((e, i) => {
      return <Tile key={ i } tile={ e } user={ user } users={ users } paiyama={ paiyama } kyokuState={ kyokuState }
              changeUsers={ changeUsers } changeKyokuState={ changeKyokuState }/>
    })
  }
  </>
}

const Tile:React.FC<{
  tile:GamePai, user:User, users:User[], paiyama:GamePai[], kyokuState:KyokuState,
  changeUsers: React.Dispatch<React.SetStateAction<User[]>>,
  changeKyokuState: React.Dispatch<React.SetStateAction<KyokuState>>
}> = ({ tile, user, users, paiyama, kyokuState, changeUsers, changeKyokuState }) => {
  return <img src={ `/img/${tile.kind.filename}` } alt={ tile.kind.name } 
      style={ user.userId === kyokuState.activeUser && !kyokuState.finish && !kyokuState.ron_waiting.some(e => e) ? 
        {cursor: 'pointer'} : {cursor: 'not-allowed'} }
      onClick={ user.userId === kyokuState.activeUser ? () => {
        changeUsers((prevUsers) => prevUsers.map((user) => (user.userId === kyokuState.activeUser) ? 
          {
            userId: user.userId, river: [...user.river, tile],
            tehai: sortTehai(user.tehai.map((pai) => (pai.unique === tile.unique ?
              paiyama[kyokuState.tsumo_num] : pai))),
            machi: isTenpai(user.tehai.map((pai) => (pai.unique === tile.unique ?
              paiyama[kyokuState.tsumo_num] : pai)))
          } : {
            userId: user.userId, river: user.river, tehai: user.tehai, machi: isTenpai(user.tehai)
          }
        ));
        changeKyokuState({
          activeUser: (kyokuState.activeUser + 1) % 4, tsumo_num: kyokuState.tsumo_num + 1, 
          finish: kyokuState.tsumo_num >= allPaiNum - wanpaiNum - 1 ? true : false,
          ron_waiting: users.map((u, i) => i === user.userId ? 
            false : isRonUser(tile.kind, u.machi, u.river.map(r => r.kind)))
        })
      } : () => {}} />
}

const River:React.FC<{ tiles:GamePai[] }> = ({ tiles }) => {
  return <>
    {
      tiles.map((e, i) => {
        return <StaticTile key={ i } tile={ e }/>
      })
    }
  </>
}

const Wanpai:React.FC<{ paiyama:GamePai[] }> = ({ paiyama }) => {
  return <>
    <div>{ paiyama.slice(allPaiNum - wanpaiNum, allPaiNum - wanpaiNum / 2).map((e, i) => {
        return <StaticTile key={ i } tile={ e } hidden={ i===2 ? false: true } />}) }</div>
    <div>{ paiyama.slice(allPaiNum - wanpaiNum / 2).map((e, i) => {
        return <StaticTile key={ i } tile={ e } hidden={ true } />}) }</div>
  </>
}

const StaticTile:React.FC<{ tile:GamePai, hidden?:boolean }> = ({ tile, hidden }) => {
  if(hidden){
    return <img src={ `/img/ura.png` } alt={ "ura" } />
  }
  return <img src={ `/img/${tile.kind.filename}` } alt={ tile.kind.name } />
}

export default App;
