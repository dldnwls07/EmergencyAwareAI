import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Car, Info, ShieldAlert, Navigation } from 'lucide-react';

export default function App() {
  const [distance, setDistance] = useState(1500); // 구급차와의 초기 거리 (미터)
  const [isSimulating, setIsSimulating] = useState(false);
  const [speed] = useState(25); // 시뮬레이션 속도 (한 틱당 줄어드는 거리)

  useEffect(() => {
    let interval;
    if (isSimulating && distance > -200) {
      interval = setInterval(() => {
        setDistance((prev) => prev - speed);
      }, 300); // 0.3초마다 거리 단축
    } else if (distance <= -200) {
      setIsSimulating(false);
    }
    return () => clearInterval(interval);
  }, [isSimulating, distance, speed]);

  const startSimulation = () => {
    setDistance(1500);
    setIsSimulating(true);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  // 거리에 따른 알림 상태 계산 로직
  const getAlertStatus = () => {
    if (distance > 1000) return { level: 'safe', message: '주변에 접근 중인 긴급 차량이 없습니다.', color: 'bg-green-500' };
    if (distance > 500) return { level: 'warning', message: '⚠️ 1km 뒤에서 구급차가 접근 중입니다.', color: 'bg-yellow-500' };
    if (distance > 0) return { level: 'danger', message: '🚨 500m 뒤 구급차 접근! 우측으로 양보해주세요.', color: 'bg-red-600' };
    if (distance > -100) return { level: 'passing', message: '🚑 구급차가 옆을 지나가고 있습니다.', color: 'bg-blue-600' };
    return { level: 'passed', message: '✅ 구급차가 통과했습니다. 안전 운전하세요.', color: 'bg-gray-600' };
  };

  const alertStatus = getAlertStatus();

  // 구급차의 시각적 Y축 위치 계산 (거리에 비례하여 화면 아래에서 위로 이동)
  // 내 차는 20% 위치에 고정, 구급차는 거리에 따라 20% ~ 100% 사이에서 움직임
  const getAmbulancePosition = () => {
    if (distance > 1500) return '100%';
    if (distance < 0) return '0%';
    // 1500m일 때 바닥(100%), 0m일 때 내 차 위치(20%)
    const position = 20 + (distance / 1500) * 80;
    return `${position}%`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4 font-sans text-white">
      {/* 시뮬레이션 컨트롤러 */}
      <div className="max-w-md w-full mb-6 p-4 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
        <h1 className="text-2xl font-bold text-blue-400 flex items-center gap-2 mb-2">
          <ShieldAlert />
          EmergencyAware AI
        </h1>
        <p className="text-slate-400 text-sm mb-4">
          긴급차량 사전 알림 내비게이션 시뮬레이션입니다. 구급차가 뒤에서부터 접근하는 상황을 가정합니다.
        </p>
        <div className="flex gap-2">
          <button
            onClick={startSimulation}
            disabled={isSimulating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {distance <= -200 ? '다시 시작' : '시뮬레이션 시작'}
          </button>
          <button
            onClick={stopSimulation}
            disabled={!isSimulating}
            className="flex-1 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            정지
          </button>
        </div>
      </div>

      {/* 내비게이션 UI */}
      <div className="relative w-full max-w-md h-[600px] bg-slate-800 rounded-3xl overflow-hidden border-4 border-slate-700 shadow-2xl flex flex-col">
        {/* 상단 알림 배너 */}
        <div className={`absolute top-0 left-0 w-full z-20 transition-all duration-500 ease-in-out ${alertStatus.color} ${distance > 1000 ? 'h-12' : 'h-24'} shadow-lg flex items-center justify-center px-4`}>
          <div className="flex flex-col items-center text-center">
            <span className="font-bold text-lg">{alertStatus.message}</span>
            {distance > 0 && distance <= 1000 && (
              <span className="text-sm opacity-90 mt-1 font-mono bg-black/20 px-2 py-1 rounded">
                현재 거리: {distance}m
              </span>
            )}
          </div>
        </div>

        {/* 지도 영역 (도로) */}
        <div className="flex-1 relative bg-zinc-800 mt-12 overflow-hidden flex justify-center">
          {/* 중앙선 등 도로 그래픽 */}
          <div className="absolute w-2 h-full bg-yellow-500/50 left-[30%]"></div>
          <div className="absolute w-2 h-full bg-dashed-line left-[70%]"></div>
          
          {/* 도로 애니메이션 용 점선 (시뮬레이션 작동 시 움직임) */}
          <div className={`absolute w-full h-[200%] -top-[100%] flex justify-center ${isSimulating ? 'animate-[slide_1s_linear_infinite]' : ''}`}>
             <div className="w-2 h-full border-l-4 border-dashed border-white/30 ml-[-2px]"></div>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slide {
              0% { transform: translateY(0); }
              100% { transform: translateY(50%); }
            }
          `}} />

          {/* 내 차량 (고정 위치) */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
            <div className="bg-blue-500 p-2 rounded-lg shadow-lg ring-2 ring-white/50">
              <Car size={32} color="white" />
            </div>
            <div className="w-16 h-16 bg-blue-500/20 rounded-full absolute -top-4 animate-ping"></div>
          </div>

          {/* 구급차 (거리에 따라 위치 이동) */}
          {distance > -200 && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-linear flex flex-col items-center"
              style={{ top: getAmbulancePosition() }}
            >
              {distance <= 1000 && (
                <div className="absolute -top-16 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md mb-2 whitespace-nowrap animate-bounce shadow-lg after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:border-l-[6px] after:border-l-transparent after:border-r-[6px] after:border-r-transparent after:border-t-[6px] after:border-t-red-600">
                  구급차 접근중
                </div>
              )}
              <div className="bg-red-600 p-2 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.8)] ring-2 ring-white/80 z-10 relative">
                {/* 사이렌 불빛 효과 */}
                <div className="absolute top-0 left-0 w-1/2 h-full bg-blue-500/50 rounded-l-lg animate-pulse"></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-red-500/50 rounded-r-lg animate-pulse delay-75"></div>
                <AlertTriangle size={32} color="white" className="relative z-10" />
              </div>
            </div>
          )}
        </div>

        {/* 하단 내비게이션 정보 */}
        <div className="h-24 bg-slate-900 border-t border-slate-700 p-4 flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-sm">도착 예정 시간</div>
            <div className="text-2xl font-bold text-white">오후 2:30</div>
          </div>
          <div className="text-right">
            <div className="text-slate-400 text-sm">남은 거리</div>
            <div className="text-xl font-bold text-blue-400">12.5 km</div>
          </div>
        </div>
      </div>
    </div>
  );
}
