import React, { useState } from 'react';
import './App.css';

import { GamePai, Tehai, allPai, allPaiNum, tehaiNum, wanpaiNum, sortTehai, getPon } from './pai'
import { User, KyokuState, wind, isRonUser, isPonUser } from './user';
import { isTenpai, ponList } from './judge';

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
    initArr.push({unique: i, kind: pushPai, decided: true, side: false});
  }

  return initArr;
}

const initGame = (paiyama:GamePai[]): User[] => {
  const tehai1: Tehai = {menzen: sortTehai(paiyama.slice(0, tehaiNum)), fuuro: []};
  const tehai2: Tehai = {menzen: sortTehai(paiyama.slice(tehaiNum, tehaiNum * 2)), fuuro: []};
  const tehai3: Tehai = {menzen: sortTehai(paiyama.slice(tehaiNum * 2, tehaiNum * 3)), fuuro: []};
  const tehai4: Tehai = {menzen: sortTehai(paiyama.slice(tehaiNum * 3, tehaiNum * 4)), fuuro: []};

  const user1: User = {
    userId: 0, tehai: tehai1, fuuro: [], river: [], machi: [], 
    pon: ponList(tehai1.menzen), pon_waiting: false, ron_waiting: false
  };
  const user2: User = {
    userId: 1, tehai: tehai2, fuuro: [], river: [], machi: [], 
    pon: ponList(tehai2.menzen), pon_waiting: false, ron_waiting: false
  };
  const user3: User = {
    userId: 2, tehai: tehai3, fuuro: [], river: [], machi: [],
    pon: ponList(tehai3.menzen), pon_waiting: false, ron_waiting: false
  };
  const user4: User = {
    userId: 3, tehai: tehai4, fuuro: [], river: [], machi: [],
    pon: ponList(tehai4.menzen), pon_waiting: false, ron_waiting: false
  };

  return [user1, user2, user3, user4];
}

const App:React.FC<{}> = () => {
  const [paiyama, changePaiyama] = useState<GamePai[]>(initPaiyama());
  const [kyokuState, changeKyokuState] = useState<KyokuState>(
    { activeUser: 0, tsumo_num: tehaiNum * 4, finish: false, suspend: false, userState: initGame(paiyama)}
  );
  console.log(kyokuState.activeUser, kyokuState.suspend);

  return (
    <>
      { kyokuState.finish ? <h1>流局</h1> : null }
      { kyokuState.userState.map((user, i) => {
        return <div>
          <UserField key={ i } user={ user } paiyama={ paiyama }
            kyokuState={ kyokuState } changeKyokuState={ changeKyokuState } />
        </div>
      }) }
      <Wanpai paiyama={ paiyama }/>
    </>
  )
}

const UserField:React.FC<{
  user:User, paiyama:GamePai[], kyokuState:KyokuState,
  changeKyokuState: React.Dispatch<React.SetStateAction<KyokuState>>
}> = ({ user, paiyama, kyokuState, changeKyokuState }) => {
  return <>
    <h3>
      { wind[user.userId] }
      { user.machi.length > 0 ? user.machi.map((e, i) => {
        return <img key={ i } src={ `/img/${e.filename}` } alt={ e.name } style={{ "height": "28px" }} /> 
      }) : null }
      { user.machi.indexOf(paiyama[kyokuState.tsumo_num].kind) !== -1 && user.userId === kyokuState.activeUser ? 
        <><button onClick={() => { changeKyokuState({ ...kyokuState, finish: true }) }}>ツモ</button></> : null }
      { user.ron_waiting ? <>
        <button onClick={() => { changeKyokuState({ ...kyokuState, finish: true }) }}>ロン</button>
        <button onClick={() => { changeKyokuState({ ...kyokuState, activeUser: (kyokuState.activeUser + 1) % 4,
          tsumo_num: kyokuState.tsumo_num + 1, suspend: false,
          userState: kyokuState.userState.map((prevUser) => prevUser.userId === user.userId ? 
          {...prevUser, ron_waiting: false} : prevUser) }) }}>キャンセル</button>
        </> : null 
      }
      { user.pon_waiting ? <>
        <button onClick={() => {
          changeKyokuState({ ...kyokuState, activeUser: user.userId, userState: 
            kyokuState.userState.map((prevUser) => prevUser.userId === user.userId ? { ...prevUser, 
              tehai: getPon(prevUser.tehai, kyokuState.userState[kyokuState.activeUser].river.slice(-1)[0], 
              user.userId, kyokuState.activeUser) } :
              ( (prevUser.userId === kyokuState.activeUser ) ? { ...prevUser, river: prevUser.river.slice(0, -1) } : prevUser )
            )
          }); 
        }}>ポン</button>
        <button onClick={() => { changeKyokuState({ ...kyokuState, activeUser: (kyokuState.activeUser + 1) % 4, 
          tsumo_num: kyokuState.tsumo_num + 1, suspend: false, userState: kyokuState.userState.map((prevUser) => 
            prevUser.userId === user.userId ? {...prevUser, pon_waiting: false} : prevUser) }) }}>キャンセル</button>
        </> : null 
      }
    </h3>
    <Handtiles tehai={ user.tehai } user={ user } paiyama={ paiyama } river={ user.river }
      kyokuState = { kyokuState } changeKyokuState={ changeKyokuState } />
    <span>　　　</span>
    { (user.userId === kyokuState.activeUser && !kyokuState.suspend) ? <Tile tile={ paiyama[kyokuState.tsumo_num] } user={ user }
      paiyama={ paiyama } kyokuState={ kyokuState } changeKyokuState={ changeKyokuState } />
      : <img src={`/img/1m.gif`} style={{"visibility": 'hidden'}} alt="fa" /> }
    <span>　　　</span>
    <River tiles={ user.river } />
  </>
}

