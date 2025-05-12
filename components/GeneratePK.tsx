"use client";

import getMusicData from "../utils/lxns/GetMusicData";
import React from "react";

interface UserMusicDetail {
  achievement: number;
  scoreRank: number;
  level: number;
  playCount: number;
  syncStatus: number;
  comboStatus: number;
  deluxscoreMax: number;
}

interface UserData {
  userName: string;
  iconId: number;
  userMusicDetail: UserMusicDetail;
}

import type { Song } from "../utils/lxns/GetMusicData";

interface GeneratePKParams {
  musicId: number;
  musicLevel: number;
  isDX: boolean;
  userId1Data: UserData;
  userId2Data: UserData;
  musicData?: Song;
}

const borderColors = [
  "#36A31C", // 0 绿色
  "#E7C960", // 1 黄色
  "#F36470", // 2 红色
  "#9447D3", // 3 紫色
  "#E7C6FD", // 4 粉色
];

const scoreRankImage = [
  "/sdgb/UI/UI_TTR_Rank_D.png",
  "/sdgb/UI/UI_TTR_Rank_C.png",
  "/sdgb/UI/UI_TTR_Rank_B.png",
  "/sdgb/UI/UI_TTR_Rank_BB.png",
  "/sdgb/UI/UI_TTR_Rank_BBB.png",
  "/sdgb/UI/UI_TTR_Rank_A.png",
  "/sdgb/UI/UI_TTR_Rank_AA.png",
  "/sdgb/UI/UI_TTR_Rank_AAA.png",
  "/sdgb/UI/UI_TTR_Rank_S.png",
  "/sdgb/UI/UI_TTR_Rank_Sp.png",
  "/sdgb/UI/UI_TTR_Rank_SS.png",
  "/sdgb/UI/UI_TTR_Rank_SSp.png",
  "/sdgb/UI/UI_TTR_Rank_SSS.png",
  "/sdgb/UI/UI_TTR_Rank_SSSp.png",
];

const levelNames = ["Basic", "Advanced", "Expert", "Master", "ReMaster"];

import { useState, useEffect } from "react";

// PK对战主展示组件
// 接收两位用户数据、曲目信息等参数，渲染三栏布局（左头像+中间曲封+右头像）
const GeneratePK: React.FC<GeneratePKParams | undefined> = (pkParams) => {
  // 参数校验，防止数据未加载时报错
  if (!pkParams || !pkParams.userId1Data || !pkParams.userId2Data) {
    return <div>数据加载中或参数错误</div>;
  }
  const {
    musicId,
    musicLevel,
    isDX,
    userId1Data,
    userId2Data,
    musicData: musicDataProp,
  } = pkParams;

  // 静态资源CDN前缀（头像、曲封等）
  const lxMaimaiBaseUrl = "https://assets2.lxns.net/maimai";

  // SSR 优先用 props 里的 musicData
  const [musicData, setMusicData] = useState<Song | null>(
    musicDataProp ?? null
  );
  const [loading, setLoading] = useState(!musicDataProp);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (musicDataProp) return; // SSR 已有数据，无需再加载
    setLoading(true);
    setError(null);
    getMusicData(musicId)
      .then((data) => {
        setMusicData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("曲目信息加载失败");
        setLoading(false);
      });
  }, [musicId]);

  // 加载、错误、空数据的兜底渲染
  if (loading) return <div>曲目信息加载中...</div>;
  if (error) return <div>{error}</div>;
  if (!musicData) return <div>未获取到曲目信息</div>;

  // 解构曲目信息
  const { title, artist, genre, bpm, version, difficulties } = musicData;

  // 防御性判断：确保 difficulties 为数组
  if (!difficulties) {
    console.error("difficulties 不存在", musicData);
    return <div>曲目信息格式异常</div>;
  }

  const difficulty = isDX
    ? difficulties.dx.find((diff) => diff.difficulty === musicLevel)
    : difficulties.standard.find((diff) => diff.difficulty === musicLevel);

  if (!difficulty) {
    return <div>未获取到曲目信息</div>;
  }
  console.log("difficulty", difficulty);

  // 页面主布局：左右头像区+中间曲封区
  return (
    <div
      // 整体背景设置
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(/sdgb/background.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="min-h-screen flex items-center justify-center"
    >
      <div className="flex flex-col w-[95vw] max-w-[1600px] min-w-[320px] bg-transparent">
        {/* 三栏区域：左头像/中曲封/右头像 */}
        <div className="flex flex-row flex-wrap items-center justify-between w-full gap-16">
          {/* 左侧用户头像及信息区 */}
          <AvatarBlock
            userData={userId1Data}
            lxMaimaiBaseUrl={lxMaimaiBaseUrl}
          />
          {/* 中间曲目封面及信息区 */}
          <div className="flex flex-col items-center justify-start h-full flex-1 min-w-[200px] text-2xl">
            <div
              className="flex items-center justify-center h-full w-full"
              style={{
                width: "min(40vw, 400px)",
                height: "min(40vw, 400px)",
                minWidth: 120,
                minHeight: 120,
                overflow: "hidden",
              }}
            >
              {/* 曲目封面图 */}
              <img
                src={`${lxMaimaiBaseUrl}/jacket/${musicId}.png`}
                alt="music cover"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 16,
                  objectFit: "cover",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                  border: `6px solid ${
                    borderColors[musicLevel] ?? borderColors[0]
                  }`,
                  background: "#fff",
                  transition: "width 0.2s, height 0.2s, border-color 0.2s",
                }}
              />
            </div>
            {/* 封面文本区，展示歌曲信息 */}
            <div
              className="flex flex-col items-stretch justify-center mt-4 px-5 py-3 bg-white bg-opacity-80 rounded-xl shadow text-gray-800 text-xl break-words"
              style={{ width: "min(40vw, 400px)", minWidth: 120 }}
            >
              {/* 曲目名 */}
              <div className="font-bold text-base w-full max-w-full min-w-0 break-words whitespace-normal text-center md:text-center">
                {title}
              </div>
              {/* 艺术家名 */}
              <div className="w-full max-w-full min-w-0 break-words whitespace-normal text-center md:text-center">
                {artist}
              </div>
              {/* 曲风、BPM、难度标签区 */}
              <div className="flex flex-row flex-wrap justify-center gap-2 mt-1 min-w-0 w-full">
                {/* 曲风标签 */}
                <span className="bg-purple-100 text-purple-700 rounded px-2 py-0.5 text-xs overflow-hidden text-ellipsis whitespace-normal break-words">
                  {genre}
                </span>
                {/* BPM标签 */}
                <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs overflow-hidden text-ellipsis whitespace-normal break-words">
                  BPM: {bpm}
                </span>
                {/* 难度标签 */}
                <span
                  className="rounded px-2 py-0.5 text-xs overflow-hidden text-ellipsis whitespace-normal break-words"
                  style={{
                    backgroundColor: borderColors[musicLevel],
                    color: "#fff",
                    border: `1.5px solid ${borderColors[musicLevel]}`,
                  }}
                >
                  {levelNames[musicLevel] + " " + difficulty.level}
                </span>
                {/* 谱面定数 */}
                <span className="bg-blue-50 text-blue-700 font-semibold rounded px-2 py-0.5 text-xs shadow-sm border border-blue-200 mr-1">
                  <span className="text-blue-500">谱面定数</span>:{" "}
                  {difficulty.level_value}
                </span>
                {/* 谱师 */}
                <span className="bg-orange-100 text-orange-700 rounded px-2 py-0.5 text-xs overflow-hidden text-ellipsis whitespace-normal break-words border border-orange-200">
                  谱师: {difficulty.note_designer}
                </span>
              </div>
            </div>
          </div>
          <AvatarBlock
            userData={userId2Data}
            lxMaimaiBaseUrl={lxMaimaiBaseUrl}
          />
        </div>
      </div>
    </div>
  );
};

