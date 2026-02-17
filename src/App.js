import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Plus, Trash2 } from 'lucide-react';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'break', 'longBreak'
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('');
  const [videoPresets, setVideoPresets] = useState([
    { id: 1, name: '마음이 조급할 때 듣는 브금', url: 'https://youtu.be/UMcqpEuMUrs?si=eja39lXcQaCuY3WL', category: 'work' },
    { id: 2, name: '봄비 (春雨)', url: 'https://youtu.be/VT4Vm2TdJdg?si=xIy6xW9Y9DhBh0F3', category: 'work' },
    { id: 3, name: 'Motivational', url: 'https://www.youtube.com/watch?v=ZXsQAXx_ao0', category: 'break' }
  ]);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetUrl, setNewPresetUrl] = useState('');
  const [newPresetCategory, setNewPresetCategory] = useState('work');

  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const durations = { // 시간설정
    work: 1 * 60,
    break: 5 * 60,
    longBreak: 15 * 60
  };

  // YouTube video ID 추출
  const getVideoId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  // 타이머 로직
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  // YouTube Player 초기화
  useEffect(() => {
    if (currentVideo) {
      const videoId = getVideoId(currentVideo);
      if (videoId && window.YT) {
        if (playerRef.current) {
          playerRef.current.loadVideoById(videoId);
        } else {
          playerRef.current = new window.YT.Player('youtube-player', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
              autoplay: 1,
              controls: 1,
              loop: 1,
              playlist: videoId
            }
          });
        }
      }
    }
  }, [currentVideo]);

  // YouTube API 로드
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }, []);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === 'work') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      if (newSessions % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(durations.longBreak);
      } else {
        setMode('break');
        setTimeLeft(durations.break);
      }
    } else {
      setMode('work');
      setTimeLeft(durations.work);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durations[mode]);
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsActive(false);
  };

  const addPreset = () => {
    if (newPresetName && newPresetUrl) {
      const newPreset = {
        id: Date.now(),
        name: newPresetName,
        url: newPresetUrl,
        category: newPresetCategory
      };
      setVideoPresets([...videoPresets, newPreset]);
      setNewPresetName('');
      setNewPresetUrl('');
    }
  };

  const deletePreset = (id) => {
    setVideoPresets(videoPresets.filter(preset => preset.id !== id));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const workPresets = videoPresets.filter(p => p.category === 'work');
  const breakPresets = videoPresets.filter(p => p.category === 'break');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          포모도로 타이머 !
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 타이머 섹션 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => changeMode('work')}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  mode === 'work' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                작업
              </button>
              <button
                onClick={() => changeMode('break')}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  mode === 'break' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                휴식
              </button>
            </div>

            <div className="text-center mb-8">
              <div className="text-8xl font-bold text-gray-800 mb-4">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xl text-gray-600 mb-6">
                완료한 세션: {sessions}개
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={toggleTimer}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
                >
                  {isActive ? <Pause size={20} /> : <Play size={20} />}
                  {isActive ? '일시정지' : '시작'}
                </button>
                <button
                  onClick={resetTimer}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
                >
                  <RotateCcw size={20} />
                  리셋
                </button>
              </div>
            </div>

            {/* 비디오 프리셋 */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                {mode === 'work' ? '작업용 영상' : '휴식용 영상'}
              </h3>
              <div className="space-y-2">
                {(mode === 'work' ? workPresets : breakPresets).map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => setCurrentVideo(preset.url)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      currentVideo === preset.url
                        ? 'bg-purple-100 border-2 border-purple-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 유튜브 플레이어 & 설정 */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                <div id="youtube-player"></div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                {currentVideo ? '영상 재생 중' : '영상을 선택해주세요'}
              </p>
            </div>

            {/* 프리셋 관리 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-700">프리셋 관리</h3>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Settings size={20} />
                </button>
              </div>

              {showSettings && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="프리셋 이름"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="유튜브 URL"
                    value={newPresetUrl}
                    onChange={(e) => setNewPresetUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <select
                    value={newPresetCategory}
                    onChange={(e) => setNewPresetCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="work">작업용</option>
                    <option value="break">휴식용</option>
                  </select>
                  <button
                    onClick={addPreset}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    프리셋 추가
                  </button>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold mb-2 text-gray-600">저장된 프리셋</h4>
                    <div className="space-y-2">
                      {videoPresets.map(preset => (
                        <div key={preset.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="text-sm">{preset.name} ({preset.category === 'work' ? '작업' : '휴식'})</span>
                          <button
                            onClick={() => deletePreset(preset.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;