import React, { useState } from 'react';
import './App.css';

import { GamePai, Tehai, allPai, allPaiNum, tehaiNum, wanpaiNum, sortTehai, getPon, getTii, getFirstTii, getSecondTii } from './pai'
import { User, KyokuState, wind, isRonUser, isPonUser, isTiiUser } from './user';
import { isTenpai, ponList, tiiList } from './judge';

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
    initArr.push({unique: i, kind: pushPai, active: true, side: false});
  }

  return initArr;
}

const initGame = (paiyama:GamePai[]): User[] => {
  const tehai1: Tehai = {menzen: sortTehai(paiyama.slice(0, tehaiNum)), fuuro: []};
  const tehai2: Tehai = {menzen: sortTehai(paiyama.slice(tehaiNum, tehaiNum * 2)), fuuro: []};
  const tehai3: Tehai = {menzen: sortTehai(paiyama.slice(tehaiNum * 2, tehaiNum * 3)), fuuro: []};
  const tehai4: Tehai = {menzen: sortTehai(paiyama.slice(tehaiNum * 3, tehaiNum * 4)), fuuro: []};

  const user1: User = {
    user_id: 0, tehai: tehai1, fuuro: [], river: [], machi: [], pon: ponList(tehai1.menzen),
    tii: tiiList(tehai1.menzen), pon_waiting: false, ron_waiting: false, tii_waiting: false, now_tii: []
  };
  const user2: User = {
    user_id: 1, tehai: tehai2, fuuro: [], river: [], machi: [], pon: ponList(tehai2.menzen),
    tii: tiiList(tehai2.menzen), pon_waiting: false, ron_waiting: false, tii_waiting: false, now_tii: []
  };
  const user3: User = {
    user_id: 2, tehai: tehai3, fuuro: [], river: [], machi: [], pon: ponList(tehai3.menzen),
    tii: tiiList(tehai3.menzen), pon_waiting: false, ron_waiting: false, tii_waiting: false, now_tii: []
  };
  const user4: User = {
    user_id: 3, tehai: tehai4, fuuro: [], river: [], machi: [], pon: ponList(tehai4.menzen),
    tii: tiiList(tehai4.menzen), pon_waiting: false, ron_waiting: false, tii_waiting: false, now_tii: []
  };

  return [user1, user2, user3, user4];
}