const Handtiles:React.FC<{
  tehai:Tehai, user:User, paiyama:GamePai[], river:GamePai[],
  kyokuState:KyokuState, changeKyokuState: React.Dispatch<React.SetStateAction<KyokuState>>
}> = ({ tehai, user, paiyama, kyokuState, changeKyokuState }) => {
  return <>
  {
    tehai.menzen.map((e, i) => {
      return <Tile key={ i } tile={ e } user={ user } paiyama={ paiyama } kyokuState={ kyokuState }
              changeKyokuState={ changeKyokuState }/>
    })
  }
  <span>　</span>
  {
    tehai.fuuro.map((e, i) => {
      return <StaticTile key={ i } tile={ e }/>
    })
  }
  </>
}

const Tile:React.FC<{
  tile:GamePai, user:User, paiyama:GamePai[], kyokuState:KyokuState,
  changeKyokuState: React.Dispatch<React.SetStateAction<KyokuState>>
}> = ({ tile, user, paiyama, kyokuState, changeKyokuState }) => {
  return <img src={ `/img/${tile.kind.filename}` } alt={ tile.kind.name } 
      style={ ( user.userId === kyokuState.activeUser && !kyokuState.finish && !kyokuState.suspend ) ? 
        {cursor: 'pointer'} : {cursor: 'not-allowed'}
      }
      onClick={ () => {
        let suspend: boolean = false;
        kyokuState.userState.forEach( u => {
          if(!(u.userId === kyokuState.activeUser)){
            suspend = suspend || isRonUser(tile.kind, u.machi, u.river.map(r => r.kind)) || isPonUser(tile.kind, u.pon);
          }
        });
        changeKyokuState({
          activeUser: suspend ? kyokuState.activeUser : (kyokuState.activeUser + 1) % 4,
          tsumo_num: suspend ? kyokuState.tsumo_num : kyokuState.tsumo_num + 1, 
          finish: kyokuState.tsumo_num >= allPaiNum - wanpaiNum - 1 ? true : false,
          suspend: suspend,
          userState: kyokuState.userState.map((prevUser) => 
            prevUser.userId === kyokuState.activeUser ? 
            {
              ...prevUser,
              river: [...prevUser.river, tile],
              pon_waiting: false,
              ron_waiting: false,
              tehai: { menzen: sortTehai(prevUser.tehai.menzen.map((pai) => (pai.unique === tile.unique ?
                paiyama[kyokuState.tsumo_num] : pai))
                .filter((pai) => kyokuState.suspend ? pai.unique !== paiyama[kyokuState.tsumo_num].unique : true ) ),
                fuuro: prevUser.tehai.fuuro },
              machi: isTenpai(prevUser.tehai.menzen.map((pai) => (pai.unique === tile.unique ?
                paiyama[kyokuState.tsumo_num] : pai))
                .filter((pai) => kyokuState.suspend ? pai.unique !== paiyama[kyokuState.tsumo_num].unique : true ) ),
              pon: ponList(sortTehai(prevUser.tehai.menzen.map((pai) => (pai.unique === tile.unique ?
                paiyama[kyokuState.tsumo_num] : pai))
                .filter((pai) => kyokuState.suspend ? pai.unique !== paiyama[kyokuState.tsumo_num].unique : true ) ))
            } : 
            {
              ...prevUser,
              ron_waiting: isRonUser(tile.kind, prevUser.machi, prevUser.river.map(r => r.kind)),
              pon_waiting: isPonUser(tile.kind, prevUser.pon)
            }
          )
        });
      }} />
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
  return <img src={ `/img/${tile.kind.filename}` } alt={ tile.kind.name } style={ tile.side ? {transform: "rotate(90deg)" } : {} } />
}

export default App;
