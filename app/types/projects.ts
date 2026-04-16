interface ProjectUrl {
  text: string;
  url: string;
}

export interface Project {
  title: string;
  date: string;
  prize?: string;
  subtext: string;
  image?: string;
  url?: string;
  urls?: ProjectUrl[];
}