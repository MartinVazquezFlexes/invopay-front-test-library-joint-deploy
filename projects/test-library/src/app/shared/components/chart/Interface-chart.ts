export interface Chart{
  labels: string[],
  backgroundColor ?: string,
  datasets: Data[],
  row: {
    rowColor: string,
    rowNumber: number,
    rowDash ?: boolean,
  },
  padding?: number,
  fontFamily ?: string,
  fontSizeY ?: number,
  fontSizeX ?: number,
}

export interface Point {
  posX : number,
  posY : number,
  id: string,
  dataPoint:{
    diameter: number,
    fill: string,
    strokeWidth?: string,
    strokeColor?: string,
  },
  value: number,
  index: number,
}

export interface Data{
  data: number[],
  id: string,
  typeLine: "rect" | "curve",
  strokeLine: string,
  shadow ?:{
    opacity: number,
    color : string,
  },
  gradient ?:{
    firstColor : string,
    secondColor: string,
  },
  color ?: string,
  dataPoint:{
    diameter: number,
    fill: string,
    strokeWidth?: string,
    strokeColor?: string,
  },
  direction ?: string,
}