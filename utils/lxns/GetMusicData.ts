export interface Song {
  id: number;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  map: string;
  version: number;
  right: string;
  disabled: boolean;
  difficulties: Difficulty;
}

interface Difficulty {
  standard: songDifficulty[];
  dx: songDifficulty[];
  utage?: songDifficulty[];
}

interface songDifficulty {
  type: string;
  difficulty: number;
  level: string;
  level_value: number;
  note_designer: string;
  version: number;
  note: Note;
}

interface Note {
  total: number;
  tap: number;
  hold: number;
  slide: number;
  touch: number;
  break: number;
}

async function getMusicData(musicId: number): Promise<Song> {
  const baseUrl = "https://maimai.lxns.net";
  const musicData = await fetch(
    `${baseUrl}/api/v0/maimai/song/${musicId}`
  ).then((res) => res.json());
  console.log(musicData);
  console.log(musicData.difficulties);
  return musicData;
}

export default getMusicData;