// 头像下方文本复用组件
// 头像下方文本复用组件
const AvatarInfo: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={
      "flex flex-col items-stretch justify-center mt-4 px-6 py-4 w-auto max-w-full min-w-0 bg-gradient-to-b from-white/90 to-purple-50/80 rounded-2xl shadow-lg text-gray-900 text-base break-words border border-purple-100 " +
      className
    }
  >
    {children}
  </div>
);

// 头像区块复用组件
const AvatarBlock: React.FC<{
  userData: UserData;
  lxMaimaiBaseUrl: string;
}> = ({ userData, lxMaimaiBaseUrl }) => (
  <div className="flex flex-col items-center justify-start h-full flex-1 min-w-[200px]">
    <div className="flex items-center justify-center h-full">
      <img
        src={`${lxMaimaiBaseUrl}/icon/${userData.iconId}.png`}
        alt="avatar"
        width={150}
        height={150}
        style={{
          borderRadius: "50%",
          objectFit: "cover",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          border: "4px solid #a6a1d7",
          background: "#a6a1d7",
        }}
      />
    </div>
    {/* 用户名独立显示在头像下方，间距更紧凑 */}
    <div className="font-bold text-4xl w-full max-w-full min-w-0 break-words whitespace-normal text-center text-purple-700 drop-shadow-sm mt-1 mb-1 tracking-wide">
      {userData.userName}
    </div>
    {/* 插入图片示例 */}
    <div className="flex items-center justify-center w-[300px] h-[72px]">
      {/* 示例图片路径，可替换为任意图片 */}
      <img
        src={scoreRankImage[userData.userMusicDetail.scoreRank]}
        alt="示例图片"
        className="h-full object-contain"
      />
    </div>
    <AvatarInfo className="flex flex-col gap-2 mt-1 text-base w-[300px] px-4 py-2 rounded-xl shadow-md">
      <div className="flex items-center gap-1 border-b border-purple-100 pb-1 w-full">
        <span className="font-semibold text-purple-500">成绩</span>：
        <span>{userData.userMusicDetail.achievement}</span>
      </div>
      <div className="flex items-center gap-1 border-b border-blue-100 pb-1 w-full">
        <span className="font-semibold text-blue-500">等级</span>：
        <span>{userData.userMusicDetail.level}</span>
      </div>
      <div className="flex items-center gap-1 border-b border-pink-100 pb-1 w-full">
        <span className="font-semibold text-pink-500">游玩次数</span>：
        <span>{userData.userMusicDetail.playCount}</span>
      </div>
      <div className="flex items-center gap-1 border-b border-green-100 pb-1 w-full">
        <span className="font-semibold text-green-600">同步状态</span>：
        <span>{userData.userMusicDetail.syncStatus}</span>
      </div>
      <div className="flex items-center gap-1 border-b border-orange-100 pb-1 w-full">
        <span className="font-semibold text-orange-500">连击状态</span>：
        <span>{userData.userMusicDetail.comboStatus}</span>
      </div>
      <div className="flex items-center gap-1 w-full">
        <span className="font-semibold text-indigo-600">DX分数</span>：
        <span>{userData.userMusicDetail.deluxscoreMax}</span>
      </div>
    </AvatarInfo>
  </div>
);

export default GeneratePK;