const App:React.FC<{}> = () => {
  const [paiyama, changePaiyama] = useState<GamePai[]>(initPaiyama());
  const [kyokuState, changeKyokuState] = useState<KyokuState>(
    { activeUser: 0, tsumo_num: tehaiNum * 4, finish: false, suspend: false, waiting_actions: 0, userState: initGame(paiyama)}
  );

  return (
    <>
      { kyokuState.finish ? <h1>終局</h1> : null }
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
  let waiting = false;
  kyokuState.userState.forEach(u => {waiting = u.tii_waiting || u.pon_waiting || waiting});
  return <>
    <h3>
      { wind[user.user_id] }
      { user.machi.length > 0 ? user.machi.map((e, i) => {
        return <img key={ i } src={ `/img/${e.filename}` } alt={ e.name } style={{ "height": "28px" }} /> 
      }) : null }
      { user.machi.indexOf(paiyama[kyokuState.tsumo_num].kind) !== -1 && user.user_id === kyokuState.activeUser && !kyokuState.suspend ? 
        <><button onClick={() => { changeKyokuState({ ...kyokuState, finish: true }) }}>ツモ</button></> : null }

      { user.ron_waiting ? <>
        <button onClick={() => { changeKyokuState({ ...kyokuState, finish: true }) }}>ロン</button>
        <button onClick={() => { changeKyokuState({ ...kyokuState, activeUser: (kyokuState.activeUser + 1) % 4,
          tsumo_num: kyokuState.tsumo_num + 1, suspend: false,
          userState: kyokuState.userState.map((prevUser) => prevUser.user_id === user.user_id ? 
          {...prevUser, ron_waiting: false} : prevUser) }) }}>キャンセル</button>
        </> : null 
      }

      { user.pon_waiting && kyokuState.suspend ? <>
        <button onClick={() => {
          changeKyokuState({ ...kyokuState, activeUser: user.user_id, suspend: false, userState: 
            kyokuState.userState.map((prevUser) => prevUser.user_id === user.user_id ? { ...prevUser, 
              tehai: getPon(prevUser.tehai, kyokuState.userState[kyokuState.activeUser].river.slice(-1)[0], 
              user.user_id, kyokuState.activeUser) } :
              ( (prevUser.user_id === kyokuState.activeUser ) ? { ...prevUser, river: prevUser.river.slice(0, -1) } : prevUser )
            )
          }); 
        }}>ポン</button>
        <button onClick={() => { changeKyokuState({ ...kyokuState, activeUser: kyokuState.waiting_actions - 1 > 0 ? kyokuState.activeUser : (kyokuState.activeUser + 1) % 4, 
          tsumo_num: kyokuState.tsumo_num + 1, suspend: false, waiting_actions: kyokuState.waiting_actions - 1,
          userState: kyokuState.userState.map((prevUser) => 
            prevUser.user_id === user.user_id ? {...prevUser, pon_waiting: false} : prevUser) }) }}>キャンセル</button>
        </> : null 
      }

      { user.tii_waiting && kyokuState.suspend ? <>
        <button onClick={() => {
          changeKyokuState({ ...kyokuState, activeUser: user.user_id, suspend: false, userState: 
            kyokuState.userState.map((prevUser) => prevUser.user_id === user.user_id ? { ...prevUser, 
              tehai: getFirstTii(prevUser.tehai, kyokuState.userState[kyokuState.activeUser].river.slice(-1)[0]) } : prevUser
            )
          }); 
        }}>チー</button>
        <button onClick={() => { changeKyokuState({ ...kyokuState, activeUser: kyokuState.waiting_actions - 1 > 0 ? kyokuState.activeUser : (kyokuState.activeUser + 1) % 4, 
          tsumo_num: kyokuState.tsumo_num + 1, suspend: false, waiting_actions: kyokuState.waiting_actions - 1,
          userState: kyokuState.userState.map((prevUser) => 
            prevUser.user_id === user.user_id ? {...prevUser, tii_waiting: false} : prevUser) }) }}>キャンセル</button>
        </> : null 
      }
    </h3>
    <Handtiles tehai={ user.tehai } user={ user } paiyama={ paiyama } river={ user.river }
      kyokuState = { kyokuState } changeKyokuState={ changeKyokuState } />
    <span>　　　</span>
    { (user.user_id === kyokuState.activeUser && !waiting) ? <Tile tile={ paiyama[kyokuState.tsumo_num] } user={ user }
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
      style={ ( user.user_id === kyokuState.activeUser && !kyokuState.finish && !kyokuState.suspend ) ? 
        ( tile.active ? {cursor: 'pointer'} : {cursor: 'not-allowed', opacity: 0.5} ) : {cursor: 'not-allowed', opacity: 0.5}
      }
      onClick={ () => {
        let suspend: boolean = false;
        let waiting_actions = 0;
        kyokuState.userState.forEach( u => {
          if(!(u.user_id === kyokuState.activeUser)){
            suspend = suspend || isRonUser(tile.kind, u.machi, u.river.map(r => r.kind))
              || isPonUser(tile.kind, u.pon) || isTiiUser(tile.kind, u.tii, u.user_id, kyokuState.activeUser);
            waiting_actions += Number(isRonUser(tile.kind, u.machi, u.river.map(r =>r.kind)));
            waiting_actions += Number(isPonUser(tile.kind, u.pon));
            waiting_actions += Number(isTiiUser(tile.kind, u.tii, u.user_id, kyokuState.activeUser));
          }
        });
        if(kyokuState.userState[kyokuState.activeUser].tii_waiting && kyokuState.userState[kyokuState.activeUser].now_tii.length === 0){
          changeKyokuState({
            ...kyokuState,
            userState: kyokuState.userState.map((prevUser) =>
              prevUser.user_id === kyokuState.activeUser ?
              {
                ...prevUser,
                now_tii: [tile],
                tehai: getSecondTii(prevUser.tehai, kyokuState.userState[(prevUser.user_id + 3) % 4].river.slice(-1)[0], tile),
              } : prevUser
            )
          })
        }
        else if(kyokuState.userState[kyokuState.activeUser].tii_waiting && kyokuState.userState[kyokuState.activeUser].now_tii.length === 1){
          changeKyokuState({ ...kyokuState, userState: 
            kyokuState.userState.map((prevUser) => prevUser.user_id === kyokuState.activeUser ? { ...prevUser, now_tii: [...prevUser.now_tii, tile],
              tehai: getTii(prevUser.tehai, kyokuState.userState[(prevUser.user_id + 3) % 4].river.slice(-1)[0], 
              prevUser.now_tii[0], tile) } :
              ( (prevUser.user_id === (kyokuState.activeUser + 3) % 4 ) ? { ...prevUser, river: prevUser.river.slice(0, -1) } : prevUser )
            )
          }); 
        }
        else{
          changeKyokuState({
            activeUser: suspend ? kyokuState.activeUser : (kyokuState.activeUser + 1) % 4,
            tsumo_num: suspend ? kyokuState.tsumo_num : kyokuState.tsumo_num + 1, 
            finish: kyokuState.tsumo_num >= allPaiNum - wanpaiNum - 1 ? true : false,
            suspend: suspend,
            waiting_actions: waiting_actions,
            userState: kyokuState.userState.map((prevUser) => 
              prevUser.user_id === kyokuState.activeUser ? 
              {
                ...prevUser,
                river: [...prevUser.river, tile],
                pon_waiting: false,
                ron_waiting: false,
                tii_waiting: false,
                now_tii: [],
                tehai: { menzen: sortTehai(prevUser.tehai.menzen.map((pai) => (pai.unique === tile.unique ?
                  paiyama[kyokuState.tsumo_num] : pai))
                  .filter((pai) => (prevUser.ron_waiting || prevUser.pon_waiting || prevUser.tii_waiting) ?
                    pai.unique !== paiyama[kyokuState.tsumo_num].unique : true ) ),
                  fuuro: prevUser.tehai.fuuro },
                machi: isTenpai(prevUser.tehai.menzen.map((pai) => (pai.unique === tile.unique ?
                  paiyama[kyokuState.tsumo_num] : pai))
                  .filter((pai) => (prevUser.ron_waiting || prevUser.pon_waiting || prevUser.tii_waiting) ?
                    pai.unique !== paiyama[kyokuState.tsumo_num].unique : true ) ),
                pon: ponList(sortTehai(prevUser.tehai.menzen.map((pai) => (pai.unique === tile.unique ?
                  paiyama[kyokuState.tsumo_num] : pai))
                  .filter((pai) => (prevUser.ron_waiting || prevUser.pon_waiting || prevUser.tii_waiting) ?
                    pai.unique !== paiyama[kyokuState.tsumo_num].unique : true ) ))
              } : 
              {
                ...prevUser,
                // machi: isTenpai(prevUser.tehai.menzen.map((pai) => (pai.unique === tile.unique ?
                //   paiyama[kyokuState.tsumo_num] : pai))),
                ron_waiting: isRonUser(tile.kind, prevUser.machi, prevUser.river.map(r => r.kind)),
                pon_waiting: isPonUser(tile.kind, prevUser.pon),
                tii_waiting: isTiiUser(tile.kind, prevUser.tii, prevUser.user_id, kyokuState.activeUser)
              }
            )
          });
        }
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
