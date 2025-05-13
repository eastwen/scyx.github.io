import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // 标签页状态
  const [activeTab, setActiveTab] = useState('房子');
  // 建筑标签页解锁等级
  const buildingUnlockLevel = 10;
  
  // 资源与工人状态
  const initialResources = [
    { name: '铁矿石', key: 'iron', value: 0, perSec: 0 },
    { name: '铜矿石', key: 'copper', value: 0, perSec: 0 },
    { name: '木材', key: 'wood', value: 0, perSec: 0 },
    { name: '石头', key: 'stone', value: 0, perSec: 0 },
    { name: '黄金', key: 'gold', value: 0, perSec: 0 }
  ];
  const [resources, setResources] = useState(initialResources);
  const [workers, setWorkers] = useState(0);
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [collecting, setCollecting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  // 日志记录
  const [logs, setLogs] = useState(["游戏开始。"]);
  // 建筑系统
  const [buildings, setBuildings] = useState([]); // {type: 'house', count: 1, level: 1, ...}
  // 新增人口与材料状态
  const [population, setPopulation] = useState(0);
  const [specialMaterials, setSpecialMaterials] = useState({fur:0,meat:0,scale:0,tooth:0});
  // 天气系统
  const [weather, setWeather] = useState({ temp: 25, desc: '晴朗', tick: 0 });
  const [dead, setDead] = useState(false);
  const collectProgressTimerRef = React.useRef(null);
  const collectActionTimeoutRef = React.useRef(null);
  // 等级阶段与经验需求
  const levelStages = [
    { name: '初级', maxLevel: 3, exp: 100 },
    { name: '中级', maxLevel: 6, exp: 200 },
    { name: '高级', maxLevel: 99, exp: 500 }
  ];
  const getStage = (lv) => {
    if (lv < 3) return levelStages[0];
    if (lv < 6) return levelStages[1];
    return levelStages[2];
  };
  const getStageName = (lv) => getStage(lv).name;
  const getStageExp = (lv) => getStage(lv).exp;
  // 冷却时间随等级提升递减，最低0.5秒
  const getCooldownDuration = () => {
    if (level <= 1) return 800; // 1级采集时间为0.8秒
    if (level <= 3) return 1200 + (level - 1) * 200; // 2-3级逐步加长
    if (level <= 6) return 1800 + (level - 3) * 300; // 4-6级再加长
    return 2700 + (level - 6) * 100; // 7级及以上缓慢递增
  };
  
  // 日志添加
  const addLog = (msg) => setLogs(logs => [msg, ...logs.slice(0, 49)]);
  // 手动采集资源（采集）
  const collectResource = () => {
    if (dead || collecting) return; // Prevent action if dead or already collecting

    setCollecting(true);
    setCooldown(1);
    const cooldownDuration = getCooldownDuration();
    const start = Date.now();

    // Clear any existing timers from a previous, possibly interrupted, collection attempt
    if (collectProgressTimerRef.current) {
      clearInterval(collectProgressTimerRef.current);
      collectProgressTimerRef.current = null;
    }
    if (collectActionTimeoutRef.current) {
      clearTimeout(collectActionTimeoutRef.current);
      collectActionTimeoutRef.current = null;
    }

    collectProgressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.max(0, 1 - elapsed / cooldownDuration);
      setCooldown(progress);
      if (elapsed >= cooldownDuration) {
        clearInterval(collectProgressTimerRef.current);
        collectProgressTimerRef.current = null; // Clear ref
        setCooldown(0); // Ensure cooldown visual is reset
      }
    }, 16);

    collectActionTimeoutRef.current = setTimeout(() => {
      // NOTE: The core logic for stopping this timeout if `dead` becomes true
      // is handled by the new useEffect that cleans up `collectActionTimeoutRef.current`.

      // 采集逻辑：根据等级和概率采集不同资源
      // 采集逻辑：根据等级和概率采集不同资源
      let selectedKey = 'wood'; // 默认采集木材
      if (level > 1) {
        // 定义资源等级和掉落概率
        const resourceTiers = [
          // 初级资源 (等级1时不应到这里，但保留结构以防万一)
          [
            { key: 'wood', weight: 100 } // 等级1只掉落木材
          ],
          // 中级资源 (从等级10开始)
          [
            { key: 'wood', weight: 40 }, // 木材概率高
            { key: 'stone', weight: 25 }, // 石头概率中
            { key: 'iron', weight: 20 }, // 铁矿石概率较低
            { key: 'copper', weight: 10 }, // 铜矿石概率更低
            { key: 'gold', weight: 5 } // 黄金极低概率
          ],
          // 高级资源 (从等级20开始)
          [
            { key: 'gold', weight: 20 }, // 黄金概率提升
            { key: 'iron', weight: 30 },
            { key: 'copper', weight: 25 },
            { key: 'stone', weight: 15 },
            { key: 'wood', weight: 10 } // 木材概率降低
          ]
        ];
        // 根据等级解锁可采集资源
        let availableTierResources = [];
        if (level >= 20) { // 高级
          availableTierResources = resourceTiers[2];
        } else if (level >= 10) { // 中级
          availableTierResources = resourceTiers[1];
        } else { // 初级 (理论上 level > 1 且 < 10)
          availableTierResources = resourceTiers[0];
        }

        // 概率加权采集
        const totalWeight = availableTierResources.reduce((sum, r) => sum + r.weight, 0);
        let rand = Math.random() * totalWeight;
        for (let i = 0; i < availableTierResources.length; i++) {
          rand -= availableTierResources[i].weight;
          if (rand <= 0) {
            selectedKey = availableTierResources[i].key;
            break;
          }
        }
      } else {
        // 等级为1时，确保只采集木材
        selectedKey = 'wood';
      }
      setResources(rs => rs.map(r => r.key === selectedKey ? { ...r, value: r.value + 1 } : r));
      addLog(`采集获得了${resources.find(r=>r.key===selectedKey)?.name||selectedKey}`);
      // 增加经验并处理升级
      setExp(prevExp => {
        let nextExp = prevExp + 10;
        let nextLevel = level;
        let stageExp = getStageExp(nextLevel);
        let changed = false;
        while (nextExp >= stageExp) {
          nextExp -= stageExp;
          nextLevel += 1;
          stageExp = getStageExp(nextLevel);
          changed = true;
        }
        if (changed) setLevel(nextLevel);
        return nextExp;
      });
      setCollecting(false);
      collectActionTimeoutRef.current = null; // Mark as completed/cleared
    }, cooldownDuration);
  };
  
  // 招募工人（提升等级）
  const hireWorker = () => {
    if (dead) return;
    if (resources[2].value >= 10) {
      setResources(rs => rs.map((r, idx) => {
        if(idx === 2) return { ...r, value: r.value - 10 };
        if(idx === 0) return { ...r, perSec: r.perSec + 0.1 }; // 铁矿石
        if(idx === 1) return { ...r, perSec: r.perSec + 0.1 }; // 铜矿石
        if(idx === 3) return { ...r, perSec: r.perSec + 0.1 }; // 石头
        if(idx === 4) return { ...r, perSec: r.perSec + 0.05 }; // 黄金
        return r;
      }));
      setWorkers(w => w + 1);
      setLevel(lv => lv + 1);
      addLog('招募一名工人。');
    } else {
      alert('招募工人需要10木材！');
    }
  };
  // 建造房子
  const buildHouse = () => {
    if (dead) return;
    if (resources[2].value >= 20 && resources[3].value >= 10) {
      setResources(rs => rs.map((r, idx) => {
        if(r.key==='wood') return { ...r, value: r.value - 20 };
        if(r.key==='stone') return { ...r, value: r.value - 10 };
        return r;
      }));
      setBuildings(bs => {
        const exist = bs.find(b=>b.type==='house');
        if(exist) return bs.map(b=>b.type==='house'?{...b,count:b.count+1}:b);
        return [...bs, {type:'house', count:1}];
      });
      addLog('建造了一间房子。');
    } else {
      alert('建造房子需要20木材和10石头！');
    }
  };
  // 添加木材按钮逻辑
  const addWood = () => {
    if (dead) return;
    const wood = resources.find(r => r.key === 'wood');
    if (wood && wood.value >= 1) {
      setResources(rs => rs.map(r => r.key === 'wood' ? { ...r, value: r.value - 1 } : r));
      setWeather(w => ({ ...w, temp: w.temp + 3 }));
      addLog('消耗1木材，提升了室内温度3℃！');
    } else {
      alert('木材不足，无法提升温度！');
    }
  };
  // 天气变化与生存检测
  useEffect(() => {
    if(dead) return;
    const interval = setInterval(() => {
      setWeather(w => {
        let tick = w.tick + 1;
        let temp = w.temp;
        let desc = w.desc;
        // 每10 tick变一次天气
        if(tick % 10 === 0) {
          const r = Math.random();
          if(r < 0.3) { temp = Math.max(-20, temp - Math.floor(Math.random()*8+3)); desc = '暴风雪'; }
          else if(r < 0.7) { temp = Math.max(-10, temp - Math.floor(Math.random()*4+1)); desc = '寒冷'; }
          else { temp = Math.min(25, temp + Math.floor(Math.random()*6)); desc = '晴朗'; }
          addLog(`天气变化：${desc}，温度${temp}℃`);
        }
        // 检查是否冻死
        let houseCount = buildings.find(b=>b.type==='house')?.count||0;
        if(temp <= -10 && houseCount === 0) {
          setDead(true);
          addLog('你被冻死了！游戏结束。');
        }
        return { temp, desc, tick };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [dead, buildings]);
  
  // 自动采集逻辑
  useEffect(() => {
    if (dead) { // 如果角色已死亡，则不启动新的计时器，旧的计时器会被清理函数清除
      return;
    }
    if (workers > 0) {
      const interval = setInterval(() => {
        setResources(currentResources => {
          // 自动采集采用与手动采集一致的加权概率逻辑
          let selectedKey = 'wood';
          if (level > 1) {
            // 自动采集的资源等级定义：
            // - 初级 (等级 2-9): resourceTiers[0]
            // - 中级 (等级 10-19): resourceTiers[1]
            // - 高级 (等级 20+): resourceTiers[2]
            const resourceTiers = [
              [
                { key: 'wood', weight: 80 }
              ],
              [
                { key: 'wood', weight: 80 },
                { key: 'stone', weight: 25 },
                { key: 'iron', weight: 20 },
                { key: 'copper', weight: 10 },
                { key: 'gold', weight: 5 }
              ],
              [
                { key: 'gold', weight: 20 },
                { key: 'iron', weight: 30 },
                { key: 'copper', weight: 25 },
                { key: 'stone', weight: 15 },
                { key: 'wood', weight: 80 }
              ]
            ];
            let availableTierResources = [];
            if (level >= 20) {
              availableTierResources = resourceTiers[2];
            } else if (level >= 10) {
              availableTierResources = resourceTiers[1];
            } else {
              availableTierResources = resourceTiers[0];
            }
            const totalWeight = availableTierResources.reduce((sum, r) => sum + r.weight, 0);
            let rand = Math.random() * totalWeight;
            for (let i = 0; i < availableTierResources.length; i++) {
              rand -= availableTierResources[i].weight;
              if (rand <= 0) {
                selectedKey = availableTierResources[i].key;
                break;
              }
            }
          } else {
            selectedKey = 'wood';
          }
          // 增加采集到的资源
          const newResources = currentResources.map(r => r.key === selectedKey ? { ...r, value: +(r.value + (r.perSec > 0 ? r.perSec : 1)).toFixed(2) } : r);
          // 只有资源实际增加时才增加经验
          if (newResources.some((r, idx) => newResources[idx].value > currentResources[idx].value)) {
            const collectedResource = newResources.find(r => r.key === selectedKey);
            if (collectedResource) {
              const amountCollected = +( (collectedResource.perSec > 0 ? collectedResource.perSec : 1) * workers ).toFixed(2);
              addLog(`工人自动采集获得了 ${amountCollected} ${collectedResource.name || selectedKey}。`);
            }
            setExp(prevExp => {
              let currentLevelForExpCalc = level; 
              let nextExp = prevExp + 5 * workers;
              let nextLevelCandidate = currentLevelForExpCalc;
              let stageExp = getStageExp(nextLevelCandidate);
              let levelDidChange = false;
              while (nextExp >= stageExp) {
                nextExp -= stageExp;
                nextLevelCandidate += 1;
                stageExp = getStageExp(nextLevelCandidate);
                levelDidChange = true;
              }
              if (levelDidChange) {
                setLevel(nextLevelCandidate); 
              }
              return nextExp; 
            });
          }
          return newResources; 
        });
      }, 3000); // 自动采集间隔调整为3000ms
      return () => clearInterval(interval);
    }
  }, [workers, level, dead, addLog, resources]); // 将 addLog 和 resources 添加到依赖项数组

  // Effect to clear manual collection timers if player dies
  useEffect(() => {
    if (dead) {
      if (collectProgressTimerRef.current) {
        clearInterval(collectProgressTimerRef.current);
        collectProgressTimerRef.current = null;
      }
      if (collectActionTimeoutRef.current) {
        clearTimeout(collectActionTimeoutRef.current);
        collectActionTimeoutRef.current = null;
      }
      // Reset UI states related to manual collection if death interrupts it
      setCollecting(false);
      setCooldown(0);
    }
    // Cleanup refs on component unmount (optional, but good practice)
    return () => {
      if (collectProgressTimerRef.current) {
        clearInterval(collectProgressTimerRef.current);
      }
      if (collectActionTimeoutRef.current) {
        clearTimeout(collectActionTimeoutRef.current);
      }
    };
  }, [dead]); // Run this effect when 'dead' state changes

  // =================== 建筑相关功能 ===================
  const buildOrUpgradeBuilding = (type) => {
    if (dead) return;
    const woodResource = resources.find(r => r.key === 'wood');
    const stoneResource = resources.find(r => r.key === 'stone');
    const ironResource = resources.find(r => r.key === 'iron');

    if (type === 'trap') {
      if (woodResource && woodResource.value >= 10 && stoneResource && stoneResource.value >= 5) {
        setResources(rs => rs.map(r => {
          if (r.key === 'wood') return { ...r, value: r.value - 10 };
          if (r.key === 'stone') return { ...r, value: r.value - 5 };
          return r;
        }));
        setBuildings(bs => {
          const exist = bs.find(b => b.type === 'trap');
          if (exist) return bs.map(b => b.type === 'trap' ? { ...b, level: (b.level || 1) + 1 } : b);
          return [...bs, { type: 'trap', level: 1 }];
        });
        addLog('建造/升级了陷阱。');
      } else {
        alert('建造/升级陷阱需要10木材和5石头！');
      }
    } else if (type === 'expansion') {
      if (woodResource && woodResource.value >= 30 && stoneResource && stoneResource.value >= 20) {
        setResources(rs => rs.map(r => {
          if (r.key === 'wood') return { ...r, value: r.value - 30 };
          if (r.key === 'stone') return { ...r, value: r.value - 20 };
          return r;
        }));
        setBuildings(bs => {
          const exist = bs.find(b => b.type === 'expansion');
          if (exist) return bs.map(b => b.type === 'expansion' ? { ...b, level: (b.level || 1) + 1 } : b);
          return [...bs, { type: 'expansion', level: 1 }];
        });
        setPopulation(p => p + 2);
        addLog('扩建成功，人口上限提升。');
      } else {
        alert('扩建需要30木材和20石头！');
      }
    } else if (type === 'hunter') {
      if (woodResource && woodResource.value >= 20 && ironResource && ironResource.value >= 10) {
        setResources(rs => rs.map(r => {
          if (r.key === 'wood') return { ...r, value: r.value - 20 };
          if (r.key === 'iron') return { ...r, value: r.value - 10 };
          return r;
        }));
        setBuildings(bs => {
          const exist = bs.find(b => b.type === 'hunter');
          if (exist) return bs.map(b => b.type === 'hunter' ? { ...b, level: (b.level || 1) + 1 } : b);
          return [...bs, { type: 'hunter', level: 1 }];
        });
        addLog('建造/升级了猎人小屋。');
      } else {
        alert('建造/升级猎人小屋需要20木材和10铁矿石！');
      }
    }
  };

  const triggerTrapOrHunt = (type) => {
    if (type === 'trap') {
      const trapBuilding = buildings.find(b => b.type === 'trap');
      if (!trapBuilding) {
        alert('请先建造陷阱！');
        return;
      }
      const trapLevel = trapBuilding.level || 1;
      const rand = Math.random();
      if (rand < 0.5 + 0.1 * (trapLevel - 1)) {
        setSpecialMaterials(sm => ({ ...sm, fur: sm.fur + 1, meat: sm.meat + 1 }));
        addLog('陷阱捕获到一只小动物，获得毛皮和鲜肉！');
      } else {
        addLog('陷阱未能捕获到猎物。');
      }
    } else if (type === 'hunter') {
      const hunterLodge = buildings.find(b => b.type === 'hunter');
      if (!hunterLodge) {
        alert('请先建造猎人小屋！');
        return;
      }
      const hunterLevel = hunterLodge.level || 1;
      const rand = Math.random();
      if (rand < 0.4 + 0.12 * (hunterLevel - 1)) {
        setSpecialMaterials(sm => ({ ...sm, scale: sm.scale + 1, tooth: sm.tooth + 1 }));
        addLog('猎人小屋狩猎成功，获得鳞片和兽齿！');
      } else {
        addLog('猎人小屋狩猎失败。');
      }
    }
  };
  
  // 渲染标签页内容
  const renderTabContent = () => {
    switch(activeTab) {
      case '房子':
        return (
          <div>
            <button onClick={collectResource} disabled={collecting || cooldown > 0 || dead} style={{ position: 'relative', marginRight: 12, padding: '8px 16px', overflow: 'hidden', width: 120 }}>
              {dead ? '已死亡' : (collecting || cooldown > 0 ? '采集中...' : '采集')}
              {(collecting || cooldown > 0) && !dead && (
                <span style={{
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  height: 4,
                  width: `${(cooldown > 0 ? cooldown : 1) * 100}%`,
                  background: '#2196f3',
                  transition: 'width 0.1s linear',
                  zIndex: 1,
                  borderRadius: 2,
                  pointerEvents: 'none',
                }} />
              )}
            </button>
            <button onClick={hireWorker} disabled={dead} style={{ marginRight: 12, padding: '8px 16px' }}>招募工人（10木材，提升等级）</button>
            <button onClick={addWood} disabled={dead} style={{ marginRight: 12, padding: '8px 16px' }}>添加木材（-1）</button>
            
            {/* 天气显示 */}
            <div style={{ marginTop: 16, marginBottom: 8, color: weather.temp<=-10?'#c00':'#2196f3', fontWeight: 'bold' }}>
              天气：{weather.desc}，温度：{weather.temp}℃
            </div>
          </div>
        );
      case '建筑':
        // 建筑功能达到 buildingUnlockLevel 级开放
        if (level < buildingUnlockLevel) {
          return (
            <div>
              <p style={{color:'#c00'}}>{`建筑功能将在${buildingUnlockLevel}级后解锁，当前等级：${level}`}</p>
              <button disabled style={{ marginRight: 12, padding: '8px 16px' }}>建造房子（未解锁）</button>
            </div>
          );
        }
        return (
          <div>
            <button onClick={buildHouse} disabled={dead} style={{ marginRight: 12, padding: '8px 16px' }}>等级10解锁建造房子，房子可防止极寒天气冻死。</button>
            {/* 新增功能性建筑按钮 */}
            <button onClick={()=>buildOrUpgradeBuilding('trap')} disabled={dead} style={{ marginRight: 12, padding: '8px 16px' }}>建造/升级陷阱</button>
            <button onClick={()=>buildOrUpgradeBuilding('expansion')} disabled={dead} style={{ marginRight: 12, padding: '8px 16px' }}>建造/升级扩建</button>
            <button onClick={()=>buildOrUpgradeBuilding('hunter')} disabled={dead} style={{ marginRight: 12, padding: '8px 16px' }}>建造/升级猎人小屋</button>
            {/* 功能性建筑操作 */}
            <button onClick={()=>triggerTrapOrHunt('trap')} disabled={dead} style={{ marginRight: 12, padding: '8px 16px' }}>触发陷阱捕获</button>
            <button onClick={()=>triggerTrapOrHunt('hunter')} disabled={dead} style={{ marginRight: 12, padding: '8px 16px' }}>猎人小屋狩猎</button>
            {/* 展示建筑 */}
            <div style={{ marginTop: 16, marginBottom: 8 }}>
              {buildings.length > 0 ? (
                <>
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>已建造的建筑：</div>
                  {buildings.map(b => (
                    <div key={b.type}>
                      {b.type==='house'?`房子 x${b.count}`:
                        b.type==='trap'?`陷阱 Lv.${b.level||1}`:
                        b.type==='expansion'?`扩建 Lv.${b.level||1}`:
                        b.type==='hunter'?`猎人小屋 Lv.${b.level||1}`:b.type}
                    </div>
                  ))}
                </>
              ) : (
                <div>暂无建筑，请先建造一些建筑。</div>
              )}
            </div>
            {/* 展示特殊材料与人口 */}
            <div style={{marginTop:8}}>
              <span>人口：{population}</span>
              <span style={{marginLeft:12}}>毛皮：{specialMaterials.fur} 鲜肉：{specialMaterials.meat} 鳞片：{specialMaterials.scale} 兽齿：{specialMaterials.tooth}</span>
            </div>
          </div>
        );
      case '探险':
        // 探险功能达到 adventureUnlockLevel 级开放
        const adventureUnlockLevelTab = 30; // 定义探险解锁等级
        if (level < adventureUnlockLevelTab) {
          return (
            <div>
              <p style={{color:'#c00'}}>{`探险功能将在${adventureUnlockLevelTab}级后解锁，当前等级：${level}`}</p>
              <button disabled style={{ marginRight: 12, padding: '8px 16px' }}>开始探险（未解锁）</button>
            </div>
          );
        }
        return (
          <div>
            <p>探险功能尚未开放，敬请期待！</p>
            <button disabled style={{ marginRight: 12, padding: '8px 16px' }}>开始探险（即将推出）</button>
          </div>
        );
      default:
        return <div>未知标签页</div>;
    }
  };

  return (
    <div className="App" style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        {/* 日志区块 */}
        <div style={{ width: 220, minHeight: 400, marginRight: 32, background: '#f7f7f7', border: '1px solid #ccc', borderRadius: 6, padding: 12, textAlign: 'left', fontSize: 14, color: '#333', overflowY: 'auto', height: 480 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>日志记录</div>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {logs.map((log, idx) => <li key={idx} style={{ opacity: idx>20?0.5:1 }}>{log}</li>)}
          </ul>
        </div>
        {/* 主体内容和库存左右排版容器 */}
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', maxWidth: 1000, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* 主体内容区块 */}
          <div style={{ flex: 1, minWidth: 0, marginRight: 32, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <h1 style={{ marginRight: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>打造末日安全屋</h1>
              {/* 标签页导航 */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {['房子', '建筑', '探险'].map(tab => {
                  const adventureUnlockLevel = 30;
                  const buildingUnlockLevel = 10;
                  const isAdventure = tab === '探险';
                  const isBuilding = tab === '建筑';
                  const adventureLocked = isAdventure && level < adventureUnlockLevel;
                  const buildingLocked = isBuilding && level < buildingUnlockLevel;
                  const locked = adventureLocked || buildingLocked;
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        if (!locked) setActiveTab(tab);
                      }}
                      disabled={locked}
                      style={{
                        marginRight: 12,
                        padding: '8px 16px',
                        borderRadius: activeTab === tab ? '4px 4px 4px 4px' : '4px',
                        backgroundColor: activeTab === tab ? '#2196f3' : '#f5f5f5',
                        color: activeTab === tab ? '#fff' : locked ? '#aaa' : '#333',
                        fontWeight: activeTab === tab ? 'bold' : 'normal',
                        border: activeTab === tab ? '2px solid #2196f3' : '1px solid #ccc',
                        borderBottom: activeTab === tab ? 'none' : '1px solid #ccc',
                        boxShadow: activeTab === tab ? '0 -2px 5px rgba(0,0,0,0.1)' : 'none',
                        position: 'relative',
                        top: activeTab === tab ? '1px' : '0',
                        minWidth: 80
                      }}
                      title={locked ? (isAdventure ? `达到${adventureUnlockLevel}级后解锁探险` : isBuilding ? `达到${buildingUnlockLevel}级后解锁建筑` : '') : ''}
                    >
                      {tab}
                      {locked && <span style={{ fontSize: 12, marginLeft: 2 }}>(未解锁)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 18, marginRight: 16 }}>{getStageName(level)}：{level}/{getStageExp(level)}（经验：{exp}/{getStageExp(level)}）</span>
              <span style={{ fontSize: 18 }}>工人：{workers}</span>
            </div>
            
            {/* 标签页内容 */}
            {renderTabContent()}
          </div>
          {/* 库存内容区块 */}
          <div style={{ minWidth: 220, marginLeft: 0, border: '1px solid #aaa', borderRadius: 6, padding: 12, background: '#fff', width: 220 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4, textAlign: 'center' }}>库存</div>
            <table style={{ borderCollapse: 'collapse', fontSize: 16, width: '100%' }}>
              <tbody>
                {resources.filter(r => r.value > 0).map((r, idx) => (
                  <tr key={r.key}>
                    <td style={{ padding: '2px 8px', textAlign: 'right', color: idx === 0 ? '#333' : '#666' }}>{r.name}</td>
                    <td style={{ padding: '2px 8px', textAlign: 'right', fontWeight: idx === 0 ? 'bold' : 'normal' }}>
                      {Math.floor(r.value)}
                      {r.perSec > 0 && (
                        <span style={{ color: 'green', fontSize: 14, marginLeft: 2 }}>
                          (+{r.perSec})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* 游戏说明区块 - 移动到页面底部 */}
      <div style={{ marginTop: 40, color: '#888', paddingTop: 20, textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
        <p>每个工人每秒自动采集所有有增长速率的资源。</p>
        <p>招募工人消耗10木材并提升等级，等级越高采集冷却越短（最低0.5秒）。</p>
        <p>等级10解锁建造房子，房子可防止极寒天气冻死。</p>
        <p>天气系统：温度过低且无房子时会导致角色死亡。</p>
      </div>
    </div>
  );
}

export default App;

<style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }\n@keyframes progressBarFill { 0% { transform: scaleX(0);} 100% { transform: scaleX(1);} }`}</style>
